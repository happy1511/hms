import { prisma } from "@/services/prisma";
import { RESPONSE_STATUS } from "@/lib/responseStatus";
import { validateRequest } from "@/lib/validator";
import { apiResponse } from "@/lib/apiResponse";
import { paginationValidator } from "@/validators/api/common/pagination";
import { Prisma } from "@/generated/prisma/client";
import {
  drugBillingCategoryValidator,
  partialDrugBillingCategoryValidator,
} from "@/validators/api/masters/drugBillingCategory";

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
      const and: Prisma.DrugBillingCategoryWhereInput[] = [];

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

      const where: Prisma.DrugBillingCategoryWhereInput = and.length
        ? { AND: and }
        : {};

      const [items, total] = await prisma.$transaction([
        prisma.drugBillingCategory.findMany({
          skip,
          take: limit,
          orderBy: { createdAt: "desc" },
          where,
        }),
        prisma.drugBillingCategory.count({ where }),
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
    paramsSchema: partialDrugBillingCategoryValidator,
    req,
    params,
    onSuccess: async ({ params }) => {
      const id = params.categoryId;

      const details = await prisma.drugBillingCategory.findFirst({
        where: { id, isDeleted: false },
        include: {
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
    bodySchema: drugBillingCategoryValidator,
    req,
    onSuccess: async ({ body }) => {
      return prisma.$transaction(async (tx) => {
        const data = await tx.drugBillingCategory.create({ data: body });
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
    bodySchema: partialDrugBillingCategoryValidator,
    paramsSchema: partialDrugBillingCategoryValidator,
    params,
    req,
    onSuccess: async ({ body }) => {
      const data = body;

      return prisma.$transaction(async (tx) => {
        const { categoryId, ...rest } = data;
        const existingCategory = await tx.drugBillingCategory.findFirst({
          where: { id: categoryId, isDeleted: false },
        });

        if (!existingCategory) {
          return apiResponse({
            status: RESPONSE_STATUS.NOT_FOUND,
            message: "Category not found",
          });
        }

        const updatedCategory = await tx.drugBillingCategory.update({
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
    paramsSchema: partialDrugBillingCategoryValidator,
    params,
    req,
    onSuccess: async ({ params }) => {
      const data = params;
      return prisma.$transaction(async (tx) => {
        const existingCategory = await tx.drugBillingCategory.findFirst({
          where: { id: data.categoryId, isDeleted: false },
        });

        if (!existingCategory) {
          return apiResponse({
            status: RESPONSE_STATUS.NOT_FOUND,
            message: "Category not found",
          });
        }

        await tx.drugBillingCategory.update({
          where: { id: data.categoryId },
          data: { isDeleted: true },
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
