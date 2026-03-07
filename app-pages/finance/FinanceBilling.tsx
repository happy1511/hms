"use client";

import CustomActionDropdown from "@/components/common/CustomActionDropdown";
import CustomFilters from "@/components/common/CustomFilters";
import CustomLayout from "@/components/common/CustomLayout";
import { CustomTable } from "@/components/common/CustomTable";
import { SortableHeader } from "@/components/common/SortableHeader";
import { ActionType, ModuleType } from "@/generated/prisma/enums";
import { useProfile } from "@/hooks/query/auth";
import { useIpdList } from "@/hooks/query/ipd";
import { useOpdList } from "@/hooks/query/opd";
import {
  ColumnDefWithClass,
  FilterConfig,
  FilterValues,
  IPDType,
  OPDType,
} from "@/lib/type";
import { hasActionPermission } from "@/lib/utils";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

type BillingRow = {
  id: string;
  billType: "OPD" | "IPD";
  billNumber: number;
  invoiceId: number;
  permissionModule: ModuleType;
  patientName: string;
  createdAt: Date;
  total: number;
  discount: number;
  finalAmount: number;
  paidAmount: number;
};

const neededFilters: FilterConfig<FilterValues>[] = [
  { label: "Search", valueKey: "name", type: "text" },
  { label: "Created Date", valueKey: "createdAt", type: "dateRange" },
];

const toBillingRowFromOpd = (item: OPDType): BillingRow => {
  const paidAmount = item.invoice.transactions.reduce(
    (sum, t) => sum + t.amount,
    0,
  );
  const discount =
    item.invoice.discountType === "PERCENTAGE"
      ? (item.invoice.rate * item.invoice.discountValue) / 100
      : item.invoice.discountValue;

  return {
    id: `opd-${item.id}`,
    billType: "OPD",
    billNumber: item.id,
    invoiceId: item.invoice.id,
    permissionModule: ModuleType.OPD_BILL,
    patientName: `${item.patient.firstName} ${item.patient.lastName}`,
    createdAt: item.createdAt,
    total: item.invoice.rate,
    discount,
    finalAmount: item.invoice.total,
    paidAmount,
  };
};

const toBillingRowFromIpd = (item: IPDType): BillingRow => {
  const paidAmount = item.invoice.transactions.reduce(
    (sum, t) => sum + t.amount,
    0,
  );
  const discount =
    item.invoice.discountType === "PERCENTAGE"
      ? (item.invoice.rate * item.invoice.discountValue) / 100
      : item.invoice.discountValue;

  return {
    id: `ipd-${item.id}`,
    billType: "IPD",
    billNumber: item.id,
    invoiceId: item.invoice.id,
    permissionModule: ModuleType.IPD_BILL,
    patientName: `${item.patient.firstName} ${item.patient.lastName}`,
    createdAt: item.createdAt,
    total: item.invoice.rate,
    discount,
    finalAmount: item.invoice.total,
    paidAmount,
  };
};

