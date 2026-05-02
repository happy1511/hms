"use client";

import CustomFilters from "@/components/common/CustomFilters";
import CustomLayout from "@/components/common/CustomLayout";
import { CustomTable } from "@/components/common/CustomTable";
import NoPermission from "@/components/common/NoPermission";
import { SortableHeader } from "@/components/common/SortableHeader";
import { ActionType, ModuleType } from "@/generated/prisma/enums";
import { useProfile } from "@/hooks/query/auth";
import { useCustomerLedgerList } from "@/hooks/query/pharmacyLedger";
import {
  ColumnDefWithClass,
  CustomerLedgerRowType,
  FilterConfig,
  FilterValues,
} from "@/lib/type";
import { hasActionPermission } from "@/lib/utils";
import { format } from "date-fns";
import { useState } from "react";

const neededFilters: FilterConfig<FilterValues>[] = [
  { label: "Search", valueKey: "name", type: "text" },
  { label: "Created Date", valueKey: "createdAt", type: "dateRange" },
];

const money = (value: number) => Number(value || 0).toFixed(2);

const CustomerLedgers = () => {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [filters, setFilters] = useState<FilterValues>({});
  const { data: profile } = useProfile(false);
  const { data, isLoading, isFetching, refetch, isError, error } =
    useCustomerLedgerList(filters, page, limit);

  if (!profile) {
    return <div />;
  }

  const canView = hasActionPermission(
    profile.data,
    ModuleType.PHARMACY_CUSTOMER_LEDGER,
    ActionType.VIEW,
  );

  const columns: ColumnDefWithClass<CustomerLedgerRowType>[] = [
    {
      accessorKey: "billNumber",
      header: ({ column }) => (
        <SortableHeader<CustomerLedgerRowType> label="Bill Number" column={column} />
      ),
      cell: ({ row }) => row.original.billNumber,
      headerClassName: "min-w-28",
      cellClassName: "min-w-28",
    },
    {
      accessorKey: "date",
      header: ({ column }) => (
        <SortableHeader<CustomerLedgerRowType> label="Date" column={column} />
      ),
      cell: ({ row }) => format(row.original.date, "dd/MM/yyyy"),
      headerClassName: "min-w-24",
      cellClassName: "min-w-24",
    },
    {
      accessorKey: "customer",
      header: ({ column }) => (
        <SortableHeader<CustomerLedgerRowType> label="Customer" column={column} />
      ),
      cell: ({ row }) => row.original.customer,
      headerClassName: "min-w-40",
      cellClassName: "min-w-40",
    },
    {
      accessorKey: "taxableAmount",
      header: ({ column }) => (
        <SortableHeader<CustomerLedgerRowType> label="Taxable Amount" column={column} />
      ),
      cell: ({ row }) => money(row.original.taxableAmount),
      headerClassName: "min-w-24",
      cellClassName: "min-w-24",
    },
    {
      accessorKey: "cGstAmount",
      header: ({ column }) => (
        <SortableHeader<CustomerLedgerRowType> label="CGST" column={column} />
      ),
      cell: ({ row }) => money(row.original.cGstAmount),
      headerClassName: "min-w-20",
      cellClassName: "min-w-20",
    },
    {
      accessorKey: "sGstAmount",
      header: ({ column }) => (
        <SortableHeader<CustomerLedgerRowType> label="SGST" column={column} />
      ),
      cell: ({ row }) => money(row.original.sGstAmount),
      headerClassName: "min-w-20",
      cellClassName: "min-w-20",
    },
    {
      accessorKey: "iGstAmount",
      header: ({ column }) => (
        <SortableHeader<CustomerLedgerRowType> label="IGST" column={column} />
      ),
      cell: ({ row }) => money(row.original.iGstAmount),
      headerClassName: "min-w-20",
      cellClassName: "min-w-20",
    },
    {
      accessorKey: "total",
      header: ({ column }) => (
        <SortableHeader<CustomerLedgerRowType> label="Total" column={column} />
      ),
      cell: ({ row }) => money(row.original.total),
      headerClassName: "min-w-24",
      cellClassName: "min-w-24",
    },
    {
      accessorKey: "paid",
      header: ({ column }) => (
        <SortableHeader<CustomerLedgerRowType> label="Paid" column={column} />
      ),
      cell: ({ row }) => money(row.original.paid),
      headerClassName: "min-w-24",
      cellClassName: "min-w-24",
    },
    {
      accessorKey: "due",
      header: ({ column }) => (
        <SortableHeader<CustomerLedgerRowType> label="Due" column={column} />
      ),
      cell: ({ row }) => money(row.original.due),
      headerClassName: "min-w-24",
      cellClassName: "min-w-24",
    },
    {
      accessorKey: "type",
      header: ({ column }) => (
        <SortableHeader<CustomerLedgerRowType> label="Type" column={column} />
      ),
      cell: ({ row }) => row.original.type,
      headerClassName: "min-w-20",
      cellClassName: "min-w-20",
    },
  ];

  return (
    <CustomLayout title="Customer Ledgers">
      {canView ? (
        <>
          <CustomFilters<FilterValues>
            filters={neededFilters}
            onSubmit={setFilters}
            onRefresh={refetch}
            isLoading={isLoading || isFetching}
            isRefreshing={isFetching}
            filtersContainerClassName="grid-cols-1 md:grid-cols-2"
          />
          <CustomTable
            columns={columns}
            data={data?.data || []}
            page={page}
            total={data?.total}
            limit={limit}
            handleChangePage={setPage}
            handleChangeLimit={setLimit}
            isLoading={isLoading}
            isError={isError}
            error={error}
            getRowId={(row) => row.id}
            enableSorting
          />
        </>
      ) : (
        <NoPermission />
      )}
    </CustomLayout>
  );
};

export default CustomerLedgers;
