import { prisma } from "@/services/prisma";
import { RESPONSE_STATUS } from "@/lib/responseStatus";
import { validateRequest } from "@/lib/validator";
import { apiResponse } from "@/lib/apiResponse";
import { paginationValidator } from "@/validators/api/common/pagination";
import { Prisma } from "@/generated/prisma/client";
import {
  partialPurchaseOrderValidator,
  purchaseOrderValidator,
} from "@/validators/api/masters/pharmacyPurchase";

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
      const and: Prisma.PurchaseOrderWhereInput[] = [];

      if (search) {
        and.push({ supplier: { name: { contains: search } } });
      }

      if (createdAtFrom || createdAtTo) {
        and.push({
          createdAt: {
            ...(createdAtFrom && { gte: createdAtFrom }),
            ...(createdAtTo && { lte: createdAtTo }),
          },
        });
      }

      const where: Prisma.PurchaseOrderWhereInput = and.length
        ? { AND: and }
        : {};

      const [items, total] = await prisma.$transaction([
        prisma.purchaseOrder.findMany({
          skip,
          take: limit,
          orderBy: { createdAt: "desc" },
          where,
          include: {
            supplier: true,
            items: { include: { category: true, drug: true } },
          },
        }),
        prisma.purchaseOrder.count({ where }),
      ]);

      return apiResponse({
        status: RESPONSE_STATUS.SUCCESS,
        message: "Orders Fetched Successfully",
        data: items,
        total,
      });
    },
  });
};

export const getDetailsAPI = async (
  req: Request,
  { params }: { params: { orderId: string } },
) => {
  return validateRequest({
    paramsSchema: partialPurchaseOrderValidator,
    params,
    req,
    onSuccess: async ({ params }) => {
      const id = params.orderId;

      const details = await prisma.purchaseOrder.findUnique({
        where: { id },
        include: {
          supplier: true,
          items: { include: { category: true, drug: true } },
        },
      });

      console.log(details);
      if (!details) {
        return apiResponse({
          status: RESPONSE_STATUS.NOT_FOUND,
          message: "Order not found",
        });
      }

      return apiResponse({
        status: RESPONSE_STATUS.SUCCESS,
        message: "Order Fetched Successfully",
        data: details,
      });
    },
  });
};

export const createAPI = async (req: Request) => {
  return validateRequest({
    bodySchema: purchaseOrderValidator,
    req,
    onSuccess: async ({ body }) => {
      return prisma.$transaction(async (tx) => {
        const { items, supplier, ...rest } = body;
        const data = await tx.purchaseOrder.create({
          data: {
            ...rest,
            supplierId: supplier.id,
            items: {
              create: items.map((i) => ({
                categoryId: i.category.id,
                drugId: i.drug.id,
                quantity: i.quantity,
                rate: i.rate,
                total: i.total,
                discountPercentage: i.discountPercentage,
              })),
            },
          },
        });
        return apiResponse({
          status: RESPONSE_STATUS.CREATED,
          message: "Order Created Successfully",
          data: data,
        });
      });
    },
  });
};

export const updateAPI = async (
  req: Request,
  { params }: { params: { orderId: string } },
) => {
  return validateRequest({
    bodySchema: partialPurchaseOrderValidator,
    paramsSchema: partialPurchaseOrderValidator,
    params,
    req,
    onSuccess: async ({ body }) => {
      return prisma.$transaction(async (tx) => {
        const orderId = body.orderId;

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

        const updatedOrder = await tx.purchaseOrder.update({
          where: { id: orderId },
          data: {
            supplierId: body.supplier?.id,
            remarks: body.remarks,
            orderDate: body.orderDate,
          },
        });

        await tx.purchaseItem.deleteMany({
          where: { purchaseOrderId: orderId },
        });

        if (body.items && body.items.length > 0) {
          await tx.purchaseItem.createMany({
            data: body.items.map((item) => ({
              purchaseOrderId: orderId,
              drugId: item.drug.id,
              categoryId: item.category.id,
              quantity: item.quantity,
              discountPercentage: item.discountPercentage,
              rate: item.rate,
              total: item.total,
            })),
          });
        }

        return apiResponse({
          status: RESPONSE_STATUS.SUCCESS,
          message: "Purchase Order Updated Successfully",
          data: updatedOrder,
        });
      });
    },
  });
};

export const deleteAPI = async (
  req: Request,
  { params }: { params: { orderId: string } },
) => {
  return validateRequest({
    paramsSchema: partialPurchaseOrderValidator,
    params,
    req,
    onSuccess: async ({ params }) => {
      const data = params;
      return prisma.$transaction(async (tx) => {
        const existingOrder = await tx.purchaseOrder.findUnique({
          where: { id: data.orderId },
        });

        if (!existingOrder) {
          return apiResponse({
            status: RESPONSE_STATUS.NOT_FOUND,
            message: "Order not found",
          });
        }

        await prisma.purchaseOrder.delete({
          where: { id: data.orderId },
        });

        return apiResponse({
          status: RESPONSE_STATUS.SUCCESS,
          message: "Order Deleted Successfully",
          data: null,
        });
      });
    },
  });
};
