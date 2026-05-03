"use client";

import CustomTabs from "@/components/common/CustomTabs";
import { SortableHeader } from "@/components/common/SortableHeader";
import {
  ColumnDefWithClass,
  FilterValues,
  GrnItemReportRowType,
  GrnReportRowType,
  PharmacyReportsType,
} from "@/lib/type";
import { format } from "date-fns";
import ReportTable, { ReportTableStateProps } from "./ReportTable";
import { money } from "./reportUtils";

type GrnReportsTabProps = ReportTableStateProps & {
  data: PharmacyReportsType["grn"];
  filters: FilterValues;
};

export const grnColumns: ColumnDefWithClass<GrnReportRowType>[] = [
  {
    accessorKey: "supplier",
    header: ({ column }) => (
      <SortableHeader<GrnReportRowType> label="Supplier" column={column} />
    ),
    cell: ({ row }) => row.original.supplier,
    headerClassName: "min-w-40",
    cellClassName: "min-w-40",
  },
  {
    accessorKey: "gstIn",
    header: ({ column }) => (
      <SortableHeader<GrnReportRowType> label="GSTIN" column={column} />
    ),
    cell: ({ row }) => row.original.gstIn,
    headerClassName: "min-w-28",
    cellClassName: "min-w-28",
  },
  {
    accessorKey: "invoiceNumber",
    header: ({ column }) => (
      <SortableHeader<GrnReportRowType> label="Invoice No." column={column} />
    ),
    cell: ({ row }) => row.original.invoiceNumber,
    headerClassName: "min-w-24",
    cellClassName: "min-w-24",
  },
  {
    accessorKey: "invoiceDate",
    header: ({ column }) => (
      <SortableHeader<GrnReportRowType> label="Invoice Date" column={column} />
    ),
    cell: ({ row }) => format(row.original.invoiceDate, "dd/MM/yyyy"),
    headerClassName: "min-w-24",
    cellClassName: "min-w-24",
  },
  {
    accessorKey: "totalItems",
    header: ({ column }) => (
      <SortableHeader<GrnReportRowType> label="Total Items" column={column} />
    ),
    cell: ({ row }) => row.original.totalItems,
    headerClassName: "min-w-20",
    cellClassName: "min-w-20",
  },
  {
    accessorKey: "taxableAmount",
    header: ({ column }) => (
      <SortableHeader<GrnReportRowType> label="Taxable Amt." column={column} />
    ),
    cell: ({ row }) => money(row.original.taxableAmount),
    headerClassName: "min-w-24",
    cellClassName: "min-w-24",
  },
  {
    accessorKey: "discountAmount",
    header: ({ column }) => (
      <SortableHeader<GrnReportRowType> label="Discount" column={column} />
    ),
    cell: ({ row }) => money(row.original.discountAmount),
    headerClassName: "min-w-20",
    cellClassName: "min-w-20",
  },
  {
    accessorKey: "cGstAmount",
    header: ({ column }) => (
      <SortableHeader<GrnReportRowType> label="CGST" column={column} />
    ),
    cell: ({ row }) => money(row.original.cGstAmount),
    headerClassName: "min-w-20",
    cellClassName: "min-w-20",
  },
  {
    accessorKey: "sGstAmount",
    header: ({ column }) => (
      <SortableHeader<GrnReportRowType> label="SGST" column={column} />
    ),
    cell: ({ row }) => money(row.original.sGstAmount),
    headerClassName: "min-w-20",
    cellClassName: "min-w-20",
  },
  {
    accessorKey: "iGstAmount",
    header: ({ column }) => (
      <SortableHeader<GrnReportRowType> label="IGST" column={column} />
    ),
    cell: ({ row }) => money(row.original.iGstAmount),
    headerClassName: "min-w-20",
    cellClassName: "min-w-20",
  },
  {
    accessorKey: "tcsAmount",
    header: ({ column }) => (
      <SortableHeader<GrnReportRowType> label="TCS" column={column} />
    ),
    cell: ({ row }) => money(row.original.tcsAmount),
    headerClassName: "min-w-20",
    cellClassName: "min-w-20",
  },
  {
    accessorKey: "packingForwarding",
    header: ({ column }) => (
      <SortableHeader<GrnReportRowType> label="P&F" column={column} />
    ),
    cell: ({ row }) => money(row.original.packingForwarding),
    headerClassName: "min-w-20",
    cellClassName: "min-w-20",
  },
  {
    accessorKey: "roundOffAmount",
    header: ({ column }) => (
      <SortableHeader<GrnReportRowType> label="Round Off" column={column} />
    ),
    cell: ({ row }) => money(row.original.roundOffAmount),
    headerClassName: "min-w-20",
    cellClassName: "min-w-20",
  },
  {
    accessorKey: "grandTotal",
    header: ({ column }) => (
      <SortableHeader<GrnReportRowType> label="Total Amount" column={column} />
    ),
    cell: ({ row }) => money(row.original.grandTotal),
    headerClassName: "min-w-24",
    cellClassName: "min-w-24",
  },
  {
    accessorKey: "grnNumber",
    header: ({ column }) => (
      <SortableHeader<GrnReportRowType> label="GRN No" column={column} />
    ),
    cell: ({ row }) => row.original.grnNumber,
    headerClassName: "min-w-20",
    cellClassName: "min-w-20",
  },
  {
    accessorKey: "linkedPo",
    header: ({ column }) => (
      <SortableHeader<GrnReportRowType> label="Linked PO" column={column} />
    ),
    cell: ({ row }) => row.original.linkedPo,
    headerClassName: "min-w-24",
    cellClassName: "min-w-24",
  },
];

