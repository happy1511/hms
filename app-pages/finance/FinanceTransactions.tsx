"use client";

import CustomActionDropdown from "@/components/common/CustomActionDropdown";
import CustomFilters from "@/components/common/CustomFilters";
import CustomLayout from "@/components/common/CustomLayout";
import { CustomTable } from "@/components/common/CustomTable";
import NoPermission from "@/components/common/NoPermission";
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
import { useMemo, useState } from "react";

type TransactionRow = {
  id: string;
  transactionId: number;
  invoiceId: number;
  billType: "OPD" | "IPD";
  billNumber: number;
  permissionModule: ModuleType;
  patientName: string;
  createdAt: Date;
  mode: string;
  amount: number;
  remarks: string;
};

const neededFilters: FilterConfig<FilterValues>[] = [
  { label: "Search", valueKey: "name", type: "text" },
  { label: "Created Date", valueKey: "createdAt", type: "dateRange" },
];

const toTransactionRowsFromOpd = (item: OPDType): TransactionRow[] =>
  item.invoice.transactions.map((txn) => ({
    id: `opd-${item.id}-txn-${txn.id}`,
    transactionId: txn.id,
    invoiceId: item.invoice.id,
    billType: "OPD",
    billNumber: item.id,
    permissionModule: ModuleType.OPD_BILL,
    patientName: `${item.patient.firstName} ${item.patient.lastName}`,
    createdAt: txn.createdAt,
    mode: txn.mode,
    amount: txn.amount,
    remarks: txn.remarks || "",
  }));

const toTransactionRowsFromIpd = (item: IPDType): TransactionRow[] =>
  item.invoice.transactions.map((txn) => ({
    id: `ipd-${item.id}-txn-${txn.id}`,
    transactionId: txn.id,
    invoiceId: item.invoice.id,
    billType: "IPD",
    billNumber: item.id,
    permissionModule: ModuleType.IPD_BILL,
    patientName: `${item.patient.firstName} ${item.patient.lastName}`,
    createdAt: txn.createdAt,
    mode: txn.mode,
    amount: txn.amount,
    remarks: txn.remarks || "",
  }));

const FinanceTransactions = () => {
  const [filters, setFilters] = useState<FilterValues>({});

  const { data: profile } = useProfile(false);
  const opdQuery = useOpdList(filters, 1, 100);
  const ipdQuery = useIpdList(filters, 1, 100);

  if (!profile) {
    return <div />;
  }

  const canView = hasActionPermission(
    profile.data,
    "FINANCE_PAYMENTS" as ModuleType,
    ActionType.VIEW,
  );

  const rows = useMemo(() => {
    const opdRows = (opdQuery.data?.data || []).flatMap(toTransactionRowsFromOpd);
    const ipdRows = (ipdQuery.data?.data || []).flatMap(toTransactionRowsFromIpd);
    return [...opdRows, ...ipdRows].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  }, [opdQuery.data?.data, ipdQuery.data?.data]);

  const columns: ColumnDefWithClass<TransactionRow>[] = [
    {
      accessorKey: "srn",
      header: ({ column }) => <SortableHeader<TransactionRow> label="ID" column={column} />,
      cell: ({ row }) => <span>#{row.index + 1}</span>,
      headerClassName: "min-w-15 max-w-20",
      cellClassName: "min-w-15 max-w-20",
    },
    {
      accessorKey: "transactionId",
      header: ({ column }) => (
        <SortableHeader<TransactionRow> label="Receipt No." column={column} />
      ),
      headerClassName: "min-w-24 max-w-30",
      cellClassName: "min-w-24 max-w-30",
    },
    {
      accessorKey: "billType",
      header: ({ column }) => <SortableHeader<TransactionRow> label="Type" column={column} />,
      headerClassName: "min-w-20 max-w-24",
      cellClassName: "min-w-20 max-w-24",
    },
    {
      accessorKey: "billNumber",
      header: ({ column }) => <SortableHeader<TransactionRow> label="Bill No." column={column} />,
      cell: ({ row }) => `${row.original.billType}-${row.original.billNumber}`,
      headerClassName: "min-w-24 max-w-30",
      cellClassName: "min-w-24 max-w-30",
    },
    {
      accessorKey: "patientName",
      header: ({ column }) => <SortableHeader<TransactionRow> label="Patient" column={column} />,
      headerClassName: "min-w-40",
      cellClassName: "min-w-40",
    },
    {
      accessorKey: "createdAt",
      header: ({ column }) => <SortableHeader<TransactionRow> label="Date/Time" column={column} />,
      cell: ({ row }) => format(new Date(row.original.createdAt), "dd/MM/yyyy - h:mma"),
      headerClassName: "min-w-40",
      cellClassName: "min-w-40",
    },
    {
      accessorKey: "mode",
      header: ({ column }) => <SortableHeader<TransactionRow> label="Mode" column={column} />,
      headerClassName: "min-w-24 max-w-30",
      cellClassName: "min-w-24 max-w-30",
    },
    {
      accessorKey: "amount",
      header: ({ column }) => <SortableHeader<TransactionRow> label="Amount" column={column} />,
      cell: ({ row }) => `₹ ${row.original.amount.toFixed(2)}`,
      headerClassName: "min-w-24 max-w-30",
      cellClassName: "min-w-24 max-w-30",
    },
    {
      accessorKey: "remarks",
      header: ({ column }) => <SortableHeader<TransactionRow> label="Remarks" column={column} />,
      headerClassName: "min-w-40",
      cellClassName: "min-w-40",
    },
    {
      accessorKey: "action",
      header: "Actions",
      cell: ({ row }) => {
        const canPrint = hasActionPermission(
          profile.data,
          row.original.permissionModule,
          ActionType.PRINT,
        );

        if (!canPrint) {
          return null;
        }

        return (
          <CustomActionDropdown
            triggerLabel="Print"
            groups={[
              {
                items: [
                  {
                    label: "Receipt",
                    onClick: () =>
                      window.open(
                        `/invoice/transactions/${row.original.invoiceId}?transactionId=${row.original.transactionId}`,
                        "_blank",
                      ),
                  },
                  {
                    label: "All Transactions",
                    onClick: () =>
                      window.open(
                        `/invoice/transactions/${row.original.invoiceId}`,
                        "_blank",
                      ),
                  },
                ],
              },
            ]}
          />
        );
      },
      headerClassName: "min-w-30 max-w-40",
      cellClassName: "min-w-30 max-w-40",
    },
  ];

  const isLoading = opdQuery.isLoading || ipdQuery.isLoading;
  const isError = opdQuery.isError || ipdQuery.isError;
  const error = opdQuery.error || ipdQuery.error || null;

  return (
    <CustomLayout title="Finance Transactions (OPD + IPD)">
      {canView && (
        <>
          <CustomFilters<FilterValues> filters={neededFilters} onSubmit={setFilters} />
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
      {!canView && <NoPermission />}
    </CustomLayout>
  );
};

export default FinanceTransactions;
