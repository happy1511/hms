"use client";

import CustomTabs from "@/components/common/CustomTabs";
import { SortableHeader } from "@/components/common/SortableHeader";
import {
  ColumnDefWithClass,
  ExpiringItemRowType,
  FilterValues,
  PharmacyReportsType,
  PurchaseUtilisationRowType,
  StockItemMovementRowType,
  TopPerformingItemRowType,
} from "@/lib/type";
import { format } from "date-fns";
import ReportTable, { ReportTableStateProps } from "./ReportTable";
import { money } from "./reportUtils";

type StockReportsTabProps = ReportTableStateProps & {
  data: PharmacyReportsType["stock"];
  filters: FilterValues;
};

export const purchaseUtilisationColumns: ColumnDefWithClass<PurchaseUtilisationRowType>[] =
  [
    {
      accessorKey: "item",
      header: ({ column }) => (
        <SortableHeader<PurchaseUtilisationRowType>
          label="Item"
          column={column}
        />
      ),
      cell: ({ row }) => row.original.item,
      headerClassName: "min-w-40",
      cellClassName: "min-w-40",
    },
    {
      accessorKey: "batch",
      header: ({ column }) => (
        <SortableHeader<PurchaseUtilisationRowType>
          label="Batch"
          column={column}
        />
      ),
      cell: ({ row }) => row.original.batch,
      headerClassName: "min-w-24",
      cellClassName: "min-w-24",
    },
    {
      accessorKey: "expiry",
      header: ({ column }) => (
        <SortableHeader<PurchaseUtilisationRowType>
          label="Expiry"
          column={column}
        />
      ),
      cell: ({ row }) => format(row.original.expiry, "MM/yyyy"),
      headerClassName: "min-w-24",
      cellClassName: "min-w-24",
    },
    {
      accessorKey: "purchasedQuantity",
      header: ({ column }) => (
        <SortableHeader<PurchaseUtilisationRowType>
          label="Pur.Qty."
          column={column}
        />
      ),
      cell: ({ row }) => row.original.purchasedQuantity,
      headerClassName: "min-w-20",
      cellClassName: "min-w-20",
    },
    {
      accessorKey: "ptr",
      header: ({ column }) => (
        <SortableHeader<PurchaseUtilisationRowType>
          label="PTR"
          column={column}
        />
      ),
      cell: ({ row }) => money(row.original.ptr),
      headerClassName: "min-w-20",
      cellClassName: "min-w-20",
    },
    {
      accessorKey: "cGstPercentage",
      header: ({ column }) => (
        <SortableHeader<PurchaseUtilisationRowType>
          label="CGST%"
          column={column}
        />
      ),
      cell: ({ row }) => money(row.original.cGstPercentage),
      headerClassName: "min-w-20",
      cellClassName: "min-w-20",
    },
    {
      accessorKey: "sGstPercentage",
      header: ({ column }) => (
        <SortableHeader<PurchaseUtilisationRowType>
          label="SGST%"
          column={column}
        />
      ),
      cell: ({ row }) => money(row.original.sGstPercentage),
      headerClassName: "min-w-20",
      cellClassName: "min-w-20",
    },
    {
      accessorKey: "purchaseAmount",
      header: ({ column }) => (
        <SortableHeader<PurchaseUtilisationRowType>
          label="Pur.Amt."
          column={column}
        />
      ),
      cell: ({ row }) => money(row.original.purchaseAmount),
      headerClassName: "min-w-24",
      cellClassName: "min-w-24",
    },
    {
      accessorKey: "soldQuantity",
      header: ({ column }) => (
        <SortableHeader<PurchaseUtilisationRowType>
          label="Sold Qty."
          column={column}
        />
      ),
      cell: ({ row }) => row.original.soldQuantity,
      headerClassName: "min-w-20",
      cellClassName: "min-w-20",
    },
    {
      accessorKey: "soldAmount",
      header: ({ column }) => (
        <SortableHeader<PurchaseUtilisationRowType>
          label="Sold Amt."
          column={column}
        />
      ),
      cell: ({ row }) => money(row.original.soldAmount),
      headerClassName: "min-w-24",
      cellClassName: "min-w-24",
    },
    {
      accessorKey: "utilisationPercentage",
      header: ({ column }) => (
        <SortableHeader<PurchaseUtilisationRowType>
          label="Utilisation%"
          column={column}
        />
      ),
      cell: ({ row }) => `${money(row.original.utilisationPercentage)}%`,
      headerClassName: "min-w-24",
      cellClassName: "min-w-24",
    },
  ];

