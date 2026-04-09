import { IpdCareType } from "@/generated/prisma/client";
import { PaymentMode, TransactionType } from "@/generated/prisma/enums";
import { InvoiceWhereInput } from "@/generated/prisma/models";
import { apiResponse } from "@/lib/apiResponse";
import { RESPONSE_STATUS } from "@/lib/responseStatus";
import { validateRequest } from "@/lib/validator";
import { prisma } from "@/services/prisma";
import { paginationValidator } from "@/validators/api/common/pagination";

const roundAmount = (value: number) => Number(value.toFixed(2));

const getSignedTotal = (
  paymentAmount?: number | null,
  refundAmount?: number | null,
) => roundAmount(Number(paymentAmount || 0) - Number(refundAmount || 0));

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

      const opdInvoiceWhere = {
        isDeleted: false,
        opd: { isNot: null },
        ...(createdAtFilter && { createdAt: createdAtFilter }),
      } as const;

      const ipdInvoiceWhere = {
        isDeleted: false,
        ipd: { is: { isDayCare: false } },
        ...(createdAtFilter && { createdAt: createdAtFilter }),
      } as const;

      const dayCareInvoiceWhere = {
        isDeleted: false,
        ipd: { is: { isDayCare: true } },
        ...(createdAtFilter && { createdAt: createdAtFilter }),
      } as const;

      const clinicalInvoiceWhere: InvoiceWhereInput = {
        isDeleted: false,
        ...(createdAtFilter && { createdAt: createdAtFilter }),
        OR: [{ opd: { isNot: null } }, { ipd: { isNot: null } }],
      };

      const [
        opdPatients,
        ipdPatients,
        dayCarePatients,
        opdBillingAgg,
        ipdBillingAgg,
        dayCareBillingAgg,
        opdPaymentsAgg,
        opdRefundsAgg,
        ipdPaymentsAgg,
        ipdRefundsAgg,
        dayCarePaymentsAgg,
        dayCareRefundsAgg,
        otherIncomeAgg,
        expenseAgg,
        cashPaymentsAgg,
        cashRefundsAgg,
        walletPaymentsAgg,
        walletRefundsAgg,
        surgicalCurrentIpdPatients,
        medicalCurrentIpdPatients,
        ipdCensus,
        otherCashPaymentsAgg,
      ] = await prisma.$transaction([
        prisma.opd.count({
          where: {
            ...(createdAtFilter && { createdAt: createdAtFilter }),
          },
        }),
        prisma.ipd.count({
          where: {
            isDayCare: false,
            ...(createdAtFilter && { createdAt: createdAtFilter }),
          },
        }),
        prisma.ipd.count({
          where: {
            isDayCare: true,
            ...(createdAtFilter && { createdAt: createdAtFilter }),
          },
        }),
        prisma.invoice.aggregate({
          _sum: { total: true },
          where: opdInvoiceWhere,
        }),
        prisma.invoice.aggregate({
          _sum: { total: true },
          where: ipdInvoiceWhere,
        }),
        prisma.invoice.aggregate({
          _sum: { total: true },
          where: dayCareInvoiceWhere,
        }),
        prisma.transaction.aggregate({
          _sum: { amount: true },
          where: {
            transactionType: TransactionType.PAYMENT,
            ...(createdAtFilter && { createdAt: createdAtFilter }),
            invoice: { is: opdInvoiceWhere },
          },
        }),
        prisma.transaction.aggregate({
          _sum: { amount: true },
          where: {
            transactionType: TransactionType.REFUND,
            ...(createdAtFilter && { createdAt: createdAtFilter }),
            invoice: { is: opdInvoiceWhere },
          },
        }),
        prisma.transaction.aggregate({
          _sum: { amount: true },
          where: {
            transactionType: TransactionType.PAYMENT,
            ...(createdAtFilter && { createdAt: createdAtFilter }),
            invoice: { is: ipdInvoiceWhere },
          },
        }),
        prisma.transaction.aggregate({
          _sum: { amount: true },
          where: {
            transactionType: TransactionType.REFUND,
            ...(createdAtFilter && { createdAt: createdAtFilter }),
            invoice: { is: ipdInvoiceWhere },
          },
        }),
        prisma.transaction.aggregate({
          _sum: { amount: true },
          where: {
            transactionType: TransactionType.PAYMENT,
            ...(createdAtFilter && { createdAt: createdAtFilter }),
            invoice: { is: dayCareInvoiceWhere },
          },
        }),
        prisma.transaction.aggregate({
          _sum: { amount: true },
          where: {
            transactionType: TransactionType.REFUND,
            ...(createdAtFilter && { createdAt: createdAtFilter }),
            invoice: { is: dayCareInvoiceWhere },
          },
        }),
        prisma.income.aggregate({
          _sum: { amount: true },
          where: {
            isDeleted: false,
            ...(createdAtFilter && { collectedOn: createdAtFilter }),
          },
        }),
        prisma.expense.aggregate({
          _sum: { amount: true },
          where: {
            isDeleted: false,
            ...(createdAtFilter && { dateTime: createdAtFilter }),
          },
        }),
        prisma.transaction.aggregate({
          _sum: { amount: true },
          where: {
            mode: PaymentMode.CASH,
            transactionType: TransactionType.PAYMENT,
            ...(createdAtFilter && { createdAt: createdAtFilter }),
            invoice: { is: clinicalInvoiceWhere },
          },
        }),
        prisma.transaction.aggregate({
          _sum: { amount: true },
          where: {
            mode: PaymentMode.CASH,
            transactionType: TransactionType.REFUND,
            ...(createdAtFilter && { createdAt: createdAtFilter }),
            invoice: { is: clinicalInvoiceWhere },
          },
        }),
        prisma.transaction.aggregate({
          _sum: { amount: true },
          where: {
            mode: { not: PaymentMode.CASH },
            transactionType: TransactionType.PAYMENT,
            ...(createdAtFilter && { createdAt: createdAtFilter }),
            invoice: { is: clinicalInvoiceWhere },
          },
        }),
        prisma.transaction.aggregate({
          _sum: { amount: true },
          where: {
            mode: { not: PaymentMode.CASH },
            transactionType: TransactionType.REFUND,
            ...(createdAtFilter && { createdAt: createdAtFilter }),
            invoice: { is: clinicalInvoiceWhere },
          },
        }),
        prisma.ipd.count({
          where: {
            isDayCare: false,
            isDischarged: false,
            careType: IpdCareType.SURGICAL,
            ...(createdAtFilter && { createdAt: createdAtFilter }),
          },
        }),
        prisma.ipd.count({
          where: {
            isDayCare: false,
            isDischarged: false,
            careType: IpdCareType.MEDICAL,
            ...(createdAtFilter && { createdAt: createdAtFilter }),
          },
        }),
        prisma.ipd.count({
          where: {
            isMlcPatient: false,
            isDischarged: false,
          },
        }),
        prisma.income.aggregate({
          _sum: { amount: true },
          where: {
            isDeleted: false,
            mode: PaymentMode.CASH,
            ...(createdAtFilter && { collectedOn: createdAtFilter }),
          },
        }),
      ]);

      const opdBilling = Number(opdBillingAgg._sum.total || 0);
      const ipdBilling = Number(ipdBillingAgg._sum.total || 0);
      const dayCareBilling = Number(dayCareBillingAgg._sum.total || 0);

      const opdCollections = getSignedTotal(
        opdPaymentsAgg._sum.amount,
        opdRefundsAgg._sum.amount,
      );
      const ipdCollections = getSignedTotal(
        Number(ipdPaymentsAgg._sum.amount || 0) +
          Number(dayCarePaymentsAgg._sum.amount || 0),
        Number(ipdRefundsAgg._sum.amount || 0) +
          Number(dayCareRefundsAgg._sum.amount || 0),
      );
      const totalClinicalCollections = roundAmount(
        opdCollections + ipdCollections,
      );
      const otherIncome = roundAmount(Number(otherIncomeAgg._sum.amount || 0));
      const totalIncome = roundAmount(totalClinicalCollections + otherIncome);
      const expenses = roundAmount(Number(expenseAgg._sum.amount || 0));
      const balance = roundAmount(totalIncome - expenses);
      const opdDue = roundAmount(Math.max(opdBilling - opdCollections, 0));
      const ipdDue = roundAmount(
        Math.max(ipdBilling + dayCareBilling - ipdCollections, 0),
      );

      const cashPayments = getSignedTotal(
        cashPaymentsAgg._sum?.amount,
        cashRefundsAgg._sum?.amount,
      );
      const otherNoCashIncome = getSignedTotal(
        otherIncomeAgg._sum?.amount,
        otherCashPaymentsAgg._sum?.amount,
      );
      const cashAmount =
        cashPayments + (otherCashPaymentsAgg._sum?.amount || 0);
      const digitalWalletAmount =
        getSignedTotal(
          walletPaymentsAgg._sum?.amount,
          walletRefundsAgg._sum?.amount,
        ) + otherNoCashIncome;
      const paymentModesTotal = roundAmount(cashAmount + digitalWalletAmount);

      return apiResponse({
        status: RESPONSE_STATUS.SUCCESS,
        message: "Dashboard Fetched Successfully",
        data: {
          patients: {
            opd: opdPatients,
            ipd: ipdPatients,
            dayCare: dayCarePatients,
            ipdCensus: ipdCensus,
          },
          collections: {
            opd: opdCollections,
            ipd: ipdCollections,
            totalClinical: totalClinicalCollections,
            otherIncome,
            totalIncome,
            expenses,
            balance,
            ipdDue,
            opdDue,
          },
          billing: {
            opd: roundAmount(opdBilling),
            ipd: roundAmount(ipdBilling),
            dayCare: roundAmount(dayCareBilling),
          },
          transactions: [],
          paymentModes: {
            cash: cashAmount,
            digitalWallet: digitalWalletAmount,
            total: paymentModesTotal,
          },
          ipdCareType: {
            surgical: surgicalCurrentIpdPatients,
            medical: medicalCurrentIpdPatients,
            total: surgicalCurrentIpdPatients + medicalCurrentIpdPatients,
          },
        },
      });
    },
  });
};
