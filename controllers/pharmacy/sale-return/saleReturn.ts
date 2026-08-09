import {
  TransactionType,
  type Prisma,
  type User,
} from "@/generated/prisma/client";
import { apiResponse } from "@/lib/apiResponse";
import { getNetInvoicePaidAmount } from "@/lib/invoiceTransactions";
import { RESPONSE_STATUS } from "@/lib/responseStatus";
import { validateRequest } from "@/lib/validator";
import { prisma } from "@/services/prisma";
import { saleReturnValidator } from "@/validators/api/masters/pharmacySaleReturn";

const round2 = (value: number) => Number(value.toFixed(2));

const toPieces = ({
  quantity,
  isLooseQuantity,
  packSize,
}: {
  quantity: number;
  isLooseQuantity: boolean;
  packSize: number;
}) =>
  isLooseQuantity ? Number(quantity || 0) : Number(quantity || 0) * packSize;

const saleReturnInclude = {
  items: {
    include: {
      saleItem: {
        include: {
          inventoryItem: {
            include: {
              drug: true,
              supplier: true,
              hsnSac: true,
            },
          },
        },
      },
      inventoryItem: {
        include: {
          drug: true,
          supplier: true,
          hsnSac: true,
        },
      },
    },
  },
  refundTransaction: true,
  drugBill: {
    include: {
      invoice: {
        include: {
          transactions: {
            include: {
              receivedBy: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
      },
      customer: {
        include: {
          patient: true,
        },
      },
      patient: true,
      doctor: true,
    },
  },
} satisfies Prisma.SaleReturnInclude;

export const createAPI = async (req: Request, user: User) => {
  return validateRequest({
    bodySchema: saleReturnValidator,
    req,
    user,
    onSuccess: async ({ body, user }) => {
      return prisma.$transaction(async (tx) => {
        const bill = await tx.drugBill.findFirst({
          where: {
            id: body.drugBillId,
            isDeleted: false,
            invoice: { isDeleted: false },
          },
          include: {
            patient: true,
            customer: { include: { patient: true } },
            doctor: true,
            invoice: {
              include: {
                transactions: true,
              },
            },
            saleItems: {
              include: {
                inventoryItem: {
                  include: {
                    drug: true,
                    supplier: true,
                    hsnSac: true,
                  },
                },
                returnItems: {
                  where: {
                    saleReturn: {
                      isDeleted: false,
                    },
                  },
                },
              },
            },
          },
        });

        if (!bill) {
          return apiResponse({
            status: RESPONSE_STATUS.NOT_FOUND,
            message: "Sale bill not found",
          });
        }

        const selectedItems = body.items.filter(
          (item) => Number(item.quantity || 0) > 0,
        );
        const saleItemsById = new Map(
          bill.saleItems.map((item) => [item.id, item]),
        );
        const preparedItems: Array<{
          drugSaleItemId: number;
          inventoryItemId: number;
          quantity: number;
          isLooseQuantity: boolean;
          rate: number;
          discountType: (typeof bill.saleItems)[number]["discountType"];
          discountValue: number;
          taxableAmount: number;
          gstPercentage: number;
          cGstPercentage: number;
          sGstPercentage: number;
          iGstPercentage: number;
          gstAmount: number;
          cGstAmount: number;
          sGstAmount: number;
          iGstAmount: number;
          total: number;
        }> = [];

        for (const selectedItem of selectedItems) {
          const saleItem = saleItemsById.get(selectedItem.saleItemId);

          if (!saleItem) {
            return apiResponse({
              status: RESPONSE_STATUS.BAD_REQUEST,
              message: `Sale item ${selectedItem.saleItemId} not found`,
            });
          }

          if (saleItem.inventoryItemId !== selectedItem.inventoryItemId) {
            return apiResponse({
              status: RESPONSE_STATUS.BAD_REQUEST,
              message: `Inventory mismatch for item ${selectedItem.saleItemId}`,
            });
          }

          const packSize = Math.max(
            Number(saleItem.inventoryItem.itemsPerPack || 1),
            1,
          );
          const soldPieces = toPieces({
            quantity: saleItem.quantity,
            isLooseQuantity: Boolean(saleItem.isLooseQuantity),
            packSize,
          });
          const returnedPieces = saleItem.returnItems.reduce(
            (sum, returnItem) =>
              sum +
              toPieces({
                quantity: returnItem.quantity,
                isLooseQuantity: Boolean(returnItem.isLooseQuantity),
                packSize,
              }),
            0,
          );
          const requestedPieces = toPieces({
            quantity: Number(selectedItem.quantity || 0),
            isLooseQuantity: Boolean(selectedItem.isLooseQuantity),
            packSize,
          });
          const remainingPieces = Math.max(soldPieces - returnedPieces, 0);

          if (requestedPieces > remainingPieces) {
            return apiResponse({
              status: RESPONSE_STATUS.BAD_REQUEST,
              message: `${saleItem.inventoryItem.drug.name} exceeds returnable quantity`,
            });
          }

          const ratio = soldPieces > 0 ? requestedPieces / soldPieces : 0;
          const pieceRate = saleItem.isLooseQuantity
            ? Number(saleItem.rate || 0)
            : Number(saleItem.rate || 0) / packSize;
          const lineRate = Boolean(selectedItem.isLooseQuantity)
            ? pieceRate
            : pieceRate * packSize;

          preparedItems.push({
            drugSaleItemId: saleItem.id,
            inventoryItemId: saleItem.inventoryItemId,
            quantity: Number(selectedItem.quantity || 0),
            isLooseQuantity: Boolean(selectedItem.isLooseQuantity),
            rate: round2(lineRate),
            discountType: saleItem.discountType,
            discountValue: round2(Number(saleItem.discountValue || 0) * ratio),
            taxableAmount: round2(Number(saleItem.taxableAmount || 0) * ratio),
            gstPercentage: Number(saleItem.gstPercentage || 0),
            cGstPercentage: Number(saleItem.cGstPercentage || 0),
            sGstPercentage: Number(saleItem.sGstPercentage || 0),
            iGstPercentage: Number(saleItem.iGstPercentage || 0),
            gstAmount: round2(Number(saleItem.gstAmount || 0) * ratio),
            cGstAmount: round2(Number(saleItem.cGstAmount || 0) * ratio),
            sGstAmount: round2(Number(saleItem.sGstAmount || 0) * ratio),
            iGstAmount: round2(Number(saleItem.iGstAmount || 0) * ratio),
            total: round2(Number(saleItem.total || 0) * ratio),
          });
        }

        const refundAmount = round2(
          preparedItems.reduce((sum, item) => sum + Number(item.total || 0), 0),
        );

        if (refundAmount <= 0) {
          return apiResponse({
            status: RESPONSE_STATUS.BAD_REQUEST,
            message: "Refund amount must be greater than 0",
          });
        }

        const currentNetPaid = getNetInvoicePaidAmount(
          bill.invoice.transactions,
        );
        if (refundAmount > currentNetPaid) {
          return apiResponse({
            status: RESPONSE_STATUS.BAD_REQUEST,
            message: "Refund amount cannot exceed collected amount",
          });
        }

        const refundTransaction = await tx.transaction.create({
          data: {
            invoiceId: bill.invoiceId,
            amount: refundAmount,
            mode: body.refundMode,
            transactionType: TransactionType.REFUND,
            remarks: body.remarks,
            receivedById: user.id,
            createdAt: body.createdAt,
          },
        });

        const nextNetPaid = round2(currentNetPaid - refundAmount);
        await tx.invoice.update({
          where: { id: bill.invoiceId },
          data: {
            updatedBy: user.id,
            isPaid:
              !bill.invoice.isFree &&
              nextNetPaid >= Number(bill.invoice.total || 0) &&
              Number(bill.invoice.total || 0) > 0,
          },
        });

        const saleReturn = await tx.saleReturn.create({
          data: {
            drugBillId: bill.id,
            refundAmount,
            refundMode: body.refundMode,
            remarks: body.remarks,
            refundTransactionId: refundTransaction.id,
            createdBy: user.id,
            updatedBy: user.id,
            createdAt: body.createdAt,
            items: {
              create: preparedItems,
            },
          },
          include: saleReturnInclude,
        });

        for (const item of preparedItems) {
          const inventory = bill.saleItems.find(
            (saleItem) => saleItem.inventoryItemId === item.inventoryItemId,
          )?.inventoryItem;
          const packSize = Math.max(Number(inventory?.itemsPerPack || 1), 1);
          const restockedPieces = toPieces({
            quantity: item.quantity,
            isLooseQuantity: item.isLooseQuantity,
            packSize,
          });

          await tx.inventoryItems.update({
            where: { id: item.inventoryItemId },
            data: {
              quantityInStock: {
                increment: restockedPieces,
              },
              updatedBy: user.id,
            },
          });
        }

        return apiResponse({
          status: RESPONSE_STATUS.CREATED,
          message: "Sale return created successfully",
          data: saleReturn,
        });
      });
    },
  });
};
