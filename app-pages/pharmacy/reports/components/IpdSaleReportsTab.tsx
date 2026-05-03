"use client";

import CustomTabs from "@/components/common/CustomTabs";
import { SortableHeader } from "@/components/common/SortableHeader";
import {
  ColumnDefWithClass,
  IpdSaleItemRowType,
  PharmacyReportsType,
  SalesHsnSummaryRowType,
} from "@/lib/type";
import { format } from "date-fns";
import ReportTable, { ReportTableStateProps } from "./ReportTable";
import { money } from "./reportUtils";

type IpdSaleReportsTabProps = ReportTableStateProps & {
  data: PharmacyReportsType["ipdSale"];
};

const hsnColumns: ColumnDefWithClass<SalesHsnSummaryRowType>[] = [
  {
    accessorKey: "hsn",
    header: ({ column }) => (
      <SortableHeader<SalesHsnSummaryRowType> label="HSN" column={column} />
    ),
    cell: ({ row }) => row.original.hsn,
    headerClassName: "min-w-24",
    cellClassName: "min-w-24",
  },
  {
    accessorKey: "quantity",
    header: ({ column }) => (
      <SortableHeader<SalesHsnSummaryRowType> label="Qty" column={column} />
    ),
    cell: ({ row }) => row.original.quantity,
    headerClassName: "min-w-20",
    cellClassName: "min-w-20",
  },
  {
    accessorKey: "cGstPercentage",
    header: ({ column }) => (
      <SortableHeader<SalesHsnSummaryRowType> label="CGST" column={column} />
    ),
    cell: ({ row }) => money(row.original.cGstPercentage),
    headerClassName: "min-w-20",
    cellClassName: "min-w-20",
  },
  {
    accessorKey: "sGstPercentage",
    header: ({ column }) => (
      <SortableHeader<SalesHsnSummaryRowType> label="SGST" column={column} />
    ),
    cell: ({ row }) => money(row.original.sGstPercentage),
    headerClassName: "min-w-20",
    cellClassName: "min-w-20",
  },
  {
    accessorKey: "taxableAmount",
    header: ({ column }) => (
      <SortableHeader<SalesHsnSummaryRowType>
        label="Taxable Amount"
        column={column}
      />
    ),
    cell: ({ row }) => money(row.original.taxableAmount),
    headerClassName: "min-w-28",
    cellClassName: "min-w-28",
  },
  {
    accessorKey: "cGstAmount",
    header: ({ column }) => (
      <SortableHeader<SalesHsnSummaryRowType>
        label="CGST Amount"
        column={column}
      />
    ),
    cell: ({ row }) => money(row.original.cGstAmount),
    headerClassName: "min-w-24",
    cellClassName: "min-w-24",
  },
  {
    accessorKey: "sGstAmount",
    header: ({ column }) => (
      <SortableHeader<SalesHsnSummaryRowType>
        label="SGST Amount"
        column={column}
      />
    ),
    cell: ({ row }) => money(row.original.sGstAmount),
    headerClassName: "min-w-24",
    cellClassName: "min-w-24",
  },
];

const ipdSaleItemColumns: ColumnDefWithClass<IpdSaleItemRowType>[] = [
  {
    accessorKey: "date",
    header: ({ column }) => (
      <SortableHeader<IpdSaleItemRowType> label="Date" column={column} />
    ),
    cell: ({ row }) => format(row.original.date, "dd/MM/yyyy"),
    headerClassName: "min-w-24",
    cellClassName: "min-w-24",
  },
  {
    accessorKey: "invoiceNumber",
    header: ({ column }) => (
      <SortableHeader<IpdSaleItemRowType>
        label="Invoice Number"
        column={column}
      />
    ),
    cell: ({ row }) => row.original.invoiceNumber,
    headerClassName: "min-w-24",
    cellClassName: "min-w-24",
  },
  {
    accessorKey: "billingType",
    header: ({ column }) => (
      <SortableHeader<IpdSaleItemRowType>
        label="Billing Type"
        column={column}
      />
    ),
    cell: ({ row }) => row.original.billingType,
    headerClassName: "min-w-28",
    cellClassName: "min-w-28",
  },
  {
    accessorKey: "customer",
    header: ({ column }) => (
      <SortableHeader<IpdSaleItemRowType> label="Customer" column={column} />
    ),
    cell: ({ row }) => row.original.customer,
    headerClassName: "min-w-40",
    cellClassName: "min-w-40",
  },
  {
    accessorKey: "item",
    header: ({ column }) => (
      <SortableHeader<IpdSaleItemRowType> label="Item" column={column} />
    ),
    cell: ({ row }) => row.original.item,
    headerClassName: "min-w-40",
    cellClassName: "min-w-40",
  },
  {
    accessorKey: "rate",
    header: ({ column }) => (
      <SortableHeader<IpdSaleItemRowType> label="Rate" column={column} />
    ),
    cell: ({ row }) => money(row.original.rate),
    headerClassName: "min-w-20",
    cellClassName: "min-w-20",
  },
  {
    accessorKey: "quantity",
    header: ({ column }) => (
      <SortableHeader<IpdSaleItemRowType> label="Qty" column={column} />
    ),
    cell: ({ row }) => row.original.quantity,
    headerClassName: "min-w-16",
    cellClassName: "min-w-16",
  },
  {
    accessorKey: "itemTotal",
    header: ({ column }) => (
      <SortableHeader<IpdSaleItemRowType> label="Item Total" column={column} />
    ),
    cell: ({ row }) => money(row.original.itemTotal),
    headerClassName: "min-w-24",
    cellClassName: "min-w-24",
  },
];

const IpdSaleReportsTab = ({
  data,
  isLoading,
  isError,
  error,
}: IpdSaleReportsTabProps) => {
  return (
    <CustomTabs
      defaultValue="ipd-sale-items"
      classNames="border-none shadow-none"
      tabs={[
        {
          value: "ipd-sale-items",
          name: "IPD Sale Items",
          content: (
            <ReportTable
              data={data.items}
              columns={ipdSaleItemColumns}
              rowId={(row) => row.id}
              searchPlaceholder="Search IPD sale items..."
              isLoading={isLoading}
              isError={isError}
              error={error}
            />
          ),
        },
        {
          value: "ipd-sale-hsn-summary",
          name: "IPD Sales HSN Summary",
          content: (
            <ReportTable
              data={data.hsnSummary}
              columns={hsnColumns}
              rowId={(row) => row.id}
              searchPlaceholder="Search IPD sales HSN summary..."
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

export default IpdSaleReportsTab;
