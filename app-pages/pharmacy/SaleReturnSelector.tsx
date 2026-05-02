"use client";

import CustomButton from "@/components/common/CustomButton";
import CustomLayout from "@/components/common/CustomLayout";
import { CustomTable } from "@/components/common/CustomTable";
import NoPermission from "@/components/common/NoPermission";
import { SortableHeader } from "@/components/common/SortableHeader";
import { Input } from "@/components/ui/input";
import { ActionType, ModuleType } from "@/generated/prisma/enums";
import { useProfile } from "@/hooks/query/auth";
import { useSaleBillList } from "@/hooks/query/pharmacySaleBill";
import { ColumnDefWithClass, PharmacySaleBillType } from "@/lib/type";
import { hasActionPermission } from "@/lib/utils";
import { format } from "date-fns";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

const toPieces = (
  quantity: number,
  isLooseQuantity: boolean,
  packSize: number,
) => (isLooseQuantity ? Number(quantity || 0) : Number(quantity || 0) * packSize);

const formatQty = ({
  pieces,
  packSize,
}: {
  pieces: number;
  packSize: number;
}) => {
  if (pieces <= 0) return "0";
  const packs = Math.floor(pieces / packSize);
  const loose = pieces % packSize;
  if (!loose) return `${packs} pack`;
  if (!packs) return `${loose} pcs`;
  return `${packs} pack + ${loose} pcs`;
};