export const stockMovementColumns: ColumnDefWithClass<StockItemMovementRowType>[] = [
  {
    accessorKey: "item",
    header: ({ column }) => (
      <SortableHeader<StockItemMovementRowType> label="Item" column={column} />
    ),
    cell: ({ row }) => row.original.item,
    headerClassName: "min-w-40",
    cellClassName: "min-w-40",
  },
  {
    accessorKey: "counterSalesQuantity",
    header: ({ column }) => (
      <SortableHeader<StockItemMovementRowType>
        label="Counter Sales QTY"
        column={column}
      />
    ),
    cell: ({ row }) => row.original.counterSalesQuantity,
    headerClassName: "min-w-24",
    cellClassName: "min-w-24",
  },
  {
    accessorKey: "counterSalesPurchaseValue",
    header: ({ column }) => (
      <SortableHeader<StockItemMovementRowType>
        label="Counter Sales Purchase Value"
        column={column}
      />
    ),
    cell: ({ row }) => money(row.original.counterSalesPurchaseValue),
    headerClassName: "min-w-30",
    cellClassName: "min-w-30",
  },
  {
    accessorKey: "counterSalesMrpValue",
    header: ({ column }) => (
      <SortableHeader<StockItemMovementRowType>
        label="Counter MRP Value"
        column={column}
      />
    ),
    cell: ({ row }) => money(row.original.counterSalesMrpValue),
    headerClassName: "min-w-26",
    cellClassName: "min-w-26",
  },
  {
    accessorKey: "counterReturnsQuantity",
    header: ({ column }) => (
      <SortableHeader<StockItemMovementRowType>
        label="Counter Returns QTY"
        column={column}
      />
    ),
    cell: ({ row }) => row.original.counterReturnsQuantity,
    headerClassName: "min-w-24",
    cellClassName: "min-w-24",
  },
  {
    accessorKey: "counterReturnsPurchaseValue",
    header: ({ column }) => (
      <SortableHeader<StockItemMovementRowType>
        label="Counter Returns Purchase Value"
        column={column}
      />
    ),
    cell: ({ row }) => money(row.original.counterReturnsPurchaseValue),
    headerClassName: "min-w-30",
    cellClassName: "min-w-30",
  },
  {
    accessorKey: "counterReturnsMrpValue",
    header: ({ column }) => (
      <SortableHeader<StockItemMovementRowType>
        label="Counter Returns MRP Value"
        column={column}
      />
    ),
    cell: ({ row }) => money(row.original.counterReturnsMrpValue),
    headerClassName: "min-w-28",
    cellClassName: "min-w-28",
  },
  {
    accessorKey: "ipdSalesQuantity",
    header: ({ column }) => (
      <SortableHeader<StockItemMovementRowType>
        label="IPD Sales QTY"
        column={column}
      />
    ),
    cell: ({ row }) => row.original.ipdSalesQuantity,
    headerClassName: "min-w-24",
    cellClassName: "min-w-24",
  },
  {
    accessorKey: "ipdSalesPurchaseValue",
    header: ({ column }) => (
      <SortableHeader<StockItemMovementRowType>
        label="IPD Sales Purchase Value"
        column={column}
      />
    ),
    cell: ({ row }) => money(row.original.ipdSalesPurchaseValue),
    headerClassName: "min-w-28",
    cellClassName: "min-w-28",
  },
  {
    accessorKey: "ipdSalesMrpValue",
    header: ({ column }) => (
      <SortableHeader<StockItemMovementRowType>
        label="IPD Sales MRP Value"
        column={column}
      />
    ),
    cell: ({ row }) => money(row.original.ipdSalesMrpValue),
    headerClassName: "min-w-24",
    cellClassName: "min-w-24",
  },
  {
    accessorKey: "ipdReturnsQuantity",
    header: ({ column }) => (
      <SortableHeader<StockItemMovementRowType>
        label="IPD Returns QTY"
        column={column}
      />
    ),
    cell: ({ row }) => row.original.ipdReturnsQuantity,
    headerClassName: "min-w-24",
    cellClassName: "min-w-24",
  },
  {
    accessorKey: "ipdReturnsPurchaseValue",
    header: ({ column }) => (
      <SortableHeader<StockItemMovementRowType>
        label="IPD Returns Purchase Value"
        column={column}
      />
    ),
    cell: ({ row }) => money(row.original.ipdReturnsPurchaseValue),
    headerClassName: "min-w-28",
    cellClassName: "min-w-28",
  },
  {
    accessorKey: "ipdReturnsMrpValue",
    header: ({ column }) => (
      <SortableHeader<StockItemMovementRowType>
        label="IPD Returns MRP Value"
        column={column}
      />
    ),
    cell: ({ row }) => money(row.original.ipdReturnsMrpValue),
    headerClassName: "min-w-24",
    cellClassName: "min-w-24",
  },
  {
    accessorKey: "purchaseOrdersQuantity",
    header: ({ column }) => (
      <SortableHeader<StockItemMovementRowType>
        label="Purchase Orders QTY"
        column={column}
      />
    ),
    cell: ({ row }) => row.original.purchaseOrdersQuantity,
    headerClassName: "min-w-24",
    cellClassName: "min-w-24",
  },
  {
    accessorKey: "purchaseOrdersPurchaseValue",
    header: ({ column }) => (
      <SortableHeader<StockItemMovementRowType>
        label="Purchase Orders Value"
        column={column}
      />
    ),
    cell: ({ row }) => money(row.original.purchaseOrdersPurchaseValue),
    headerClassName: "min-w-28",
    cellClassName: "min-w-28",
  },
  {
    accessorKey: "purchaseOrdersMrpValue",
    header: ({ column }) => (
      <SortableHeader<StockItemMovementRowType>
        label="Purchase Orders MRP Value"
        column={column}
      />
    ),
    cell: ({ row }) => money(row.original.purchaseOrdersMrpValue),
    headerClassName: "min-w-28",
    cellClassName: "min-w-28",
  },
  {
    accessorKey: "purchaseReturnsQuantity",
    header: ({ column }) => (
      <SortableHeader<StockItemMovementRowType>
        label="Purchase Returns QTY"
        column={column}
      />
    ),
    cell: ({ row }) => row.original.purchaseReturnsQuantity,
    headerClassName: "min-w-24",
    cellClassName: "min-w-24",
  },
  {
    accessorKey: "purchaseReturnsPurchaseValue",
    header: ({ column }) => (
      <SortableHeader<StockItemMovementRowType>
        label="Purchase Returns Value"
        column={column}
      />
    ),
    cell: ({ row }) => money(row.original.purchaseReturnsPurchaseValue),
    headerClassName: "min-w-28",
    cellClassName: "min-w-28",
  },
  {
    accessorKey: "purchaseReturnsMrpValue",
    header: ({ column }) => (
      <SortableHeader<StockItemMovementRowType>
        label="Purchase Returns MRP Value"
        column={column}
      />
    ),
    cell: ({ row }) => money(row.original.purchaseReturnsMrpValue),
    headerClassName: "min-w-28",
    cellClassName: "min-w-28",
  },
];

