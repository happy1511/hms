import {
  Prisma,
  PurchaseOrderStatus,
  User,
} from "@/generated/prisma/client";
import { apiResponse } from "@/lib/apiResponse";
import { calculateGrnSummary } from "@/lib/pharmacyGrn";
import { RESPONSE_STATUS } from "@/lib/responseStatus";
import { validateRequest } from "@/lib/validator";
import { prisma } from "@/services/prisma";
import { paginationValidator } from "@/validators/api/common/pagination";
import { grnValidator } from "@/validators/api/masters/pharmacyGRN";
import z from "zod";

const grnDetailsParamsValidator = z.object({
  grnId: z.coerce.number().min(1, "GRN Id is required"),
});

export const getAPI = async (req: Request) => {
  return validateRequest({
    querySchema: paginationValidator,
    req,
    onSuccess: async ({ query }) => {
      const page = Number(query.page ?? 1);
      const limit = Number(query.limit ?? 10);
      const createdAtFrom = query["createdAt[from]"] ?? "";
      const createdAtTo = query["createdAt[to]"] ?? "";

      const skip = (page - 1) * limit;
      const and: Prisma.GRNWhereInput[] = [];

      if (createdAtFrom || createdAtTo) {
        and.push({
          createdAt: {
            ...(createdAtFrom && { gte: createdAtFrom }),
            ...(createdAtTo && { lte: createdAtTo }),
          },
        });
      }
      and.push({
        OR: [
          { order: { is: { isDeleted: false } } },
          { challan: { is: { isDeleted: false } } },
        ],
      });

      const where: Prisma.GRNWhereInput = and.length ? { AND: and } : {};

      const [items, total] = await prisma.$transaction([
        prisma.gRN.findMany({
          skip,
          take: limit,
          orderBy: { createdAt: "desc" },
          where,
          include: {
            order: { include: { supplier: true } },
            challan: { include: { supplier: true } },
            grnItems: true,
          },
        }),
        prisma.gRN.count({ where }),
      ]);

      return apiResponse({
        status: RESPONSE_STATUS.SUCCESS,
        message: "GRNs Fetched Successfully",
        data: items,
        total,
      });
    },
  });
};

