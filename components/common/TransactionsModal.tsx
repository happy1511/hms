import { Transaction } from "@/generated/prisma/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Eye } from "lucide-react";
import { CustomTable } from "./CustomTable";
import { ColumnDefWithClass } from "@/lib/type";
import { SortableHeader } from "./SortableHeader";
import { useProfile } from "@/hooks/query/auth";
import { hasActionPermission } from "@/lib/utils";
import Link from "next/link";
import { ActionType, ModuleType } from "@/generated/prisma/enums";

interface Props {
  data: Transaction[];
  patientName: string;
  billId: number;
  printModule?: ModuleType;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger?: React.ReactNode;
}

const TransactionsModal = ({
  billId,
  data,
  open,
  onOpenChange,
  printModule,
  trigger,
  patientName,
}: Props) => {
  const { data: profile } = useProfile(false);

  if (!profile) {
    return <div />;
  }

  const canPrint = printModule
    ? hasActionPermission(profile?.data, printModule, ActionType.PRINT)
    : false;

  const columns: ColumnDefWithClass<Transaction>[] = [
    {
      accessorKey: "srn",
      header: ({ column }) => {
        return <SortableHeader<Transaction> label="ID" column={column} />;
      },
      cell: ({ row }) => <span>#{row.index + 1}</span>,
      headerClassName: "min-w-15 max-w-20",
      cellClassName: "min-w-15 max-w-20",
    },
    {
      accessorKey: "id",
      header: ({ column }) => {
        return (
          <SortableHeader<Transaction> label="Receipt Number" column={column} />
        );
      },
    },
    {
      accessorKey: "payment",
      header: ({ column }) => {
        return <SortableHeader<Transaction> label="Payment" column={column} />;
      },
      cell: ({ row }) => `₹ ${row.original.amount}`,
    },
    {
      accessorKey: "mode",
      header: "Payment Mode",
    },
    {
      id: "receivedBy",
      header: "Received By",
      cell: ({ row }) => (
        <span className="text-blue-500">{row.original.receivedById}</span>
      ),
    },
    {
      accessorKey: "remarks",
      header: "Remarks",
    },
  ];

  if (canPrint) {
    columns.push({
      id: "actions",
      header: () => <p>Action</p>,
      cell: ({ row }) => (
        <Link
          target="_blank"
          className="text-blue-400 hover:underline"
          href={`/invoice/transactions/${row.original.invoiceId}`}
        >
          Print
        </Link>
      ),
      headerClassName: "min-w-20 max-w-30",
      cellClassName: "min-w-20 max-w-30",
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button
            variant="outline"
            className="h-auto shadow-none p-1 cursor-pointer"
          >
            <Eye className="size-2.5 text-destructive" />
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="max-w-3xl! border-secondary border-4 bg-white">
        <DialogHeader>
          <DialogTitle className="text-black/60 text-sm">
            Payment History
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 max-h-[70dvh] overflow-y-auto text-tiny">
          <div className="flex items-center gap-2">
            <span className="bg-blue-400 px-2 text-white">{patientName}</span>
            <span className="bg-blue-400 px-2 text-white">
              Invoice Number: {billId}
            </span>
          </div>
          <CustomTable
            columns={columns}
            data={data}
            getRowId={(data) => String(data.id)}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TransactionsModal;
