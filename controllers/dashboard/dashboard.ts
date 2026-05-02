import { IpdCareType } from "@/generated/prisma/client";
import {
  PathologyOrderStatus,
  PaymentMode,
  RadiologyOrderStatus,
  TransactionType,
} from "@/generated/prisma/enums";
import { InvoiceWhereInput } from "@/generated/prisma/models";
import { apiResponse } from "@/lib/apiResponse";
import { RESPONSE_STATUS } from "@/lib/responseStatus";
import { DashboardType } from "@/lib/type";
import { validateRequest } from "@/lib/validator";
import { prisma } from "@/services/prisma";
import { paginationValidator } from "@/validators/api/common/pagination";
import { addDays, differenceInCalendarDays, startOfDay } from "date-fns";

const roundAmount = (value: number) => Number(value.toFixed(2));

const getSignedTotal = (
  paymentAmount?: number | null,
  refundAmount?: number | null,
) => roundAmount(Number(paymentAmount || 0) - Number(refundAmount || 0));

const getPieceCount = ({
  quantity,
  isLooseQuantity,
  itemsPerPack,
}: {
  quantity?: number | null;
  isLooseQuantity?: boolean | null;
  itemsPerPack?: number | null;
}) => {
  const packSize = Math.max(Number(itemsPerPack || 1), 1);
  return Number(isLooseQuantity ? quantity || 0 : Number(quantity || 0) * packSize);
};

const getInventoryValue = ({
  quantityInStock,
  purchasePrice,
  itemsPerPack,
}: {
  quantityInStock?: number | null;
  purchasePrice?: number | null;
  itemsPerPack?: number | null;
}) => {
  const packSize = Math.max(Number(itemsPerPack || 1), 1);
  const pieceRate = Number(purchasePrice || 0) / packSize;
  return roundAmount(Number(quantityInStock || 0) * pieceRate);
};

const getCreatedAtFilter = (query: Record<string, unknown>) => {
  const createdAtFrom =
    query["createdAt[from]"] instanceof Date ? query["createdAt[from]"] : undefined;
  const createdAtTo =
    query["createdAt[to]"] instanceof Date ? query["createdAt[to]"] : undefined;

  return {
    createdAtFrom,
    createdAtTo,
    createdAtFilter:
      createdAtFrom || createdAtTo
        ? {
            ...(createdAtFrom && { gte: createdAtFrom }),
            ...(createdAtTo && { lte: createdAtTo }),
          }
        : undefined,
  };
};

const sumAmounts = (values: number[]) =>
  roundAmount(values.reduce((sum, value) => sum + Number(value || 0), 0));

const buildReferredByRows = (
  rows: Array<{
    opd?: { referringDoctor?: { user?: { name?: string | null } | null } | null } | null;
    ipd?: { referringDoctor?: { user?: { name?: string | null } | null } | null } | null;
  }>,
) => {
  const counter = new Map<string, number>();

  rows.forEach((row) => {
    const name =
      row.opd?.referringDoctor?.user?.name ||
      row.ipd?.referringDoctor?.user?.name ||
      "Self / Direct";

    counter.set(name, (counter.get(name) || 0) + 1);
  });

  return [...counter.entries()]
    .map(([name, totalOrders]) => ({ name, totalOrders }))
    .sort((a, b) => b.totalOrders - a.totalOrders || a.name.localeCompare(b.name));
};