export const grnItemColumns: ColumnDefWithClass<GrnItemReportRowType>[] = [
  {
    accessorKey: "grn",
    header: ({ column }) => (
      <SortableHeader<GrnItemReportRowType> label="GRN" column={column} />
    ),
    cell: ({ row }) => row.original.grn,
    headerClassName: "min-w-20",
    cellClassName: "min-w-20",
  },
  {
    accessorKey: "po",
    header: ({ column }) => (
      <SortableHeader<GrnItemReportRowType> label="PO" column={column} />
    ),
    cell: ({ row }) => row.original.po,
    headerClassName: "min-w-20",
    cellClassName: "min-w-20",
  },
  {
    accessorKey: "supplier",
    header: ({ column }) => (
      <SortableHeader<GrnItemReportRowType> label="Supplier" column={column} />
    ),
    cell: ({ row }) => row.original.supplier,
    headerClassName: "min-w-40",
    cellClassName: "min-w-40",
  },
  {
    accessorKey: "invoiceNumber",
    header: ({ column }) => (
      <SortableHeader<GrnItemReportRowType>
        label="Invoice No."
        column={column}
      />
    ),
    cell: ({ row }) => row.original.invoiceNumber,
    headerClassName: "min-w-24",
    cellClassName: "min-w-24",
  },
  {
    accessorKey: "grnDate",
    header: ({ column }) => (
      <SortableHeader<GrnItemReportRowType> label="GRN Date" column={column} />
    ),
    cell: ({ row }) => format(row.original.grnDate, "dd/MM/yyyy"),
    headerClassName: "min-w-24",
    cellClassName: "min-w-24",
  },
  {
    accessorKey: "item",
    header: ({ column }) => (
      <SortableHeader<GrnItemReportRowType> label="Item" column={column} />
    ),
    cell: ({ row }) => row.original.item,
    headerClassName: "min-w-40",
    cellClassName: "min-w-40",
  },
  {
    accessorKey: "category",
    header: ({ column }) => (
      <SortableHeader<GrnItemReportRowType> label="Category" column={column} />
    ),
    cell: ({ row }) => row.original.category,
    headerClassName: "min-w-32",
    cellClassName: "min-w-32",
  },
  {
    accessorKey: "batch",
    header: ({ column }) => (
      <SortableHeader<GrnItemReportRowType> label="Batch" column={column} />
    ),
    cell: ({ row }) => row.original.batch,
    headerClassName: "min-w-24",
    cellClassName: "min-w-24",
  },
  {
    accessorKey: "expiry",
    header: ({ column }) => (
      <SortableHeader<GrnItemReportRowType> label="Expiry" column={column} />
    ),
    cell: ({ row }) => format(row.original.expiry, "MM/yyyy"),
    headerClassName: "min-w-24",
    cellClassName: "min-w-24",
  },
  {
    accessorKey: "hsn",
    header: ({ column }) => (
      <SortableHeader<GrnItemReportRowType> label="HSN" column={column} />
    ),
    cell: ({ row }) => row.original.hsn,
    headerClassName: "min-w-24",
    cellClassName: "min-w-24",
  },
  {
    accessorKey: "quantity",
    header: ({ column }) => (
      <SortableHeader<GrnItemReportRowType> label="Qty." column={column} />
    ),
    cell: ({ row }) => row.original.quantity,
    headerClassName: "min-w-20",
    cellClassName: "min-w-20",
  },
  {
    accessorKey: "freeQuantity",
    header: ({ column }) => (
      <SortableHeader<GrnItemReportRowType> label="Free Qty." column={column} />
    ),
    cell: ({ row }) => row.original.freeQuantity,
    headerClassName: "min-w-20",
    cellClassName: "min-w-20",
  },
  {
    accessorKey: "rate",
    header: ({ column }) => (
      <SortableHeader<GrnItemReportRowType> label="Rate" column={column} />
    ),
    cell: ({ row }) => money(row.original.rate),
    headerClassName: "min-w-20",
    cellClassName: "min-w-20",
  },
  {
    accessorKey: "cGstPercentage",
    header: ({ column }) => (
      <SortableHeader<GrnItemReportRowType> label="CGST%" column={column} />
    ),
    cell: ({ row }) => money(row.original.cGstPercentage),
    headerClassName: "min-w-20",
    cellClassName: "min-w-20",
  },
  {
    accessorKey: "sGstPercentage",
    header: ({ column }) => (
      <SortableHeader<GrnItemReportRowType> label="SGST%" column={column} />
    ),
    cell: ({ row }) => money(row.original.sGstPercentage),
    headerClassName: "min-w-20",
    cellClassName: "min-w-20",
  },
  {
    accessorKey: "iGstPercentage",
    header: ({ column }) => (
      <SortableHeader<GrnItemReportRowType> label="IGST%" column={column} />
    ),
    cell: ({ row }) => money(row.original.iGstPercentage),
    headerClassName: "min-w-20",
    cellClassName: "min-w-20",
  },
  {
    accessorKey: "mrp",
    header: ({ column }) => (
      <SortableHeader<GrnItemReportRowType> label="MRP" column={column} />
    ),
    cell: ({ row }) => money(row.original.mrp),
    headerClassName: "min-w-20",
    cellClassName: "min-w-20",
  },
];

const GrnReportsTab = ({
  data,
  isLoading,
  isError,
  error,
  filters,
}: GrnReportsTabProps) => {
  return (
    <CustomTabs
      defaultValue="grn-summary"
      classNames="border-none shadow-none"
      tabs={[
        {
          value: "grn-summary",
          name: "GRN",
          content: (
            <ReportTable
              data={data.grns}
              columns={grnColumns}
              rowId={(row) => String(row.id)}
              searchPlaceholder="Search GRN summary..."
              printConfig={{
                reportKey: "grn",
                tableKey: "grn-summary",
                title: "GRN Summary",
                filters,
              }}
              isLoading={isLoading}
              isError={isError}
              error={error}
            />
          ),
        },
        {
          value: "grn-items",
          name: "GRN Items",
          content: (
            <ReportTable
              data={data.grnItems}
              columns={grnItemColumns}
              rowId={(row) => row.id}
              searchPlaceholder="Search GRN items..."
              printConfig={{
                reportKey: "grn",
                tableKey: "grn-items",
                title: "GRN Items",
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

export default GrnReportsTab;