export const createAPI = async (req: Request, user: User) => {
  return validateRequest({
    bodySchema: grnValidator,
    req,
    onSuccess: async ({ body }) => {
      return prisma.$transaction(async (tx) => {
        const {
          orderId,
          challanId,
          grnItems,
          invoiceDate,
          invoiceNumber,
          discountAmount,
          tcsAmount,
          packingForwarding,
          roundOffAmount,
          cnAmount,
          cnRef,
        } = body;
        let resolvedOrderId = orderId;
        let resolvedChallanId = challanId;
        let supplierId: number | undefined;
        const purchaseItemIdByItemIndex = new Map<number, number>();
        const challanItemById = new Map<
          number,
          { id: number; inventoryItemId: number }
        >();
        const summary = calculateGrnSummary(grnItems, {
          discountAmount,
          tcsAmount,
          packingForwarding,
          roundOffAmount,
          cnAmount,
        });

        if (resolvedOrderId) {
          const existingOrder = await tx.purchaseOrder.findFirst({
            where: { id: resolvedOrderId, isDeleted: false },
            include: { items: true },
          });

          if (!existingOrder) {
            return apiResponse({
              status: RESPONSE_STATUS.NOT_FOUND,
              message: "Order not found",
            });
          }

          supplierId = existingOrder.supplierId;
        } else if (resolvedChallanId) {
          const existingChallan = await tx.challan.findFirst({
            where: { id: resolvedChallanId, isDeleted: false },
            include: { items: true, grn: { select: { id: true } } },
          });

          if (!existingChallan) {
            return apiResponse({
              status: RESPONSE_STATUS.NOT_FOUND,
              message: "Challan not found",
            });
          }

          if (existingChallan.grn?.id) {
            return apiResponse({
              status: RESPONSE_STATUS.BAD_REQUEST,
              message: "GRN already exists for this challan",
            });
          }

          supplierId = existingChallan.supplierId;

          for (const item of existingChallan.items) {
            challanItemById.set(item.id, {
              id: item.id,
              inventoryItemId: item.inventoryItemId,
            });
          }
        } else {
          if (!body.supplier?.id) {
            return apiResponse({
              status: RESPONSE_STATUS.BAD_REQUEST,
              message: "Supplier is required",
            });
          }

          const createdOrder = await tx.purchaseOrder.create({
            data: {
              supplierId: body.supplier.id,
              status: PurchaseOrderStatus.draft,
              createdBy: user.id,
              updatedBy: user.id,
            },
          });

          resolvedOrderId = createdOrder.id;
          supplierId = body.supplier.id;

          for (const [index, item] of grnItems.entries()) {
            const purchaseItem = await tx.purchaseItem.create({
              data: {
                purchaseOrderId: createdOrder.id,
                drugId: item.drug.id,
                hsnSacId: item.hsnSacId ?? item.hsnSac?.id ?? null,
                categoryId: item.category?.id ?? undefined,
                quantity: item.quantity,
                discountPercentage: 0,
                rate: item.purchasePrice,
                total:
                  summary.lines[index]?.lineTotal ??
                  item.purchasePrice * item.quantity,
              },
            });
            purchaseItemIdByItemIndex.set(index, purchaseItem.id);
          }
        }

        if (resolvedOrderId) {
          const existingGrn = await tx.gRN.findUnique({
            where: { orderId: resolvedOrderId },
          });
          if (existingGrn) {
            return apiResponse({
              status: RESPONSE_STATUS.BAD_REQUEST,
              message: "GRN already exists for this order",
            });
          }
        }

        if (resolvedChallanId) {
          const existingGrn = await tx.gRN.findUnique({
            where: { challanId: resolvedChallanId },
          });
          if (existingGrn) {
            return apiResponse({
              status: RESPONSE_STATUS.BAD_REQUEST,
              message: "GRN already exists for this challan",
            });
          }
        }

        const data = await tx.gRN.create({
          data: {
            ...(resolvedOrderId ? { orderId: resolvedOrderId } : {}),
            ...(resolvedChallanId ? { challanId: resolvedChallanId } : {}),
            invoiceNumber,
            invoiceDate,
            discountAmount: summary.discountAmount,
            taxableAmount: summary.taxableAmount,
            cGstAmount: summary.cGstAmount,
            sGstAmount: summary.sGstAmount,
            iGstAmount: summary.iGstAmount,
            tcsAmount: summary.tcsAmount,
            packingForwarding: summary.packingForwarding,
            roundOffAmount: summary.roundOffAmount,
            grandTotal: summary.grandTotal,
            cnAmount: summary.cnAmount,
            cnRef: cnRef?.trim() || null,
            createdBy: user.id,
            updatedBy: user.id,
          },
        });

        for (const [index, i] of grnItems.entries()) {
          if (resolvedChallanId) {
            const challanItemId = Number(i.id || 0);
            const challanItem = challanItemById.get(challanItemId);

            if (!challanItem) {
              return apiResponse({
                status: RESPONSE_STATUS.BAD_REQUEST,
                message: "Challan item not found for GRN entry",
              });
            }

            await tx.gRNItems.create({
              data: {
                grnId: data.id,
                challanItemId: challanItem.id,
                inventoryItemId: challanItem.inventoryItemId,
              },
            });
            continue;
          }

          const existingInventory = await tx.inventoryItems.findFirst({
            where: {
              drugId: i.drug.id,
              supplierId: supplierId!,
              batchNo: i.batchNo,
            },
          });
          const receivedPieces =
            (Number(i.quantity || 0) + Number(i.freeQuantity || 0)) *
            Math.max(Number(i.itemsPerPack || 1), 1);

          let inventoryItemId = existingInventory?.id;

          if (existingInventory) {
            const updatedInventory = await tx.inventoryItems.update({
              where: { id: existingInventory.id },
              data: {
                quantityInStock: {
                  increment: receivedPieces,
                },
                hsnSacId: i.hsnSacId ?? i.hsnSac?.id ?? null,
                expiryDate: i.expiryDate,
                manufacturingDate: i.manufacturingDate,
                purchasePrice: i.purchasePrice,
                mrp: i.mrp,
                sellingPrice: i.sellingPrice,
                wholeSalePrice: i.wholeSalePrice,
                itemsPerPack: Math.max(Number(i.itemsPerPack || 1), 1),
                updatedBy: user.id,
              },
            });
            inventoryItemId = updatedInventory.id;
          } else {
            const newInventory = await tx.inventoryItems.create({
              data: {
                drugId: i.drug.id,
                hsnSacId: i.hsnSacId ?? i.hsnSac?.id ?? null,
                batchNo: i.batchNo,
                expiryDate: i.expiryDate,
                manufacturingDate: i.manufacturingDate,
                purchasePrice: i.purchasePrice,
                mrp: i.mrp,
                sellingPrice: i.sellingPrice,
                wholeSalePrice: i.wholeSalePrice,
                itemsPerPack: Math.max(Number(i.itemsPerPack || 1), 1),
                quantityInStock: receivedPieces,
                supplierId: supplierId!,
                createdBy: user.id,
                updatedBy: user.id,
              },
            });
            inventoryItemId = newInventory.id;
          }

          const purchaseItemId =
            resolvedOrderId === orderId
              ? i.id
              : purchaseItemIdByItemIndex.get(index);

          if (!purchaseItemId) {
            return apiResponse({
              status: RESPONSE_STATUS.BAD_REQUEST,
              message: "Purchase item not found for GRN entry",
            });
          }

          await tx.gRNItems.create({
            data: {
              grnId: data.id,
              purchaseItemId,
              inventoryItemId: inventoryItemId!,
            },
          });
        }

        if (resolvedOrderId) {
          await tx.purchaseOrder.update({
            where: { id: resolvedOrderId },
            data: {
              grnId: data.id,
              status: PurchaseOrderStatus.received,
              updatedBy: user.id,
            },
          });
        }

        return apiResponse({
          status: RESPONSE_STATUS.CREATED,
          message: "GRN Created Successfully",
          data: data,
        });
      });
    },
  });
};

