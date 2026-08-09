import { Prisma, User } from "@/generated/prisma/client";
import { apiResponse } from "@/lib/apiResponse";
import { RESPONSE_STATUS } from "@/lib/responseStatus";
import { validateRequest } from "@/lib/validator";
import { prisma } from "@/services/prisma";
import { paginationValidator } from "@/validators/api/common/pagination";
import {
  partialSaleBillValidator,
  saleBillValidator,
} from "@/validators/api/masters/pharmacySaleBill";

const buildRequestedQtyMap = (
  items: {
    inventoryItem: { id: number };
    quantity: number;
    isLooseQuantity?: boolean;
  }[],
  inventoryById?: Map<number, { itemsPerPack: number }>,
) => {
  const qtyMap = new Map<number, number>();
  for (const item of items) {
    const previous = qtyMap.get(item.inventoryItem.id) ?? 0;
    const packSize = Math.max(
      Number(inventoryById?.get(item.inventoryItem.id)?.itemsPerPack || 1),
      1,
    );
    const requestedPieces = Boolean(item.isLooseQuantity)
      ? Number(item.quantity)
      : Number(item.quantity) * packSize;
    qtyMap.set(item.inventoryItem.id, previous + requestedPieces);
  }
  return qtyMap;
};

const round2 = (n: number) => Number(n.toFixed(2));
const getBaseRate = ({
  inventory,
  isWholesaleBill,
  isLooseQuantity,
}: {
  inventory: {
    wholeSalePrice: number;
    sellingPrice: number;
    itemsPerPack: number;
  };
  isWholesaleBill: boolean;
  isLooseQuantity?: boolean;
}) => {
  const packageRate = Number(
    isWholesaleBill
      ? inventory.wholeSalePrice || 0
      : inventory.sellingPrice || 0,
  );
  if (!isLooseQuantity) {
    return packageRate;
  }

  return packageRate / Math.max(Number(inventory.itemsPerPack || 1), 1);
};

export const getAPI = async (req: Request) => {
  return validateRequest({
    querySchema: paginationValidator,
    req,
    onSuccess: async ({ query }) => {
      const page = Number(query.page ?? 1);
      const limit = Number(query.limit ?? 10);
      const search = query.search ?? "";
      const createdAtFrom = query["createdAt[from]"] ?? "";
      const createdAtTo = query["createdAt[to]"] ?? "";
      const skip = (page - 1) * limit;

      const and: Prisma.DrugBillWhereInput[] = [];

      if (search) {
        and.push({
          OR: [
            ...(Number.isFinite(Number(search))
              ? [{ id: Number(search) }]
              : []),
            { name: { contains: search } },
            { customer: { name: { contains: search } } },
            { patient: { firstName: { contains: search } } },
            { patient: { lastName: { contains: search } } },
          ],
        });
      }
      and.push({ isDeleted: false, invoice: { isDeleted: false } });

      if (createdAtFrom || createdAtTo) {
        and.push({
          invoice: {
            createdAt: {
              ...(createdAtFrom && { gte: createdAtFrom }),
              ...(createdAtTo && { lte: createdAtTo }),
            },
          },
        });
      }

      const where: Prisma.DrugBillWhereInput = and.length ? { AND: and } : {};

      const [items, total] = await prisma.$transaction([
        prisma.drugBill.findMany({
          skip,
          take: limit,
          orderBy: { id: "desc" },
          where,
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
              },
            },
            saleReturns: {
              where: { isDeleted: false },
              include: {
                items: true,
                refundTransaction: true,
              },
            },
          },
        }),
        prisma.drugBill.count({ where }),
      ]);

      return apiResponse({
        status: RESPONSE_STATUS.SUCCESS,
        message: "Sale bills fetched successfully",
        data: items,
        total,
      });
    },
  });
};

export const getDetailsAPI = async (
  req: Request,
  { params }: { params: { billId: string } },
) => {
  return validateRequest({
    paramsSchema: partialSaleBillValidator,
    params,
    req,
    onSuccess: async ({ params }) => {
      const details = await prisma.drugBill.findFirst({
        where: {
          id: params.billId,
          isDeleted: false,
          invoice: { isDeleted: false },
        },
        include: {
          patient: true,
          customer: { include: { patient: true } },
          doctor: true,
          invoice: {
            include: {
              transactions: {
                include: { receivedBy: { select: { name: true } } },
              },
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
            },
          },
          saleReturns: {
            where: { isDeleted: false },
            include: {
              items: true,
              refundTransaction: true,
            },
          },
        },
      });

      if (!details) {
        return apiResponse({
          status: RESPONSE_STATUS.NOT_FOUND,
          message: "Sale bill not found",
        });
      }

      return apiResponse({
        status: RESPONSE_STATUS.SUCCESS,
        message: "Sale bill fetched successfully",
        data: details,
      });
    },
  });
};

