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
  items: { inventoryItem: { id: number }; quantity: number }[],
) => {
  const qtyMap = new Map<number, number>();
  for (const item of items) {
    const previous = qtyMap.get(item.inventoryItem.id) ?? 0;
    qtyMap.set(item.inventoryItem.id, previous + Number(item.quantity));
  }
  return qtyMap;
};

const round2 = (n: number) => Number(n.toFixed(2));

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
            { name: { contains: search } },
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
            doctor: { include: { user: true } },
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
                  },
                },
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
          doctor: { include: { user: true } },
          invoice: {
            include: {
              transactions: { include: { receivedBy: { select: { name: true } } } },
            },
          },
          saleItems: {
            include: {
              inventoryItem: {
                include: {
                  drug: true,
                  supplier: true,
                },
              },
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

        if (body.doctorId) {
          const doctor = await tx.doctor.findUnique({
            where: { userId: body.doctorId },
            select: { userId: true },
          });
          if (!doctor) {
            return apiResponse({
              status: RESPONSE_STATUS.BAD_REQUEST,
              message: "Doctor not found",
            });
          }
        }

        const requestedQty = buildRequestedQtyMap(body.items);
        const inventoryIds = [...requestedQty.keys()];

        const inventoryRows = await tx.inventoryItems.findMany({
          where: { id: { in: inventoryIds } },
          include: { drug: true, supplier: true },
        });

        if (inventoryRows.length !== inventoryIds.length) {
          return apiResponse({
            status: RESPONSE_STATUS.BAD_REQUEST,
            message: "One or more inventory items were not found",
          });
        }

        const inventoryById = new Map(inventoryRows.map((i) => [i.id, i]));

        for (const [inventoryId, qty] of requestedQty) {
          const row = inventoryById.get(inventoryId)!;
          if (qty > row.quantityInStock) {
            return apiResponse({
              status: RESPONSE_STATUS.BAD_REQUEST,
              message: `Insufficient stock for ${row.drug.name}`,
            });
          }
        }

        const preparedItems = body.items.map((item) => {
          const inventory = inventoryById.get(item.inventoryItem.id)!;
          const rate = Number(item.rate ?? inventory.sellingPrice);
          const gross = rate * item.quantity;
          const discount =
            item.discountType === "PERCENTAGE"
              ? (gross * item.discountValue) / 100
              : item.discountValue;
          const taxableAmount = Math.max(gross - discount, 0);

          const gstPercentage = Number(inventory.drug.gstPercentage ?? 0);
          const cGstPercentage = Number(inventory.drug.cGstPercentage ?? 0);
          const sGstPercentage = Number(inventory.drug.sGstPercentage ?? 0);
          const iGstPercentage = Number(inventory.drug.iGstPercentage ?? 0);

          const cGstAmount = round2((taxableAmount * cGstPercentage) / 100);
          const sGstAmount = round2((taxableAmount * sGstPercentage) / 100);
          const iGstAmount = round2((taxableAmount * iGstPercentage) / 100);
          const explicitTax = cGstAmount + sGstAmount + iGstAmount;
          const fallbackTax = round2((taxableAmount * gstPercentage) / 100);
          const gstAmount = explicitTax > 0 ? explicitTax : fallbackTax;
          const lineTotal = round2(taxableAmount + gstAmount);

          return {
            inventoryItemId: inventory.id,
            quantity: item.quantity,
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
            createdBy: user.id ,
            updatedBy: user.id ,
          },
        });

        const saleBill = await tx.drugBill.create({
          data: {
            name: body.name,
            patientId: body.patientId,
            doctorId: body.doctorId,
            invoiceId: invoice.id,
            createdBy: user.id ,
            updatedBy: user.id ,
            saleItems: {
              create: preparedItems,
            },
          },
          include: {
            invoice: true,
            patient: true,
            doctor: { include: { user: true } },
            saleItems: { include: { inventoryItem: { include: { drug: true } } } },
          },
        });

        for (const [inventoryItemId, quantity] of requestedQty) {
          await tx.inventoryItems.update({
            where: { id: inventoryItemId },
            data: {
              quantityInStock: {
                decrement: quantity,
              },
              updatedBy: user.id ,
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
          where: { id: billId, isDeleted: false, invoice: { isDeleted: false } },
          include: {
            invoice: { include: { transactions: true } },
            saleItems: true,
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

        if (body.doctorId) {
          const doctor = await tx.doctor.findUnique({
            where: { userId: body.doctorId },
            select: { userId: true },
          });
          if (!doctor) {
            return apiResponse({
              status: RESPONSE_STATUS.BAD_REQUEST,
              message: "Doctor not found",
            });
          }
        }

        const requestedQty = buildRequestedQtyMap(items);
        const existingQty = new Map<number, number>();
        for (const existing of existingBill.saleItems) {
          const prev = existingQty.get(existing.inventoryItemId) ?? 0;
          existingQty.set(existing.inventoryItemId, prev + existing.quantity);
        }

        const allInventoryIds = [...new Set([...requestedQty.keys(), ...existingQty.keys()])];
        const inventoryRows = await tx.inventoryItems.findMany({
          where: { id: { in: allInventoryIds } },
          include: { drug: true },
        });

        if (inventoryRows.length !== allInventoryIds.length) {
          return apiResponse({
            status: RESPONSE_STATUS.BAD_REQUEST,
            message: "One or more inventory items were not found",
          });
        }

        const inventoryById = new Map(inventoryRows.map((i) => [i.id, i]));

        for (const [inventoryId, qty] of requestedQty) {
          const row = inventoryById.get(inventoryId)!;
          const available = row.quantityInStock + (existingQty.get(inventoryId) ?? 0);
          if (qty > available) {
            return apiResponse({
              status: RESPONSE_STATUS.BAD_REQUEST,
              message: `Insufficient stock for ${row.drug.name}`,
            });
          }
        }

        const preparedItems = items.map((item) => {
          const inventory = inventoryById.get(item.inventoryItem.id)!;
          const rate = Number(item.rate ?? inventory.sellingPrice);
          const gross = rate * item.quantity;
          const discount =
            item.discountType === "PERCENTAGE"
              ? (gross * item.discountValue) / 100
              : item.discountValue;
          const taxableAmount = Math.max(gross - discount, 0);

          const gstPercentage = Number(inventory.drug.gstPercentage ?? 0);
          const cGstPercentage = Number(inventory.drug.cGstPercentage ?? 0);
          const sGstPercentage = Number(inventory.drug.sGstPercentage ?? 0);
          const iGstPercentage = Number(inventory.drug.iGstPercentage ?? 0);

          const cGstAmount = round2((taxableAmount * cGstPercentage) / 100);
          const sGstAmount = round2((taxableAmount * sGstPercentage) / 100);
          const iGstAmount = round2((taxableAmount * iGstPercentage) / 100);
          const explicitTax = cGstAmount + sGstAmount + iGstAmount;
          const fallbackTax = round2((taxableAmount * gstPercentage) / 100);
          const gstAmount = explicitTax > 0 ? explicitTax : fallbackTax;
          const lineTotal = round2(taxableAmount + gstAmount);

          return {
            inventoryItemId: inventory.id,
            quantity: item.quantity,
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

        const discountType = body.discountType ?? existingBill.invoice.discountType;
        const discountValue = body.discountValue ?? existingBill.invoice.discountValue;
        const isFree = body.isFree ?? existingBill.invoice.isFree;
        const billingType = body.billingType ?? existingBill.invoice.billingType;
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
            updatedBy: user.id ,
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
            doctorId: body.doctorId,
            updatedBy: user.id ,
            saleItems: {
              create: preparedItems,
            },
          },
        });

        for (const inventoryId of allInventoryIds) {
          const row = inventoryById.get(inventoryId)!;
          const restocked = row.quantityInStock + (existingQty.get(inventoryId) ?? 0);
          const nextQty = restocked - (requestedQty.get(inventoryId) ?? 0);

          await tx.inventoryItems.update({
            where: { id: inventoryId },
            data: {
              quantityInStock: nextQty,
              updatedBy: user.id ,
            },
          });
        }

        const updatedBill = await tx.drugBill.findUnique({
          where: { id: existingBill.id },
          include: {
            patient: true,
            doctor: { include: { user: true } },
            invoice: { include: { transactions: true } },
            saleItems: {
              include: {
                inventoryItem: {
                  include: { drug: true, supplier: true },
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
          where: { id: billId, isDeleted: false, invoice: { isDeleted: false } },
          include: { saleItems: true },
        });

        if (!existingBill) {
          return apiResponse({
            status: RESPONSE_STATUS.NOT_FOUND,
            message: "Sale bill not found",
          });
        }

        const restoreQty = new Map<number, number>();
        for (const item of existingBill.saleItems) {
          const prev = restoreQty.get(item.inventoryItemId) ?? 0;
          restoreQty.set(item.inventoryItemId, prev + item.quantity);
        }

        for (const [inventoryItemId, quantity] of restoreQty) {
          await tx.inventoryItems.update({
            where: { id: inventoryItemId },
            data: {
              quantityInStock: {
                increment: quantity,
              },
              updatedBy: user.id ,
            },
          });
        }

        await tx.invoice.update({
          where: { id: existingBill.invoiceId },
          data: {
            isDeleted: true,
            deletedBy: user.id ,
            updatedBy: user.id ,
          },
        });

        await tx.drugBill.update({
          where: { id: existingBill.id },
          data: {
            isDeleted: true,
            deletedBy: user.id ,
            updatedBy: user.id ,
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