export const topPerformingColumns: ColumnDefWithClass<TopPerformingItemRowType>[] = [
  {
    accessorKey: "item",
    header: ({ column }) => (
      <SortableHeader<TopPerformingItemRowType> label="Item" column={column} />
    ),
    cell: ({ row }) => row.original.item,
    headerClassName: "min-w-40",
    cellClassName: "min-w-40",
  },
  {
    accessorKey: "quantity",
    header: ({ column }) => (
      <SortableHeader<TopPerformingItemRowType> label="Qty" column={column} />
    ),
    cell: ({ row }) => row.original.quantity,
    headerClassName: "min-w-20",
    cellClassName: "min-w-20",
  },
];

export const expiringColumns: ColumnDefWithClass<ExpiringItemRowType>[] = [
  {
    accessorKey: "item",
    header: ({ column }) => (
      <SortableHeader<ExpiringItemRowType> label="Item" column={column} />
    ),
    cell: ({ row }) => row.original.item,
    headerClassName: "min-w-40",
    cellClassName: "min-w-40",
  },
  {
    accessorKey: "batch",
    header: ({ column }) => (
      <SortableHeader<ExpiringItemRowType> label="Batch" column={column} />
    ),
    cell: ({ row }) => row.original.batch,
    headerClassName: "min-w-24",
    cellClassName: "min-w-24",
  },
  {
    accessorKey: "expiringInDays",
    header: ({ column }) => (
      <SortableHeader<ExpiringItemRowType>
        label="Expiring In Days"
        column={column}
      />
    ),
    cell: ({ row }) => row.original.expiringInDays,
    headerClassName: "min-w-24",
    cellClassName: "min-w-24",
  },
  {
    accessorKey: "ptr",
    header: ({ column }) => (
      <SortableHeader<ExpiringItemRowType> label="PTR" column={column} />
    ),
    cell: ({ row }) => money(row.original.ptr),
    headerClassName: "min-w-20",
    cellClassName: "min-w-20",
  },
  {
    accessorKey: "stockValuePtr",
    header: ({ column }) => (
      <SortableHeader<ExpiringItemRowType>
        label="Stock Value PTR"
        column={column}
      />
    ),
    cell: ({ row }) => money(row.original.stockValuePtr),
    headerClassName: "min-w-24",
    cellClassName: "min-w-24",
  },
  {
    accessorKey: "mrp",
    header: ({ column }) => (
      <SortableHeader<ExpiringItemRowType> label="MRP" column={column} />
    ),
    cell: ({ row }) => money(row.original.mrp),
    headerClassName: "min-w-20",
    cellClassName: "min-w-20",
  },
  {
    accessorKey: "stockValueMrp",
    header: ({ column }) => (
      <SortableHeader<ExpiringItemRowType>
        label="Stock Value MRP"
        column={column}
      />
    ),
    cell: ({ row }) => money(row.original.stockValueMrp),
    headerClassName: "min-w-24",
    cellClassName: "min-w-24",
  },
];

