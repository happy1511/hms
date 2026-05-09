"use client";

import { SortableHeader } from "@/components/common/SortableHeader";
import { ColumnDefWithClass, GstSummaryRowType } from "@/lib/type";
import { money } from "./reportUtils";

const sumColumn = (
  rows: GstSummaryRowType[],
  selector: (row: GstSummaryRowType) => number,
) => money(rows.reduce((sum, row) => sum + Number(selector(row) || 0), 0));

export const gstSummaryColumns: ColumnDefWithClass<GstSummaryRowType>[] = [
  {
    accessorKey: "hsnSacCode",
    header: ({ column }) => (
      <SortableHeader<GstSummaryRowType>
        label="HSN/SAC Code"
        column={column}
      />
    ),
    cell: ({ row }) => row.original.hsnSacCode,
    footer: () => "Total",
    headerClassName: "min-w-28",
    cellClassName: "min-w-28",
  },
  {
    accessorKey: "gstRate",
    header: ({ column }) => (
      <SortableHeader<GstSummaryRowType>
        label="Gst Rate (SGST+CGST Rate)"
        column={column}
      />
    ),
    cell: ({ row }) => money(row.original.gstRate),
    footer: () => "-",
    headerClassName: "min-w-32",
    cellClassName: "min-w-32",
  },
  {
    accessorKey: "taxableAmount",
    header: ({ column }) => (
      <SortableHeader<GstSummaryRowType>
        label="Taxable Amount"
        column={column}
      />
    ),
    cell: ({ row }) => money(row.original.taxableAmount),
    footer: ({ table }) =>
      sumColumn(
        table.getFilteredRowModel().rows.map((row) => row.original),
        (row) => row.taxableAmount,
      ),
    headerClassName: "min-w-28",
    cellClassName: "min-w-28",
  },
  {
    accessorKey: "sGstAmount",
    header: ({ column }) => (
      <SortableHeader<GstSummaryRowType>
        label="SGST Amount"
        column={column}
      />
    ),
    cell: ({ row }) => money(row.original.sGstAmount),
    footer: ({ table }) =>
      sumColumn(
        table.getFilteredRowModel().rows.map((row) => row.original),
        (row) => row.sGstAmount,
      ),
    headerClassName: "min-w-24",
    cellClassName: "min-w-24",
  },
  {
    accessorKey: "cGstAmount",
    header: ({ column }) => (
      <SortableHeader<GstSummaryRowType>
        label="CGST Amount"
        column={column}
      />
    ),
    cell: ({ row }) => money(row.original.cGstAmount),
    footer: ({ table }) =>
      sumColumn(
        table.getFilteredRowModel().rows.map((row) => row.original),
        (row) => row.cGstAmount,
      ),
    headerClassName: "min-w-24",
    cellClassName: "min-w-24",
  },
];
