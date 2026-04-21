import { FinanceCategoryType, Prisma, User } from "@/generated/prisma/client";
import { apiResponse } from "@/lib/apiResponse";
import { RESPONSE_STATUS } from "@/lib/responseStatus";
import { validateRequest } from "@/lib/validator";
import { prisma } from "@/services/prisma";
import { paginationValidator } from "@/validators/api/common/pagination";
import {
  financeCategoryValidator,
  partialFinanceCategoryValidator,
} from "@/validators/api/finance/category";
import { z } from "zod";

const financeCategoryListValidator = paginationValidator.extend({
  type: z.enum(FinanceCategoryType).optional(),
});

const getDuplicateCategory = async ({
  name,
  type,
  excludeId,
}: {
  name: string;
  type: FinanceCategoryType;
  excludeId?: number;
}) => {
  const categories = await prisma.financeCategory.findMany({
    where: {
      type,
      isDeleted: false,
      ...(excludeId ? { NOT: { id: excludeId } } : {}),
    },
    select: {
      id: true,
      name: true,
    },
  });

  const normalizedName = name.trim().toLowerCase();

  return (
    categories.find(
      (category) => category.name.trim().toLowerCase() === normalizedName,
    ) || null
  );
};

export const getAPI = async (req: Request) => {
  return validateRequest({
    querySchema: financeCategoryListValidator,
    req,
    onSuccess: async ({ query }) => {
      const page = Number(query.page ?? 1);
      const limit = Number(query.limit ?? 10);
      const search = query.search ?? "";
      const createdAtFrom = query["createdAt[from]"] ?? "";
      const createdAtTo = query["createdAt[to]"] ?? "";

      const skip = (page - 1) * limit;
      const and: Prisma.FinanceCategoryWhereInput[] = [{ isDeleted: false }];

      if (search) {
        and.push({ name: { contains: search } });
      }

      if (query.type) {
        and.push({ type: query.type });
      }

      if (createdAtFrom || createdAtTo) {
        and.push({
          createdAt: {
            ...(createdAtFrom && { gte: createdAtFrom }),
            ...(createdAtTo && { lte: createdAtTo }),
          },
        });
      }

      const where: Prisma.FinanceCategoryWhereInput = and.length
        ? { AND: and }
        : {};

      const [items, total] = await prisma.$transaction([
        prisma.financeCategory.findMany({
          skip,
          take: limit,
          orderBy: [{ type: "asc" }, { name: "asc" }],
          where,
        }),
        prisma.financeCategory.count({ where }),
      ]);

      return apiResponse({
        status: RESPONSE_STATUS.SUCCESS,
        message: "Finance categories fetched successfully",
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
    paramsSchema: partialFinanceCategoryValidator,
    params,
    req,
    onSuccess: async ({ params }) => {
      const details = await prisma.financeCategory.findFirst({
        where: { id: params.categoryId, isDeleted: false },
      });

      if (!details) {
        return apiResponse({
          status: RESPONSE_STATUS.NOT_FOUND,
          message: "Finance category not found",
        });
      }

      return apiResponse({
        status: RESPONSE_STATUS.SUCCESS,
        message: "Finance category fetched successfully",
        data: details,
      });
    },
  });
};

export const createAPI = async (req: Request, user: User) => {
  return validateRequest({
    bodySchema: financeCategoryValidator,
    req,
    onSuccess: async ({ body }) => {
      const duplicate = await getDuplicateCategory({
        name: body.name,
        type: body.type,
      });

      if (duplicate) {
        return apiResponse({
          status: RESPONSE_STATUS.BAD_REQUEST,
          message: "Category already exists for this type",
        });
      }

      const data = await prisma.financeCategory.create({
        data: {
          ...body,
          name: body.name.trim(),
          createdBy: user.id,
          updatedBy: user.id,
        },
      });

      return apiResponse({
        status: RESPONSE_STATUS.CREATED,
        message: "Finance category created successfully",
        data,
      });
    },
  });
};

export const updateAPI = async (
  req: Request,
  { params }: { params: { categoryId: string } },
  user: User,
) => {
  return validateRequest({
    bodySchema: partialFinanceCategoryValidator,
    paramsSchema: partialFinanceCategoryValidator,
    params,
    req,
    onSuccess: async ({ body }) => {
      const { categoryId, ...rest } = body;

      const existing = await prisma.financeCategory.findFirst({
        where: { id: categoryId, isDeleted: false },
      });

      if (!existing) {
        return apiResponse({
          status: RESPONSE_STATUS.NOT_FOUND,
          message: "Finance category not found",
        });
      }

      const nextName = rest.name ?? existing.name;
      const nextType = rest.type ?? existing.type;

      const duplicate = await getDuplicateCategory({
        name: nextName,
        type: nextType,
        excludeId: categoryId,
      });

      if (duplicate) {
        return apiResponse({
          status: RESPONSE_STATUS.BAD_REQUEST,
          message: "Category already exists for this type",
        });
      }

      const data = await prisma.financeCategory.update({
        where: { id: categoryId },
        data: {
          ...rest,
          ...(rest.name ? { name: rest.name.trim() } : {}),
          updatedBy: user.id,
        },
      });

      return apiResponse({
        status: RESPONSE_STATUS.SUCCESS,
        message: "Finance category updated successfully",
        data,
      });
    },
  });
};

export const deleteAPI = async (
  req: Request,
  { params }: { params: { categoryId: string } },
  user: User,
) => {
  return validateRequest({
    paramsSchema: partialFinanceCategoryValidator,
    params,
    req,
    onSuccess: async ({ params }) => {
      const existing = await prisma.financeCategory.findFirst({
        where: { id: params.categoryId, isDeleted: false },
        include: {
          incomes: {
            where: { isDeleted: false },
            select: { id: true },
            take: 1,
          },
          expenses: {
            where: { isDeleted: false },
            select: { id: true },
            take: 1,
          },
        },
      });

      if (!existing) {
        return apiResponse({
          status: RESPONSE_STATUS.NOT_FOUND,
          message: "Finance category not found",
        });
      }

      if (existing.incomes.length || existing.expenses.length) {
        return apiResponse({
          status: RESPONSE_STATUS.BAD_REQUEST,
          message: "This category is already used in income or expense records",
        });
      }

      await prisma.financeCategory.update({
        where: { id: params.categoryId },
        data: {
          isDeleted: true,
          deletedBy: user.id,
          updatedBy: user.id,
        },
      });

      return apiResponse({
        status: RESPONSE_STATUS.SUCCESS,
        message: "Finance category deleted successfully",
        data: null,
      });
    },
  });
};
