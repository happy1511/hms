"use client";

import CustomTabs from "@/components/common/CustomTabs";
import { SortableHeader } from "@/components/common/SortableHeader";
import {
  ColumnDefWithClass,
  CounterSaleBillRowType,
  CounterSaleCollectionRowType,
  CounterSaleItemRowType,
  PharmacyReportsType,
  SalesHsnSummaryRowType,
  GstSummaryRowType,
} from "@/lib/type";
import { FilterValues } from "@/lib/type";
import { format } from "date-fns";
import ReportTable, { ReportTableStateProps } from "./ReportTable";
import { gstSummaryColumns } from "./gstSummaryColumns";
import { money } from "./reportUtils";

type CounterSaleReportsTabProps = ReportTableStateProps & {
  data: PharmacyReportsType["counterSale"];
  filters: FilterValues;
};

export const counterSaleHsnColumns: ColumnDefWithClass<SalesHsnSummaryRowType>[] = [
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

export const counterSaleGstSummaryColumns: ColumnDefWithClass<GstSummaryRowType>[] =
  gstSummaryColumns;

export const counterSaleBillColumns: ColumnDefWithClass<CounterSaleBillRowType>[] = [
  {
    accessorKey: "billNumber",
    header: ({ column }) => (
      <SortableHeader<CounterSaleBillRowType>
        label="Bill No."
        column={column}
      />
    ),
    cell: ({ row }) => row.original.billNumber,
    headerClassName: "min-w-24",
    cellClassName: "min-w-24",
  },
  {
    accessorKey: "date",
    header: ({ column }) => (
      <SortableHeader<CounterSaleBillRowType> label="Date" column={column} />
    ),
    cell: ({ row }) => format(row.original.date, "dd/MM/yyyy"),
    headerClassName: "min-w-24",
    cellClassName: "min-w-24",
  },
  {
    accessorKey: "customer",
    header: ({ column }) => (
      <SortableHeader<CounterSaleBillRowType>
        label="Customer"
        column={column}
      />
    ),
    cell: ({ row }) => row.original.customer,
    headerClassName: "min-w-40",
    cellClassName: "min-w-40",
  },
  {
    accessorKey: "taxableAmount",
    header: ({ column }) => (
      <SortableHeader<CounterSaleBillRowType>
        label="Taxable Amt."
        column={column}
      />
    ),
    cell: ({ row }) => money(row.original.taxableAmount),
    headerClassName: "min-w-24",
    cellClassName: "min-w-24",
  },
  {
    accessorKey: "cGstAmount",
    header: ({ column }) => (
      <SortableHeader<CounterSaleBillRowType> label="CGST" column={column} />
    ),
    cell: ({ row }) => money(row.original.cGstAmount),
    headerClassName: "min-w-20",
    cellClassName: "min-w-20",
  },
  {
    accessorKey: "sGstAmount",
    header: ({ column }) => (
      <SortableHeader<CounterSaleBillRowType> label="SGST" column={column} />
    ),
    cell: ({ row }) => money(row.original.sGstAmount),
    headerClassName: "min-w-20",
    cellClassName: "min-w-20",
  },
  {
    accessorKey: "iGstAmount",
    header: ({ column }) => (
      <SortableHeader<CounterSaleBillRowType> label="IGST" column={column} />
    ),
    cell: ({ row }) => money(row.original.iGstAmount),
    headerClassName: "min-w-20",
    cellClassName: "min-w-20",
  },
  {
    accessorKey: "rounding",
    header: ({ column }) => (
      <SortableHeader<CounterSaleBillRowType>
        label="Rounding"
        column={column}
      />
    ),
    cell: ({ row }) => money(row.original.rounding),
    headerClassName: "min-w-20",
    cellClassName: "min-w-20",
  },
  {
    accessorKey: "billTotal",
    header: ({ column }) => (
      <SortableHeader<CounterSaleBillRowType>
        label="Bill Total"
        column={column}
      />
    ),
    cell: ({ row }) => money(row.original.billTotal),
    headerClassName: "min-w-24",
    cellClassName: "min-w-24",
  },
  {
    accessorKey: "paidTotal",
    header: ({ column }) => (
      <SortableHeader<CounterSaleBillRowType>
        label="Paid Total"
        column={column}
      />
    ),
    cell: ({ row }) => money(row.original.paidTotal),
    headerClassName: "min-w-24",
    cellClassName: "min-w-24",
  },
  {
    accessorKey: "saleOrReturn",
    header: ({ column }) => (
      <SortableHeader<CounterSaleBillRowType>
        label="Sale/Return"
        column={column}
      />
    ),
    cell: ({ row }) => row.original.saleOrReturn,
    headerClassName: "min-w-24",
    cellClassName: "min-w-24",
  },
  {
    accessorKey: "wholesaleRetail",
    header: ({ column }) => (
      <SortableHeader<CounterSaleBillRowType>
        label="Wholesale/Retail"
        column={column}
      />
    ),
    cell: ({ row }) => row.original.wholesaleRetail,
    headerClassName: "min-w-28",
    cellClassName: "min-w-28",
  },
  {
    accessorKey: "corporate",
    header: ({ column }) => (
      <SortableHeader<CounterSaleBillRowType>
        label="Corporate"
        column={column}
      />
    ),
    cell: ({ row }) => row.original.corporate,
    headerClassName: "min-w-28",
    cellClassName: "min-w-28",
  },
];

export const counterSaleItemColumns: ColumnDefWithClass<CounterSaleItemRowType>[] = [
  {
    accessorKey: "date",
    header: ({ column }) => (
      <SortableHeader<CounterSaleItemRowType> label="Date" column={column} />
    ),
    cell: ({ row }) => format(row.original.date, "dd/MM/yyyy"),
    headerClassName: "min-w-24",
    cellClassName: "min-w-24",
  },
  {
    accessorKey: "customer",
    header: ({ column }) => (
      <SortableHeader<CounterSaleItemRowType>
        label="Customer"
        column={column}
      />
    ),
    cell: ({ row }) => row.original.customer,
    headerClassName: "min-w-40",
    cellClassName: "min-w-40",
  },
  {
    accessorKey: "billNumber",
    header: ({ column }) => (
      <SortableHeader<CounterSaleItemRowType> label="Bill No" column={column} />
    ),
    cell: ({ row }) => row.original.billNumber,
    headerClassName: "min-w-24",
    cellClassName: "min-w-24",
  },
  {
    accessorKey: "item",
    header: ({ column }) => (
      <SortableHeader<CounterSaleItemRowType> label="Item" column={column} />
    ),
    cell: ({ row }) => row.original.item,
    headerClassName: "min-w-40",
    cellClassName: "min-w-40",
  },
  {
    accessorKey: "hsn",
    header: ({ column }) => (
      <SortableHeader<CounterSaleItemRowType> label="HSN" column={column} />
    ),
    cell: ({ row }) => row.original.hsn,
    headerClassName: "min-w-24",
    cellClassName: "min-w-24",
  },
  {
    accessorKey: "batch",
    header: ({ column }) => (
      <SortableHeader<CounterSaleItemRowType> label="Batch" column={column} />
    ),
    cell: ({ row }) => row.original.batch,
    headerClassName: "min-w-24",
    cellClassName: "min-w-24",
  },
  {
    accessorKey: "expiry",
    header: ({ column }) => (
      <SortableHeader<CounterSaleItemRowType> label="Exp" column={column} />
    ),
    cell: ({ row }) => format(row.original.expiry, "MM/yy"),
    headerClassName: "min-w-20",
    cellClassName: "min-w-20",
  },
  {
    accessorKey: "ptr",
    header: ({ column }) => (
      <SortableHeader<CounterSaleItemRowType> label="PTR" column={column} />
    ),
    cell: ({ row }) => money(row.original.ptr),
    headerClassName: "min-w-20",
    cellClassName: "min-w-20",
  },
  {
    accessorKey: "ptrWithGst",
    header: ({ column }) => (
      <SortableHeader<CounterSaleItemRowType> label="PTR+GST" column={column} />
    ),
    cell: ({ row }) => money(row.original.ptrWithGst),
    headerClassName: "min-w-20",
    cellClassName: "min-w-20",
  },
  {
    accessorKey: "ptrTotal",
    header: ({ column }) => (
      <SortableHeader<CounterSaleItemRowType>
        label="PTR Total"
        column={column}
      />
    ),
    cell: ({ row }) => money(row.original.ptrTotal),
    headerClassName: "min-w-24",
    cellClassName: "min-w-24",
  },
  {
    accessorKey: "ptrWithGstTotal",
    header: ({ column }) => (
      <SortableHeader<CounterSaleItemRowType>
        label="PTR+GST Total"
        column={column}
      />
    ),
    cell: ({ row }) => money(row.original.ptrWithGstTotal),
    headerClassName: "min-w-28",
    cellClassName: "min-w-28",
  },
  {
    accessorKey: "mrp",
    header: ({ column }) => (
      <SortableHeader<CounterSaleItemRowType> label="MRP" column={column} />
    ),
    cell: ({ row }) => money(row.original.mrp),
    headerClassName: "min-w-20",
    cellClassName: "min-w-20",
  },
  {
    accessorKey: "itemsPerPack",
    header: ({ column }) => (
      <SortableHeader<CounterSaleItemRowType>
        label="Items/Pack"
        column={column}
      />
    ),
    cell: ({ row }) => row.original.itemsPerPack,
    headerClassName: "min-w-20",
    cellClassName: "min-w-20",
  },
  {
    accessorKey: "billedRate",
    header: ({ column }) => (
      <SortableHeader<CounterSaleItemRowType>
        label="Billed Rate"
        column={column}
      />
    ),
    cell: ({ row }) => money(row.original.billedRate),
    headerClassName: "min-w-24",
    cellClassName: "min-w-24",
  },
  {
    accessorKey: "quantity",
    header: ({ column }) => (
      <SortableHeader<CounterSaleItemRowType> label="Qty" column={column} />
    ),
    cell: ({ row }) => row.original.quantity,
    headerClassName: "min-w-16",
    cellClassName: "min-w-16",
  },
  {
    accessorKey: "discountPercentage",
    header: ({ column }) => (
      <SortableHeader<CounterSaleItemRowType> label="DISC%" column={column} />
    ),
    cell: ({ row }) => money(row.original.discountPercentage),
    headerClassName: "min-w-20",
    cellClassName: "min-w-20",
  },
  {
    accessorKey: "total",
    header: ({ column }) => (
      <SortableHeader<CounterSaleItemRowType> label="Total" column={column} />
    ),
    cell: ({ row }) => money(row.original.total),
    headerClassName: "min-w-20",
    cellClassName: "min-w-20",
  },
  {
    accessorKey: "cGstPercentage",
    header: ({ column }) => (
      <SortableHeader<CounterSaleItemRowType> label="CGST%" column={column} />
    ),
    cell: ({ row }) => money(row.original.cGstPercentage),
    headerClassName: "min-w-20",
    cellClassName: "min-w-20",
  },
  {
    accessorKey: "sGstPercentage",
    header: ({ column }) => (
      <SortableHeader<CounterSaleItemRowType> label="SGST%" column={column} />
    ),
    cell: ({ row }) => money(row.original.sGstPercentage),
    headerClassName: "min-w-20",
    cellClassName: "min-w-20",
  },
  {
    accessorKey: "iGstPercentage",
    header: ({ column }) => (
      <SortableHeader<CounterSaleItemRowType> label="IGST%" column={column} />
    ),
    cell: ({ row }) => money(row.original.iGstPercentage),
    headerClassName: "min-w-20",
    cellClassName: "min-w-20",
  },
  {
    accessorKey: "saleOrReturn",
    header: ({ column }) => (
      <SortableHeader<CounterSaleItemRowType>
        label="Sale/Return"
        column={column}
      />
    ),
    cell: ({ row }) => row.original.saleOrReturn,
    headerClassName: "min-w-24",
    cellClassName: "min-w-24",
  },
  {
    accessorKey: "doctor",
    header: ({ column }) => (
      <SortableHeader<CounterSaleItemRowType> label="Doctor" column={column} />
    ),
    cell: ({ row }) => row.original.doctor,
    headerClassName: "min-w-32",
    cellClassName: "min-w-32",
  },
  {
    accessorKey: "saleType",
    header: ({ column }) => (
      <SortableHeader<CounterSaleItemRowType>
        label="Sale Type"
        column={column}
      />
    ),
    cell: ({ row }) => row.original.saleType,
    headerClassName: "min-w-24",
    cellClassName: "min-w-24",
  },
  {
    accessorKey: "profitLoss",
    header: ({ column }) => (
      <SortableHeader<CounterSaleItemRowType> label="P/L" column={column} />
    ),
    cell: ({ row }) => money(row.original.profitLoss),
    headerClassName: "min-w-20",
    cellClassName: "min-w-20",
  },
  {
    accessorKey: "supplier",
    header: ({ column }) => (
      <SortableHeader<CounterSaleItemRowType>
        label="Supplier"
        column={column}
      />
    ),
    cell: ({ row }) => row.original.supplier,
    headerClassName: "min-w-32",
    cellClassName: "min-w-32",
  },
  {
    accessorKey: "purchaseDate",
    header: ({ column }) => (
      <SortableHeader<CounterSaleItemRowType>
        label="Pur. Date"
        column={column}
      />
    ),
    cell: ({ row }) =>
      row.original.purchaseDate
        ? format(row.original.purchaseDate, "dd/MM/yyyy")
        : "-",
    headerClassName: "min-w-24",
    cellClassName: "min-w-24",
  },
  {
    accessorKey: "purchaseBillNumber",
    header: ({ column }) => (
      <SortableHeader<CounterSaleItemRowType>
        label="Pur.Bill No"
        column={column}
      />
    ),
    cell: ({ row }) => row.original.purchaseBillNumber,
    headerClassName: "min-w-24",
    cellClassName: "min-w-24",
  },
];

export const counterSaleCollectionColumns: ColumnDefWithClass<CounterSaleCollectionRowType>[] =
  [
    {
      accessorKey: "customer",
      header: ({ column }) => (
        <SortableHeader<CounterSaleCollectionRowType>
          label="Customer"
          column={column}
        />
      ),
      cell: ({ row }) => row.original.customer,
      headerClassName: "min-w-40",
      cellClassName: "min-w-40",
    },
    {
      accessorKey: "billNumber",
      header: ({ column }) => (
        <SortableHeader<CounterSaleCollectionRowType>
          label="Bill Number"
          column={column}
        />
      ),
      cell: ({ row }) => row.original.billNumber,
      headerClassName: "min-w-24",
      cellClassName: "min-w-24",
    },
    {
      accessorKey: "paymentDate",
      header: ({ column }) => (
        <SortableHeader<CounterSaleCollectionRowType>
          label="Payment Date"
          column={column}
        />
      ),
      cell: ({ row }) => format(row.original.paymentDate, "dd/MM/yyyy"),
      headerClassName: "min-w-24",
      cellClassName: "min-w-24",
    },
    {
      accessorKey: "amount",
      header: ({ column }) => (
        <SortableHeader<CounterSaleCollectionRowType>
          label="Amount"
          column={column}
        />
      ),
      cell: ({ row }) => money(row.original.amount),
      headerClassName: "min-w-24",
      cellClassName: "min-w-24",
    },
    {
      accessorKey: "paymentMode",
      header: ({ column }) => (
        <SortableHeader<CounterSaleCollectionRowType>
          label="Payment Mode"
          column={column}
        />
      ),
      cell: ({ row }) => row.original.paymentMode,
      headerClassName: "min-w-24",
      cellClassName: "min-w-24",
    },
    {
      accessorKey: "receiptNumber",
      header: ({ column }) => (
        <SortableHeader<CounterSaleCollectionRowType>
          label="Receipt Number"
          column={column}
        />
      ),
      cell: ({ row }) => row.original.receiptNumber,
      headerClassName: "min-w-24",
      cellClassName: "min-w-24",
    },
    {
      accessorKey: "remarks",
      header: ({ column }) => (
        <SortableHeader<CounterSaleCollectionRowType>
          label="Remarks"
          column={column}
        />
      ),
      cell: ({ row }) => row.original.remarks,
      headerClassName: "min-w-28",
      cellClassName: "min-w-28",
    },
  ];

const CounterSaleReportsTab = ({
  data,
  isLoading,
  isError,
  error,
  filters,
}: CounterSaleReportsTabProps) => {
  return (
    <CustomTabs
      defaultValue="counter-sale-bills"
      classNames="border-none shadow-none"
      tabs={[
        {
          value: "counter-sale-bills",
          name: "Counter Sale Bills",
          content: (
            <ReportTable
              data={data.bills}
              columns={counterSaleBillColumns}
              rowId={(row) => row.id}
              searchPlaceholder="Search counter sale bills..."
              printConfig={{
                reportKey: "counter-sale",
                tableKey: "bills",
                title: "Counter Sale Bills",
                filters,
              }}
              isLoading={isLoading}
              isError={isError}
              error={error}
            />
          ),
        },
        {
          value: "counter-sale-items",
          name: "Counter Sale Items",
          content: (
            <ReportTable
              data={data.items}
              columns={counterSaleItemColumns}
              rowId={(row) => row.id}
              searchPlaceholder="Search counter sale items..."
              printConfig={{
                reportKey: "counter-sale",
                tableKey: "items",
                title: "Counter Sale Items",
                filters,
              }}
              isLoading={isLoading}
              isError={isError}
              error={error}
            />
          ),
        },
        {
          value: "counter-sale-collections",
          name: "Counter Sale Collections",
          content: (
            <ReportTable
              data={data.collections}
              columns={counterSaleCollectionColumns}
              rowId={(row) => row.id}
              searchPlaceholder="Search counter sale collections..."
              printConfig={{
                reportKey: "counter-sale",
                tableKey: "collections",
                title: "Counter Sale Collections",
                filters,
              }}
              isLoading={isLoading}
              isError={isError}
              error={error}
            />
          ),
        },
        {
          value: "counter-sale-gst-summary",
          name: "GST Summary",
          content: (
            <ReportTable
              data={data.gstSummary}
              columns={counterSaleGstSummaryColumns}
              rowId={(row) => row.id}
              searchPlaceholder="Search sales GST summary..."
              printConfig={{
                reportKey: "counter-sale",
                tableKey: "gst-summary",
                title: "Sales GST Summary",
                filters,
              }}
              isLoading={isLoading}
              isError={isError}
              error={error}
            />
          ),
        },
        {
          value: "counter-sale-hsn-summary",
          name: "Sales HSN Summary",
          content: (
            <ReportTable
              data={data.hsnSummary}
              columns={counterSaleHsnColumns}
              rowId={(row) => row.id}
              searchPlaceholder="Search HSN summary..."
              printConfig={{
                reportKey: "counter-sale",
                tableKey: "hsn-summary",
                title: "Counter Sale HSN Summary",
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

export default CounterSaleReportsTab;
