import { apiResponse } from "@/lib/apiResponse";
import { RESPONSE_STATUS } from "@/lib/responseStatus";
import { validateRequest } from "@/lib/validator";
import { prisma } from "@/services/prisma";
import z from "zod";

const cashFlowSummaryValidator = z.object({
  "createdAt[from]": z.coerce.date(),
  "createdAt[to]": z.coerce.date(),
});

export const getCashFlowSummaryAPI = async (req: Request) => {
  return validateRequest({
    querySchema: cashFlowSummaryValidator,
    req,
    onSuccess: async ({ query }) => {
      const from = query["createdAt[from]"];
      const to = query["createdAt[to]"];

      const txDateWhere = {
        createdAt: { gte: from, lte: to },
        invoice: { is: { isDeleted: false } },
      } as const;

      const [opdAgg, dayCareAgg, ipdAgg, pharmacyAgg, incomeByCategory, expenseByCategory] =
        await prisma.$transaction([
          prisma.transaction.aggregate({
            where: {
              ...txDateWhere,
              invoice: { is: { isDeleted: false, opd: { isNot: null } } },
            },
            _sum: { amount: true },
          }),
          prisma.transaction.aggregate({
            where: {
              ...txDateWhere,
              invoice: { is: { isDeleted: false, ipd: { is: { isDayCare: true } } } },
            },
            _sum: { amount: true },
          }),
          prisma.transaction.aggregate({
            where: {
              ...txDateWhere,
              invoice: {
                is: { isDeleted: false, ipd: { is: { isDayCare: false } } },
              },
            },
            _sum: { amount: true },
          }),
          prisma.transaction.aggregate({
            where: {
              ...txDateWhere,
              invoice: { is: { isDeleted: false, drugBills: { isNot: null } } },
            },
            _sum: { amount: true },
          }),
          prisma.income.groupBy({
            by: ["categoryId"],
            where: { isDeleted: false, collectedOn: { gte: from, lte: to } },
            _sum: { amount: true },
            orderBy: { categoryId: "asc" },
          }),
          prisma.expense.groupBy({
            by: ["categoryId"],
            where: { isDeleted: false, dateTime: { gte: from, lte: to } },
            _sum: { amount: true },
            orderBy: { categoryId: "asc" },
          }),
        ]);

      const categoryIds = Array.from(
        new Set([
          ...incomeByCategory.map((row) => row.categoryId),
          ...expenseByCategory.map((row) => row.categoryId),
        ]),
      );

      const categories = categoryIds.length
        ? await prisma.financeCategory.findMany({
            where: {
              id: { in: categoryIds },
            },
            select: {
              id: true,
              name: true,
            },
          })
        : [];

      const categoryNameMap = new Map(
        categories.map((category) => [category.id, category.name]),
      );

      const opdCollections = Number(opdAgg._sum.amount || 0);
      const dayCareCollections = Number(dayCareAgg._sum.amount || 0);
      const ipdCollections = Number(ipdAgg._sum.amount || 0);
      const pharmacyCollections = Number(pharmacyAgg._sum.amount || 0);

      const incomeCategoryRows = incomeByCategory.map((row) => ({
        category: categoryNameMap.get(row.categoryId) || `Category ${row.categoryId}`,
        amount: Number(row._sum?.amount || 0),
      }));
      const expenseCategoryRows = expenseByCategory.map((row) => ({
        category: categoryNameMap.get(row.categoryId) || `Category ${row.categoryId}`,
        amount: Number(row._sum?.amount || 0),
      }));

      const incomeByCategoryTotal = incomeCategoryRows.reduce(
        (sum, r) => sum + r.amount,
        0,
      );
      const expenseTotal = expenseCategoryRows.reduce((sum, r) => sum + r.amount, 0);

      const totalIncome =
        opdCollections +
        dayCareCollections +
        ipdCollections +
        pharmacyCollections +
        incomeByCategoryTotal;

      const netTotal = totalIncome - expenseTotal;

      return apiResponse({
        status: RESPONSE_STATUS.SUCCESS,
        message: "Cash Flow Summary Fetched Successfully",
        data: {
          period: { from, to },
          total: netTotal,
          income: {
            total: totalIncome,
            opd: opdCollections,
            ipd: ipdCollections,
            dayCare: dayCareCollections,
            pharmacy: pharmacyCollections,
            byCategory: incomeCategoryRows,
          },
          expense: {
            total: expenseTotal,
            byCategory: expenseCategoryRows,
          },
        },
      });
    },
  });
};
