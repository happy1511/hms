import { AddressType, ContactType, User } from "@/generated/prisma/client";
import { apiResponse } from "@/lib/apiResponse";
import { RESPONSE_STATUS } from "@/lib/responseStatus";
import { validateRequest } from "@/lib/validator";
import { prisma } from "@/services/prisma";
import {
  addInvoiceBillItemValidator,
  addInvoiceTransactionValidator,
  partialInvoiceValidator,
  updateInvoiceValidator,
} from "@/validators/api/invoice/invoice";

type InvoiceTx = Omit<
  typeof prisma,
  "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends"
>;

const cancelOrdersForBillingItems = async (
  tx: InvoiceTx,
  billingItemIds: number[],
  userId: number,
) => {
  if (!billingItemIds.length) {
    return;
  }

  await Promise.all([
    tx.pathologyTestOrder.updateMany({
      where: {
        invoiceBillingItemId: { in: billingItemIds },
        isCancelled: false,
      },
      data: {
        isCancelled: true,
        cancelledById: userId,
      },
    }),
    tx.radiologyTestOrder.updateMany({
      where: {
        invoiceBillingItemId: { in: billingItemIds },
        isCancelled: false,
      },
      data: {
        isCancelled: true,
        cancelledById: userId,
      },
    }),
  ]);
};

const createOrdersForBillingItem = async (
  tx: InvoiceTx,
  {
    billingItemId,
    serviceId,
    patientId,
    opdId,
    ipdId,
  }: {
    billingItemId: number;
    serviceId: number;
    patientId: number | null | undefined;
    opdId: number | null | undefined;
    ipdId: number | null | undefined;
  },
) => {
  const [pathologyServices, radiologyServices] = await Promise.all([
    tx.pathologyTestService.findMany({
      where: {
        serviceId,
        test: { isDeleted: false },
      },
      select: { testId: true },
    }),
    tx.radiologyTestService.findMany({
      where: {
        serviceId,
        test: { isDeleted: false },
      },
      select: { testId: true },
    }),
  ]);

  const needsOrderContext =
    pathologyServices.length > 0 || radiologyServices.length > 0;

  if (needsOrderContext && (!patientId || (!opdId && !ipdId))) {
    return apiResponse({
      status: RESPONSE_STATUS.BAD_REQUEST,
      message: "Patient Or Admission Context Not Found",
    });
  }

  if (pathologyServices.length) {
    await tx.pathologyTestOrder.createMany({
      data: pathologyServices.map((service) => ({
        opdId,
        ipdId,
        patientId: patientId!,
        testId: service.testId,
        invoiceBillingItemId: billingItemId,
      })),
    });
  }

  if (radiologyServices.length) {
    await tx.radiologyTestOrder.createMany({
      data: radiologyServices.map((service) => ({
        opdId,
        ipdId,
        patientId: patientId!,
        testId: service.testId,
        invoiceBillingItemId: billingItemId,
      })),
    });
  }

  return null;
};

export const getInvoiceDetailsAPI = async (req: Request) => {
  return validateRequest({
    querySchema: partialInvoiceValidator,
    req,
    onSuccess: async ({ query }) => {
      const { id } = query;

      const existingInvoice = await prisma.invoice.findFirst({
        where: { id, isDeleted: false },
        include: {
          transactions: { include: { receivedBy: { select: { name: true } } } },
          opd: {
            include: {
              consultantDoctor: {
                select: { user: { select: { name: true } } },
              },
              referringDoctor: {
                select: { user: { select: { name: true } } },
              },
              patient: {
                include: {
                  addresses: {
                    where: { type: AddressType["HOME"] },
                    include: { location: true },
                  },
                  contacts: { where: { type: ContactType["PHONE"] } },
                  relations: true,
                },
              },
            },
          },
          ipd: {
            include: {
              consultantDoctor: {
                select: { user: { select: { name: true } } },
              },
              referringDoctor: {
                select: { user: { select: { name: true } } },
              },
              patient: {
                include: {
                  addresses: {
                    where: { type: AddressType["HOME"] },
                    include: { location: true },
                  },
                  contacts: { where: { type: ContactType["PHONE"] } },
                  relations: true,
                },
              },
            },
          },
        },
      });

      if (!existingInvoice) {
        return apiResponse({
          status: RESPONSE_STATUS.BAD_REQUEST,
          message: "Invoice Not Found",
        });
      }

      const invoiceBillingItems = await prisma.billingSection.findMany({
        where: { isDeleted: false },
        include: {
          invoiceBillingItems: {
            where: { invoiceId: id },
            include: {
              service: true,
            },
          },
        },
      });

      return apiResponse({
        status: RESPONSE_STATUS.SUCCESS,
        message: "invoice Fetched Successfully",
        data: { sections: invoiceBillingItems, ...existingInvoice },
      });
    },
  });
};