export const getDetailsAPI = async (
  req: Request,
  { params }: { params: { grnId: string } },
) => {
  return validateRequest({
    paramsSchema: grnDetailsParamsValidator,
    params,
    req,
    onSuccess: async ({ params }) => {
      const grn = await prisma.gRN.findFirst({
        where: {
          id: params.grnId,
          OR: [
            { order: { is: { isDeleted: false } } },
            { challan: { is: { isDeleted: false } } },
          ],
        },
        include: {
          order: {
            include: {
              supplier: true,
            },
          },
          challan: {
            include: {
              supplier: true,
            },
          },
          createdByUser: {
            select: {
              id: true,
              name: true,
            },
          },
          grnItems: {
            include: {
                purchaseItem: {
                  include: {
                    drug: true,
                    category: true,
                    hsnSac: true,
                  },
                },
                challanItem: {
                  include: {
                    drug: true,
                    category: true,
                    hsnSac: true,
                  },
                },
                inventoryItem: {
                  include: {
                    drug: true,
                    hsnSac: true,
                  },
                },
            },
            orderBy: {
              id: "asc",
            },
          },
        },
      });

      if (!grn) {
        return apiResponse({
          status: RESPONSE_STATUS.NOT_FOUND,
          message: "GRN not found",
        });
      }

      return apiResponse({
        status: RESPONSE_STATUS.SUCCESS,
        message: "GRN fetched successfully",
        data: grn,
      });
    },
  });
};

