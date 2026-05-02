import { Prisma } from "@/generated/prisma/client";
import { SupplierPaymentType } from "@/generated/prisma/enums";
import { apiResponse } from "@/lib/apiResponse";
import { getInvoiceDueAmount, getNetInvoicePaidAmount } from "@/lib/invoiceTransactions";
import {
  CustomerLedgerRowType,
  SupplierLedgerDetailType,
  SupplierLedgerTransactionType,
  SupplierPendingInvoiceType,
} from "@/lib/type";
import { RESPONSE_STATUS } from "@/lib/responseStatus";
import { validateRequest } from "@/lib/validator";
import { prisma } from "@/services/prisma";
import { paginationValidator } from "@/validators/api/common/pagination";
import z from "zod";

const supplierLedgerParamsValidator = z.object({
  supplierId: z.coerce.number().int().min(1, "Supplier is required"),
});

const round2 = (value: number) => Number(value.toFixed(2));

const getSupplierFromGrn = (grn: {
  order?: { supplier?: { id: number; name: string } | null } | null;
  challan?: { supplier?: { id: number; name: string } | null } | null;
}) => grn.order?.supplier ?? grn.challan?.supplier ?? null;

const getGrnPaidAmount = (grn: {
  supplierPaymentAllocations?: Array<{
    amount: number;
    supplierPayment?: {
      isDeleted: boolean;
      type: SupplierPaymentType;
    } | null;
  }>;
}) =>
  round2(
    (grn.supplierPaymentAllocations || []).reduce((sum, allocation) => {
      if (
        allocation.supplierPayment?.isDeleted ||
        allocation.supplierPayment?.type !== SupplierPaymentType.DEBIT
      ) {
        return sum;
      }

      return sum + Number(allocation.amount || 0);
    }, 0),
  );

export const getSupplierLedgerListAPI = async (req: Request) => {
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

      const and: Prisma.DrugSupplierWhereInput[] = [{ isDeleted: false }];

      if (search) {
        and.push({
          OR: [
            { name: { contains: search } },
            { gstIn: { contains: search } },
            { phone: { contains: search } },
            { email: { contains: search } },
          ],
        });
      }

      if (createdAtFrom || createdAtTo) {
        and.push({
          createdAt: {
            ...(createdAtFrom && { gte: createdAtFrom }),
            ...(createdAtTo && { lte: createdAtTo }),
          },
        });
      }

      const where: Prisma.DrugSupplierWhereInput = { AND: and };

      const [items, total] = await prisma.$transaction([
        prisma.drugSupplier.findMany({
          skip,
          take: limit,
          where,
          orderBy: { id: "desc" },
        }),
        prisma.drugSupplier.count({ where }),
      ]);

      return apiResponse({
        status: RESPONSE_STATUS.SUCCESS,
        message: "Supplier ledgers fetched successfully",
        data: items,
        total,
      });
    },
  });
};

