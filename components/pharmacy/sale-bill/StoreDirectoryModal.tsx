"use client";

import CustomButton from "@/components/common/CustomButton";
import { CustomTable } from "@/components/common/CustomTable";
import { SortableHeader } from "@/components/common/SortableHeader";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useInventoryItemsList } from "@/hooks/query/pharmacyInventory";
import {
  ColumnDefWithClass,
  FilterValues,
  PharmacyInventoryItemType,
} from "@/lib/type";
import { useState } from "react";

type InventoryDirectoryRow = PharmacyInventoryItemType;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const StoreDirectoryModal = ({ open, onOpenChange }: Props) => {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");
  const { data, isLoading } = useInventoryItemsList(
    { name: search } as FilterValues,
    page,
    limit,
  );

  const columns: ColumnDefWithClass<InventoryDirectoryRow>[] = [
    {
      accessorKey: "id",
      header: ({ column }) => (
        <SortableHeader<InventoryDirectoryRow> label="Item Code" column={column} />
      ),
      cell: ({ row }) => row.original.id,
      headerClassName: "min-w-20",
      cellClassName: "min-w-20",
    },
    {
      accessorKey: "drug",
      header: ({ column }) => (
        <SortableHeader<InventoryDirectoryRow> label="Drug" column={column} />
      ),
      cell: ({ row }) => row.original.drug.name,
      headerClassName: "min-w-40",
      cellClassName: "min-w-40",
    },
    {
      accessorKey: "mfg",
      header: ({ column }) => (
        <SortableHeader<InventoryDirectoryRow>
          label="Mfg"
          column={column}
        />
      ),
      cell: ({ row }) => row.original.drug.manufacturer,
      headerClassName: "min-w-32",
      cellClassName: "min-w-32",
    },
    {
      accessorKey: "hsn",
      header: ({ column }) => (
        <SortableHeader<InventoryDirectoryRow> label="HSN" column={column} />
      ),
      cell: ({ row }) =>
        row.original.hsnSac?.code || "-",
      headerClassName: "min-w-16",
      cellClassName: "min-w-16",
    },
    {
      accessorKey: "batchNo",
      header: ({ column }) => (
        <SortableHeader<InventoryDirectoryRow> label="Batch" column={column} />
      ),
      cell: ({ row }) => row.original.batchNo,
      headerClassName: "min-w-20",
      cellClassName: "min-w-20",
    },
    {
      accessorKey: "expiryDate",
      header: ({ column }) => (
        <SortableHeader<InventoryDirectoryRow> label="Exp" column={column} />
      ),
      cell: ({ row }) =>
        new Date(row.original.expiryDate).toLocaleDateString("en-GB", {
          month: "2-digit",
          year: "2-digit",
        }),
      headerClassName: "min-w-16",
      cellClassName: "min-w-16",
    },
    {
      accessorKey: "pack",
      header: ({ column }) => (
        <SortableHeader<InventoryDirectoryRow> label="Pack" column={column} />
      ),
      cell: ({ row }) => `${row.original.itemsPerPack} / ${row.original.drug.unit}`,
      headerClassName: "min-w-16",
      cellClassName: "min-w-16",
    },
    {
      accessorKey: "quantityInStock",
      header: ({ column }) => (
        <SortableHeader<InventoryDirectoryRow>
          label="Qty (pcs)"
          column={column}
        />
      ),
      cell: ({ row }) => row.original.quantityInStock,
      headerClassName: "min-w-24",
      cellClassName: "min-w-24",
    },
    {
      accessorKey: "sellingPrice",
      header: ({ column }) => (
        <SortableHeader<InventoryDirectoryRow>
          label="Selling Price"
          column={column}
        />
      ),
      cell: ({ row }) => Number(row.original.sellingPrice || 0).toFixed(2),
      headerClassName: "min-w-24",
      cellClassName: "min-w-24",
    },
    {
      accessorKey: "wholeSalePrice",
      header: ({ column }) => (
        <SortableHeader<InventoryDirectoryRow>
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl! border-secondary border-4 bg-white">
        <DialogHeader>
          <DialogTitle className="text-sm">Store Directory</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="flex gap-2">
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by drug or manufacturer"
              className="w-full rounded border px-2 py-1 text-tiny"
            />
            <CustomButton
              type="button"
              onClick={() => {
                setPage(1);
              }}
            >
              Search
            </CustomButton>
          </div>
          <CustomTable
            columns={columns}
            data={data?.data || []}
            page={page}
            total={data?.total}
            enableSorting
            limit={limit}
            handleChangePage={setPage}
            handleChangeLimit={setLimit}
            isLoading={isLoading}
            getRowId={(row) => String(row.id)}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default StoreDirectoryModal;