const StockReportsTab = ({
  data,
  isLoading,
  isError,
  error,
  filters,
}: StockReportsTabProps) => {
  return (
    <CustomTabs
      defaultValue="purchase-utilization"
      classNames="border-none shadow-none"
      tabs={[
        {
          value: "purchase-utilization",
          name: "Purchase Utilization",
          content: (
            <ReportTable
              data={data.purchaseUtilisation}
              columns={purchaseUtilisationColumns}
              rowId={(row) => String(row.id)}
              searchPlaceholder="Search purchase utilization..."
              printConfig={{
                reportKey: "stock",
                tableKey: "purchase-utilization",
                title: "Purchase Utilization",
                filters,
              }}
              isLoading={isLoading}
              isError={isError}
              error={error}
            />
          ),
        },
        {
          value: "stock-items-sales-returns",
          name: "Stock Items Sales/Returns",
          content: (
            <ReportTable
              data={data.itemMovements}
              columns={stockMovementColumns}
              rowId={(row) => row.id}
              searchPlaceholder="Search stock item movements..."
              printConfig={{
                reportKey: "stock",
                tableKey: "item-movements",
                title: "Stock Items Sales/Returns",
                filters,
              }}
              isLoading={isLoading}
              isError={isError}
              error={error}
            />
          ),
        },
        {
          value: "top-performing-items",
          name: "Top 50 Performing Items",
          content: (
            <ReportTable
              data={data.topPerformingItems}
              columns={topPerformingColumns}
              rowId={(row) => row.id}
              searchPlaceholder="Search top performing items..."
              printConfig={{
                reportKey: "stock",
                tableKey: "top-performing-items",
                title: "Top Performing Items",
                filters,
              }}
              isLoading={isLoading}
              isError={isError}
              error={error}
            />
          ),
        },
        {
          value: "expiring-items",
          name: "Expiring Items (90 Days)",
          content: (
            <ReportTable
              data={data.expiringItems}
              columns={expiringColumns}
              rowId={(row) => row.id}
              searchPlaceholder="Search expiring items..."
              printConfig={{
                reportKey: "stock",
                tableKey: "expiring-items",
                title: "Expiring Items",
                filters,
              }}
              isLoading={isLoading}
              isError={isError}
              error={error}
            />
          ),
        },
      ]}
    />
  );
};

export default StockReportsTab;
