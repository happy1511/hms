"use client";

import CustomButton from "@/components/common/CustomButton";
import { CustomTable } from "@/components/common/CustomTable";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ColumnDefWithClass, PharmacyPurchaseOrderType } from "@/lib/type";
import { useRouter } from "next/navigation";

type PurchaseOrderWithItems = PharmacyPurchaseOrderType;

type PurchaseOrderItem = PurchaseOrderWithItems["items"][number];

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order: PurchaseOrderWithItems;
};

const money = (value: number) => Number(value || 0).toFixed(2);

const PurchaseOrderItemsModal = ({ open, onOpenChange, order }: Props) => {
  const router = useRouter();

  const columns: ColumnDefWithClass<PurchaseOrderItem>[] = [
    {
      accessorKey: "drug.name",
      header: () => <button className="flex">Item Name</button>,
      cell: ({ row }) => row.original.drug.name,
      headerClassName: "min-w-36",
      cellClassName: "min-w-36",
    },
    {
      accessorKey: "category.name",
      header: () => <button className="flex">Category</button>,
      cell: ({ row }) => row.original.category?.name || "-",
      headerClassName: "min-w-28",
      cellClassName: "min-w-28",
    },
    {
      accessorKey: "hsnSacCode",
      header: () => <button className="flex">HSNSAC</button>,
      cell: ({ row }) => row.original.hsnSacCode ?? row.original.hsnSac?.code ?? "-",
      headerClassName: "min-w-22",
      cellClassName: "min-w-22",
    },
    {
      accessorKey: "quantity",
      header: () => <button className="flex">Qty</button>,
      cell: ({ row }) => row.original.quantity,
      headerClassName: "min-w-16",
      cellClassName: "min-w-16",
    },
    {
      accessorKey: "rate",
      header: () => <button className="flex">Rate</button>,
      cell: ({ row }) => money(row.original.rate),
      headerClassName: "min-w-18",
      cellClassName: "min-w-18",
    },
    {
      accessorKey: "gstPercentage",
      header: () => <button className="flex">GST(%)</button>,
      cell: ({ row }) =>
        Number(
          (row.original.hsnSac?.cGstPercentage ?? 0) +
            (row.original.hsnSac?.sGstPercentage ?? 0) +
            (row.original.hsnSac?.iGstPercentage ?? 0),
        ),
      headerClassName: "min-w-18",
      cellClassName: "min-w-18",
    },
    {
      accessorKey: "cGstPercentage",
      header: () => <button className="flex">CGST(%)</button>,
      cell: ({ row }) =>
        row.original.hsnSac?.cGstPercentage ?? 0,
      headerClassName: "min-w-18",
      cellClassName: "min-w-18",
    },
    {
      accessorKey: "sGstPercentage",
      header: () => <button className="flex">SGST(%)</button>,
      cell: ({ row }) =>
        row.original.hsnSac?.sGstPercentage ?? 0,
      headerClassName: "min-w-18",
      cellClassName: "min-w-18",
    },
    {
      accessorKey: "iGstPercentage",
      header: () => <button className="flex">IGST(%)</button>,
      cell: ({ row }) =>
        row.original.hsnSac?.iGstPercentage ?? 0,
      headerClassName: "min-w-18",
      cellClassName: "min-w-18",
    },
    {
      accessorKey: "total",
      header: () => <button className="flex">Total</button>,
      cell: ({ row }) => money(row.original.total),
      headerClassName: "min-w-20",
      cellClassName: "min-w-20",
    },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-7xl! border-secondary border-4 bg-white">
        <DialogHeader>
          <DialogTitle className="text-sm text-black/70">
            PO Items - #{order.id}
          </DialogTitle>
        </DialogHeader>

        <div className="max-h-[70vh] overflow-auto">
          <CustomTable
            columns={columns}
            data={order.items}
            hidePagination
            getRowId={(item) => String(item.id)}
          />
        </div>

        <DialogFooter>
          <CustomButton
            onClick={() => {
              onOpenChange(false);
              router.push(`/pharmacy/form/grn/${order.id}`);
            }}
          >
            Create GRN with PO
          </CustomButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PurchaseOrderItemsModal;