export const updateInvoiceAPI = async (req: Request, user: User) => {
  return validateRequest({
    bodySchema: updateInvoiceValidator,
    req,
    onSuccess: async ({ body }) => {
      return prisma.$transaction(async (tx) => {
        const { billingSections, transactions, id, ...rest } = body;

        const existingInvoice = await tx.invoice.findFirst({
          where: { id, isDeleted: false },
          include: {
            transactions: true,
            billingItems: true,
            opd: true,
            ipd: true,
          },
        });

        if (!existingInvoice) {
          return apiResponse({
            status: RESPONSE_STATUS.BAD_REQUEST,
            message: "Invoice Not Found",
          });
        }

        /* ------------------------------------------------------- */
        /* 1️⃣ UPDATE OPD MAIN INVOICE */
        /* ------------------------------------------------------- */

        const updatedOpd = await tx.invoice.update({
          where: { id },
          data: {
            rate: rest.rate,
            discountType: rest.discountType,
            discountValue: rest.discountValue,
            total: rest.total,
            isFree: rest.isFree,
            isPaid: !rest.isFree && rest.total === 0 ? false : true,
            updatedBy: user.id,
          },
        });

        /* ------------------------------------------------------- */
        /* 2️⃣ HANDLE BILLING ITEMS (CREATE / UPDATE / DELETE) */
        /* ------------------------------------------------------- */

        const existingItems = existingInvoice.billingItems;

        // Flatten incoming billing items
        const incomingItems =
          billingSections?.flatMap((t) => t.billingItems).flatMap((i) => i) ||
          [];

        const incomingIds = incomingItems
          .map((i) => i.itemId)
          .filter((id): id is number => !!id);

        // DELETE removed items
        const toDelete = existingItems.filter(
          (item) => !incomingIds.includes(item.id),
        );

        if (toDelete.length) {
          await cancelOrdersForBillingItems(
            tx,
            toDelete.map((item) => item.id),
            user.id,
          );

          await tx.invoiceBillingItem.deleteMany({
            where: {
              id: { in: toDelete.map((d) => d.id) },
            },
          });
        }

        const patientId =
          existingInvoice.opd?.patientId ?? existingInvoice.ipd?.patientId;
        const opdId = existingInvoice.opd?.id;
        const ipdId = existingInvoice.ipd?.id;

        const existingItemsById = new Map(
          existingItems.map((item) => [item.id, item]),
        );

        for (const item of incomingItems) {
          if (item.itemId) {
            const previousItem = existingItemsById.get(item.itemId);

            await tx.invoiceBillingItem.update({
              where: { id: item.itemId },
              data: {
                billingSectionId: item.billingSection.id,
                serviceId: item.service.id,
                quantity: item.quantity,
                rate: item.rate,
                discountType: item.discountType,
                discountValue: item.discountValue,
                total: item.total,
                updatedBy: user.id,
              },
            });

            if (previousItem && previousItem.serviceId !== item.service.id) {
              await cancelOrdersForBillingItems(tx, [item.itemId], user.id);

              const orderError = await createOrdersForBillingItem(tx, {
                billingItemId: item.itemId,
                serviceId: item.service.id,
                patientId,
                opdId,
                ipdId,
              });

              if (orderError) {
                return orderError;
              }
            }

            continue;
          }

          const createdItem = await tx.invoiceBillingItem.create({
            data: {
              invoiceId: existingInvoice.id,
              billingSectionId: item.billingSection.id,
              serviceId: item.service.id,
              quantity: item.quantity,
              rate: item.rate,
              discountType: item.discountType,
              discountValue: item.discountValue,
              total: item.total,
              createdBy: user.id,
              updatedBy: user.id,
            },
          });

          const orderError = await createOrdersForBillingItem(tx, {
            billingItemId: createdItem.id,
            serviceId: item.service.id,
            patientId,
            opdId,
            ipdId,
          });

          if (orderError) {
            return orderError;
          }
        }

        /* ------------------------------------------------------- */
        /* 3️⃣ HANDLE TRANSACTIONS (REPLACE STRATEGY) */
        /* ------------------------------------------------------- */

        // Delete all old transactions
        await tx.transaction.deleteMany({
          where: { invoiceId: existingInvoice.id },
        });

        // Create new transactions
        if (!rest.isFree && transactions && transactions.length > 0) {
          await tx.transaction.createMany({
            data: transactions.map((t) => ({
              invoiceId: existingInvoice.id,
              amount: t.amount,
              mode: t.mode,
              remarks: t.remarks,
              receivedById: user.id,
            })),
          });
        }

        /* ------------------------------------------------------- */
        /* 4️⃣ FINAL RESPONSE */
        /* ------------------------------------------------------- */

        return apiResponse({
          status: RESPONSE_STATUS.SUCCESS,
          message: "Invoice updated successfully",
          data: updatedOpd,
        });
      });
    },
  });
};

