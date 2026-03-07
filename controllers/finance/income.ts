import { IncomeCategory, Prisma, User } from "@/generated/prisma/client";
import { apiResponse } from "@/lib/apiResponse";
import { RESPONSE_STATUS } from "@/lib/responseStatus";
import { validateRequest } from "@/lib/validator";
import { prisma } from "@/services/prisma";
import { paginationValidator } from "@/validators/api/common/pagination";
import {
  incomeValidator,
  partialIncomeValidator,
} from "@/validators/api/finance/income";

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
      const and: Prisma.IncomeWhereInput[] = [{ isDeleted: false }];

      if (search) {
        const normalizedSearch = search.trim().toUpperCase().replace(/\s+/g, "_");
        const categorySearch = Object.values(IncomeCategory).includes(
          normalizedSearch as IncomeCategory,
        )
          ? (normalizedSearch as IncomeCategory)
          : undefined;

        and.push({
          OR: [
            { title: { contains: search } },
            ...(categorySearch ? [{ category: { equals: categorySearch } }] : []),
          ],
        });
      }

      if (createdAtFrom || createdAtTo) {
        and.push({
          collectedOn: {
            ...(createdAtFrom && { gte: createdAtFrom }),
            ...(createdAtTo && { lte: createdAtTo }),
          },
        });
      }

      const where: Prisma.IncomeWhereInput = and.length ? { AND: and } : {};

      const [items, total] = await prisma.$transaction([
        prisma.income.findMany({
          skip,
          take: limit,
          orderBy: { collectedOn: "desc" },
          where,
          include: {
            collectedBy: {
              select: {
                id: true,
                name: true,
                loginId: true,
              },
            },
          },
        }),
        prisma.income.count({ where }),
      ]);

      return apiResponse({
        status: RESPONSE_STATUS.SUCCESS,
        message: "Income records fetched successfully",
        data: items,
        total,
      });
    },
  });
};

export const getDetailsAPI = async (
  req: Request,
  { params }: { params: { incomeId: string } },
) => {
  return validateRequest({
    paramsSchema: partialIncomeValidator,
    params,
    req,
    onSuccess: async ({ params }) => {
      const details = await prisma.income.findFirst({
        where: { id: params.incomeId, isDeleted: false },
        include: {
          collectedBy: {
            select: {
              id: true,
              name: true,
              loginId: true,
            },
          },
        },
      });

      if (!details) {
        return apiResponse({
          status: RESPONSE_STATUS.NOT_FOUND,
          message: "Income not found",
        });
      }

      return apiResponse({
        status: RESPONSE_STATUS.SUCCESS,
        message: "Income fetched successfully",
        data: details,
      });
    },
  });
};

export const createAPI = async (req: Request, user: User) => {
  return validateRequest({
    bodySchema: incomeValidator,
    req,
    user,
    onSuccess: async ({ body }) => {
      const data = await prisma.income.create({
        data: {
          ...body,
          createdBy: user.id,
          updatedBy: user.id,
        },
      });

      return apiResponse({
        status: RESPONSE_STATUS.CREATED,
        message: "Income created successfully",
        data,
      });
    },
  });
};

export const updateAPI = async (
  req: Request,
  { params }: { params: { incomeId: string } },
  user: User,
) => {
  return validateRequest({
    bodySchema: partialIncomeValidator,
    paramsSchema: partialIncomeValidator,
    params,
    req,
    onSuccess: async ({ body }) => {
      const { incomeId, ...rest } = body;

      const existing = await prisma.income.findFirst({
        where: { id: incomeId, isDeleted: false },
      });

      if (!existing) {
        return apiResponse({
          status: RESPONSE_STATUS.NOT_FOUND,
          message: "Income not found",
        });
      }

      const data = await prisma.income.update({
        where: { id: incomeId },
        data: {
          ...rest,
          updatedBy: user.id,
        },
      });

      return apiResponse({
        status: RESPONSE_STATUS.SUCCESS,
        message: "Income updated successfully",
        data,
      });
    },
  });
};

export const deleteAPI = async (
  req: Request,
  { params }: { params: { incomeId: string } },
  user: User,
) => {
  return validateRequest({
    paramsSchema: partialIncomeValidator,
    params,
    req,
    onSuccess: async ({ params }) => {
      const existing = await prisma.income.findFirst({
        where: { id: params.incomeId, isDeleted: false },
      });

      if (!existing) {
        return apiResponse({
          status: RESPONSE_STATUS.NOT_FOUND,
          message: "Income not found",
        });
      }

      await prisma.income.update({
        where: { id: params.incomeId },
        data: { isDeleted: true, deletedBy: user.id, updatedBy: user.id },
      });

      return apiResponse({
        status: RESPONSE_STATUS.SUCCESS,
        message: "Income deleted successfully",
        data: null,
      });
    },
  });
};
