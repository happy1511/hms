import { Prisma, PurchaseOrderStatus } from "@/generated/prisma/client";
import { apiResponse } from "@/lib/apiResponse";
import { RESPONSE_STATUS } from "@/lib/responseStatus";
import { validateRequest } from "@/lib/validator";
import { prisma } from "@/services/prisma";
import { paginationValidator } from "@/validators/api/common/pagination";
import { grnValidator } from "@/validators/api/masters/pharmacyGRN";

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

      const where: Prisma.GRNWhereInput = and.length ? { AND: and } : {};

      const [items, total] = await prisma.$transaction([
        prisma.gRN.findMany({
          skip,
          take: limit,
          orderBy: { createdAt: "desc" },
          where,
          include: {
            order: { include: { supplier: true } },
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

export const createAPI = async (req: Request) => {
  return validateRequest({
    bodySchema: grnValidator,
    req,
    onSuccess: async ({ body }) => {
      return prisma.$transaction(async (tx) => {
        const { orderId, grnItems } = body;
        let resolvedOrderId = orderId;
        let supplierId: number | undefined;
        const purchaseItemIdByItemIndex = new Map<number, number>();

        if (resolvedOrderId) {
          const existingOrder = await tx.purchaseOrder.findUnique({
            where: { id: resolvedOrderId },
            include: { items: true },
          });

          if (!existingOrder) {
            return apiResponse({
              status: RESPONSE_STATUS.NOT_FOUND,
              message: "Order not found",
            });
          }

          supplierId = existingOrder.supplierId;
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
            },
          });

          resolvedOrderId = createdOrder.id;
          supplierId = body.supplier.id;

          for (const [index, item] of grnItems.entries()) {
            const purchaseItem = await tx.purchaseItem.create({
              data: {
                purchaseOrderId: createdOrder.id,
                drugId: item.drug.id,
                categoryId: item.category.id,
                quantity: item.quantity,
                discountPercentage: 0,
                rate: item.purchasePrice,
                total: item.purchasePrice * item.quantity,
              },
            });
            purchaseItemIdByItemIndex.set(index, purchaseItem.id);
          }
        }

        const existingGrn = await tx.gRN.findUnique({
          where: { orderId: resolvedOrderId },
        });
        if (existingGrn) {
          return apiResponse({
            status: RESPONSE_STATUS.BAD_REQUEST,
            message: "GRN already exists for this order",
          });
        }

        const data = await tx.gRN.create({
          data: {
            orderId: resolvedOrderId,
          },
        });

        for (const [index, i] of grnItems.entries()) {
          const existingInventory = await tx.inventoryItems.findFirst({
            where: {
              drugId: i.drug.id,
              supplierId: supplierId!,
              batchNo: i.batchNo,
            },
          });

          let inventoryItemId = existingInventory?.id;

          if (existingInventory) {
            const updatedInventory = await tx.inventoryItems.update({
              where: { id: existingInventory.id },
              data: {
                quantityInStock: {
                  increment: i.quantity,
                },
                expiryDate: i.expiryDate,
                manufacturingDate: i.manufacturingDate,
                purchasePrice: i.purchasePrice,
                mrp: i.mrp,
                sellingPrice: i.sellingPrice,
                wholeSalePrice: i.wholeSalePrice,
              },
            });
            inventoryItemId = updatedInventory.id;
          } else {
            const newInventory = await tx.inventoryItems.create({
              data: {
                drugId: i.drug.id,
                batchNo: i.batchNo,
                expiryDate: i.expiryDate,
                manufacturingDate: i.manufacturingDate,
                purchasePrice: i.purchasePrice,
                mrp: i.mrp,
                sellingPrice: i.sellingPrice,
                wholeSalePrice: i.wholeSalePrice,
                quantityInStock: i.quantity,
                supplierId: supplierId!,
              },
            });
            inventoryItemId = newInventory.id;
          }

          const purchaseItemId = resolvedOrderId === orderId ? i.id : purchaseItemIdByItemIndex.get(index);

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

        await tx.purchaseOrder.update({
          where: { id: data.orderId },
          data: {
            grnId: data.id,
            status: PurchaseOrderStatus.received,
          },
        });

        return apiResponse({
          status: RESPONSE_STATUS.CREATED,
          message: "GRN Created Successfully",
          data: data,
        });
      });
    },
  });
};
