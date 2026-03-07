import { apiResponse } from "@/lib/apiResponse";
import { RESPONSE_STATUS } from "@/lib/responseStatus";
import { validateRequest } from "@/lib/validator";
import { prisma } from "@/services/prisma";
import { paginationValidator } from "@/validators/api/common/pagination";

export const getAPI = async (req: Request) => {
  return validateRequest({
    querySchema: paginationValidator,
    req,
    onSuccess: async ({ query }) => {
      const createdAtFrom = query["createdAt[from]"] ?? "";
      const createdAtTo = query["createdAt[to]"] ?? "";
      const createdAtFilter =
        createdAtFrom || createdAtTo
          ? {
              ...(createdAtFrom && { gte: createdAtFrom }),
              ...(createdAtTo && { lte: createdAtTo }),
            }
          : undefined;

      const [
        opdPatients,
        ipdPatients,
        opdTotalBilling,
        ipdTotalBilling,
        opdCollection,
        ipdCollection,
        transactionsByPaymentMode,
        sectionWiseBilling,
        expenseTotal,
      ] = await prisma.$transaction([
        prisma.opd.count({
          where: {
            ...(createdAtFilter && { createdAt: createdAtFilter }),
          },
        }),
        prisma.ipd.count({
          where: {
            isDischarged: false,
            ...(createdAtFilter && { createdAt: createdAtFilter }),
          },
        }),
        prisma.invoice.aggregate({
          _sum: { total: true },
          where: {
            isDeleted: false,
            opd: {
              isNot: null,
            },
            ...(createdAtFilter && { createdAt: createdAtFilter }),
          },
        }),
        prisma.invoice.aggregate({
          _sum: { total: true },
          where: {
            isDeleted: false,
            ipd: {
              isNot: null,
            },
            ...(createdAtFilter && { createdAt: createdAtFilter }),
          },
        }),
        prisma.transaction.aggregate({
          _sum: { amount: true },
          where: {
            ...(createdAtFilter && { createdAt: createdAtFilter }),
            invoice: {
              isDeleted: false,
              opd: { isNot: null },
            },
          },
        }),
        prisma.transaction.aggregate({
          _sum: { amount: true },
          where: {
            ...(createdAtFilter && { createdAt: createdAtFilter }),
            invoice: {
              isDeleted: false,
              ipd: { isNot: null },
            },
          },
        }),
        prisma.transaction.groupBy({
          by: ["mode"],
          where: {
            ...(createdAtFilter && { createdAt: createdAtFilter }),
            invoice: {
              isDeleted: false,
            },
          },
          orderBy: {
            mode: "asc",
          },
          _sum: {
            amount: true,
          },
        }),
        prisma.billingSection.findMany({
          where: { isDeleted: false },
          select: {
            id: true,
            name: true,
            invoiceBillingItems: {
              where: {
                invoice: {
                  isDeleted: false,
                  ...(createdAtFilter && { createdAt: createdAtFilter }),
                },
              },
              select: { total: true },
            },
          },
        }),
        prisma.expense.aggregate({
          _sum: { amount: true },
          where: {
            isDeleted: false,
            ...(createdAtFilter && { dateTime: createdAtFilter }),
          },
        }),
      ]);

      return apiResponse({
        status: RESPONSE_STATUS.SUCCESS,
        message: "Dashboard Fetched Successfully",
        data: {
          patients: { opd: opdPatients, ipd: ipdPatients },
          collections: {
            opd: opdCollection._sum.amount || 0,
            ipd: ipdCollection._sum.amount || 0,
          },
          billing: {
            opd: opdTotalBilling._sum.total || 0,
            ipd: ipdTotalBilling._sum.total || 0,
          },
          transactions: transactionsByPaymentMode?.map((t) => ({
            mode: t.mode,
            amount: t._sum?.amount,
          })),
          sectionWiseBilling: sectionWiseBilling?.map((section) => ({
            id: section.id,
            name: section.name,
            total: section.invoiceBillingItems.reduce(
              (sum, i) => sum + i.total,
              0,
            ),
          })),
          expense: expenseTotal?._sum?.amount || 0,
        },
      });
    },
  });
};