export const createAPI = async (req: Request, user: User) => {
  return validateRequest({
    bodySchema: saleBillValidator,
    req,
    user,
    onSuccess: async ({ body, user }) => {
      return prisma.$transaction(async (tx) => {
        if (body.patientId) {
          const patient = await tx.patient.findUnique({
            where: { id: body.patientId },
            select: { id: true },
          });
          if (!patient) {
            return apiResponse({
              status: RESPONSE_STATUS.BAD_REQUEST,
              message: "Patient not found",
            });
          }
        }

        if (body.customerId) {
          const customer = await tx.pharmacyCustomer.findUnique({
            where: { id: body.customerId },
            select: { id: true, isDeleted: true },
          });

          if (!customer || customer.isDeleted) {
            return apiResponse({
              status: RESPONSE_STATUS.BAD_REQUEST,
              message: "Customer not found",
            });
          }
        }

        if (body.doctorId) {
          const doctor = await tx.doctor.findUnique({
            where: { id: body.doctorId },
          });
          if (!doctor) {
            return apiResponse({
              status: RESPONSE_STATUS.BAD_REQUEST,
              message: "Doctor not found",
            });
          }
        }

        const inventoryIds = [
          ...new Set(body.items.map((item) => item.inventoryItem.id)),
        ];

        const inventoryRows = await tx.inventoryItems.findMany({
          where: { id: { in: inventoryIds } },
          include: { drug: true, supplier: true, hsnSac: true },
        });

        if (inventoryRows.length !== inventoryIds.length) {
          return apiResponse({
            status: RESPONSE_STATUS.BAD_REQUEST,
            message: "One or more inventory items were not found",
          });
        }

        const inventoryById = new Map(inventoryRows.map((i) => [i.id, i]));
        const requestedQty = buildRequestedQtyMap(body.items, inventoryById);

        for (const [inventoryId, requestedPieces] of requestedQty) {
          const row = inventoryById.get(inventoryId)!;
          if (requestedPieces > row.quantityInStock) {
            return apiResponse({
              status: RESPONSE_STATUS.BAD_REQUEST,
              message: `Insufficient stock for ${row.drug.name}`,
            });
          }
        }

        const preparedItems = body.items.map((item) => {
          const inventory = inventoryById.get(item.inventoryItem.id)!;
          const rate = Number(
            item.rate ??
              getBaseRate({
                inventory,
                isWholesaleBill: body.isWholesaleBill,
                isLooseQuantity: item.isLooseQuantity,
              }),
          );
          const gross = rate * item.quantity;
          const discount =
            item.discountType === "PERCENTAGE"
              ? (gross * item.discountValue) / 100
              : item.discountValue;
          const taxableAmount = Math.max(gross - discount, 0);

          const taxSource = inventory.hsnSac;
          const gstPercentage = Number(
            (taxSource?.cGstPercentage || 0) +
              (taxSource?.sGstPercentage || 0) +
              (taxSource?.iGstPercentage || 0),
          );
          const cGstPercentage = Number(taxSource?.cGstPercentage ?? 0);
          const sGstPercentage = Number(taxSource?.sGstPercentage ?? 0);
          const iGstPercentage = Number(taxSource?.iGstPercentage ?? 0);

          const cGstAmount = round2((taxableAmount * cGstPercentage) / 100);
          const sGstAmount = round2((taxableAmount * sGstPercentage) / 100);
          const iGstAmount = round2((taxableAmount * iGstPercentage) / 100);
          const gstAmount = round2(cGstAmount + sGstAmount + iGstAmount);
          const lineTotal = round2(taxableAmount + gstAmount);

          return {
            inventoryItemId: inventory.id,
            quantity: item.quantity,
            isLooseQuantity: Boolean(item.isLooseQuantity),
            rate,
            discountType: item.discountType,
            discountValue: item.discountValue,
            taxableAmount: round2(taxableAmount),
            gstPercentage,
            cGstPercentage,
            sGstPercentage,
            iGstPercentage,
            gstAmount,
            cGstAmount,
            sGstAmount,
            iGstAmount,
            total: lineTotal,
          };
        });

        const subtotal = round2(
          preparedItems.reduce((sum, item) => sum + item.total, 0),
        );
        const invoiceDiscount =
          body.discountType === "PERCENTAGE"
            ? (subtotal * body.discountValue) / 100
            : body.discountValue;
        const finalTotal = body.isFree
          ? 0
          : round2(Math.max(subtotal - invoiceDiscount, 0));
        const transactionSum = round2(
          body.transactions.reduce((sum, t) => sum + Number(t.amount), 0),
        );

        if (!body.isFree && transactionSum > finalTotal) {
          return apiResponse({
            status: RESPONSE_STATUS.BAD_REQUEST,
            message: `Transaction total (${transactionSum}) cannot exceed bill total (${finalTotal})`,
          });
        }

        const invoice = await tx.invoice.create({
          data: {
            rate: subtotal,
            discountType: body.discountType,
            discountValue: body.discountValue,
            total: finalTotal,
            isFree: body.isFree,
            isPaid: !body.isFree && body.transactions.length > 0,
            billingType: body.billingType,
            transactions: {
              create: body.isFree
                ? []
                : body.transactions.map((t) => ({
                    amount: t.amount,
                    mode: t.mode,
                    remarks: t.remarks,
                    receivedById: user.id,
                  })),
            },
            createdAt: body.createdAt,
            createdBy: user.id,
            updatedBy: user.id,
          },
        });

        const saleBill = await tx.drugBill.create({
          data: {
            name: body.name,
            patientId: body.patientId,
            customerId: body.customerId,
            doctorId: body.doctorId,
            invoiceId: invoice.id,
            isWholesaleBill: body.isWholesaleBill,
            isLooseBill: body.isLooseBill,
            createdBy: user.id,
            updatedBy: user.id,
            saleItems: {
              create: preparedItems,
            },
          },
          include: {
            invoice: true,
            patient: true,
            customer: { include: { patient: true } },
            doctor: true,
            saleItems: {
              include: {
                inventoryItem: {
                  include: {
                    drug: true,
                    hsnSac: true,
                  },
                },
              },
            },
          },
        });

        for (const [inventoryItemId, quantityInPieces] of requestedQty) {
          await tx.inventoryItems.update({
            where: { id: inventoryItemId },
            data: {
              quantityInStock: {
                decrement: quantityInPieces,
              },
              updatedBy: user.id,
            },
          });
        }

        return apiResponse({
          status: RESPONSE_STATUS.CREATED,
          message: "Sale bill created successfully",
          data: saleBill,
        });
      });
    },
  });
};

