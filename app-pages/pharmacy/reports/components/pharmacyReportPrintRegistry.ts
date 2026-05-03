import {
  CounterSaleBillRowType,
  ColumnDefWithClass,
  CounterSaleCollectionRowType,
  CounterSaleItemRowType,
  ExpiringItemRowType,
  GrnItemReportRowType,
  GrnReportRowType,
  IpdSaleItemRowType,
  PharmacyReportsType,
  PurchaseOrderItemReportRowType,
  PurchaseOrderReportRowType,
  SalesHsnSummaryRowType,
  StockItemMovementRowType,
  TopPerformingItemRowType,
  PurchaseUtilisationRowType,
} from "@/lib/type";
import {
  counterSaleBillColumns,
  counterSaleCollectionColumns,
  counterSaleHsnColumns,
  counterSaleItemColumns,
} from "./CounterSaleReportsTab";
import { ipdSaleHsnColumns, ipdSaleItemColumns } from "./IpdSaleReportsTab";
import { poColumns, poItemColumns } from "./PoReportsTab";
import { grnColumns, grnItemColumns } from "./GrnReportsTab";
import {
  expiringColumns,
  purchaseUtilisationColumns,
  stockMovementColumns,
  topPerformingColumns,
} from "./StockReportsTab";

type RegistryEntry<TData> = {
  title: string;
  columns: ColumnDefWithClass<TData>[];
  rowId: (row: TData) => string;
  getRows: (reports: PharmacyReportsType) => TData[];
};

type ReportRegistry = Record<string, Record<string, RegistryEntry<any>>>;

export const pharmacyReportPrintRegistry: ReportRegistry = {
  "counter-sale": {
    bills: {
      title: "Counter Sale Bills",
      columns: counterSaleBillColumns,
      rowId: (row: CounterSaleBillRowType) => row.id,
      getRows: (reports) => reports.counterSale.bills,
    },
    items: {
      title: "Counter Sale Items",
      columns: counterSaleItemColumns,
      rowId: (row: CounterSaleItemRowType) => row.id,
      getRows: (reports) => reports.counterSale.items,
    },
    collections: {
      title: "Counter Sale Collections",
      columns: counterSaleCollectionColumns,
      rowId: (row: CounterSaleCollectionRowType) => row.id,
      getRows: (reports) => reports.counterSale.collections,
    },
    "hsn-summary": {
      title: "Counter Sale HSN Summary",
      columns: counterSaleHsnColumns,
      rowId: (row: SalesHsnSummaryRowType) => row.id,
      getRows: (reports) => reports.counterSale.hsnSummary,
    },
  },
  "ipd-sale": {
    items: {
      title: "IPD Sale Items",
      columns: ipdSaleItemColumns,
      rowId: (row: IpdSaleItemRowType) => row.id,
      getRows: (reports) => reports.ipdSale.items,
    },
    "hsn-summary": {
      title: "IPD Sale HSN Summary",
      columns: ipdSaleHsnColumns,
      rowId: (row: SalesHsnSummaryRowType) => row.id,
      getRows: (reports) => reports.ipdSale.hsnSummary,
    },
  },
  po: {
    "purchase-orders": {
      title: "Purchase Orders",
      columns: poColumns,
      rowId: (row: PurchaseOrderReportRowType) => String(row.id),
      getRows: (reports) => reports.po.purchaseOrders,
    },
    "po-items": {
      title: "PO Items",
      columns: poItemColumns,
      rowId: (row: PurchaseOrderItemReportRowType) => row.id,
      getRows: (reports) => reports.po.purchaseOrderItems,
    },
  },
  grn: {
    "grn-summary": {
      title: "GRN Summary",
      columns: grnColumns,
      rowId: (row: GrnReportRowType) => String(row.id),
      getRows: (reports) => reports.grn.grns,
    },
    "grn-items": {
      title: "GRN Items",
      columns: grnItemColumns,
      rowId: (row: GrnItemReportRowType) => row.id,
      getRows: (reports) => reports.grn.grnItems,
    },
  },
  stock: {
    "purchase-utilization": {
      title: "Purchase Utilization",
      columns: purchaseUtilisationColumns,
      rowId: (row: PurchaseUtilisationRowType) => String(row.id),
      getRows: (reports) => reports.stock.purchaseUtilisation,
    },
    "item-movements": {
      title: "Stock Items Sales/Returns",
      columns: stockMovementColumns,
      rowId: (row: StockItemMovementRowType) => row.id,
      getRows: (reports) => reports.stock.itemMovements,
    },
    "top-performing-items": {
      title: "Top Performing Items",
      columns: topPerformingColumns,
      rowId: (row: TopPerformingItemRowType) => row.id,
      getRows: (reports) => reports.stock.topPerformingItems,
    },
    "expiring-items": {
      title: "Expiring Items",
      columns: expiringColumns,
      rowId: (row: ExpiringItemRowType) => row.id,
      getRows: (reports) => reports.stock.expiringItems,
    },
  },
};
