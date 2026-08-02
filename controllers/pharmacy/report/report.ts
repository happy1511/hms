import { Prisma, User } from "@/generated/prisma/client";
import {
  ActionType,
  ModuleType,
  PaymentCategory,
  TransactionType,
} from "@/generated/prisma/enums";
import { apiResponse } from "@/lib/apiResponse";
import { calculatePurchaseOrderLine } from "@/lib/pharmacyPurchaseOrder";
import { getNetInvoicePaidAmount } from "@/lib/invoiceTransactions";
import { RESPONSE_STATUS } from "@/lib/responseStatus";
import { hasUserPermission } from "@/lib/serverPermission";
import { fullName } from "@/lib/utils";
import {
  CounterSaleBillRowType,
  CounterSaleCollectionRowType,
  CounterSaleItemRowType,
  ExpiringItemRowType,
  GstSummaryRowType,
  GrnItemReportRowType,
  GrnReportRowType,
  IpdSaleItemRowType,
  PharmacyReportsType,
  PurchaseOrderItemReportRowType,
  PurchaseOrderReportRowType,
  PurchaseUtilisationRowType,
  SalesHsnSummaryRowType,
  StockItemMovementRowType,
  TopPerformingItemRowType,
} from "@/lib/type";
import { validateRequest } from "@/lib/validator";
import { prisma } from "@/services/prisma";
import { paginationValidator } from "@/validators/api/common/pagination";
import { differenceInCalendarDays } from "date-fns";

const PHARMACY_REPORT_COUNTER_SALE_MODULE =
  "PHARMACY_REPORT_COUNTER_SALE" as ModuleType;
const PHARMACY_REPORT_IPD_SALE_MODULE =
  "PHARMACY_REPORT_IPD_SALE" as ModuleType;
const PHARMACY_REPORT_PO_MODULE = "PHARMACY_REPORT_PO" as ModuleType;
const PHARMACY_REPORT_GRN_MODULE = "PHARMACY_REPORT_GRN" as ModuleType;
const PHARMACY_REPORT_STOCK_MODULE = "PHARMACY_REPORT_STOCK" as ModuleType;

const round2 = (value: number) => Number(value.toFixed(2));

const toPieces = ({
  quantity,
  isLooseQuantity,
  packSize,
}: {
  quantity: number;
  isLooseQuantity: boolean;
  packSize: number;
}) =>
  isLooseQuantity ? Number(quantity || 0) : Number(quantity || 0) * packSize;

const toDisplayLabel = (value: string) =>
  value
    .split("_")
    .map((part) => part.charAt(0) + part.slice(1).toLowerCase())
    .join(" ");

const formatPoNumber = (id: number) => `PO-${id}`;
const formatGrnNumber = (id: number) => `GRN-${id}`;
const formatSaleNumber = (id: number) => `BILL-${id}`;
const formatSaleReturnNumber = (id: number) => `RET-${id}`;
const formatIpdIssueNumber = (id: number) => `ISS-${id}`;

const getCustomerDisplayName = ({
  name,
  customer,
  patient,
}: {
  name?: string | null;
  customer?: { name?: string | null } | null;
  patient?: {
    firstName?: string | null;
    middleName?: string | null;
    lastName?: string | null;
    title?: string | null;
  } | null;
}) =>
  customer?.name ||
  (patient?.firstName
    ? fullName({
        firstName: patient.firstName,
        middleName: patient.middleName,
        lastName: patient.lastName,
      })
    : null) ||
  name ||
  "-";

const getCorporateLabel = (billingType?: PaymentCategory | null) =>
  billingType && billingType !== PaymentCategory.SELF_PAY
    ? toDisplayLabel(String(billingType))
    : "No";

const getLineDiscountPercentage = ({
  discountType,
  discountValue,
  rate,
  quantity,
}: {
  discountType: string;
  discountValue: number;
  rate: number;
  quantity: number;
}) => {
  if (discountType === "PERCENTAGE") {
    return round2(discountValue);
  }
  const gross = Number(rate || 0) * Number(quantity || 0);
  return gross > 0 ? round2((Number(discountValue || 0) / gross) * 100) : 0;
};

const addHsnEntry = ({
  map,
  hsn,
  quantity,
  cGstPercentage,
  sGstPercentage,
  taxableAmount,
  cGstAmount,
  sGstAmount,
  sign = 1,
}: {
  map: Map<string, SalesHsnSummaryRowType>;
  hsn: string;
  quantity: number;
  cGstPercentage: number;
  sGstPercentage: number;
  taxableAmount: number;
  cGstAmount: number;
  sGstAmount: number;
  sign?: 1 | -1;
}) => {
  const key = `${hsn}-${cGstPercentage}-${sGstPercentage}`;
  const row = map.get(key) ?? {
    id: key,
    hsn,
    quantity: 0,
    cGstPercentage,
    sGstPercentage,
    taxableAmount: 0,
    cGstAmount: 0,
    sGstAmount: 0,
  };
  row.quantity = round2(row.quantity + quantity * sign);
  row.taxableAmount = round2(row.taxableAmount + taxableAmount * sign);
  row.cGstAmount = round2(row.cGstAmount + cGstAmount * sign);
  row.sGstAmount = round2(row.sGstAmount + sGstAmount * sign);
  map.set(key, row);
};

