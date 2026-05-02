"use client";

import CustomButton from "@/components/common/CustomButton";
import CustomFilters from "@/components/common/CustomFilters";
import CustomLayout from "@/components/common/CustomLayout";
import { CustomTable } from "@/components/common/CustomTable";
import NoPermission from "@/components/common/NoPermission";
import { SortableHeader } from "@/components/common/SortableHeader";
import { DrugSupplier } from "@/generated/prisma/client";
import { ActionType, ModuleType } from "@/generated/prisma/enums";
import { useProfile } from "@/hooks/query/auth";
import { useSupplierLedgerList } from "@/hooks/query/pharmacyLedger";
import { ColumnDefWithClass, FilterConfig, FilterValues } from "@/lib/type";
import { hasActionPermission } from "@/lib/utils";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import { useState } from "react";

const neededFilters: FilterConfig<FilterValues>[] = [
  {
    label: "Search",
    valueKey: "name",
    type: "text",
    placeholder: "Search by name, phone, email or GST",
  },
  { label: "Created Date", valueKey: "createdAt", type: "dateRange" },
];

const Actions = ({ data }: { data: DrugSupplier }) => {
  const router = useRouter();

  return (
    <CustomButton onClick={() => router.push(`/pharmacy/supplier-ledger/${data.id}`)}>
      Open Ledger
    </CustomButton>
  );
};

const SupplierLedgers = () => {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [filters, setFilters] = useState<FilterValues>({});
  const { data: profile } = useProfile(false);
  const { data, isLoading, isFetching, refetch, isError, error } =
    useSupplierLedgerList(filters, page, limit);

  if (!profile) {
    return <div />;
  }

  const canView = hasActionPermission(
    profile.data,
    ModuleType.PHARMACY_SUPPLIER_LEDGER,
    ActionType.VIEW,
  );

  const columns: ColumnDefWithClass<DrugSupplier>[] = [
    {
      accessorKey: "id",
      header: ({ column }) => <SortableHeader<DrugSupplier> label="No." column={column} />,
      cell: ({ row }) => `#${row.index + 1}`,
      headerClassName: "min-w-16",
      cellClassName: "min-w-16",
    },
    {
      accessorKey: "name",
      header: ({ column }) => <SortableHeader<DrugSupplier> label="Supplier" column={column} />,
      cell: ({ row }) => row.original.name,
      headerClassName: "min-w-40",
      cellClassName: "min-w-40",
    },
    {
      accessorKey: "phone",
      header: ({ column }) => <SortableHeader<DrugSupplier> label="Phone" column={column} />,
      cell: ({ row }) => row.original.phone || "-",
      headerClassName: "min-w-28",
      cellClassName: "min-w-28",
    },
    {
      accessorKey: "gstIn",
      header: ({ column }) => <SortableHeader<DrugSupplier> label="GST" column={column} />,
      cell: ({ row }) => row.original.gstIn || "-",
      headerClassName: "min-w-32",
      cellClassName: "min-w-32",
    },
    {
      accessorKey: "createdAt",
      header: ({ column }) => (
        <SortableHeader<DrugSupplier> label="Created At" column={column} />
      ),
      cell: ({ row }) => format(row.original.createdAt, "dd/MM/yyyy"),
      headerClassName: "min-w-24",
      cellClassName: "min-w-24",
    },
    {
      id: "actions",
      header: () => <p>Action</p>,
      cell: ({ row }) => <Actions data={row.original} />,
      headerClassName: "min-w-24",
      cellClassName: "min-w-24",
    },
  ];

  return (
    <CustomLayout title="Supplier Ledgers">
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
            getRowId={(row) => String(row.id)}
            enableSorting
          />
        </>
      ) : (
        <NoPermission />
      )}
    </CustomLayout>
  );
};

export default SupplierLedgers;
