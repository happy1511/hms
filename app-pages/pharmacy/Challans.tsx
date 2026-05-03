"use client";

import CustomActionDropdown, {
  DropdownItem,
} from "@/components/common/CustomActionDropdown";
import CustomButton from "@/components/common/CustomButton";
import CustomFilters from "@/components/common/CustomFilters";
import CustomLayout from "@/components/common/CustomLayout";
import { CustomTable } from "@/components/common/CustomTable";
import NoPermission from "@/components/common/NoPermission";
import { SortableHeader } from "@/components/common/SortableHeader";
import { ActionType, ModuleType } from "@/generated/prisma/enums";
import { useProfile } from "@/hooks/query/auth";
import { useChallanList } from "@/hooks/query/pharmacyChallan";
import {
  ColumnDefWithClass,
  FilterConfig,
  FilterValues,
  PharmacyChallanType,
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
    <CustomButton onClick={() => router.push("/pharmacy/form/challan/new")}>
      New Challan
    </CustomButton>
  );
};

const Actions = ({
  data,
  canCreateGrn,
}: {
  data: PharmacyChallanType;
  canCreateGrn: boolean;
}) => {
  const router = useRouter();
  const items: DropdownItem[] = [];

  if (data.grn?.id) {
    items.push({
      label: "Open GRN",
      onClick: () => router.push(`/pharmacy/grn/print/${data.grn?.id}`),
    });
  } else if (canCreateGrn) {
    items.push({
      label: "Create GRN",
      onClick: () => router.push(`/pharmacy/form/grn/challan/${data.id}`),
    });
  }

  if (!items.length) {
    return null;
  }

  return <CustomActionDropdown triggerLabel="Actions" groups={[{ items }]} />;
};

const Challans = () => {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [filters, setFilters] = useState<FilterValues>({});

  const { data: profile } = useProfile(false);
  const { data, isLoading, isFetching, refetch, isError, error } =
    useChallanList(filters, page, limit);

  if (!profile) {
    return <div />;
  }

  const canView = hasActionPermission(
    profile.data,
    ModuleType.PHARMACY_CHALLAN,
    ActionType.VIEW,
  );
  const canCreate = hasActionPermission(
    profile.data,
    ModuleType.PHARMACY_CHALLAN,
    ActionType.CREATE,
  );
  const canCreateGrn = hasActionPermission(
    profile.data,
    ModuleType.PHARMACY_GRN,
    ActionType.CREATE,
  );

  const columns: ColumnDefWithClass<PharmacyChallanType>[] = [
    {
      id: "serial",
      header: ({ column }) => (
        <SortableHeader<PharmacyChallanType> label="No." column={column} />
      ),
      cell: ({ row }) => <span>#{row.index + 1}</span>,
      headerClassName: "min-w-16",
      cellClassName: "min-w-16",
    },
    {
      accessorKey: "supplier.name",
      header: ({ column }) => (
        <SortableHeader<PharmacyChallanType> label="Supplier" column={column} />
      ),
      cell: ({ row }) => row.original.supplier.name,
      headerClassName: "min-w-40",
      cellClassName: "min-w-40",
    },
    {
      accessorKey: "challanNumber",
      header: ({ column }) => (
        <SortableHeader<PharmacyChallanType>
          label="Challan No."
          column={column}
        />
      ),
      cell: ({ row }) => row.original.challanNumber,
      headerClassName: "min-w-28",
      cellClassName: "min-w-28",
    },
    {
      accessorKey: "invoiceNumber",
      header: ({ column }) => (
        <SortableHeader<PharmacyChallanType>
          label="Invoice No."
          column={column}
        />
      ),
      cell: ({ row }) => row.original.invoiceNumber,
      headerClassName: "min-w-28",
      cellClassName: "min-w-28",
    },
    {
      accessorKey: "invoiceDate",
      header: ({ column }) => (
        <SortableHeader<PharmacyChallanType>
          label="Invoice Date"
          column={column}
        />
      ),
      cell: ({ row }) => format(row.original.invoiceDate, "MMM dd, yyyy"),
      headerClassName: "min-w-28",
      cellClassName: "min-w-28",
    },
    {
      id: "totalItems",
      header: ({ column }) => (
        <SortableHeader<PharmacyChallanType>
          label="Total Items"
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
        <SortableHeader<PharmacyChallanType>
          label="Taxable Amt."
          column={column}
        />
      ),
      cell: ({ row }) => Number(row.original.taxableAmount || 0).toFixed(2),
      headerClassName: "min-w-26",
      cellClassName: "min-w-26",
    },
    {
      accessorKey: "grandTotal",
      header: ({ column }) => (
        <SortableHeader<PharmacyChallanType>
          label="Total Amount"
          column={column}
        />
      ),
      cell: ({ row }) => Number(row.original.grandTotal || 0).toFixed(2),
      headerClassName: "min-w-26",
      cellClassName: "min-w-26",
    },
    {
      id: "grn",
      header: ({ column }) => (
        <SortableHeader<PharmacyChallanType> label="GRN" column={column} />
      ),
      cell: ({ row }) => row.original.grn?.id || "-",
      headerClassName: "min-w-18",
      cellClassName: "min-w-18",
    },
    {
      id: "actions",
      header: () => <p>Action</p>,
      cell: ({ row }) => (
        <Actions
          data={row.original}
          canCreateGrn={Boolean(canCreateGrn)}
        />
      ),
      headerClassName: "min-w-24",
      cellClassName: "min-w-24",
    },
  ];

  return (
    <CustomLayout
      title="Challans"
      buttons={<Buttons canCreate={Boolean(canCreate)} />}
    >
      {canView && (
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
            enableSorting
            limit={limit}
            handleChangePage={setPage}
            isLoading={isLoading}
            handleChangeLimit={setLimit}
            getRowId={(row) => String(row.id)}
            isError={isError}
            error={error}
          />
        </>
      )}
      {!canView && <NoPermission />}
    </CustomLayout>
  );
};

export default Challans;
