import { ExpenseCategory, Prisma, User } from "@/generated/prisma/client";
import { apiResponse } from "@/lib/apiResponse";
import { RESPONSE_STATUS } from "@/lib/responseStatus";
import { validateRequest } from "@/lib/validator";
import { prisma } from "@/services/prisma";
import { paginationValidator } from "@/validators/api/common/pagination";
import {
  expenseValidator,
  partialExpenseValidator,
} from "@/validators/api/finance/expense";

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
      const and: Prisma.ExpenseWhereInput[] = [{ isDeleted: false }];

      if (search) {
        const normalizedSearch = search.trim().toUpperCase().replace(/\s+/g, "_");
        const categorySearch = Object.values(ExpenseCategory).includes(
          normalizedSearch as ExpenseCategory,
        )
          ? (normalizedSearch as ExpenseCategory)
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
          dateTime: {
            ...(createdAtFrom && { gte: createdAtFrom }),
            ...(createdAtTo && { lte: createdAtTo }),
          },
        });
      }

      const where: Prisma.ExpenseWhereInput = and.length ? { AND: and } : {};

      const [items, total] = await prisma.$transaction([
        prisma.expense.findMany({
          skip,
          take: limit,
          orderBy: { dateTime: "desc" },
          where,
        }),
        prisma.expense.count({ where }),
      ]);

      return apiResponse({
        status: RESPONSE_STATUS.SUCCESS,
        message: "Expense records fetched successfully",
        data: items,
        total,
      });
    },
  });
};

export const getDetailsAPI = async (
  req: Request,
  { params }: { params: { expenseId: string } },
) => {
  return validateRequest({
    paramsSchema: partialExpenseValidator,
    params,
    req,
    onSuccess: async ({ params }) => {
      const details = await prisma.expense.findFirst({
        where: { id: params.expenseId, isDeleted: false },
      });

      if (!details) {
        return apiResponse({
          status: RESPONSE_STATUS.NOT_FOUND,
          message: "Expense not found",
        });
      }

      return apiResponse({
        status: RESPONSE_STATUS.SUCCESS,
        message: "Expense fetched successfully",
        data: details,
      });
    },
  });
};

export const createAPI = async (req: Request, user: User) => {
  return validateRequest({
    bodySchema: expenseValidator,
    req,
    user,
    onSuccess: async ({ body }) => {
      const data = await prisma.expense.create({
        data: {
          ...body,
          createdBy: user.id,
          updatedBy: user.id,
        },
      });

      return apiResponse({
        status: RESPONSE_STATUS.CREATED,
        message: "Expense created successfully",
        data,
      });
    },
  });
};

export const updateAPI = async (
  req: Request,
  { params }: { params: { expenseId: string } },
  user: User,
) => {
  return validateRequest({
    bodySchema: partialExpenseValidator,
    paramsSchema: partialExpenseValidator,
    params,
    req,
    onSuccess: async ({ body }) => {
      const { expenseId, ...rest } = body;

      const existing = await prisma.expense.findFirst({
        where: { id: expenseId, isDeleted: false },
      });

      if (!existing) {
        return apiResponse({
          status: RESPONSE_STATUS.NOT_FOUND,
          message: "Expense not found",
        });
      }

      const data = await prisma.expense.update({
        where: { id: expenseId },
        data: {
          ...rest,
          updatedBy: user.id,
        },
      });

      return apiResponse({
        status: RESPONSE_STATUS.SUCCESS,
        message: "Expense updated successfully",
        data,
      });
    },
  });
};

export const deleteAPI = async (
  req: Request,
  { params }: { params: { expenseId: string } },
  user: User,
) => {
  return validateRequest({
    paramsSchema: partialExpenseValidator,
    params,
    req,
    onSuccess: async ({ params }) => {
      const existing = await prisma.expense.findFirst({
        where: { id: params.expenseId, isDeleted: false },
      });

      if (!existing) {
        return apiResponse({
          status: RESPONSE_STATUS.NOT_FOUND,
          message: "Expense not found",
        });
      }

      await prisma.expense.update({
        where: { id: params.expenseId },
        data: { isDeleted: true, deletedBy: user.id, updatedBy: user.id },
      });

      return apiResponse({
        status: RESPONSE_STATUS.SUCCESS,
        message: "Expense deleted successfully",
        data: null,
      });
    },
  });
};