const SaleReturnSelector = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: profile } = useProfile(false);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState(searchParams.get("billId") ?? "");
  const [selectedBill, setSelectedBill] = useState<PharmacySaleBillType | null>(
    null,
  );

  const { data, isLoading, isError, error } = useSaleBillList(
    { name: search },
    page,
    limit,
  );

  useEffect(() => {
    const billId = searchParams.get("billId");
    if (!billId || !data?.data?.length) return;
    const matched = data.data.find((bill) => String(bill.id) === billId);
    if (matched) {
      setSelectedBill(matched);
    }
  }, [data?.data, searchParams]);

  const rows = data?.data ?? [];
  const columns: ColumnDefWithClass<PharmacySaleBillType>[] = [
    {
      accessorKey: "id",
      header: ({ column }) => (
        <SortableHeader<PharmacySaleBillType> label="Bill ID" column={column} />
      ),
      cell: ({ row }) => `#${row.original.id}`,
      headerClassName: "min-w-20",
      cellClassName: "min-w-20",
    },
    {
      accessorKey: "name",
      header: ({ column }) => (
        <SortableHeader<PharmacySaleBillType> label="Customer" column={column} />
      ),
      cell: ({ row }) => row.original.customer?.name ?? row.original.name,
      headerClassName: "min-w-48",
      cellClassName: "min-w-48",
    },
    {
      accessorKey: "createdAt",
      header: ({ column }) => (
        <SortableHeader<PharmacySaleBillType> label="Bill Date" column={column} />
      ),
      cell: ({ row }) =>
        format(new Date(row.original.invoice.createdAt), "dd/MM/yyyy"),
      headerClassName: "min-w-28",
      cellClassName: "min-w-28",
    },
    {
      accessorKey: "items",
      header: ({ column }) => (
        <SortableHeader<PharmacySaleBillType> label="Items" column={column} />
      ),
      cell: ({ row }) => row.original.saleItems.length,
      headerClassName: "min-w-16",
      cellClassName: "min-w-16",
    },
    {
      accessorKey: "amount",
      header: ({ column }) => (
        <SortableHeader<PharmacySaleBillType> label="Total" column={column} />
      ),
      cell: ({ row }) => Number(row.original.invoice.total || 0).toFixed(2),
      headerClassName: "min-w-24",
      cellClassName: "min-w-24",
    },
    {
      id: "actions",
      header: () => <span>Actions</span>,
      cell: ({ row }) => (
        <div className="flex gap-2">
          <CustomButton
            type="button"
            variant="secondary"
            onClick={() => setSelectedBill(row.original)}
          >
            View Items
          </CustomButton>
          <CustomButton
            type="button"
            onClick={() => router.push(`/pharmacy/sale-return/${row.original.id}`)}
          >
            Confirm
          </CustomButton>
        </div>
      ),
      headerClassName: "min-w-40",
      cellClassName: "min-w-40",
    },
  ];

  const previewRows = useMemo(() => {
    if (!selectedBill) return [];

    return selectedBill.saleItems.map((item) => {
      const packSize = Math.max(Number(item.inventoryItem.itemsPerPack || 1), 1);
      const soldPieces = toPieces(
        Number(item.quantity || 0),
        Boolean(item.isLooseQuantity),
        packSize,
      );
      const returnedPieces = selectedBill.saleReturns
        .flatMap((saleReturn) => saleReturn.items)
        .filter((returnItem) => returnItem.drugSaleItemId === item.id)
        .reduce(
          (sum, returnItem) =>
            sum +
            toPieces(
              Number(returnItem.quantity || 0),
              Boolean(returnItem.isLooseQuantity),
              packSize,
            ),
          0,
        );

      return {
        id: item.id,
        name: item.inventoryItem.drug.name,
        batchNo: item.inventoryItem.batchNo,
        sold: formatQty({ pieces: soldPieces, packSize }),
        returned: formatQty({ pieces: returnedPieces, packSize }),
        available: formatQty({
          pieces: Math.max(soldPieces - returnedPieces, 0),
          packSize,
        }),
        rate: Number(item.rate || 0).toFixed(2),
      };
    });
  }, [selectedBill]);

  if (!profile) {
    return <div />;
  }

  const canCreate = hasActionPermission(
    profile.data,
    ModuleType.PHARMACY_SALE_RETURN,
    ActionType.CREATE,
  );

  if (!canCreate) {
    return (
      <CustomLayout title="Select Sale Bill For Return">
        <NoPermission />
      </CustomLayout>
    );
  }

  return (
    <CustomLayout title="Select Sale Bill For Return">
      <div className="space-y-4">
        <div className="grid gap-3 md:grid-cols-[minmax(0,360px)_auto] md:items-end">
          <div>
            <div className="mb-1 text-sm font-medium">Search Sale Bill</div>
            <Input
              value={search}
              onChange={(event) => {
                setPage(1);
                setSearch(event.target.value);
              }}
              placeholder="Search by bill id, customer or patient"
            />
          </div>
          <div className="text-sm text-muted-foreground">
            Pick a sale bill, review the items, then continue to enter return quantities.
          </div>
        </div>

        <CustomTable
          columns={columns}
          data={rows}
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

        {selectedBill ? (
          <div className="rounded-md border border-black/15 bg-white">
            <div className="flex items-center justify-between border-b px-4 py-3">
              <div>
                <div className="text-sm font-semibold">
                  Bill #{selectedBill.id}
                </div>
                <div className="text-sm text-muted-foreground">
                  {selectedBill.customer?.name ?? selectedBill.name}
                </div>
              </div>
              <CustomButton
                type="button"
                onClick={() => router.push(`/pharmacy/sale-return/${selectedBill.id}`)}
              >
                Continue To Return Form
              </CustomButton>
            </div>

            <div className="overflow-auto">
              <table className="w-full min-w-[900px] border-collapse text-sm">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="border-b px-3 py-2 text-left">Item</th>
                    <th className="border-b px-3 py-2 text-left">Batch</th>
                    <th className="border-b px-3 py-2 text-left">Sold</th>
                    <th className="border-b px-3 py-2 text-left">Returned</th>
                    <th className="border-b px-3 py-2 text-left">Returnable</th>
                    <th className="border-b px-3 py-2 text-left">Rate</th>
                  </tr>
                </thead>
                <tbody>
                  {previewRows.map((row) => (
                    <tr key={row.id} className="border-b last:border-b-0">
                      <td className="px-3 py-2">{row.name}</td>
                      <td className="px-3 py-2">{row.batchNo}</td>
                      <td className="px-3 py-2">{row.sold}</td>
                      <td className="px-3 py-2">{row.returned}</td>
                      <td className="px-3 py-2">{row.available}</td>
                      <td className="px-3 py-2">{row.rate}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="rounded-md border border-dashed px-4 py-6 text-sm text-muted-foreground">
            Choose a sale bill to preview its items before opening the return form.
          </div>
        )}
      </div>
    </CustomLayout>
  );
};

export default SaleReturnSelector;