export const getSupplierLedgerDetailsAPI = async (
  req: Request,
  { params }: { params: { supplierId: string } },
) => {
  return validateRequest({
    paramsSchema: supplierLedgerParamsValidator,
    params,
    req,
    onSuccess: async ({ params }) => {
      const supplierId = Number(params.supplierId);

      const supplier = await prisma.drugSupplier.findFirst({
        where: {
          id: supplierId,
          isDeleted: false,
        },
        select: {
          id: true,
          name: true,
          phone: true,
          email: true,
          gstIn: true,
        },
      });

      if (!supplier) {
        return apiResponse({
          status: RESPONSE_STATUS.NOT_FOUND,
          message: "Supplier not found",
        });
      }

      const [grns, supplierPayments, supplierReturns] = await prisma.$transaction([
        prisma.gRN.findMany({
          where: {
            OR: [
              { order: { is: { supplierId, isDeleted: false } } },
              { challan: { is: { supplierId, isDeleted: false } } },
            ],
          },
          include: {
            order: { include: { supplier: true } },
            challan: { include: { supplier: true } },
            supplierPaymentAllocations: {
              include: {
                supplierPayment: {
                  select: {
                    isDeleted: true,
                    type: true,
                  },
                },
              },
            },
          },
          orderBy: { invoiceDate: "asc" },
        }),
        prisma.supplierPayment.findMany({
          where: {
            supplierId,
            isDeleted: false,
          },
          orderBy: { paymentDate: "asc" },
        }),
        prisma.supplierReturn.findMany({
          where: {
            supplierId,
            isDeleted: false,
          },
          orderBy: { returnDate: "asc" },
        }),
      ]);

      const pendingInvoices: SupplierPendingInvoiceType[] = grns
        .map((grn) => {
          const paid = getGrnPaidAmount(grn);
          const total = round2(Number(grn.grandTotal || 0));
          const due = round2(total - paid);

          return {
            invoiceNumber: grn.invoiceNumber,
            date: grn.invoiceDate,
            total,
            paid,
            due,
          };
        })
        .filter((item) => item.due > 0);

      const rawTransactions: Array<
        Omit<SupplierLedgerTransactionType, "balance"> & {
          sortDate: Date;
          sortOrder: number;
        }
      > = [];

      grns.forEach((grn) => {
        rawTransactions.push({
          sortDate: grn.invoiceDate,
          sortOrder: 1,
          date: grn.invoiceDate,
          reference: `GRN Invoice ${grn.invoiceNumber}`,
          credit: 0,
          debit: round2(Number(grn.grandTotal || 0)),
        });
      });

      supplierReturns.forEach((supplierReturn) => {
        rawTransactions.push({
          sortDate: supplierReturn.returnDate,
          sortOrder: 2,
          date: supplierReturn.returnDate,
          reference: `Supplier Return #${supplierReturn.id}${supplierReturn.returnReason ? ` | ${supplierReturn.returnReason}` : ""}`,
          credit: round2(Number(supplierReturn.total || 0)),
          debit: 0,
        });
      });

      supplierPayments.forEach((payment) => {
        rawTransactions.push({
          sortDate: payment.paymentDate,
          sortOrder: 3,
          date: payment.paymentDate,
          reference:
            payment.type === SupplierPaymentType.CREDIT
              ? `Supplier Credit Note${payment.reference ? ` | ${payment.reference}` : ""}`
              : `Supplier Payment${payment.reference ? ` | ${payment.reference}` : ""}`,
          credit: round2(Number(payment.amount || 0)),
          debit: 0,
        });
      });

      const transactions = rawTransactions
        .sort((a, b) => {
          const dateDiff = new Date(a.sortDate).getTime() - new Date(b.sortDate).getTime();
          if (dateDiff !== 0) return dateDiff;
          return a.sortOrder - b.sortOrder;
        })
        .reduce<SupplierLedgerTransactionType[]>((acc, item) => {
          const previousBalance = acc.length ? acc[acc.length - 1].balance : 0;
          const nextBalance = round2(previousBalance + item.debit - item.credit);

          acc.push({
            date: item.date,
            reference: item.reference,
            credit: item.credit,
            debit: item.debit,
            balance: nextBalance,
          });

          return acc;
        }, []);

      const data: SupplierLedgerDetailType = {
        supplier,
        transactions,
        pendingInvoices,
      };

      return apiResponse({
        status: RESPONSE_STATUS.SUCCESS,
        message: "Supplier ledger fetched successfully",
        data,
      });
    },
  });
};