export const addItemAPI = async (req: Request, user: User) => {
  return validateRequest({
    bodySchema: addInvoiceBillItemValidator,
    req,
    user,
    onSuccess: async ({ body }) => {
      return prisma.$transaction(
        async (tx) => {
          const existingInvoice = await tx.invoice.findFirst({
            where: { id: body.id, isDeleted: false },
            include: {
              opd: true,
              ipd: true,
            },
          });

          if (!existingInvoice) {
            return apiResponse({
              status: RESPONSE_STATUS.BAD_REQUEST,
              message: "Invoice Not Found",
            });
          }

          const createdItem = await tx.invoiceBillingItem.create({
            data: {
              billingSectionId: body.billingSection.id,
              serviceId: body.service.id,
              quantity: body.quantity,
              rate: body.rate,
              discountType: body.discountType,
              discountValue: body.discountValue,
              total: body.total,
              createdBy: user.id,
              updatedBy: user.id,
              createdAt: body.createdAt,
              invoiceId: body.id,
            },
          });

          const subtotalResult = await tx.invoiceBillingItem.aggregate({
            where: { invoiceId: body.id },
            _sum: { total: true },
          });

          const subTotal = subtotalResult._sum.total ?? 0;
          const invoiceDiscount =
            existingInvoice.discountType === "PERCENTAGE"
              ? (subTotal * existingInvoice.discountValue) / 100
              : existingInvoice.discountValue;
          const invoiceTotal = existingInvoice.isFree
            ? 0
            : Math.max(subTotal - invoiceDiscount, 0);

          const updatedInvoice = await tx.invoice.update({
            where: { id: body.id },
            data: {
              rate: subTotal,
              total: invoiceTotal,
              updatedBy: user.id,
            },
          });

          const patientId =
            existingInvoice.opd?.patientId ?? existingInvoice.ipd?.patientId;
          const opdId = existingInvoice.opd?.id;
          const ipdId = existingInvoice.ipd?.id;

          const orderError = await createOrdersForBillingItem(tx, {
            billingItemId: createdItem.id,
            serviceId: body.service.id,
            patientId,
            opdId,
            ipdId,
          });

          if (orderError) {
            return orderError;
          }

          return apiResponse({
            status: RESPONSE_STATUS.CREATED,
            message: "Invoice Created Successfully",
            data: updatedInvoice,
          });
        },
        {
          maxWait: 10000,
          timeout: 20000,
        },
      );
    },
  });
};

export const addTransactionAPI = async (req: Request, user: User) => {
  return validateRequest({
    bodySchema: addInvoiceTransactionValidator,
    req,
    user,
    onSuccess: async ({ body }) => {
      return prisma.$transaction(async (tx) => {
        const existingInvoice = await tx.invoice.findFirst({
          where: { id: body.id, isDeleted: false },
        });

        if (!existingInvoice) {
          return apiResponse({
            status: RESPONSE_STATUS.BAD_REQUEST,
            message: "Invoice Not Found",
          });
        }

        const updatedInvoice = await tx.invoice.update({
          where: { id: body.id },
          data: {
            updatedBy: user.id,
            transactions: {
              create: [
                {
                  amount: body.amount,
                  mode: body.mode,
                  receivedById: user.id,
                  remarks: body.remarks,
                },
              ],
            },
          },
        });

        return apiResponse({
          status: RESPONSE_STATUS.CREATED,
          message: "Transactions Created Successfully",
          data: updatedInvoice,
        });
      });
    },
  });
};
