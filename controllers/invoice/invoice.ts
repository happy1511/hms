import {
  AddressType,
  ContactType,
  DiscountType,
  User,
} from "@/generated/prisma/client";
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

const hasBillingItemChanged = (
  existingItem: {
    billingSectionId: number;
    serviceId: number;
    quantity: number;
    rate: number;
    discountType: string;
    discountValue: number;
    total: number;
  },
  incomingItem: {
    billingSection: { id: number };
    service: { id: number };
    quantity: number;
    rate: number;
    discountType: string;
    discountValue: number;
    total: number;
  },
) => {
  return (
    existingItem.billingSectionId !== incomingItem.billingSection.id ||
    existingItem.serviceId !== incomingItem.service.id ||
    existingItem.quantity !== incomingItem.quantity ||
    existingItem.rate !== incomingItem.rate ||
    existingItem.discountType !== incomingItem.discountType ||
    existingItem.discountValue !== incomingItem.discountValue ||
    existingItem.total !== incomingItem.total
  );
};

const getDiscountAmount = (
  amount: number,
  discountType: DiscountType,
  discountValue: number,
) => {
  return discountType === DiscountType.PERCENTAGE
    ? (amount * discountValue) / 100
    : discountValue;
};

const getInvoiceTotalsFromSections = ({
  billingSections,
  invoiceDiscountType,
  invoiceDiscountValue,
  isFree,
}: {
  billingSections: Array<{
    discountType: DiscountType;
    discountValue: number;
    billingItems: Array<{ total: number }>;
  }>;
  invoiceDiscountType: DiscountType;
  invoiceDiscountValue: number;
  isFree: boolean;
}) => {
  const rate = billingSections.reduce((invoiceSum, section) => {
    const sectionSubtotal = section.billingItems.reduce(
      (sum, item) => sum + item.total,
      0,
    );
    const sectionDiscount = getDiscountAmount(
      sectionSubtotal,
      section.discountType,
      section.discountValue,
    );

    return invoiceSum + Math.max(sectionSubtotal - sectionDiscount, 0);
  }, 0);

  const invoiceDiscount = getDiscountAmount(
    rate,
    invoiceDiscountType,
    invoiceDiscountValue,
  );

  return {
    rate,
    total: isFree ? 0 : Math.max(rate - invoiceDiscount, 0),
  };
};

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
          billingSections: {
            include: {
              billingSection: true,
              items: {
                include: {
                  service: true,
                },
              },
            },
          },
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

      const billingSections = await prisma.billingSection.findMany({
        where: { isDeleted: false },
      });

      const invoiceSectionByBillingSectionId = new Map(
        existingInvoice.billingSections.map((section) => [
          section.billingSectionId,
          section,
        ]),
      );

      return apiResponse({
        status: RESPONSE_STATUS.SUCCESS,
        message: "invoice Fetched Successfully",
        data: {
          ...existingInvoice,
          sections: billingSections.map((section) => {
            const invoiceSection = invoiceSectionByBillingSectionId.get(
              section.id,
            );

            return {
              ...section,
              invoiceBillingSectionId: invoiceSection?.id ?? null,
              discountType: invoiceSection?.discountType ?? DiscountType.VALUE,
              discountValue: invoiceSection?.discountValue ?? 0,
              invoiceBillingItems: invoiceSection?.items ?? [],
            };
          }),
        },
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
            billingSections: {
              include: {
                items: true,
              },
            },
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

        /* ------------------------------------------------------- */
        /* 2️⃣ HANDLE BILLING ITEMS (CREATE / UPDATE / DELETE) */
        /* ------------------------------------------------------- */

        const existingItems = existingInvoice.billingSections.flatMap((section) =>
          section.items.map((item) => ({
            ...item,
            invoiceBillingSectionId: section.id,
            updateReason: (item as { updateReason?: string | null }).updateReason,
          })),
        );

        // Flatten incoming billing items
        const incomingItems =
          billingSections?.flatMap((t) => t.billingItems).flatMap((i) => i) ||
          [];

        const incomingIds = incomingItems
          .map((i) => i.itemId)
          .filter((id): id is number => !!id);

        const toDelete = existingItems.filter(
          (item) => !incomingIds.includes(item.id),
        );

        if (toDelete.length) {
          return apiResponse({
            status: RESPONSE_STATUS.BAD_REQUEST,
            message: "Deleting invoice rows is not allowed",
          });
        }

        const patientId =
          existingInvoice.opd?.patientId ?? existingInvoice.ipd?.patientId;
        const opdId = existingInvoice.opd?.id;
        const ipdId = existingInvoice.ipd?.id;

        const existingSectionsByBillingSectionId = new Map(
          existingInvoice.billingSections.map((section) => [
            section.billingSectionId,
            section,
          ]),
        );
        const existingItemsById = new Map(
          existingItems.map((item) => [item.id, item]),
        );
        const resolvedInvoiceSectionIds = new Map<number, number>();

        for (const section of billingSections || []) {
          const existingSection = existingSectionsByBillingSectionId.get(section.id);
          const shouldPersistSection =
            section.billingItems.length > 0 || Number(section.discountValue || 0) > 0;

          if (existingSection) {
            await tx.invoiceBillingSection.update({
              where: { id: existingSection.id },
              data: {
                discountType: section.discountType,
                discountValue: section.discountValue,
                updatedBy: user.id,
              },
            });
            resolvedInvoiceSectionIds.set(section.id, existingSection.id);
            continue;
          }

          if (!shouldPersistSection) {
            continue;
          }

          const createdSection = await tx.invoiceBillingSection.create({
            data: {
              invoiceId: existingInvoice.id,
              billingSectionId: section.id,
              discountType: section.discountType,
              discountValue: section.discountValue,
              createdBy: user.id,
              updatedBy: user.id,
            },
          });

          resolvedInvoiceSectionIds.set(section.id, createdSection.id);
        }

        for (const item of incomingItems) {
          if (item.itemId) {
            const previousItem = existingItemsById.get(item.itemId);
            const itemChanged =
              previousItem && hasBillingItemChanged(previousItem, item);
            const updateReason =
              (typeof item.updateReason === "string"
                ? item.updateReason.trim()
                : "") || null;

            if (itemChanged && !updateReason) {
              return apiResponse({
                status: RESPONSE_STATUS.BAD_REQUEST,
                message: "Update reason is required for edited invoice rows",
              });
            }

            await tx.invoiceBillingItem.update({
              where: { id: item.itemId },
              data: {
                billingSectionId: item.billingSection.id,
                invoiceBillingSectionId:
                  resolvedInvoiceSectionIds.get(item.billingSection.id) ??
                  previousItem?.invoiceBillingSectionId,
                serviceId: item.service.id,
                quantity: item.quantity,
                rate: item.rate,
                discountType: item.discountType,
                discountValue: item.discountValue,
                total: item.total,
                updateReason: itemChanged
                  ? updateReason
                  : previousItem?.updateReason ?? null,
                updatedBy: user.id,
              } as any,
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
              invoiceBillingSectionId:
                resolvedInvoiceSectionIds.get(item.billingSection.id)!,
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

        const totals = getInvoiceTotalsFromSections({
          billingSections:
            billingSections?.map((section) => ({
              discountType: section.discountType,
              discountValue: Number(section.discountValue || 0),
              billingItems: section.billingItems.map((item) => ({
                total: Number(item.total || 0),
              })),
            })) || [],
          invoiceDiscountType: rest.discountType,
          invoiceDiscountValue: Number(rest.discountValue || 0),
          isFree: rest.isFree,
        });

        const updatedOpd = await tx.invoice.update({
          where: { id },
          data: {
            rate: totals.rate,
            discountType: rest.discountType,
            discountValue: rest.discountValue,
            total: totals.total,
            isFree: rest.isFree,
            isPaid: !rest.isFree && totals.total === 0 ? false : true,
            updatedBy: user.id,
          },
        });

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

          let invoiceBillingSection = await tx.invoiceBillingSection.findFirst({
            where: {
              invoiceId: body.id,
              billingSectionId: body.billingSection.id,
            },
          });

          if (!invoiceBillingSection) {
            invoiceBillingSection = await tx.invoiceBillingSection.create({
              data: {
                invoiceId: body.id,
                billingSectionId: body.billingSection.id,
                discountType: DiscountType.VALUE,
                discountValue: 0,
                createdBy: user.id,
                updatedBy: user.id,
              },
            });
          }

          const createdItem = await tx.invoiceBillingItem.create({
            data: {
              billingSectionId: body.billingSection.id,
              invoiceBillingSectionId: invoiceBillingSection.id,
              serviceId: body.service.id,
              quantity: body.quantity,
              rate: body.rate,
              discountType: body.discountType,
              discountValue: body.discountValue,
              total: body.total,
              updateReason: body.updateReason ?? null,
              createdBy: user.id,
              updatedBy: user.id,
              createdAt: body.createdAt,
              invoiceId: body.id,
            },
          });

          const invoiceSections = await tx.invoiceBillingSection.findMany({
            where: { invoiceId: body.id },
            include: {
              items: {
                select: {
                  total: true,
                },
              },
            },
          });

          const totals = getInvoiceTotalsFromSections({
            billingSections: invoiceSections.map((section) => ({
              discountType: section.discountType,
              discountValue: section.discountValue,
              billingItems: section.items,
            })),
            invoiceDiscountType: existingInvoice.discountType,
            invoiceDiscountValue: existingInvoice.discountValue,
            isFree: existingInvoice.isFree,
          });

          const updatedInvoice = await tx.invoice.update({
            where: { id: body.id },
            data: {
              rate: totals.rate,
              total: totals.total,
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
