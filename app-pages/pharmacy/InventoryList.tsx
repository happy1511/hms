"use client";

import CustomFilters from "@/components/common/CustomFilters";
import CustomLayout from "@/components/common/CustomLayout";
import { CustomTable } from "@/components/common/CustomTable";
import NoPermission from "@/components/common/NoPermission";
import { SortableHeader } from "@/components/common/SortableHeader";
import { ActionType, ModuleType } from "@/generated/prisma/enums";
import { InventoryItemsGetPayload } from "@/generated/prisma/models";
import { useProfile } from "@/hooks/query/auth";
import { useInventoryItemsList } from "@/hooks/query/pharmacyInventory";
import { ColumnDefWithClass, FilterConfig, FilterValues } from "@/lib/type";
import { hasActionPermission } from "@/lib/utils";
import { format } from "date-fns";
import { useState } from "react";

type InventoryData = InventoryItemsGetPayload<{
  include: {
    drug: true;
    supplier: true;
  };
}>;

const neededFilters: FilterConfig<FilterValues>[] = [
  { label: "Search", valueKey: "name", type: "text" },
];

const InventoryList = () => {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [filters, setFilters] = useState<FilterValues>({});

  const { data: profile } = useProfile(false);
  const { data, isLoading, isError, error } = useInventoryItemsList(
    filters,
    page,
    limit,
  );

  if (!profile) {
    return <div />;
  }

  const canView = Boolean(
    hasActionPermission(
      profile.data,
      ModuleType.PHARMACY_INVENTORY,
      ActionType.VIEW,
    ),
  );

  const columns: ColumnDefWithClass<InventoryData>[] = [
    {
      accessorKey: "id",
      header: ({ column }) => (
        <SortableHeader<InventoryData> label="ID" column={column} />
      ),
      cell: ({ row }) => <span>#{row.original.id}</span>,
      headerClassName: "min-w-15 max-w-20",
      cellClassName: "min-w-15 max-w-20",
    },
    {
      accessorKey: "drug",
      header: ({ column }) => (
        <SortableHeader<InventoryData> label="Drug" column={column} />
      ),
      cell: ({ row }) => row.original.drug.name,
      headerClassName: "min-w-40",
      cellClassName: "min-w-40",
    },
    {
      accessorKey: "supplier",
      header: ({ column }) => (
        <SortableHeader<InventoryData> label="Supplier" column={column} />
      ),
      cell: ({ row }) => row.original.supplier.name,
      headerClassName: "min-w-40",
      cellClassName: "min-w-40",
    },
    {
      accessorKey: "batchNo",
      header: ({ column }) => (
        <SortableHeader<InventoryData> label="Batch" column={column} />
      ),
      headerClassName: "min-w-20 max-w-30",
      cellClassName: "min-w-20 max-w-30",
    },
    {
      accessorKey: "quantityInStock",
      header: ({ column }) => (
        <SortableHeader<InventoryData> label="In Stock" column={column} />
      ),
      headerClassName: "min-w-20 max-w-30",
      cellClassName: "min-w-20 max-w-30",
    },
    {
      accessorKey: "mrp",
      header: ({ column }) => (
        <SortableHeader<InventoryData> label="MRP" column={column} />
      ),
      headerClassName: "min-w-20 max-w-30",
      cellClassName: "min-w-20 max-w-30",
    },
    {
      accessorKey: "sellingPrice",
      header: ({ column }) => (
        <SortableHeader<InventoryData> label="Selling" column={column} />
      ),
      headerClassName: "min-w-20 max-w-30",
      cellClassName: "min-w-20 max-w-30",
    },
    {
      accessorKey: "expiryDate",
      header: ({ column }) => (
        <SortableHeader<InventoryData> label="Expiry" column={column} />
      ),
      cell: ({ row }) => format(row.original.expiryDate, "MMM dd, yyyy"),
      headerClassName: "min-w-30 max-w-40",
      cellClassName: "min-w-30 max-w-40",
    },
  ];

  return (
    <CustomLayout title="Inventory">
      {canView && (
        <>
          <CustomFilters<FilterValues>
            filters={neededFilters}
            onSubmit={setFilters}
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

export default InventoryList;
