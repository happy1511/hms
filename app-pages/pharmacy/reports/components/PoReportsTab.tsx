"use client";

import CustomTabs from "@/components/common/CustomTabs";
import { SortableHeader } from "@/components/common/SortableHeader";
import {
  ColumnDefWithClass,
  FilterValues,
  PharmacyReportsType,
  PurchaseOrderItemReportRowType,
  PurchaseOrderReportRowType,
} from "@/lib/type";
import { format } from "date-fns";
import ReportTable, { ReportTableStateProps } from "./ReportTable";
import { money } from "./reportUtils";

type PoReportsTabProps = ReportTableStateProps & {
  data: PharmacyReportsType["po"];
  filters: FilterValues;
};

export const poColumns: ColumnDefWithClass<PurchaseOrderReportRowType>[] = [
  {
    accessorKey: "supplier",
    header: ({ column }) => (
      <SortableHeader<PurchaseOrderReportRowType>
        label="Supplier"
        column={column}
      />
    ),
    cell: ({ row }) => row.original.supplier,
    headerClassName: "min-w-40",
    cellClassName: "min-w-40",
  },
  {
    accessorKey: "poNumber",
    header: ({ column }) => (
      <SortableHeader<PurchaseOrderReportRowType>
        label="PO Number"
        column={column}
      />
    ),
    cell: ({ row }) => row.original.poNumber,
    headerClassName: "min-w-24",
    cellClassName: "min-w-24",
  },
  {
    accessorKey: "poDate",
    header: ({ column }) => (
      <SortableHeader<PurchaseOrderReportRowType>
        label="PO Date"
        column={column}
      />
    ),
    cell: ({ row }) => format(row.original.poDate, "dd/MM/yyyy"),
    headerClassName: "min-w-24",
    cellClassName: "min-w-24",
  },
  {
    accessorKey: "items",
    header: ({ column }) => (
      <SortableHeader<PurchaseOrderReportRowType>
        label="Items"
        column={column}
      />
    ),
    cell: ({ row }) => row.original.items,
    headerClassName: "min-w-20",
    cellClassName: "min-w-20",
  },
  {
    accessorKey: "taxableAmount",
    header: ({ column }) => (
      <SortableHeader<PurchaseOrderReportRowType>
        label="Taxable Amt."
        column={column}
      />
    ),
    cell: ({ row }) => money(row.original.taxableAmount),
    headerClassName: "min-w-24",
    cellClassName: "min-w-24",
  },
  {
    accessorKey: "packingForwarding",
    header: ({ column }) => (
      <SortableHeader<PurchaseOrderReportRowType> label="P&F" column={column} />
    ),
    cell: ({ row }) => money(row.original.packingForwarding),
    headerClassName: "min-w-20",
    cellClassName: "min-w-20",
  },
  {
    accessorKey: "cGstAmount",
    header: ({ column }) => (
      <SortableHeader<PurchaseOrderReportRowType>
        label="CGST"
        column={column}
      />
    ),
    cell: ({ row }) => money(row.original.cGstAmount),
    headerClassName: "min-w-20",
    cellClassName: "min-w-20",
  },
  {
    accessorKey: "sGstAmount",
    header: ({ column }) => (
      <SortableHeader<PurchaseOrderReportRowType>
        label="SGST"
        column={column}
      />
    ),
    cell: ({ row }) => money(row.original.sGstAmount),
    headerClassName: "min-w-20",
    cellClassName: "min-w-20",
  },
  {
    accessorKey: "iGstAmount",
    header: ({ column }) => (
      <SortableHeader<PurchaseOrderReportRowType>
        label="IGST"
        column={column}
      />
    ),
    cell: ({ row }) => money(row.original.iGstAmount),
    headerClassName: "min-w-20",
    cellClassName: "min-w-20",
  },
  {
    accessorKey: "tcsAmount",
    header: ({ column }) => (
      <SortableHeader<PurchaseOrderReportRowType> label="TCS" column={column} />
    ),
    cell: ({ row }) => money(row.original.tcsAmount),
    headerClassName: "min-w-20",
    cellClassName: "min-w-20",
  },
  {
    accessorKey: "discountAmount",
    header: ({ column }) => (
      <SortableHeader<PurchaseOrderReportRowType>
        label="Discount"
        column={column}
      />
    ),
    cell: ({ row }) => money(row.original.discountAmount),
    headerClassName: "min-w-20",
    cellClassName: "min-w-20",
  },
  {
    accessorKey: "roundOffAmount",
    header: ({ column }) => (
      <SortableHeader<PurchaseOrderReportRowType>
        label="Round Off"
        column={column}
      />
    ),
    cell: ({ row }) => money(row.original.roundOffAmount),
    headerClassName: "min-w-20",
    cellClassName: "min-w-20",
  },
  {
    accessorKey: "grandTotal",
    header: ({ column }) => (
      <SortableHeader<PurchaseOrderReportRowType>
        label="Total Amount"
        column={column}
      />
    ),
    cell: ({ row }) => money(row.original.grandTotal),
    headerClassName: "min-w-24",
    cellClassName: "min-w-24",
  },
  {
    accessorKey: "linkedGrn",
    header: ({ column }) => (
      <SortableHeader<PurchaseOrderReportRowType>
        label="Linked GRN"
        column={column}
      />
    ),
    cell: ({ row }) => row.original.linkedGrn,
    headerClassName: "min-w-24",
    cellClassName: "min-w-24",
  },
];

