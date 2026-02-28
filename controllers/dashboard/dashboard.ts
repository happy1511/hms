import { apiResponse } from "@/lib/apiResponse";
import { RESPONSE_STATUS } from "@/lib/responseStatus";
import { validateRequest } from "@/lib/validator";
import { prisma } from "@/services/prisma";

export const getAPI = async (req: Request) => {
  return validateRequest({
    req,
    onSuccess: async () => {
      const [
        opdPatients,
        ipdPatients,
        opdTotalBilling,
        ipdTotalBilling,
        opdCollection,
        ipdCollection,
        transactionsByPaymentMode,
        sectionWiseBilling,
      ] = await prisma.$transaction([
        prisma.opd.count(),
        prisma.ipd.count({ where: { isDischarged: false } }),
        prisma.invoice.aggregate({
          _sum: { total: true },
          where: {
            opd: {
              isNot: null,
            },
          },
        }),
        prisma.invoice.aggregate({
          _sum: { total: true },
          where: {
            ipd: {
              isNot: null,
            },
          },
        }),
        prisma.transaction.aggregate({
          _sum: { amount: true },
          where: {
            invoice: {
              opd: { isNot: null },
            },
          },
        }),
        prisma.transaction.aggregate({
          _sum: { amount: true },
          where: {
            invoice: {
              ipd: { isNot: null },
            },
          },
        }),
        prisma.transaction.groupBy({
          by: ["mode"],
          orderBy: {
            mode: "asc",
          },
          _sum: {
            amount: true,
          },
        }),
        prisma.billingSection.findMany({
          select: {
            id: true,
            name: true,
            invoiceBillingItems: {
              select: { total: true },
            },
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
        },
      });
    },
  });
};
