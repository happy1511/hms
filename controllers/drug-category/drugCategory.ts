import { prisma } from "@/services/prisma";
import { RESPONSE_STATUS } from "@/lib/responseStatus";
import { validateRequest } from "@/lib/validator";
import { apiResponse } from "@/lib/apiResponse";
import { paginationValidator } from "@/validators/api/common/pagination";
import { Prisma } from "@/generated/prisma/client";
import {
  drugCategoryValidator,
  partialDrugCategoryValidator,
} from "@/validators/api/masters/drugCategory";

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
      const and: Prisma.DrugCategoryWhereInput[] = [];

      if (search) {
        and.push({ name: { contains: search } });
      }

      if (createdAtFrom || createdAtTo) {
        and.push({
          createdAt: {
            ...(createdAtFrom && { gte: createdAtFrom }),
            ...(createdAtTo && { lte: createdAtTo }),
          },
        });
      }

      const where: Prisma.DrugCategoryWhereInput = and.length
        ? { AND: and }
        : {};

      const [items, total] = await prisma.$transaction([
        prisma.drugCategory.findMany({
          skip,
          take: limit,
          orderBy: { createdAt: "desc" },
          where,
        }),
        prisma.drugCategory.count({ where }),
      ]);

      return apiResponse({
        status: RESPONSE_STATUS.SUCCESS,
        message: "Drug Categories Fetched Successfully",
        data: items,
        total,
      });
    },
  });
};

export const getDetailsAPI = async (
  req: Request,
  { params }: { params: { categoryId: string } },
) => {
  return validateRequest({
    paramsSchema: partialDrugCategoryValidator,
    req,
    params,
    onSuccess: async ({ params }) => {
      const id = params.categoryId;

      const details = await prisma.drugCategory.findUnique({
        where: { id },
        include: {
          drugs: true,
          purchaseItems: { include: { drug: true } },
        },
      });

      if (!details) {
        return apiResponse({
          status: RESPONSE_STATUS.NOT_FOUND,
          message: "Category not found",
        });
      }

      return apiResponse({
        status: RESPONSE_STATUS.SUCCESS,
        message: "Category Fetched Successfully",
        data: details,
      });
    },
  });
};

export const createAPI = async (req: Request) => {
  return validateRequest({
    bodySchema: drugCategoryValidator,
    req,
    onSuccess: async ({ body }) => {
      return prisma.$transaction(async (tx) => {
        const data = await tx.drugCategory.create({ data: body });
        return apiResponse({
          status: RESPONSE_STATUS.CREATED,
          message: "Category Created Successfully",
          data: data,
        });
      });
    },
  });
};

export const updateAPI = async (
  req: Request,
  { params }: { params: { categoryId: string } },
) => {
  return validateRequest({
    bodySchema: partialDrugCategoryValidator,
    paramsSchema: partialDrugCategoryValidator,
    params,
    req,
    onSuccess: async ({ body }) => {
      const data = body;

      return prisma.$transaction(async (tx) => {
        const { categoryId, ...rest } = data;
        const existingCategory = await tx.drugCategory.findUnique({
          where: { id: categoryId },
        });

        if (!existingCategory) {
          return apiResponse({
            status: RESPONSE_STATUS.NOT_FOUND,
            message: "Category not found",
          });
        }

        const updatedCategory = await tx.drugCategory.update({
          where: { id: categoryId },
          data: rest,
        });

        return apiResponse({
          status: RESPONSE_STATUS.SUCCESS,
          message: "Category Updated Successfully",
          data: updatedCategory,
        });
      });
    },
  });
};

export const deleteAPI = async (
  req: Request,
  { params }: { params: { categoryId: string } },
) => {
  return validateRequest({
    paramsSchema: partialDrugCategoryValidator,
    params,
    req,
    onSuccess: async ({ params }) => {
      const data = params;
      return prisma.$transaction(async (tx) => {
        const existingCategory = await tx.drugCategory.findUnique({
          where: { id: data.categoryId },
        });

        if (!existingCategory) {
          return apiResponse({
            status: RESPONSE_STATUS.NOT_FOUND,
            message: "Category not found",
          });
        }

        await prisma.drugCategory.delete({
          where: { id: data.categoryId },
        });

        return apiResponse({
          status: RESPONSE_STATUS.SUCCESS,
          message: "Category Deleted Successfully",
          data: null,
        });
      });
    },
  });
};