export const poItemColumns: ColumnDefWithClass<PurchaseOrderItemReportRowType>[] = [
  {
    accessorKey: "poNumber",
    header: ({ column }) => (
      <SortableHeader<PurchaseOrderItemReportRowType>
        label="PO Number"
        column={column}
      />
    ),
    cell: ({ row }) => row.original.poNumber,
    headerClassName: "min-w-24",
    cellClassName: "min-w-24",
  },
  {
    accessorKey: "supplier",
    header: ({ column }) => (
      <SortableHeader<PurchaseOrderItemReportRowType>
        label="Supplier"
        column={column}
      />
    ),
    cell: ({ row }) => row.original.supplier,
    headerClassName: "min-w-40",
    cellClassName: "min-w-40",
  },
  {
    accessorKey: "poDate",
    header: ({ column }) => (
      <SortableHeader<PurchaseOrderItemReportRowType>
        label="PO Date"
        column={column}
      />
    ),
    cell: ({ row }) => format(row.original.poDate, "dd/MM/yyyy"),
    headerClassName: "min-w-24",
    cellClassName: "min-w-24",
  },
  {
    accessorKey: "item",
    header: ({ column }) => (
      <SortableHeader<PurchaseOrderItemReportRowType>
        label="Item"
        column={column}
      />
    ),
    cell: ({ row }) => row.original.item,
    headerClassName: "min-w-40",
    cellClassName: "min-w-40",
  },
  {
    accessorKey: "category",
    header: ({ column }) => (
      <SortableHeader<PurchaseOrderItemReportRowType>
        label="Category"
        column={column}
      />
    ),
    cell: ({ row }) => row.original.category,
    headerClassName: "min-w-32",
    cellClassName: "min-w-32",
  },
  {
    accessorKey: "hsn",
    header: ({ column }) => (
      <SortableHeader<PurchaseOrderItemReportRowType>
        label="HSN"
        column={column}
      />
    ),
    cell: ({ row }) => row.original.hsn,
    headerClassName: "min-w-24",
    cellClassName: "min-w-24",
  },
  {
    accessorKey: "quantity",
    header: ({ column }) => (
      <SortableHeader<PurchaseOrderItemReportRowType>
        label="Qty."
        column={column}
      />
    ),
    cell: ({ row }) => row.original.quantity,
    headerClassName: "min-w-20",
    cellClassName: "min-w-20",
  },
  {
    accessorKey: "rate",
    header: ({ column }) => (
      <SortableHeader<PurchaseOrderItemReportRowType>
        label="Rate"
        column={column}
      />
    ),
    cell: ({ row }) => money(row.original.rate),
    headerClassName: "min-w-20",
    cellClassName: "min-w-20",
  },
  {
    accessorKey: "cGstPercentage",
    header: ({ column }) => (
      <SortableHeader<PurchaseOrderItemReportRowType>
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
      <SortableHeader<PurchaseOrderItemReportRowType>
        label="SGST%"
        column={column}
      />
    ),
    cell: ({ row }) => money(row.original.sGstPercentage),
    headerClassName: "min-w-20",
    cellClassName: "min-w-20",
  },
  {
    accessorKey: "iGstPercentage",
    header: ({ column }) => (
      <SortableHeader<PurchaseOrderItemReportRowType>
        label="IGST%"
        column={column}
      />
    ),
    cell: ({ row }) => money(row.original.iGstPercentage),
    headerClassName: "min-w-20",
    cellClassName: "min-w-20",
  },
  {
    accessorKey: "total",
    header: ({ column }) => (
      <SortableHeader<PurchaseOrderItemReportRowType>
        label="Item Total"
        column={column}
      />
    ),
    cell: ({ row }) => money(row.original.total),
    headerClassName: "min-w-24",
    cellClassName: "min-w-24",
  },
];

const PoReportsTab = ({
  data,
  isLoading,
  isError,
  error,
  filters,
}: PoReportsTabProps) => {
  return (
    <CustomTabs
      classNames="border-none shadow-none"
      defaultValue="purchase-orders"
      tabs={[
        {
          value: "purchase-orders",
          name: "Purchase Orders",
          content: (
            <ReportTable
              data={data.purchaseOrders}
              columns={poColumns}
              rowId={(row) => String(row.id)}
              searchPlaceholder="Search purchase orders..."
              printConfig={{
                reportKey: "po",
                tableKey: "purchase-orders",
                title: "Purchase Orders",
                filters,
              }}
              isLoading={isLoading}
              isError={isError}
              error={error}
            />
          ),
        },
        {
          value: "po-items",
          name: "PO Items",
          content: (
            <ReportTable
              data={data.purchaseOrderItems}
              columns={poItemColumns}
              rowId={(row) => row.id}
              searchPlaceholder="Search PO items..."
              printConfig={{
                reportKey: "po",
                tableKey: "po-items",
                title: "PO Items",
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

export default PoReportsTab;
