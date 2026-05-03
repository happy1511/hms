"use client";

import CustomButton from "@/components/common/CustomButton";
import CustomFilters from "@/components/common/CustomFilters";
import CustomLayout from "@/components/common/CustomLayout";
import { CustomTable } from "@/components/common/CustomTable";
import NoPermission from "@/components/common/NoPermission";
import { SortableHeader } from "@/components/common/SortableHeader";
import { ActionType, ModuleType } from "@/generated/prisma/enums";
import { useProfile } from "@/hooks/query/auth";
import { useSupplierReturnList } from "@/hooks/query/pharmacySupplierReturn";
import {
  ColumnDefWithClass,
  FilterConfig,
  FilterValues,
  PharmacySupplierReturnType,
} from "@/lib/type";
import { hasActionPermission } from "@/lib/utils";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import { useState } from "react";

const neededFilters: FilterConfig<FilterValues>[] = [
  { label: "Search", valueKey: "name", type: "text" },
  { label: "Created Date", valueKey: "createdAt", type: "dateRange" },
];

const Buttons = ({ canCreate }: { canCreate: boolean }) => {
  const router = useRouter();

  if (!canCreate) {
    return null;
  }

  return (
    <CustomButton onClick={() => router.push("/pharmacy/form/supplier-return/new")}>
      New Supplier Return
    </CustomButton>
  );
};

const money = (value: number) => Number(value || 0).toFixed(2);

const SupplierReturns = () => {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [filters, setFilters] = useState<FilterValues>({});
  const { data: profile } = useProfile(false);
  const { data, isLoading, isFetching, refetch, isError, error } =
    useSupplierReturnList(filters, page, limit);

  if (!profile) {
    return <div />;
  }

  const canView = hasActionPermission(
    profile.data,
    ModuleType.PHARMACY_SUPPLIER_RETURN,
    ActionType.VIEW,
  );
  const canCreate = hasActionPermission(
    profile.data,
    ModuleType.PHARMACY_SUPPLIER_RETURN,
    ActionType.CREATE,
  );

  const columns: ColumnDefWithClass<PharmacySupplierReturnType>[] = [
    {
      accessorKey: "returnDate",
      header: ({ column }) => (
        <SortableHeader<PharmacySupplierReturnType> label="Date" column={column} />
      ),
      cell: ({ row }) => format(row.original.returnDate, "dd/MM/yyyy"),
      headerClassName: "min-w-24",
      cellClassName: "min-w-24",
    },
    {
      accessorKey: "supplier",
      header: ({ column }) => (
        <SortableHeader<PharmacySupplierReturnType>
          label="Supplier"
          column={column}
        />
      ),
      cell: ({ row }) => row.original.supplier.name,
      headerClassName: "min-w-40",
      cellClassName: "min-w-40",
    },
    {
      accessorKey: "returnReason",
      header: ({ column }) => (
        <SortableHeader<PharmacySupplierReturnType>
          label="Return Reason"
          column={column}
        />
      ),
      cell: ({ row }) => row.original.returnReason || "-",
      headerClassName: "min-w-48",
      cellClassName: "min-w-48",
    },
    {
      id: "items",
      header: ({ column }) => (
        <SortableHeader<PharmacySupplierReturnType>
          label="Items"
          column={column}
        />
      ),
      cell: ({ row }) => row.original.items.length,
      headerClassName: "min-w-20",
      cellClassName: "min-w-20",
    },
    {
      accessorKey: "taxableAmount",
      header: ({ column }) => (
        <SortableHeader<PharmacySupplierReturnType>
          label="Taxable"
          column={column}
        />
      ),
      cell: ({ row }) => money(row.original.taxableAmount),
      headerClassName: "min-w-24",
      cellClassName: "min-w-24",
    },
    {
      accessorKey: "total",
      header: ({ column }) => (
        <SortableHeader<PharmacySupplierReturnType> label="Total" column={column} />
      ),
      cell: ({ row }) => money(row.original.total),
      headerClassName: "min-w-24",
      cellClassName: "min-w-24",
    },
  ];

  return (
    <CustomLayout
      title="Supplier Returns"
      buttons={<Buttons canCreate={Boolean(canCreate)} />}
    >
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

export default SupplierReturns;