export const getCustomerLedgerAPI = async (req: Request) => {
  return validateRequest({
    querySchema: paginationValidator,
    req,
    onSuccess: async ({ query }) => {
      const page = Number(query.page ?? 1);
      const limit = Number(query.limit ?? 10);
      const search = query.search ?? "";
      const createdAtFrom = query["createdAt[from]"] ?? "";
      const createdAtTo = query["createdAt[to]"] ?? "";

      const and: Prisma.DrugBillWhereInput[] = [
        { isDeleted: false, invoice: { isDeleted: false } },
      ];

      if (search) {
        and.push({
          OR: [
            ...(Number.isFinite(Number(search)) ? [{ id: Number(search) }] : []),
            { name: { contains: search } },
            { customer: { name: { contains: search } } },
            { patient: { firstName: { contains: search } } },
            { patient: { lastName: { contains: search } } },
          ],
        });
      }

      if (createdAtFrom || createdAtTo) {
        and.push({
          OR: [
            {
              invoice: {
                createdAt: {
                  ...(createdAtFrom && { gte: createdAtFrom }),
                  ...(createdAtTo && { lte: createdAtTo }),
                },
              },
            },
            {
              saleReturns: {
                some: {
                  createdAt: {
                    ...(createdAtFrom && { gte: createdAtFrom }),
                    ...(createdAtTo && { lte: createdAtTo }),
                  },
                },
              },
            },
          ],
        });
      }

      const bills = await prisma.drugBill.findMany({
        where: { AND: and },
        include: {
          patient: true,
          customer: { include: { patient: true } },
          invoice: { include: { transactions: true } },
          saleItems: true,
          saleReturns: {
            where: { isDeleted: false },
            include: {
              items: true,
              refundTransaction: true,
            },
          },
        },
        orderBy: { id: "desc" },
      });

      const rows: CustomerLedgerRowType[] = bills.flatMap((bill) => {
        const customerName = bill.customer?.name ?? bill.name;
        const saleRow: CustomerLedgerRowType = {
          id: `sale-${bill.id}`,
          billNumber: `#${bill.id}`,
          date: bill.invoice.createdAt,
          customer: customerName,
          taxableAmount: round2(
            bill.saleItems.reduce((sum, item) => sum + Number(item.taxableAmount || 0), 0),
          ),
          cGstAmount: round2(
            bill.saleItems.reduce((sum, item) => sum + Number(item.cGstAmount || 0), 0),
          ),
          sGstAmount: round2(
            bill.saleItems.reduce((sum, item) => sum + Number(item.sGstAmount || 0), 0),
          ),
          iGstAmount: round2(
            bill.saleItems.reduce((sum, item) => sum + Number(item.iGstAmount || 0), 0),
          ),
          total: round2(Number(bill.invoice.total || 0)),
          paid: round2(getNetInvoicePaidAmount(bill.invoice.transactions || [])),
          due: round2(
            getInvoiceDueAmount({
              total: Number(bill.invoice.total || 0),
              transactions: bill.invoice.transactions || [],
            }),
          ),
          type: "SALE",
        };

        const returnRows: CustomerLedgerRowType[] = bill.saleReturns.map((saleReturn) => ({
          id: `return-${saleReturn.id}`,
          billNumber: `#${bill.id}-R${saleReturn.id}`,
          date: saleReturn.createdAt,
          customer: customerName,
          taxableAmount: round2(
            saleReturn.items.reduce(
              (sum, item) => sum + Number(item.taxableAmount || 0),
              0,
            ),
          ),
          cGstAmount: round2(
            saleReturn.items.reduce((sum, item) => sum + Number(item.cGstAmount || 0), 0),
          ),
          sGstAmount: round2(
            saleReturn.items.reduce((sum, item) => sum + Number(item.sGstAmount || 0), 0),
          ),
          iGstAmount: round2(
            saleReturn.items.reduce((sum, item) => sum + Number(item.iGstAmount || 0), 0),
          ),
          total: round2(Number(saleReturn.refundAmount || 0)),
          paid: round2(Number(saleReturn.refundAmount || 0)),
          due: 0,
          type: "RETURN",
        }));

        return [saleRow, ...returnRows];
      });

      rows.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      const total = rows.length;
      const skip = (page - 1) * limit;
      const data = rows.slice(skip, skip + limit);

      return apiResponse({
        status: RESPONSE_STATUS.SUCCESS,
        message: "Customer ledger fetched successfully",
        data,
        total,
      });
    },
  });
};