export const updateAPI = async (
  req: Request,
  { params }: { params: { billId: string } },
  user: User,
) => {
  return validateRequest({
    bodySchema: partialSaleBillValidator,
    paramsSchema: partialSaleBillValidator,
    params,
    req,
    user,
    onSuccess: async ({ body, params, user }) => {
      return prisma.$transaction(async (tx) => {
        const billId = Number(params.billId);
        const existingBill = await tx.drugBill.findFirst({
          where: {
            id: billId,
            isDeleted: false,
            invoice: { isDeleted: false },
          },
          include: {
            invoice: { include: { transactions: true } },
            saleItems: {
              select: {
                inventoryItemId: true,
                quantity: true,
                isLooseQuantity: true,
              },
            },
          },
        });

        if (!existingBill) {
          return apiResponse({
            status: RESPONSE_STATUS.NOT_FOUND,
            message: "Sale bill not found",
          });
        }

        const items = body.items ?? [];
        if (!items.length) {
          return apiResponse({
            status: RESPONSE_STATUS.BAD_REQUEST,
            message: "At least one sale item is required",
          });
        }

        if (body.patientId) {
          const patient = await tx.patient.findUnique({
            where: { id: body.patientId },
            select: { id: true },
          });
          if (!patient) {
            return apiResponse({
              status: RESPONSE_STATUS.BAD_REQUEST,
              message: "Patient not found",
            });
          }
        }

        if (body.customerId) {
          const customer = await tx.pharmacyCustomer.findUnique({
            where: { id: body.customerId },
            select: { id: true, isDeleted: true },
          });

          if (!customer || customer.isDeleted) {
            return apiResponse({
              status: RESPONSE_STATUS.BAD_REQUEST,
              message: "Customer not found",
            });
          }
        }

        if (body.doctorId) {
          const doctor = await tx.doctor.findUnique({
            where: { id: body.doctorId },
          });
          if (!doctor) {
            return apiResponse({
              status: RESPONSE_STATUS.BAD_REQUEST,
              message: "Doctor not found",
            });
          }
        }

        const allInventoryIds = [
          ...new Set([
            ...items.map((item) => item.inventoryItem.id),
            ...existingBill.saleItems.map((item) => item.inventoryItemId),
          ]),
        ];
        const inventoryRows = await tx.inventoryItems.findMany({
          where: { id: { in: allInventoryIds } },
          include: { drug: true, hsnSac: true },
        });

        if (inventoryRows.length !== allInventoryIds.length) {
          return apiResponse({
            status: RESPONSE_STATUS.BAD_REQUEST,
            message: "One or more inventory items were not found",
          });
        }

        const inventoryById = new Map(inventoryRows.map((i) => [i.id, i]));
        const requestedQty = buildRequestedQtyMap(items, inventoryById);
        const existingPieces = new Map<number, number>();
        for (const existing of existingBill.saleItems) {
          const inventory = inventoryById.get(existing.inventoryItemId);
          const packSize = Math.max(Number(inventory?.itemsPerPack || 1), 1);
          const previous = existingPieces.get(existing.inventoryItemId) ?? 0;
          const restoredPieces = existing.isLooseQuantity
            ? existing.quantity
            : existing.quantity * packSize;
          existingPieces.set(
            existing.inventoryItemId,
            previous + restoredPieces,
          );
        }

        for (const [inventoryId, requestedPieces] of requestedQty) {
          const row = inventoryById.get(inventoryId)!;
          const available =
            row.quantityInStock + (existingPieces.get(inventoryId) ?? 0);
          if (requestedPieces > available) {
            return apiResponse({
              status: RESPONSE_STATUS.BAD_REQUEST,
              message: `Insufficient stock for ${row.drug.name}`,
            });
          }
        }

        const preparedItems = items.map((item) => {
          const inventory = inventoryById.get(item.inventoryItem.id)!;
          const rate = Number(
            item.rate ??
              getBaseRate({
                inventory,
                isWholesaleBill:
                  body.isWholesaleBill ?? existingBill.isWholesaleBill,
                isLooseQuantity: item.isLooseQuantity,
              }),
          );
          const gross = rate * item.quantity;
          const discount =
            item.discountType === "PERCENTAGE"
              ? (gross * item.discountValue) / 100
              : item.discountValue;
          const taxableAmount = Math.max(gross - discount, 0);

          const taxSource = inventory.hsnSac;
          const gstPercentage = Number(
            (taxSource?.cGstPercentage || 0) +
              (taxSource?.sGstPercentage || 0) +
              (taxSource?.iGstPercentage || 0),
          );
          const cGstPercentage = Number(taxSource?.cGstPercentage ?? 0);
          const sGstPercentage = Number(taxSource?.sGstPercentage ?? 0);
          const iGstPercentage = Number(taxSource?.iGstPercentage ?? 0);

          const cGstAmount = round2((taxableAmount * cGstPercentage) / 100);
          const sGstAmount = round2((taxableAmount * sGstPercentage) / 100);
          const iGstAmount = round2((taxableAmount * iGstPercentage) / 100);
          const gstAmount = round2(cGstAmount + sGstAmount + iGstAmount);
          const lineTotal = round2(taxableAmount + gstAmount);

          return {
            inventoryItemId: inventory.id,
            quantity: item.quantity,
            isLooseQuantity: Boolean(item.isLooseQuantity),
            rate,
            discountType: item.discountType,
            discountValue: item.discountValue,
            taxableAmount: round2(taxableAmount),
            gstPercentage,
            cGstPercentage,
            sGstPercentage,
            iGstPercentage,
            gstAmount,
            cGstAmount,
            sGstAmount,
            iGstAmount,
            total: lineTotal,
          };
        });

        const discountType =
          body.discountType ?? existingBill.invoice.discountType;
        const discountValue =
          body.discountValue ?? existingBill.invoice.discountValue;
        const isFree = body.isFree ?? existingBill.invoice.isFree;
        const billingType =
          body.billingType ?? existingBill.invoice.billingType;
        const transactions = body.transactions ?? [];

        const subtotal = round2(
          preparedItems.reduce((sum, item) => sum + item.total, 0),
        );
        const invoiceDiscount =
          discountType === "PERCENTAGE"
            ? (subtotal * discountValue) / 100
            : discountValue;
        const finalTotal = isFree
          ? 0
          : round2(Math.max(subtotal - invoiceDiscount, 0));
        const transactionSum = round2(
          transactions.reduce((sum, t) => sum + Number(t.amount), 0),
        );

        if (!isFree && transactionSum > finalTotal) {
          return apiResponse({
            status: RESPONSE_STATUS.BAD_REQUEST,
            message: `Transaction total (${transactionSum}) cannot exceed bill total (${finalTotal})`,
          });
        }

        await tx.transaction.deleteMany({
          where: { invoiceId: existingBill.invoiceId },
        });

        if (!isFree && transactions.length) {
          await tx.transaction.createMany({
            data: transactions.map((t) => ({
              invoiceId: existingBill.invoiceId,
              amount: t.amount,
              mode: t.mode,
              remarks: t.remarks,
              receivedById: user.id,
            })),
          });
        }

        await tx.invoice.update({
          where: { id: existingBill.invoiceId },
          data: {
            rate: subtotal,
            discountType,
            discountValue,
            total: finalTotal,
            isFree,
            isPaid: !isFree && transactions.length > 0,
            billingType,
            updatedBy: user.id,
          },
        });

        await tx.drugSaleItem.deleteMany({
          where: { drugBillId: existingBill.id },
        });

        await tx.drugBill.update({
          where: { id: existingBill.id },
          data: {
            name: body.name ?? existingBill.name,
            patientId: body.patientId,
            customerId: body.customerId,
            doctorId: body.doctorId,
            isWholesaleBill:
              body.isWholesaleBill ?? existingBill.isWholesaleBill,
            isLooseBill: body.isLooseBill ?? existingBill.isLooseBill,
            updatedBy: user.id,
            saleItems: {
              create: preparedItems,
            },
          },
        });

        for (const inventoryId of allInventoryIds) {
          const row = inventoryById.get(inventoryId)!;
          const restocked =
            row.quantityInStock + (existingPieces.get(inventoryId) ?? 0);
          const nextQty = restocked - (requestedQty.get(inventoryId) ?? 0);

          await tx.inventoryItems.update({
            where: { id: inventoryId },
            data: {
              quantityInStock: nextQty,
              updatedBy: user.id,
            },
          });
        }

        const updatedBill = await tx.drugBill.findUnique({
          where: { id: existingBill.id },
          include: {
            patient: true,
            customer: { include: { patient: true } },
            doctor: true,
            invoice: { include: { transactions: true } },
            saleItems: {
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
          },
        });

        return apiResponse({
          status: RESPONSE_STATUS.SUCCESS,
          message: "Sale bill updated successfully",
          data: updatedBill,
        });
      });
    },
  });
};

export const deleteAPI = async (
  req: Request,
  { params }: { params: { billId: string } },
  user: User,
) => {
  return validateRequest({
    paramsSchema: partialSaleBillValidator,
    params,
    req,
    onSuccess: async ({ params }) => {
      return prisma.$transaction(async (tx) => {
        const billId = Number(params.billId);
        const existingBill = await tx.drugBill.findFirst({
          where: {
            id: billId,
            isDeleted: false,
            invoice: { isDeleted: false },
          },
          include: {
            saleItems: {
              select: {
                inventoryItemId: true,
                quantity: true,
                isLooseQuantity: true,
              },
            },
          },
        });

        if (!existingBill) {
          return apiResponse({
            status: RESPONSE_STATUS.NOT_FOUND,
            message: "Sale bill not found",
          });
        }

        const restoreInventoryIds = [
          ...new Set(
            existingBill.saleItems.map((item) => item.inventoryItemId),
          ),
        ];

        const inventoryRows = await tx.inventoryItems.findMany({
          where: { id: { in: restoreInventoryIds } },
          select: { id: true, itemsPerPack: true },
        });
        const packSizeByInventoryId = new Map(
          inventoryRows.map((row) => [
            row.id,
            Math.max(Number(row.itemsPerPack || 1), 1),
          ]),
        );

        for (const inventoryItemId of restoreInventoryIds) {
          const restoredPieces = existingBill.saleItems
            .filter((item) => item.inventoryItemId === inventoryItemId)
            .reduce((sum, item) => {
              const packSize = packSizeByInventoryId.get(inventoryItemId) ?? 1;
              return (
                sum +
                (item.isLooseQuantity
                  ? item.quantity
                  : item.quantity * packSize)
              );
            }, 0);

          await tx.inventoryItems.update({
            where: { id: inventoryItemId },
            data: {
              quantityInStock: {
                increment: restoredPieces,
              },
              updatedBy: user.id,
            },
          });
        }

        await tx.invoice.update({
          where: { id: existingBill.invoiceId },
          data: {
            isDeleted: true,
            deletedBy: user.id,
            updatedBy: user.id,
          },
        });

        await tx.drugBill.update({
          where: { id: existingBill.id },
          data: {
            isDeleted: true,
            deletedBy: user.id,
            updatedBy: user.id,
          },
        });

        return apiResponse({
          status: RESPONSE_STATUS.SUCCESS,
          message: "Sale bill deleted successfully",
          data: null,
        });
      });
    },
  });
};
