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

export const getInvoiceDetailsAPI = async (req: Request) => {
  return validateRequest({
    querySchema: partialInvoiceValidator,
    req,
    onSuccess: async ({ query }) => {
      const { id } = query;

      const existingInvoice = await prisma.invoice.findFirst({
        where: { id },
        include: {
          transactions: { include: { receivedBy: { select: { name: true } } } },
          opd: {
            include: {
              patient: {
                include: {
                  addresses: { where: { type: AddressType["HOME"] } },
                  contacts: { where: { type: ContactType["PHONE"] } },
                },
              },
            },
          },
          ipd: {
            include: {
              patient: {
                include: {
                  addresses: { where: { type: AddressType["HOME"] } },
                  contacts: { where: { type: ContactType["PHONE"] } },
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
        where: {},
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
          where: { id },
          include: {
            transactions: true,
            billingItems: true,
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

        console.log(incomingIds, incomingItems, existingInvoice, existingItems);
        // DELETE removed items
        const toDelete = existingItems.filter(
          (item) => !incomingIds.includes(item.id),
        );

        if (toDelete.length) {
          await tx.invoiceBillingItem.deleteMany({
            where: {
              id: { in: toDelete.map((d) => d.id) },
            },
          });
        }

        // UPSERT incoming items
        for (const item of incomingItems) {
          if (item.itemId) {
            // UPDATE
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
              },
            });
          } else {
            // CREATE
            await tx.invoiceBillingItem.create({
              data: {
                invoiceId: existingInvoice.id,
                billingSectionId: item.billingSection.id,
                serviceId: item.service.id,
                quantity: item.quantity,
                rate: item.rate,
                discountType: item.discountType,
                discountValue: item.discountValue,
                total: item.total,
              },
            });
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
      return prisma.$transaction(async (tx) => {
        const existingInvoice = await tx.invoice.findFirst({
          where: { id: body.id },
          include: {
            opd: true,
          },
        });

        if (!existingInvoice) {
          return apiResponse({
            status: RESPONSE_STATUS.BAD_REQUEST,
            message: "Invoice Not Found",
          });
        }

        await tx.invoiceBillingItem.create({
          data: {
            billingSectionId: body.billingSection.id,
            serviceId: body.service.id,
            quantity: body.quantity,
            rate: body.rate,
            discountType: body.discountType,
            discountValue: body.discountValue,
            total: body.total,
            createdAt: body.createdAt,
            invoiceId: body.id,
          },
        });

        const pathologyServices = await tx.pathologyTestService.findMany({
          where: {
            serviceId: { equals: body.service.id },
          },
        });

        const patientId = existingInvoice.opd?.patientId;

        if (!patientId || !existingInvoice.opd) {
          return apiResponse({
            status: RESPONSE_STATUS.BAD_REQUEST,
            message: "Patient Or Opd Not Found",
          });
        }

        if (pathologyServices?.length) {
          await tx.pathologyTestOrder.createMany({
            data: pathologyServices.map((service) => ({
              opdId: existingInvoice.opd!.id,
              patientId: existingInvoice.opd!.patientId,
              testId: service.testId,
            })),
          });
        }

        const radiologyServices = await tx.radiologyTestService.findMany({
          where: {
            serviceId: { equals: body.service.id },
          },
        });

        if (radiologyServices?.length) {
          await tx.radiologyTestOrder.createMany({
            data: radiologyServices.map((service) => ({
              opdId: existingInvoice.opd!.id,
              patientId: existingInvoice.opd!.patientId,
              testId: service.testId,
            })),
          });
        }

        return apiResponse({
          status: RESPONSE_STATUS.CREATED,
          message: "Invoice Created Successfully",
          data: existingInvoice,
        });
      });
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
          where: { id: body.id },
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
