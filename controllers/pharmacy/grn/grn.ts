import { Prisma } from "@/generated/prisma/client";
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
        const existingOrder = await tx.purchaseOrder.findUnique({
          where: { id: orderId },
          include: { items: true },
        });

        if (!existingOrder) {
          return apiResponse({
            status: RESPONSE_STATUS.NOT_FOUND,
            message: "Order not found",
          });
        }

        const data = await tx.gRN.create({
          data: {
            orderId,
            grnItems: {
              create: grnItems.map((i) => ({
                purchaseItem: { connect: { id: i.id } },
                inventoryItem: {
                  create: {
                    drugId: i.drug.id,
                    batchNo: i.batchNo,
                    expiryDate: i.expiryDate,
                    manufacturingDate: i.manufacturingDate,
                    purchasePrice: i.purchasePrice,
                    mrp: i.mrp,
                    sellingPrice: i.sellingPrice,
                    wholeSalePrice: i.wholeSalePrice,
                    quantityInStock: i.quantityInStock,
                    supplierId: existingOrder.supplierId,
                  },
                },
              })),
            },
          },
        });

        await tx.purchaseOrder.update({
          where: { id: data.orderId },
          data: {
            grnId: data.id,
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
