"use client";

import CustomButton from "@/components/common/CustomButton";
import CustomFilters from "@/components/common/CustomFilters";
import CustomLayout from "@/components/common/CustomLayout";
import { CustomTable } from "@/components/common/CustomTable";
import NoPermission from "@/components/common/NoPermission";
import { SortableHeader } from "@/components/common/SortableHeader";
import { SupplierPaymentType, ActionType, ModuleType } from "@/generated/prisma/enums";
import { useProfile } from "@/hooks/query/auth";
import { useSupplierPaymentList } from "@/hooks/query/pharmacySupplierPayment";
import {
  ColumnDefWithClass,
  FilterConfig,
  FilterValues,
  PharmacySupplierPaymentType,
} from "@/lib/type";
import { hasActionPermission } from "@/lib/utils";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import { useState } from "react";

type Props = {
  type: SupplierPaymentType;
  title: string;
  createPath: string;
  permissionModule: ModuleType;
  createLabel: string;
};

const neededFilters: FilterConfig<FilterValues>[] = [
  { label: "Search", valueKey: "name", type: "text" },
  { label: "Created Date", valueKey: "createdAt", type: "dateRange" },
];

const money = (value: number) => Number(value || 0).toFixed(2);

const Buttons = ({
  canCreate,
  createPath,
  createLabel,
}: {
  canCreate: boolean;
  createPath: string;
  createLabel: string;
}) => {
  const router = useRouter();

  if (!canCreate) return null;

  return <CustomButton onClick={() => router.push(createPath)}>{createLabel}</CustomButton>;
};

const SupplierLedgerEntries = ({
  type,
  title,
  createPath,
  permissionModule,
  createLabel,
}: Props) => {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [filters, setFilters] = useState<FilterValues>({});
  const { data: profile } = useProfile(false);
  const { data, isLoading, isFetching, refetch, isError, error } =
    useSupplierPaymentList(filters, page, limit, type);

  if (!profile) {
    return <div />;
  }

  const canView = hasActionPermission(profile.data, permissionModule, ActionType.VIEW);
  const canCreate = hasActionPermission(
    profile.data,
    permissionModule,
    ActionType.CREATE,
  );

  const columns: ColumnDefWithClass<PharmacySupplierPaymentType>[] = [
    {
      accessorKey: "paymentDate",
      header: ({ column }) => (
        <SortableHeader<PharmacySupplierPaymentType> label="Date" column={column} />
      ),
      cell: ({ row }) => format(row.original.paymentDate, "dd/MM/yyyy"),
      headerClassName: "min-w-24",
      cellClassName: "min-w-24",
    },
    {
      accessorKey: "supplier",
      header: ({ column }) => (
        <SortableHeader<PharmacySupplierPaymentType> label="Supplier" column={column} />
      ),
      cell: ({ row }) => row.original.supplier.name,
      headerClassName: "min-w-40",
      cellClassName: "min-w-40",
    },
    {
      accessorKey: "amount",
      header: ({ column }) => (
        <SortableHeader<PharmacySupplierPaymentType> label="Amount" column={column} />
      ),
      cell: ({ row }) => money(row.original.amount),
      headerClassName: "min-w-24",
      cellClassName: "min-w-24",
    },
    {
      accessorKey: "reference",
      header: ({ column }) => (
        <SortableHeader<PharmacySupplierPaymentType> label="Reference" column={column} />
      ),
      cell: ({ row }) => row.original.reference || "-",
      headerClassName: "min-w-48",
      cellClassName: "min-w-48",
    },
    {
      id: "allocations",
      header: ({ column }) => (
        <SortableHeader<PharmacySupplierPaymentType>
          label={type === SupplierPaymentType.DEBIT ? "Adjusted Bills" : "Entries"}
          column={column}
        />
      ),
      cell: ({ row }) =>
        type === SupplierPaymentType.DEBIT ? row.original.allocations.length : "-",
      headerClassName: "min-w-20",
      cellClassName: "min-w-20",
    },
  ];

  return (
    <CustomLayout
      title={title}
      buttons={
        <Buttons
          canCreate={Boolean(canCreate)}
          createPath={createPath}
          createLabel={createLabel}
        />
      }
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

export default SupplierLedgerEntries;