const FinanceBilling = () => {
  const [filters, setFilters] = useState<FilterValues>({});
  const router = useRouter();

  const { data: profile } = useProfile(false);
  const opdQuery = useOpdList(filters, 1, 100);
  const ipdQuery = useIpdList(filters, 1, 100);

  const rows = useMemo(() => {
    const opdRows = (opdQuery.data?.data || []).map(toBillingRowFromOpd);
    const ipdRows = (ipdQuery.data?.data || []).map(toBillingRowFromIpd);
    return [...opdRows, ...ipdRows].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  }, [opdQuery.data?.data, ipdQuery.data?.data]);

  if (!profile) {
    return <div />;
  }

  const canView = hasActionPermission(
    profile.data,
    ModuleType.FINANCE_BILLING,
    ActionType.VIEW,
  );

  const columns: ColumnDefWithClass<BillingRow>[] = [
    {
      accessorKey: "srn",
      header: ({ column }) => (
        <SortableHeader<BillingRow> label="ID" column={column} />
      ),
      cell: ({ row }) => <span>#{row.index + 1}</span>,
      headerClassName: "min-w-15 max-w-20",
      cellClassName: "min-w-15 max-w-20",
    },
    {
      accessorKey: "billType",
      header: ({ column }) => (
        <SortableHeader<BillingRow> label="Type" column={column} />
      ),
      headerClassName: "min-w-20 max-w-30",
      cellClassName: "min-w-20 max-w-30",
    },
    {
      accessorKey: "billNumber",
      header: ({ column }) => (
        <SortableHeader<BillingRow> label="Bill No." column={column} />
      ),
      cell: ({ row }) => `${row.original.billType}-${row.original.billNumber}`,
      headerClassName: "min-w-24 max-w-30",
      cellClassName: "min-w-24 max-w-30",
    },
    {
      accessorKey: "patientName",
      header: ({ column }) => (
        <SortableHeader<BillingRow> label="Patient" column={column} />
      ),
      headerClassName: "min-w-40",
      cellClassName: "min-w-40",
    },
    {
      accessorKey: "createdAt",
      header: ({ column }) => (
        <SortableHeader<BillingRow> label="Date/Time" column={column} />
      ),
      cell: ({ row }) =>
        format(new Date(row.original.createdAt), "dd/MM/yyyy - h:mma"),
      headerClassName: "min-w-40",
      cellClassName: "min-w-40",
    },
    {
      accessorKey: "total",
      header: ({ column }) => (
        <SortableHeader<BillingRow> label="Total" column={column} />
      ),
      cell: ({ row }) => `₹ ${row.original.total.toFixed(2)}`,
      headerClassName: "min-w-24 max-w-30",
      cellClassName: "min-w-24 max-w-30",
    },
    {
      accessorKey: "discount",
      header: ({ column }) => (
        <SortableHeader<BillingRow> label="Discount" column={column} />
      ),
      cell: ({ row }) => `₹ ${row.original.discount.toFixed(2)}`,
      headerClassName: "min-w-24 max-w-30",
      cellClassName: "min-w-24 max-w-30",
    },
    {
      accessorKey: "finalAmount",
      header: ({ column }) => (
        <SortableHeader<BillingRow> label="Final" column={column} />
      ),
      cell: ({ row }) => `₹ ${row.original.finalAmount.toFixed(2)}`,
      headerClassName: "min-w-24 max-w-30",
      cellClassName: "min-w-24 max-w-30",
    },
    {
      accessorKey: "paidAmount",
      header: ({ column }) => (
        <SortableHeader<BillingRow> label="Paid" column={column} />
      ),
      cell: ({ row }) => `₹ ${row.original.paidAmount.toFixed(2)}`,
      headerClassName: "min-w-24 max-w-30",
      cellClassName: "min-w-24 max-w-30",
    },
    {
      accessorKey: "dueAmount",
      header: ({ column }) => (
        <SortableHeader<BillingRow> label="Due" column={column} />
      ),
      cell: ({ row }) =>
        `₹ ${(row.original.finalAmount - row.original.paidAmount).toFixed(2)}`,
      headerClassName: "min-w-24 max-w-30",
      cellClassName: "min-w-24 max-w-30",
    },
    {
      accessorKey: "action",
      header: "Actions",
      cell: ({ row }) => {
        const canUpdateInvoice = hasActionPermission(
          profile.data,
          row.original.permissionModule,
          ActionType.UPDATE,
        );
        const canPrintInvoice = hasActionPermission(
          profile.data,
          row.original.permissionModule,
          ActionType.PRINT,
        );
        const items = [
          {
            label: "View Invoice",
            onClick: () => router.push(`/invoice/${row.original.invoiceId}`),
          },
        ];

        if (canUpdateInvoice) {
          items.unshift({
            label: "Edit Invoice",
            onClick: () => router.push(`/invoice/${row.original.invoiceId}`),
          });
        }

        if (canPrintInvoice) {
          items.push(
            {
              label: "Print Invoice",
              onClick: () =>
                window.open(`/invoice/print/${row.original.invoiceId}`, "_blank"),
            },
            {
              label: "Print Transactions",
              onClick: () =>
                window.open(
                  `/invoice/transactions/${row.original.invoiceId}`,
                  "_blank",
                ),
            },
          );
        }

        return (
          <CustomActionDropdown triggerLabel="Actions" groups={[{ items }]} />
        );
      },
      headerClassName: "min-w-24 max-w-30",
      cellClassName: "min-w-24 max-w-30",
    },
  ];

  const isLoading = opdQuery.isLoading || ipdQuery.isLoading;
  const isError = opdQuery.isError || ipdQuery.isError;
  const error = opdQuery.error || ipdQuery.error || null;

  return (
    <CustomLayout title="Finance Billing (OPD + IPD)">
      {canView && (
        <>
          <CustomFilters<FilterValues>
            filters={neededFilters}
            onSubmit={setFilters}
          />
          <CustomTable
            columns={columns}
            data={rows}
            isLoading={isLoading}
            isError={isError}
            error={error}
            enableSorting
            hidePagination
            getRowId={(row) => row.id}
          />
        </>
      )}
    </CustomLayout>
  );
};

export default FinanceBilling;
