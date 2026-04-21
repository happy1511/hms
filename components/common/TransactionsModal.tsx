import { ActionType, ModuleType } from "@/generated/prisma/enums";
import { useProfile } from "@/hooks/query/auth";
import { getSignedTransactionAmount } from "@/lib/invoiceTransactions";
import { ColumnDefWithClass, PaymentTransaction } from "@/lib/type";
import { hasActionPermission } from "@/lib/utils";
import Link from "next/link";
import { Eye } from "lucide-react";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { CustomTable } from "./CustomTable";
import { SortableHeader } from "./SortableHeader";

interface Props {
  data: PaymentTransaction[];
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

  const columns: ColumnDefWithClass<PaymentTransaction>[] = [
    {
      accessorKey: "srn",
      header: ({ column }) => {
        return (
          <SortableHeader<PaymentTransaction> label="ID" column={column} />
        );
      },
      cell: ({ row }) => <span>#{row.index + 1}</span>,
      headerClassName: "min-w-15 max-w-20",
      cellClassName: "min-w-15 max-w-20",
    },
    {
      accessorKey: "id",
      header: ({ column }) => {
        return (
          <SortableHeader<PaymentTransaction>
            label="Receipt Number"
            column={column}
          />
        );
      },
    },
    {
      accessorKey: "transactionType",
      header: ({ column }) => {
        return (
          <SortableHeader<PaymentTransaction> label="Type" column={column} />
        );
      },
    },
    {
      accessorKey: "payment",
      header: ({ column }) => {
        return (
          <SortableHeader<PaymentTransaction> label="Amount" column={column} />
        );
      },
      cell: ({ row }) =>
        `Rs. ${getSignedTransactionAmount(row.original).toFixed(2)}`,
    },
    {
      accessorKey: "mode",
      header: "Payment Mode",
    },
    {
      id: "receivedBy",
      header: "Received By",
      cell: ({ row }) => (
        <span className="text-blue-500">{row.original.receivedBy.name}</span>
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
            className="h-auto cursor-pointer p-1 shadow-none"
          >
            <Eye className="size-2.5 text-destructive" />
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="max-w-3xl! border-4 border-secondary bg-white">
        <DialogHeader>
          <DialogTitle className="text-sm text-black/60">
            Transaction History
          </DialogTitle>
        </DialogHeader>

        <div className="max-h-[70dvh] space-y-4 overflow-y-auto text-tiny">
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