export const getAPI = async (req: Request) => {
  return validateRequest({
    querySchema: paginationValidator,
    req,
    onSuccess: async ({ query }) => {
      const { createdAtFrom, createdAtFilter } = getCreatedAtFilter(query as Record<string, unknown>);
      const createdAtBeforeFilter = createdAtFrom
        ? {
            lt: createdAtFrom,
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

      const now = startOfDay(new Date());
      const nearExpiryDate = addDays(now, 90);

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
        priorPharmacySalesAgg,
        priorPharmacyReturnsAgg,
        priorPharmacyExpensesAgg,
        pharmacySaleBills,
        pharmacySaleReturns,
        pharmacyExpenses,
        purchaseOrders,
        grns,
        inventoryItems,
        supplierReturns,
        pathologyOrders,
        radiologyOrders,
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
        prisma.transaction.aggregate({
          _sum: { amount: true },
          where: {
            transactionType: TransactionType.PAYMENT,
            ...(createdAtBeforeFilter && { createdAt: createdAtBeforeFilter }),
            invoice: {
              is: {
                isDeleted: false,
                drugBills: { isNot: null },
              },
            },
          },
        }),
        prisma.saleReturn.aggregate({
          _sum: { refundAmount: true },
          where: {
            isDeleted: false,
            ...(createdAtBeforeFilter && { createdAt: createdAtBeforeFilter }),
          },
        }),
        prisma.expense.aggregate({
          _sum: { amount: true },
          where: {
            isDeleted: false,
            ...(createdAtBeforeFilter && { dateTime: createdAtBeforeFilter }),
          },
        }),
        prisma.drugBill.findMany({
          where: {
            isDeleted: false,
            invoice: {
              is: {
                isDeleted: false,
                ...(createdAtFilter && { createdAt: createdAtFilter }),
              },
            },
          },
          include: {
            invoice: {
              select: {
                total: true,
                transactions: {
                  where: {
                    isDeleted: false,
                    transactionType: TransactionType.PAYMENT,
                  },
                  select: {
                    amount: true,
                    mode: true,
                  },
                },
              },
            },
            saleItems: {
              select: {
                quantity: true,
                isLooseQuantity: true,
                cGstAmount: true,
                sGstAmount: true,
                iGstAmount: true,
                inventoryItem: {
                  select: {
                    itemsPerPack: true,
                    drug: {
                      select: {
                        name: true,
                      },
                    },
                  },
                },
              },
            },
          },
        }),
        prisma.saleReturn.findMany({
          where: {
            isDeleted: false,
            ...(createdAtFilter && { createdAt: createdAtFilter }),
          },
          include: {
            refundTransaction: {
              select: {
                mode: true,
              },
            },
            items: {
              select: {
                total: true,
              },
            },
          },
        }),
        prisma.expense.findMany({
          where: {
            isDeleted: false,
            ...(createdAtFilter && { dateTime: createdAtFilter }),
          },
          include: {
            category: {
              select: {
                name: true,
              },
            },
          },
        }),
        prisma.purchaseOrder.findMany({
          where: {
            isDeleted: false,
            ...(createdAtFilter && { orderDate: createdAtFilter }),
          },
          select: {
            grandTotal: true,
          },
        }),
        prisma.gRN.findMany({
          where: {
            ...(createdAtFilter && { invoiceDate: createdAtFilter }),
          },
          select: {
            grandTotal: true,
            cGstAmount: true,
            sGstAmount: true,
            iGstAmount: true,
          },
        }),
        prisma.inventoryItems.findMany({
          where: {
            quantityInStock: {
              gt: 0,
            },
          },
          select: {
            batchNo: true,
            expiryDate: true,
            purchasePrice: true,
            quantityInStock: true,
            itemsPerPack: true,
            drug: {
              select: {
                name: true,
              },
            },
          },
        }),
        prisma.supplierReturn.findMany({
          where: {
            isDeleted: false,
            ...(createdAtFilter && { returnDate: createdAtFilter }),
          },
          select: {
            total: true,
          },
        }),
        prisma.pathologyTestOrder.findMany({
          where: {
            isDeleted: false,
            ...(createdAtFilter && { createdAt: createdAtFilter }),
          },
          select: {
            status: true,
            isCancelled: true,
            isOutSourced: true,
            resultEnteredAt: true,
            verifiedAt: true,
            invoiceBillingItem: {
              select: {
                total: true,
              },
            },
            test: {
              select: {
                name: true,
                price: true,
                section: true,
              },
            },
            opd: {
              select: {
                referringDoctor: {
                  select: {
                    user: {
                      select: {
                        name: true,
                      },
                    },
                  },
                },
              },
            },
            ipd: {
              select: {
                referringDoctor: {
                  select: {
                    user: {
                      select: {
                        name: true,
                      },
                    },
                  },
                },
              },
            },
          },
        }),
        prisma.radiologyTestOrder.findMany({
          where: {
            isDeleted: false,
            ...(createdAtFilter && { createdAt: createdAtFilter }),
          },
          select: {
            status: true,
            isCancelled: true,
            isOutSourced: true,
            resultEnteredAt: true,
            verifiedAt: true,
            invoiceBillingItem: {
              select: {
                total: true,
              },
            },
            test: {
              select: {
                name: true,
                price: true,
                section: true,
              },
            },
            opd: {
              select: {
                referringDoctor: {
                  select: {
                    user: {
                      select: {
                        name: true,
                      },
                    },
                  },
                },
              },
            },
            ipd: {
              select: {
                referringDoctor: {
                  select: {
                    user: {
                      select: {
                        name: true,
                      },
                    },
                  },
                },
              },
            },
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
      const totalClinicalCollections = roundAmount(opdCollections + ipdCollections);
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
      const cashAmount = cashPayments + Number(otherCashPaymentsAgg._sum?.amount || 0);
      const digitalWalletAmount =
        getSignedTotal(walletPaymentsAgg._sum?.amount, walletRefundsAgg._sum?.amount) +
        otherNoCashIncome;
      const paymentModesTotal = roundAmount(cashAmount + digitalWalletAmount);

      const counterSales = pharmacySaleBills.reduce(
        (acc, bill) => {
          bill.invoice.transactions.forEach((transaction) => {
            if (transaction.mode === PaymentMode.CASH) {
              acc.cashSales += Number(transaction.amount || 0);
            } else {
              acc.otherSales += Number(transaction.amount || 0);
            }
          });

          bill.saleItems.forEach((item) => {
            const pieces = getPieceCount({
              quantity: item.quantity,
              isLooseQuantity: item.isLooseQuantity,
              itemsPerPack: item.inventoryItem.itemsPerPack,
            });

            const key = item.inventoryItem.drug.name;
            acc.topItemMap.set(key, (acc.topItemMap.get(key) || 0) + pieces);
            acc.salesGst +=
              Number(item.cGstAmount || 0) +
              Number(item.sGstAmount || 0) +
              Number(item.iGstAmount || 0);
          });

          acc.corporateSales += Number(bill.invoice.total || 0);

          return acc;
        },
        {
          cashSales: 0,
          otherSales: 0,
          salesGst: 0,
          corporateSales: 0,
          topItemMap: new Map<string, number>(),
        },
      );

      const returnsSummary = pharmacySaleReturns.reduce(
        (acc, saleReturn) => {
          const amount = Number(saleReturn.refundAmount || 0);

          if (saleReturn.refundTransaction?.mode === PaymentMode.CASH) {
            acc.cashReturns += amount;
          } else {
            acc.otherReturns += amount;
          }

          acc.corporateReturns += amount;
          return acc;
        },
        {
          cashReturns: 0,
          otherReturns: 0,
          corporateReturns: 0,
        },
      );

      const expensesByCategoryMap = new Map<string, number>();
      let cashExpenses = 0;
      let otherExpenses = 0;

      pharmacyExpenses.forEach((expenseRow) => {
        const amount = Number(expenseRow.amount || 0);
        const category = expenseRow.category?.name || "Uncategorized";

        expensesByCategoryMap.set(
          category,
          Number(expensesByCategoryMap.get(category) || 0) + amount,
        );

        if (expenseRow.paymentMode === PaymentMode.CASH) {
          cashExpenses += amount;
        } else {
          otherExpenses += amount;
        }
      });

      const openingBalance = roundAmount(
        Number(priorPharmacySalesAgg._sum.amount || 0) -
          Number(priorPharmacyReturnsAgg._sum.refundAmount || 0) -
          Number(priorPharmacyExpensesAgg._sum.amount || 0),
      );

      const totalSales = roundAmount(counterSales.cashSales + counterSales.otherSales);
      const totalReturns = roundAmount(
        returnsSummary.cashReturns + returnsSummary.otherReturns,
      );
      const totalExpenses = roundAmount(cashExpenses + otherExpenses);
      const periodBalance = roundAmount(totalSales - totalReturns - totalExpenses);
      const cashBalance = roundAmount(
        counterSales.cashSales - returnsSummary.cashReturns - cashExpenses,
      );
      const closingBalance = roundAmount(openingBalance + periodBalance);

      const expenseByCategory = [...expensesByCategoryMap.entries()]
        .map(([category, amount]) => ({
          category,
          amount: roundAmount(amount),
        }))
        .sort((a, b) => b.amount - a.amount || a.category.localeCompare(b.category));

      const totalStockValue = sumAmounts(
        inventoryItems.map((item) =>
          getInventoryValue({
            quantityInStock: item.quantityInStock,
            purchasePrice: item.purchasePrice,
            itemsPerPack: item.itemsPerPack,
          }),
        ),
      );

      const nearExpiry = inventoryItems
        .filter(
          (item) =>
            new Date(item.expiryDate) >= now && new Date(item.expiryDate) <= nearExpiryDate,
        )
        .map((item) => ({
          item: item.drug.name,
          batch: item.batchNo,
          stock: Number(item.quantityInStock || 0),
          expiringInDays: differenceInCalendarDays(new Date(item.expiryDate), now),
          stockValue: getInventoryValue(item),
        }))
        .sort((a, b) => a.expiringInDays - b.expiringInDays || b.stockValue - a.stockValue);

      const topPerformingItems = [...counterSales.topItemMap.entries()]
        .map(([item, qtySold]) => ({
          item,
          qtySold,
        }))
        .sort((a, b) => b.qtySold - a.qtySold || a.item.localeCompare(b.item))
        .slice(0, 50);

      const purchaseTotal = sumAmounts(
        purchaseOrders.map((purchaseOrder) => Number(purchaseOrder.grandTotal || 0)),
      );
      const purchaseTotalFromGrn = sumAmounts(
        grns.map((grn) => Number(grn.grandTotal || 0)),
      );
      const purchaseReturns = sumAmounts(
        supplierReturns.map((item) => Number(item.total || 0)),
      );
      const purchaseGst = sumAmounts(
        grns.map(
          (grn) =>
            Number(grn.cGstAmount || 0) +
            Number(grn.sGstAmount || 0) +
            Number(grn.iGstAmount || 0),
        ),
      );

      const buildLabSummary = <
        T extends {
          status: PathologyOrderStatus | RadiologyOrderStatus;
          isCancelled: boolean;
          isOutSourced: boolean;
          resultEnteredAt: Date | null;
          verifiedAt: Date | null;
          invoiceBillingItem: { total: number } | null;
          test: { name: string; price: number; section: string };
          opd?: {
            referringDoctor?: { user?: { name?: string | null } | null } | null;
          } | null;
          ipd?: {
            referringDoctor?: { user?: { name?: string | null } | null } | null;
          } | null;
        },
      >(
        orders: T[],
        getPending: (order: T) => boolean,
      ) => {
        const testMap = new Map<string, { revenue: number; totalOrders: number }>();
        const sectionMap = new Map<string, { revenue: number; totalOrders: number }>();

        const requisitions = orders.reduce(
          (acc, order) => {
            const active = !order.isCancelled && !order.isOutSourced;
            const revenue = Number(order.invoiceBillingItem?.total ?? order.test.price ?? 0);

            const testCurrent = testMap.get(order.test.name) || {
              revenue: 0,
              totalOrders: 0,
            };
            testMap.set(order.test.name, {
              revenue: testCurrent.revenue + revenue,
              totalOrders: testCurrent.totalOrders + 1,
            });

            const sectionCurrent = sectionMap.get(order.test.section) || {
              revenue: 0,
              totalOrders: 0,
            };
            sectionMap.set(order.test.section, {
              revenue: sectionCurrent.revenue + revenue,
              totalOrders: sectionCurrent.totalOrders + 1,
            });

            if (order.isCancelled) {
              acc.cancelled += 1;
              return acc;
            }

            if (order.isOutSourced) {
              acc.outsourced += 1;
              return acc;
            }

            if (active && order.status === PathologyOrderStatus.COMPLETED) {
              acc.completed += 1;
              return acc;
            }

            if (active && getPending(order)) {
              acc.pending += 1;
              return acc;
            }

            if (active) {
              acc.inProgress += 1;
            }

            return acc;
          },
          {
            pending: 0,
            inProgress: 0,
            completed: 0,
            outsourced: 0,
            cancelled: 0,
          },
        );

        return {
          requisitions,
          tests: [...testMap.entries()]
            .map(([name, value]) => ({
              name,
              revenue: roundAmount(value.revenue),
              totalOrders: value.totalOrders,
            }))
            .sort((a, b) => b.revenue - a.revenue || b.totalOrders - a.totalOrders),
          sections: [...sectionMap.entries()]
            .map(([name, value]) => ({
              name,
              revenue: roundAmount(value.revenue),
              totalOrders: value.totalOrders,
            }))
            .sort((a, b) => b.revenue - a.revenue || b.totalOrders - a.totalOrders),
          referredBy: buildReferredByRows(orders),
        };
      };

      const pathology = buildLabSummary(pathologyOrders, (order) => {
        return order.status === PathologyOrderStatus.SAMPLE_PENDING;
      });

      const radiology = buildLabSummary(radiologyOrders, (order) => {
        return !order.resultEnteredAt && !order.verifiedAt && order.status !== RadiologyOrderStatus.COMPLETED;
      });

      const data: DashboardType = {
        patients: {
          opd: opdPatients,
          ipd: ipdPatients,
          dayCare: dayCarePatients,
          ipdCensus,
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
          cash: roundAmount(cashAmount),
          digitalWallet: roundAmount(digitalWalletAmount),
          total: paymentModesTotal,
        },
        ipdCareType: {
          surgical: surgicalCurrentIpdPatients,
          medical: medicalCurrentIpdPatients,
          total: surgicalCurrentIpdPatients + medicalCurrentIpdPatients,
        },
        pharmacy: {
          finance: {
            counterSales: {
              openingBalance,
              cashSales: roundAmount(counterSales.cashSales),
              otherSales: roundAmount(counterSales.otherSales),
              totalSales,
              cashReturns: roundAmount(returnsSummary.cashReturns),
              otherReturns: roundAmount(returnsSummary.otherReturns),
              totalReturns,
              cashExpenses: roundAmount(cashExpenses),
              otherExpenses: roundAmount(otherExpenses),
              totalExpenses,
              balance: periodBalance,
              cashBalance,
              closingBalance,
            },
            expensesByCategory: expenseByCategory,
            purchaseTotal,
            totalStockValue,
          },
          stock: {
            topPerformingItems,
            totalItemsInInventory: inventoryItems.length,
            nearExpiry,
          },
          corporate: {
            sales: roundAmount(counterSales.corporateSales),
            returns: roundAmount(returnsSummary.corporateReturns),
            netSales: roundAmount(
              counterSales.corporateSales - returnsSummary.corporateReturns,
            ),
            expenses: roundAmount(
              pharmacyExpenses.reduce(
                (sum, item) => sum + Number(item.amount || 0),
                0,
              ),
            ),
            purchases: purchaseTotalFromGrn,
            purchaseReturns,
            salesGst: roundAmount(counterSales.salesGst),
            purchaseGst,
          },
        },
        lab: {
          pathology,
          radiology,
        },
      };

      return apiResponse({
        status: RESPONSE_STATUS.SUCCESS,
        message: "Dashboard Fetched Successfully",
        data,
      });
    },
  });
};