const addGstSummaryEntry = ({
  map,
  hsnSacCode,
  gstRate,
  taxableAmount,
  sGstAmount,
  cGstAmount,
  sign = 1,
}: {
  map: Map<string, GstSummaryRowType>;
  hsnSacCode: string;
  gstRate: number;
  taxableAmount: number;
  sGstAmount: number;
  cGstAmount: number;
  sign?: 1 | -1;
}) => {
  const key = `${hsnSacCode}-${gstRate}`;
  const row = map.get(key) ?? {
    id: key,
    hsnSacCode,
    gstRate,
    taxableAmount: 0,
    sGstAmount: 0,
    cGstAmount: 0,
  };

  row.taxableAmount = round2(row.taxableAmount + taxableAmount * sign);
  row.sGstAmount = round2(row.sGstAmount + sGstAmount * sign);
  row.cGstAmount = round2(row.cGstAmount + cGstAmount * sign);
  map.set(key, row);
};

export const getAPI = async (req: Request, user: User) => {
  return validateRequest({
    querySchema: paginationValidator,
    req,
    onSuccess: async ({ query }) => {
      const createdAtFrom = query["createdAt[from]"] ?? "";
      const createdAtTo = query["createdAt[to]"] ?? "";
      const now = new Date();
      const nearExpiryDate = new Date(now);
      nearExpiryDate.setDate(nearExpiryDate.getDate() + 90);

      const [
        canViewCounterSale,
        canViewIpdSale,
        canViewPo,
        canViewGrn,
        canViewStock,
      ] = await Promise.all([
        hasUserPermission(
          user.id,
          PHARMACY_REPORT_COUNTER_SALE_MODULE,
          ActionType.VIEW,
        ),
        hasUserPermission(
          user.id,
          PHARMACY_REPORT_IPD_SALE_MODULE,
          ActionType.VIEW,
        ),
        hasUserPermission(user.id, PHARMACY_REPORT_PO_MODULE, ActionType.VIEW),
        hasUserPermission(user.id, PHARMACY_REPORT_GRN_MODULE, ActionType.VIEW),
        hasUserPermission(
          user.id,
          PHARMACY_REPORT_STOCK_MODULE,
          ActionType.VIEW,
        ),
      ]);

      const saleBillWhere: Prisma.DrugBillWhereInput = {
        isDeleted: false,
        invoice: {
          isDeleted: false,
          ...(createdAtFrom || createdAtTo
            ? {
                createdAt: {
                  ...(createdAtFrom && { gte: createdAtFrom }),
                  ...(createdAtTo && { lte: createdAtTo }),
                },
              }
            : {}),
        },
      };

      const ipdIssueWhere: Prisma.IpdDirectIssueWhereInput = {
        isDeleted: false,
        ...(createdAtFrom || createdAtTo
          ? {
              createdAt: {
                ...(createdAtFrom && { gte: createdAtFrom }),
                ...(createdAtTo && { lte: createdAtTo }),
              },
            }
          : {}),
      };

      const purchaseOrderWhere: Prisma.PurchaseOrderWhereInput = {
        isDeleted: false,
        ...(createdAtFrom || createdAtTo
          ? {
              orderDate: {
                ...(createdAtFrom && { gte: createdAtFrom }),
                ...(createdAtTo && { lte: createdAtTo }),
              },
            }
          : {}),
      };

      const grnWhere: Prisma.GRNWhereInput = {
        OR: [
          { order: { is: { isDeleted: false } } },
          { challan: { is: { isDeleted: false } } },
        ],
        ...(createdAtFrom || createdAtTo
          ? {
              createdAt: {
                ...(createdAtFrom && { gte: createdAtFrom }),
                ...(createdAtTo && { lte: createdAtTo }),
              },
            }
          : {}),
      };

      const [
        saleBills,
        ipdIssues,
        ipdReturns,
        purchaseOrders,
        grns,
        inventoryItems,
      ] = await Promise.all([
        prisma.drugBill.findMany({
          where: saleBillWhere,
          include: {
            patient: true,
            customer: { include: { patient: true } },
            doctor: true,
            invoice: {
              include: {
                transactions: true,
              },
            },
            saleItems: {
              include: {
                inventoryItem: {
                  include: {
                    drug: true,
                    supplier: true,
                    hsnSac: true,
                    grnItems: {
                      include: {
                        grn: true,
                      },
                    },
                  },
                },
                returnItems: {
                  where: {
                    saleReturn: {
                      isDeleted: false,
                    },
                  },
                },
              },
            },
            saleReturns: {
              where: { isDeleted: false },
              include: {
                refundTransaction: true,
                items: {
                  include: {
                    saleItem: {
                      include: {
                        inventoryItem: {
                          include: {
                            drug: true,
                            supplier: true,
                            hsnSac: true,
                            grnItems: {
                              include: {
                                grn: true,
                              },
                            },
                          },
                        },
                      },
                    },
                    inventoryItem: {
                      include: {
                        drug: true,
                        supplier: true,
                        hsnSac: true,
                        grnItems: {
                          include: {
                            grn: true,
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        }),
        prisma.ipdDirectIssue.findMany({
          where: ipdIssueWhere,
          include: {
            ipd: {
              include: {
                invoice: true,
                patient: true,
              },
            },
            items: {
              include: {
                inventoryItem: {
                  include: {
                    drug: true,
                    supplier: true,
                    hsnSac: true,
                    grnItems: {
                      include: {
                        grn: true,
                      },
                    },
                  },
                },
                returnItems: {
                  where: {
                    ipdDirectReturn: {
                      isDeleted: false,
                    },
                  },
                },
              },
            },
          },
        }),
        prisma.ipdDirectReturn.findMany({
          where: {
            isDeleted: false,
            ...(createdAtFrom || createdAtTo
              ? {
                  createdAt: {
                    ...(createdAtFrom && { gte: createdAtFrom }),
                    ...(createdAtTo && { lte: createdAtTo }),
                  },
                }
              : {}),
          },
          include: {
            items: {
              include: {
                inventoryItem: {
                  include: {
                    drug: true,
                    supplier: true,
                    hsnSac: true,
                  },
                },
              },
            },
          },
        }),
        prisma.purchaseOrder.findMany({
          where: purchaseOrderWhere,
          include: {
            supplier: true,
            items: {
              include: {
                category: true,
                drug: true,
                hsnSac: true,
              },
            },
            grn: {
              select: {
                id: true,
              },
            },
          },
          orderBy: { orderDate: "desc" },
        }),
        prisma.gRN.findMany({
          where: grnWhere,
          include: {
            order: {
              include: {
                supplier: true,
              },
            },
            challan: {
              include: {
                supplier: true,
              },
            },
            grnItems: {
              include: {
                purchaseItem: {
                  include: {
                    category: true,
                    drug: true,
                    hsnSac: true,
                  },
                },
                challanItem: {
                  include: {
                    category: true,
                    drug: true,
                    hsnSac: true,
                  },
                },
                inventoryItem: {
                  include: {
                    drug: true,
                    hsnSac: true,
                    supplier: true,
                  },
                },
              },
            },
          },
          orderBy: { createdAt: "desc" },
        }),
        prisma.inventoryItems.findMany({
          include: {
            drug: true,
            supplier: true,
            hsnSac: true,
            grnItems: {
              include: {
                grn: true,
                purchaseItem: {
                  include: {
                    hsnSac: true,
                  },
                },
                challanItem: {
                  include: {
                    hsnSac: true,
                  },
                },
              },
            },
            saleItems: {
              include: {
                returnItems: {
                  where: {
                    saleReturn: {
                      isDeleted: false,
                    },
                  },
                },
              },
            },
            ipdIssueItems: {
              include: {
                returnItems: true,
              },
            },
            ipdReturnItems: true,
            supplierReturnItems: {
              include: {
                supplierReturn: true,
              },
            },
          },
        }),
      ]);

      const counterSaleBills: CounterSaleBillRowType[] = [];
      const counterSaleItems: CounterSaleItemRowType[] = [];
      const counterSaleCollections: CounterSaleCollectionRowType[] = [];
      const counterSaleHsnMap = new Map<string, SalesHsnSummaryRowType>();
      const counterSaleGstSummaryMap = new Map<string, GstSummaryRowType>();

      for (const bill of saleBills) {
        const customer = getCustomerDisplayName({
          name: bill.name,
          customer: bill.customer,
          patient: bill.patient,
        });
        const paidTotal = getNetInvoicePaidAmount(bill.invoice.transactions);

        if (canViewCounterSale) {
          counterSaleBills.push({
            id: `sale-${bill.id}`,
            billNumber: formatSaleNumber(bill.id),
            date: bill.invoice.createdAt,
            customer,
            taxableAmount: round2(
              bill.saleItems.reduce(
                (sum, item) => sum + Number(item.taxableAmount || 0),
                0,
              ),
            ),
            cGstAmount: round2(
              bill.saleItems.reduce(
                (sum, item) => sum + Number(item.cGstAmount || 0),
                0,
              ),
            ),
            sGstAmount: round2(
              bill.saleItems.reduce(
                (sum, item) => sum + Number(item.sGstAmount || 0),
                0,
              ),
            ),
            iGstAmount: round2(
              bill.saleItems.reduce(
                (sum, item) => sum + Number(item.iGstAmount || 0),
                0,
              ),
            ),
            rounding: 0,
            billTotal: round2(Number(bill.invoice.total || 0)),
            paidTotal,
            saleOrReturn: "SALE",
            wholesaleRetail: bill.isWholesaleBill ? "WHOLESALE" : "RETAIL",
            corporate: getCorporateLabel(bill.invoice.billingType),
          });
        }

        for (const txn of bill.invoice.transactions.filter(
          (txn) =>
            !txn.isDeleted && txn.transactionType === TransactionType.PAYMENT,
        )) {
          if (!canViewCounterSale) continue;
          counterSaleCollections.push({
            id: `txn-${txn.id}`,
            customer,
            billNumber: formatSaleNumber(bill.id),
            paymentDate: txn.createdAt,
            amount: Number(txn.amount || 0),
            paymentMode: toDisplayLabel(String(txn.mode)),
            receiptNumber: `RCPT-${txn.id}`,
            remarks: txn.remarks || "-",
          });
        }

        for (const item of bill.saleItems) {
          const packSize = Math.max(
            Number(item.inventoryItem.itemsPerPack || 1),
            1,
          );
          const pieces = toPieces({
            quantity: item.quantity,
            isLooseQuantity: Boolean(item.isLooseQuantity),
            packSize,
          });
          const ptr = Boolean(item.isLooseQuantity)
            ? Number(item.inventoryItem.purchasePrice || 0) / packSize
            : Number(item.inventoryItem.purchasePrice || 0);
          const gstPercent =
            Number(item.cGstPercentage || 0) +
            Number(item.sGstPercentage || 0) +
            Number(item.iGstPercentage || 0);
          const ptrWithGst = round2(ptr + (ptr * gstPercent) / 100);
          const ptrTotal = round2(ptr * Number(item.quantity || 0));
          const ptrWithGstTotal = round2(
            ptrWithGst * Number(item.quantity || 0),
          );
          const purchaseMeta = item.inventoryItem.grnItems[0]?.grn;

          if (canViewCounterSale) {
            counterSaleItems.push({
              id: `sale-item-${item.id}`,
              date: bill.invoice.createdAt,
              customer,
              billNumber: formatSaleNumber(bill.id),
              item: item.inventoryItem.drug.name,
              hsn: String(item.inventoryItem.hsnSac?.code ?? "-"),
              batch: String(item.inventoryItem.batchNo),
              expiry: item.inventoryItem.expiryDate,
              ptr: round2(ptr),
              ptrWithGst,
              ptrTotal,
              ptrWithGstTotal,
              mrp: round2(
                Boolean(item.isLooseQuantity)
                  ? Number(item.inventoryItem.mrp || 0) / packSize
                  : Number(item.inventoryItem.mrp || 0),
              ),
              itemsPerPack: packSize,
              billedRate: Number(item.rate || 0),
              quantity: Number(item.quantity || 0),
              discountPercentage: getLineDiscountPercentage({
                discountType: String(item.discountType),
                discountValue: Number(item.discountValue || 0),
                rate: Number(item.rate || 0),
                quantity: Number(item.quantity || 0),
              }),
              total: Number(item.total || 0),
              cGstPercentage: Number(item.cGstPercentage || 0),
              sGstPercentage: Number(item.sGstPercentage || 0),
              iGstPercentage: Number(item.iGstPercentage || 0),
              saleOrReturn: "SALE",
              doctor: bill.doctor ? fullName(bill.doctor) : "-",
              saleType: bill.isWholesaleBill ? "WHOLESALE" : "RETAIL",
              profitLoss: round2(Number(item.total || 0) - ptrWithGstTotal),
              supplier: item.inventoryItem.supplier.name,
              purchaseDate: purchaseMeta?.createdAt ?? null,
              purchaseBillNumber: purchaseMeta?.invoiceNumber || "-",
            });
          }

          addHsnEntry({
            map: counterSaleHsnMap,
            hsn: String(item.inventoryItem.hsnSac?.code ?? "-"),
            quantity: pieces,
            cGstPercentage: Number(item.cGstPercentage || 0),
            sGstPercentage: Number(item.sGstPercentage || 0),
            taxableAmount: Number(item.taxableAmount || 0),
            cGstAmount: Number(item.cGstAmount || 0),
            sGstAmount: Number(item.sGstAmount || 0),
          });

          addGstSummaryEntry({
            map: counterSaleGstSummaryMap,
            hsnSacCode: String(item.inventoryItem.hsnSac?.code ?? "-"),
            gstRate: round2(
              Number(item.cGstPercentage || 0) +
                Number(item.sGstPercentage || 0),
            ),
            taxableAmount: Number(item.taxableAmount || 0),
            sGstAmount: Number(item.sGstAmount || 0),
            cGstAmount: Number(item.cGstAmount || 0),
          });
        }

        for (const saleReturn of bill.saleReturns) {
          if (canViewCounterSale) {
            counterSaleBills.push({
              id: `return-${saleReturn.id}`,
              billNumber: formatSaleReturnNumber(saleReturn.id),
              date: saleReturn.createdAt,
              customer,
              taxableAmount: round2(
                saleReturn.items.reduce(
                  (sum, item) => sum + Number(item.taxableAmount || 0),
                  0,
                ),
              ),
              cGstAmount: round2(
                saleReturn.items.reduce(
                  (sum, item) => sum + Number(item.cGstAmount || 0),
                  0,
                ),
              ),
              sGstAmount: round2(
                saleReturn.items.reduce(
                  (sum, item) => sum + Number(item.sGstAmount || 0),
                  0,
                ),
              ),
              iGstAmount: round2(
                saleReturn.items.reduce(
                  (sum, item) => sum + Number(item.iGstAmount || 0),
                  0,
                ),
              ),
              rounding: 0,
              billTotal: round2(Number(saleReturn.refundAmount || 0)),
              paidTotal: round2(
                Number(saleReturn.refundTransaction?.amount || 0),
              ),
              saleOrReturn: "RETURN",
              wholesaleRetail: bill.isWholesaleBill ? "WHOLESALE" : "RETAIL",
              corporate: getCorporateLabel(bill.invoice.billingType),
            });
          }

          for (const item of saleReturn.items) {
            const inventory = item.inventoryItem ?? item.saleItem.inventoryItem;
            const packSize = Math.max(Number(inventory.itemsPerPack || 1), 1);
            const pieces = toPieces({
              quantity: item.quantity,
              isLooseQuantity: Boolean(item.isLooseQuantity),
              packSize,
            });
            const ptr = Boolean(item.isLooseQuantity)
              ? Number(inventory.purchasePrice || 0) / packSize
              : Number(inventory.purchasePrice || 0);
            const gstPercent =
              Number(item.cGstPercentage || 0) +
              Number(item.sGstPercentage || 0) +
              Number(item.iGstPercentage || 0);
            const ptrWithGst = round2(ptr + (ptr * gstPercent) / 100);
            const ptrTotal = round2(ptr * Number(item.quantity || 0));
            const ptrWithGstTotal = round2(
              ptrWithGst * Number(item.quantity || 0),
            );
            const purchaseMeta = inventory.grnItems[0]?.grn;

            if (canViewCounterSale) {
              counterSaleItems.push({
                id: `return-item-${item.id}`,
                date: saleReturn.createdAt,
                customer,
                billNumber: formatSaleReturnNumber(saleReturn.id),
                item: inventory.drug.name,
                hsn: String(inventory.hsnSac?.code ?? "-"),
                batch: String(inventory.batchNo),
                expiry: inventory.expiryDate,
                ptr: round2(ptr),
                ptrWithGst,
                ptrTotal,
                ptrWithGstTotal,
                mrp: round2(
                  Boolean(item.isLooseQuantity)
                    ? Number(inventory.mrp || 0) / packSize
                    : Number(inventory.mrp || 0),
                ),
                itemsPerPack: packSize,
                billedRate: Number(item.rate || 0),
                quantity: Number(item.quantity || 0),
                discountPercentage: getLineDiscountPercentage({
                  discountType: String(item.discountType),
                  discountValue: Number(item.discountValue || 0),
                  rate: Number(item.rate || 0),
                  quantity: Number(item.quantity || 0),
                }),
                total: Number(item.total || 0),
                cGstPercentage: Number(item.cGstPercentage || 0),
                sGstPercentage: Number(item.sGstPercentage || 0),
                iGstPercentage: Number(item.iGstPercentage || 0),
                saleOrReturn: "RETURN",
                doctor: bill?.doctor ? fullName(bill.doctor) : "-",
                saleType: bill.isWholesaleBill ? "WHOLESALE" : "RETAIL",
                profitLoss: round2(Number(item.total || 0) - ptrWithGstTotal),
                supplier: inventory.supplier.name,
                purchaseDate: purchaseMeta?.createdAt ?? null,
                purchaseBillNumber: purchaseMeta?.invoiceNumber || "-",
              });
            }

            addHsnEntry({
              map: counterSaleHsnMap,
              hsn: String(inventory.hsnSac?.code ?? "-"),
              quantity: pieces,
              cGstPercentage: Number(item.cGstPercentage || 0),
              sGstPercentage: Number(item.sGstPercentage || 0),
              taxableAmount: Number(item.taxableAmount || 0),
              cGstAmount: Number(item.cGstAmount || 0),
              sGstAmount: Number(item.sGstAmount || 0),
              sign: -1,
            });

            addGstSummaryEntry({
              map: counterSaleGstSummaryMap,
              hsnSacCode: String(inventory.hsnSac?.code ?? "-"),
              gstRate: round2(
                Number(item.cGstPercentage || 0) +
                  Number(item.sGstPercentage || 0),
              ),
              taxableAmount: Number(item.taxableAmount || 0),
              sGstAmount: Number(item.sGstAmount || 0),
              cGstAmount: Number(item.cGstAmount || 0),
              sign: -1,
            });
          }
        }
      }

      const ipdSaleItems: IpdSaleItemRowType[] = [];
      const ipdSaleHsnMap = new Map<string, SalesHsnSummaryRowType>();

      for (const issue of ipdIssues) {
        for (const item of issue.items) {
          const packSize = Math.max(
            Number(item.inventoryItem.itemsPerPack || 1),
            1,
          );
          if (canViewIpdSale) {
            ipdSaleItems.push({
              id: `ipd-issue-item-${item.id}`,
              date: issue.createdAt,
              invoiceNumber: formatIpdIssueNumber(issue.id),
              billingType: toDisplayLabel(
                String(issue.ipd.invoice?.billingType || "SELF_PAY"),
              ),
              customer: getCustomerDisplayName({
                patient: issue.ipd.patient,
              }),
              item: item.inventoryItem.drug.name,
              rate: Number(item.rate || 0),
              quantity: Number(item.quantity || 0),
              itemTotal: Number(item.total || 0),
            });
          }

          addHsnEntry({
            map: ipdSaleHsnMap,
            hsn: String(item.inventoryItem.hsnSac?.code ?? "-"),
            quantity: toPieces({
              quantity: item.quantity,
              isLooseQuantity: Boolean(item.isLooseQuantity),
              packSize,
            }),
            cGstPercentage: Number(item.cGstPercentage || 0),
            sGstPercentage: Number(item.sGstPercentage || 0),
            taxableAmount: Number(item.taxableAmount || 0),
            cGstAmount: Number(item.cGstAmount || 0),
            sGstAmount: Number(item.sGstAmount || 0),
          });
        }
      }

      const purchaseOrderRows: PurchaseOrderReportRowType[] =
        purchaseOrders.map((order) => ({
          id: order.id,
          supplier: order.supplier.name,
          poNumber: formatPoNumber(order.id),
          poDate: order.orderDate,
          items: order.items.length,
          taxableAmount: Number(order.taxableAmount || 0),
          packingForwarding: Number(order.packingForwarding || 0),
          cGstAmount: Number(order.cGstAmount || 0),
          sGstAmount: Number(order.sGstAmount || 0),
          iGstAmount: Number(order.iGstAmount || 0),
          tcsAmount: Number(order.tcsAmount || 0),
          discountAmount: Number(order.discountAmount || 0),
          roundOffAmount: Number(order.roundOffAmount || 0),
          grandTotal: Number(order.grandTotal || 0),
          linkedGrn: order.grn?.id ? formatGrnNumber(order.grn.id) : "-",
        }));

      const poGstSummaryMap = new Map<string, GstSummaryRowType>();

      const purchaseOrderItemRows: PurchaseOrderItemReportRowType[] =
        purchaseOrders.flatMap((order) =>
          order.items.map((item) => {
            const cGstPercentage = Number(item.hsnSac?.cGstPercentage || 0);
            const sGstPercentage = Number(item.hsnSac?.sGstPercentage || 0);
            const iGstPercentage = Number(item.hsnSac?.iGstPercentage || 0);
            const lineSummary = calculatePurchaseOrderLine({
              quantity: Number(item.quantity || 0),
              rate: Number(item.rate || 0),
              discountPercentage: Number(item.discountPercentage || 0),
              hsnSac: {
                cGstPercentage,
                sGstPercentage,
                iGstPercentage,
              },
            });

            addGstSummaryEntry({
              map: poGstSummaryMap,
              hsnSacCode: String(item.hsnSac?.code ?? "-"),
              gstRate: round2(cGstPercentage + sGstPercentage),
              taxableAmount: lineSummary.taxableAmount,
              sGstAmount: lineSummary.sGstAmount,
              cGstAmount: lineSummary.cGstAmount,
            });

            return {
              id: `${order.id}-${item.id}`,
              poNumber: formatPoNumber(order.id),
              supplier: order.supplier.name,
              poDate: order.orderDate,
              item: item.drug.name,
              category: item.category?.name || "-",
              hsn: String(item.hsnSac?.code ?? "-"),
              quantity: Number(item.quantity || 0),
              rate: Number(item.rate || 0),
              cGstPercentage,
              sGstPercentage,
              iGstPercentage,
              total: Number(item.total || 0),
            };
          }),
        );

      const grnRows: GrnReportRowType[] = grns.map((grn) => {
        const supplier = grn.order?.supplier ?? grn.challan?.supplier;
        return {
          id: grn.id,
          supplier: supplier?.name || "-",
          gstIn: supplier?.gstIn || "-",
          invoiceNumber: grn.invoiceNumber,
          invoiceDate: grn.invoiceDate,
          totalItems: grn.grnItems.length,
          taxableAmount: Number(grn.taxableAmount || 0),
          discountAmount: Number(grn.discountAmount || 0),
          cGstAmount: Number(grn.cGstAmount || 0),
          sGstAmount: Number(grn.sGstAmount || 0),
          iGstAmount: Number(grn.iGstAmount || 0),
          tcsAmount: Number(grn.tcsAmount || 0),
          packingForwarding: Number(grn.packingForwarding || 0),
          roundOffAmount: Number(grn.roundOffAmount || 0),
          grandTotal: Number(grn.grandTotal || 0),
          grnNumber: formatGrnNumber(grn.id),
          linkedPo: grn.orderId ? formatPoNumber(grn.orderId) : "-",
        };
      });

      const grnItemRows: GrnItemReportRowType[] = grns.flatMap((grn) => {
        const supplier = grn.order?.supplier ?? grn.challan?.supplier;
        return grn.grnItems.map((item) => {
          const purchaseItem = item.purchaseItem;
          const challanItem = item.challanItem;
          const inventory = item.inventoryItem;
          const hsnCode =
            purchaseItem?.hsnSac?.code ??
            challanItem?.hsnSac?.code ??
            inventory.hsnSac?.code ??
            "-";

          return {
            id: `${grn.id}-${item.id}`,
            grn: formatGrnNumber(grn.id),
            po: grn.orderId ? formatPoNumber(grn.orderId) : "-",
            supplier: supplier?.name || inventory.supplier.name,
            invoiceNumber: grn.invoiceNumber,
            grnDate: grn.createdAt,
            item:
              purchaseItem?.drug.name ||
              challanItem?.drug.name ||
              inventory.drug.name,
            category:
              purchaseItem?.category?.name ||
              challanItem?.category?.name ||
              "-",
            batch: String(inventory.batchNo),
            expiry: inventory.expiryDate,
            hsn: String(hsnCode),
            quantity: Number(
              purchaseItem?.quantity ?? challanItem?.quantity ?? 0,
            ),
            freeQuantity: Number(challanItem?.freeQuantity ?? 0),
            rate: Number(
              purchaseItem?.rate ??
                challanItem?.purchasePrice ??
                inventory.purchasePrice ??
                0,
            ),
            cGstPercentage: Number(
              purchaseItem?.hsnSac?.cGstPercentage ??
                challanItem?.hsnSac?.cGstPercentage ??
                inventory.hsnSac?.cGstPercentage ??
                0,
            ),
            sGstPercentage: Number(
              purchaseItem?.hsnSac?.sGstPercentage ??
                challanItem?.hsnSac?.sGstPercentage ??
                inventory.hsnSac?.sGstPercentage ??
                0,
            ),
            iGstPercentage: Number(
              purchaseItem?.hsnSac?.iGstPercentage ??
                challanItem?.hsnSac?.iGstPercentage ??
                inventory.hsnSac?.iGstPercentage ??
                0,
            ),
            mrp: Number(challanItem?.mrp ?? inventory.mrp ?? 0),
          };
        });
      });

      const purchaseUtilisation: PurchaseUtilisationRowType[] =
        inventoryItems.map((inventory) => {
          let purchasedQuantity = 0;
          let purchaseAmount = 0;

          for (const grnItem of inventory.grnItems) {
            const packSize = Math.max(Number(inventory.itemsPerPack || 1), 1);
            const qty = grnItem.challanItem
              ? (Number(grnItem.challanItem.quantity || 0) +
                  Number(grnItem.challanItem.freeQuantity || 0)) *
                Math.max(Number(grnItem.challanItem.itemsPerPack || 1), 1)
              : Number(grnItem.purchaseItem?.quantity || 0) * packSize;
            const amount = grnItem.challanItem
              ? Number(grnItem.challanItem.quantity || 0) *
                Number(grnItem.challanItem.purchasePrice || 0)
              : Number(grnItem.purchaseItem?.quantity || 0) *
                Number(
                  grnItem.purchaseItem?.rate || inventory.purchasePrice || 0,
                );

            purchasedQuantity += qty;
            purchaseAmount = round2(purchaseAmount + amount);
          }

          let soldQuantity = 0;
          let soldAmount = 0;
          for (const saleItem of inventory.saleItems) {
            const packSize = Math.max(Number(inventory.itemsPerPack || 1), 1);
            const soldPieces = toPieces({
              quantity: saleItem.quantity,
              isLooseQuantity: Boolean(saleItem.isLooseQuantity),
              packSize,
            });
            const returnedPieces = saleItem.returnItems.reduce(
              (sum, returnItem) =>
                sum +
                toPieces({
                  quantity: returnItem.quantity,
                  isLooseQuantity: Boolean(returnItem.isLooseQuantity),
                  packSize,
                }),
              0,
            );
            soldQuantity += soldPieces - returnedPieces;
            soldAmount = round2(
              soldAmount +
                Number(saleItem.total || 0) -
                saleItem.returnItems.reduce(
                  (sum, returnItem) => sum + Number(returnItem.total || 0),
                  0,
                ),
            );
          }

          return {
            id: inventory.id,
            item: inventory.drug.name,
            batch: String(inventory.batchNo),
            expiry: inventory.expiryDate,
            purchasedQuantity,
            ptr: Number(inventory.purchasePrice || 0),
            cGstPercentage: Number(inventory.hsnSac?.cGstPercentage || 0),
            sGstPercentage: Number(inventory.hsnSac?.sGstPercentage || 0),
            purchaseAmount: round2(purchaseAmount),
            soldQuantity: round2(soldQuantity),
            soldAmount: round2(soldAmount),
            utilisationPercentage:
              purchasedQuantity > 0
                ? round2((soldQuantity / purchasedQuantity) * 100)
                : 0,
          };
        });

      const movementMap = new Map<string, StockItemMovementRowType>();
      const upsertMovement = (itemName: string) => {
        if (!movementMap.has(itemName)) {
          movementMap.set(itemName, {
            id: itemName,
            item: itemName,
            counterSalesQuantity: 0,
            counterSalesPurchaseValue: 0,
            counterSalesMrpValue: 0,
            counterReturnsQuantity: 0,
            counterReturnsPurchaseValue: 0,
            counterReturnsMrpValue: 0,
            ipdSalesQuantity: 0,
            ipdSalesPurchaseValue: 0,
            ipdSalesMrpValue: 0,
            ipdReturnsQuantity: 0,
            ipdReturnsPurchaseValue: 0,
            ipdReturnsMrpValue: 0,
            purchaseOrdersQuantity: 0,
            purchaseOrdersPurchaseValue: 0,
            purchaseOrdersMrpValue: 0,
            purchaseReturnsQuantity: 0,
            purchaseReturnsPurchaseValue: 0,
            purchaseReturnsMrpValue: 0,
          });
        }
        return movementMap.get(itemName)!;
      };

      for (const inventory of inventoryItems) {
        const packSize = Math.max(Number(inventory.itemsPerPack || 1), 1);
        const ptrPerPiece = Number(inventory.purchasePrice || 0) / packSize;
        const mrpPerPiece = Number(inventory.mrp || 0) / packSize;
        const movement = upsertMovement(inventory.drug.name);

        for (const saleItem of inventory.saleItems) {
          const soldPieces = toPieces({
            quantity: saleItem.quantity,
            isLooseQuantity: Boolean(saleItem.isLooseQuantity),
            packSize,
          });
          movement.counterSalesQuantity += soldPieces;
          movement.counterSalesPurchaseValue = round2(
            movement.counterSalesPurchaseValue + soldPieces * ptrPerPiece,
          );
          movement.counterSalesMrpValue = round2(
            movement.counterSalesMrpValue + soldPieces * mrpPerPiece,
          );

          for (const returnItem of saleItem.returnItems) {
            const returnedPieces = toPieces({
              quantity: returnItem.quantity,
              isLooseQuantity: Boolean(returnItem.isLooseQuantity),
              packSize,
            });
            movement.counterReturnsQuantity += returnedPieces;
            movement.counterReturnsPurchaseValue = round2(
              movement.counterReturnsPurchaseValue +
                returnedPieces * ptrPerPiece,
            );
            movement.counterReturnsMrpValue = round2(
              movement.counterReturnsMrpValue + returnedPieces * mrpPerPiece,
            );
          }
        }

        for (const issueItem of inventory.ipdIssueItems) {
          const issuePieces = toPieces({
            quantity: issueItem.quantity,
            isLooseQuantity: Boolean(issueItem.isLooseQuantity),
            packSize,
          });
          movement.ipdSalesQuantity += issuePieces;
          movement.ipdSalesPurchaseValue = round2(
            movement.ipdSalesPurchaseValue + issuePieces * ptrPerPiece,
          );
          movement.ipdSalesMrpValue = round2(
            movement.ipdSalesMrpValue + issuePieces * mrpPerPiece,
          );
        }

        for (const returnItem of inventory.ipdReturnItems) {
          const returnPieces = toPieces({
            quantity: returnItem.quantity,
            isLooseQuantity: Boolean(returnItem.isLooseQuantity),
            packSize,
          });
          movement.ipdReturnsQuantity += returnPieces;
          movement.ipdReturnsPurchaseValue = round2(
            movement.ipdReturnsPurchaseValue + returnPieces * ptrPerPiece,
          );
          movement.ipdReturnsMrpValue = round2(
            movement.ipdReturnsMrpValue + returnPieces * mrpPerPiece,
          );
        }

        for (const supplierReturnItem of inventory.supplierReturnItems) {
          if (supplierReturnItem.supplierReturn.isDeleted) continue;
          const returnPieces = toPieces({
            quantity: supplierReturnItem.quantity,
            isLooseQuantity: Boolean(supplierReturnItem.isLooseQuantity),
            packSize,
          });
          movement.purchaseReturnsQuantity += returnPieces;
          movement.purchaseReturnsPurchaseValue = round2(
            movement.purchaseReturnsPurchaseValue + returnPieces * ptrPerPiece,
          );
          movement.purchaseReturnsMrpValue = round2(
            movement.purchaseReturnsMrpValue + returnPieces * mrpPerPiece,
          );
        }
      }

      for (const order of purchaseOrders) {
        for (const item of order.items) {
          const movement = upsertMovement(item.drug.name);
          movement.purchaseOrdersQuantity += Number(item.quantity || 0);
          movement.purchaseOrdersPurchaseValue = round2(
            movement.purchaseOrdersPurchaseValue + Number(item.total || 0),
          );
        }
      }

      const itemMovements = Array.from(movementMap.values()).sort((a, b) =>
        a.item.localeCompare(b.item),
      );

      const topPerformingItems: TopPerformingItemRowType[] = itemMovements
        .map((item) => ({
          id: item.id,
          item: item.item,
          quantity: round2(
            item.counterSalesQuantity -
              item.counterReturnsQuantity +
              item.ipdSalesQuantity -
              item.ipdReturnsQuantity,
          ),
        }))
        .sort((a, b) => b.quantity - a.quantity)
        .slice(0, 50);

      const expiringItems: ExpiringItemRowType[] = inventoryItems
        .filter(
          (item) =>
            Number(item.quantityInStock || 0) > 0 &&
            new Date(item.expiryDate) >= now &&
            new Date(item.expiryDate) <= nearExpiryDate,
        )
        .map((item) => {
          const packSize = Math.max(Number(item.itemsPerPack || 1), 1);
          const ptrPerPiece = Number(item.purchasePrice || 0) / packSize;
          const mrpPerPiece = Number(item.mrp || 0) / packSize;
          return {
            id: String(item.id),
            item: item.drug.name,
            batch: String(item.batchNo),
            expiringInDays: differenceInCalendarDays(
              new Date(item.expiryDate),
              now,
            ),
            ptr: round2(ptrPerPiece),
            stockValuePtr: round2(
              Number(item.quantityInStock || 0) * ptrPerPiece,
            ),
            mrp: round2(mrpPerPiece),
            stockValueMrp: round2(
              Number(item.quantityInStock || 0) * mrpPerPiece,
            ),
          };
        })
        .sort((a, b) => a.expiringInDays - b.expiringInDays);

      const data: PharmacyReportsType = {
        counterSale: {
          bills: canViewCounterSale ? counterSaleBills : [],
          items: canViewCounterSale ? counterSaleItems : [],
          collections: canViewCounterSale ? counterSaleCollections : [],
          hsnSummary: canViewCounterSale
            ? Array.from(counterSaleHsnMap.values()).sort((a, b) =>
                a.hsn.localeCompare(b.hsn),
              )
            : [],
          gstSummary: canViewCounterSale
            ? Array.from(counterSaleGstSummaryMap.values()).sort((a, b) =>
                a.hsnSacCode.localeCompare(b.hsnSacCode),
              )
            : [],
        },
        ipdSale: {
          items: canViewIpdSale ? ipdSaleItems : [],
          hsnSummary: canViewIpdSale
            ? Array.from(ipdSaleHsnMap.values()).sort((a, b) =>
                a.hsn.localeCompare(b.hsn),
              )
            : [],
        },
        po: {
          purchaseOrders: canViewPo ? purchaseOrderRows : [],
          purchaseOrderItems: canViewPo ? purchaseOrderItemRows : [],
          gstSummary: canViewPo
            ? Array.from(poGstSummaryMap.values()).sort((a, b) =>
                a.hsnSacCode.localeCompare(b.hsnSacCode),
              )
            : [],
        },
        grn: {
          grns: canViewGrn ? grnRows : [],
          grnItems: canViewGrn ? grnItemRows : [],
        },
        stock: {
          purchaseUtilisation: canViewStock ? purchaseUtilisation : [],
          itemMovements: canViewStock ? itemMovements : [],
          topPerformingItems: canViewStock ? topPerformingItems : [],
          expiringItems: canViewStock ? expiringItems : [],
        },
      };

      return apiResponse({
        status: RESPONSE_STATUS.SUCCESS,
        message: "Pharmacy reports fetched successfully",
        data,
      });
    },
  });
};
