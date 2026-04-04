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
        <SortableHeader<InventoryData> label="Item Code" column={column} />
      ),
      cell: ({ row }) => <span>{row.original.id}</span>,
      headerClassName: "min-w-20",
      cellClassName: "min-w-20",
    },
    {
      accessorKey: "item",
      header: ({ column }) => (
        <SortableHeader<InventoryData> label="Item" column={column} />
      ),
      cell: ({ row }) => row.original.drug.name,
      headerClassName: "min-w-40",
      cellClassName: "min-w-40",
    },
    {
      accessorKey: "manufacturer",
      header: ({ column }) => (
        <SortableHeader<InventoryData> label="Mfg" column={column} />
      ),
      cell: ({ row }) => row.original.drug.manufacturer,
      headerClassName: "min-w-32",
      cellClassName: "min-w-32",
    },
    {
      accessorKey: "hsn",
      header: ({ column }) => (
        <SortableHeader<InventoryData> label="HSN" column={column} />
      ),
      cell: ({ row }) => row.original.drug.hsnCode,
      headerClassName: "min-w-16",
      cellClassName: "min-w-16",
    },
    {
      accessorKey: "batchNo",
      header: ({ column }) => (
        <SortableHeader<InventoryData> label="Batch" column={column} />
      ),
      headerClassName: "min-w-20",
      cellClassName: "min-w-20",
    },
    {
      accessorKey: "expiryDate",
      header: ({ column }) => (
        <SortableHeader<InventoryData> label="Exp" column={column} />
      ),
      cell: ({ row }) => format(row.original.expiryDate, "MM/yy"),
      headerClassName: "min-w-16",
      cellClassName: "min-w-16",
    },
    {
      accessorKey: "pack",
      header: ({ column }) => (
        <SortableHeader<InventoryData> label="Pack" column={column} />
      ),
      cell: ({ row }) => row.original.drug.unit,
      headerClassName: "min-w-16",
      cellClassName: "min-w-16",
    },
    {
      accessorKey: "quantityInStock",
      header: ({ column }) => (
        <SortableHeader<InventoryData> label="Qty" column={column} />
      ),
      headerClassName: "min-w-20",
      cellClassName: "min-w-20",
    },
    {
      accessorKey: "sellingPrice",
      header: ({ column }) => (
        <SortableHeader<InventoryData> label="Selling Price" column={column} />
      ),
      cell: ({ row }) => Number(row.original.sellingPrice || 0).toFixed(2),
      headerClassName: "min-w-24",
      cellClassName: "min-w-24",
    },
    {
      accessorKey: "wholeSalePrice",
      header: ({ column }) => (
        <SortableHeader<InventoryData>
          label="Whole Sale Price"
          column={column}
        />
      ),
      cell: ({ row }) => Number(row.original.wholeSalePrice || 0).toFixed(2),
      headerClassName: "min-w-28",
      cellClassName: "min-w-28",
    },
  ];

  return (
    <CustomLayout title="Inventory">
      {canView && (
        <>
          <CustomFilters<FilterValues>
            filters={neededFilters}
            onSubmit={setFilters}
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

export default InventoryList;
