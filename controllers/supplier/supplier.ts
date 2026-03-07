import { prisma } from "@/services/prisma";
import { RESPONSE_STATUS } from "@/lib/responseStatus";
import { validateRequest } from "@/lib/validator";
import { apiResponse } from "@/lib/apiResponse";
import { paginationValidator } from "@/validators/api/common/pagination";
import { Prisma, User } from "@/generated/prisma/client";
import {
  partialSupplierValidator,
  supplierValidator,
} from "@/validators/api/masters/supplier";

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
      const and: Prisma.DrugSupplierWhereInput[] = [];

      if (search) {
        and.push({ name: { contains: search } });
      }
      and.push({ isDeleted: false });

      if (createdAtFrom || createdAtTo) {
        and.push({
          createdAt: {
            ...(createdAtFrom && { gte: createdAtFrom }),
            ...(createdAtTo && { lte: createdAtTo }),
          },
        });
      }

      const where: Prisma.DrugSupplierWhereInput = and.length
        ? { AND: and }
        : {};

      const [items, total] = await prisma.$transaction([
        prisma.drugSupplier.findMany({
          skip,
          take: limit,
          orderBy: { createdAt: "desc" },
          where,
        }),
        prisma.drugSupplier.count({ where }),
      ]);

      return apiResponse({
        status: RESPONSE_STATUS.SUCCESS,
        message: "Drug Supplier Fetched Successfully",
        data: items,
        total,
      });
    },
  });
};

export const getDetailsAPI = async (
  req: Request,
  { params }: { params: { supplierId: string } },
) => {
  return validateRequest({
    paramsSchema: partialSupplierValidator,
    req,
    params,
    onSuccess: async ({ params }) => {
      const id = params.supplierId;

      const details = await prisma.drugSupplier.findFirst({
        where: { id, isDeleted: false },
        include: {
          inventoryItems: { include: { drug: true } },
          purchaseOrders: { include: { items: { include: { drug: true } } } },
        },
      });

      if (!details) {
        return apiResponse({
          status: RESPONSE_STATUS.NOT_FOUND,
          message: "Supplier not found",
        });
      }

      return apiResponse({
        status: RESPONSE_STATUS.SUCCESS,
        message: "Supplier Fetched Successfully",
        data: details,
      });
    },
  });
};

export const createAPI = async (req: Request, user: User) => {
  return validateRequest({
    bodySchema: supplierValidator,
    req,
    onSuccess: async ({ body }) => {
      return prisma.$transaction(async (tx) => {
        const data = await tx.drugSupplier.create({
          data: {
            ...body,
            createdBy: user.id ,
            updatedBy: user.id ,
          },
        });
        return apiResponse({
          status: RESPONSE_STATUS.CREATED,
          message: "Supplier Created Successfully",
          data: data,
        });
      });
    },
  });
};

export const updateAPI = async (
  req: Request,
  { params }: { params: { supplierId: string } },
  user: User,
) => {
  return validateRequest({
    bodySchema: partialSupplierValidator,
    paramsSchema: partialSupplierValidator,
    params,
    req,
    onSuccess: async ({ body }) => {
      const data = body;

      return prisma.$transaction(async (tx) => {
        const { supplierId, ...rest } = data;
        const existingSupplier = await tx.drugSupplier.findFirst({
          where: { id: supplierId, isDeleted: false },
        });

        if (!existingSupplier) {
          return apiResponse({
            status: RESPONSE_STATUS.NOT_FOUND,
            message: "Supplier not found",
          });
        }

        const updatedSupplier = await tx.drugSupplier.update({
          where: { id: supplierId },
          data: {
            ...rest,
            updatedBy: user.id ,
          },
        });

        return apiResponse({
          status: RESPONSE_STATUS.SUCCESS,
          message: "Supplier Updated Successfully",
          data: updatedSupplier,
        });
      });
    },
  });
};

export const deleteAPI = async (
  req: Request,
  { params }: { params: { supplierId: string } },
  user: User,
) => {
  return validateRequest({
    paramsSchema: partialSupplierValidator,
    params,
    req,
    onSuccess: async ({ params }) => {
      const data = params;
      return prisma.$transaction(async (tx) => {
        const existingSupplier = await tx.drugSupplier.findFirst({
          where: { id: data.supplierId, isDeleted: false },
        });

        if (!existingSupplier) {
          return apiResponse({
            status: RESPONSE_STATUS.NOT_FOUND,
            message: "Supplier not found",
          });
        }

        await tx.drugSupplier.update({
          where: { id: data.supplierId },
          data: {
            isDeleted: true,
            deletedBy: user.id ,
            updatedBy: user.id ,
          },
        });

        return apiResponse({
          status: RESPONSE_STATUS.SUCCESS,
          message: "Supplier Deleted Successfully",
          data: null,
        });
      });
    },
  });
};

