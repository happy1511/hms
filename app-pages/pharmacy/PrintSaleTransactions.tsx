"use client";

import TransactionReceiptExport from "@/components/common/TransactionReceiptExport";
import { TransactionType } from "@/generated/prisma/enums";
import { useGetSaleBill } from "@/hooks/query/pharmacySaleBill";
import { LoaderIcon } from "lucide-react";
import { useParams, useSearchParams } from "next/navigation";

const PrintSaleTransactions = () => {
  const { billId }: { billId: string } = useParams();
  const searchParams = useSearchParams();
  const { data, isLoading } = useGetSaleBill(billId);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <LoaderIcon className="size-4 animate-spin" />
      </div>
    );
  }

  if (!data) return <div />;

  const transactionIdParam = searchParams.get("transactionId");
  const selectedTransactionId =
    transactionIdParam && transactionIdParam.trim() !== ""
      ? Number(transactionIdParam)
      : undefined;
  const filteredTransactions =
    selectedTransactionId !== undefined && Number.isFinite(selectedTransactionId)
      ? data.invoice.transactions.filter((txn) => txn.id === selectedTransactionId)
      : data.invoice.transactions.filter(
          (txn) => txn.transactionType === TransactionType.PAYMENT,
        );

  return (
    <TransactionReceiptExport
      customer={{
        name: data.patient
          ? `${data.patient.firstName} ${data.patient.lastName}`
          : data.customer?.name || "Walk-in Customer",
        phone: "",
        address: "",
      }}
      receipt={{
        number:
          filteredTransactions.length === 1
            ? `SB-RCPT-${filteredTransactions[0].id}`
            : `SB-RCPT-${data.id}`,
        date: new Date(data.invoice.createdAt).toLocaleDateString(),
      }}
      transactions={filteredTransactions.map((txn) => ({
        amount: txn.amount,
        mode: txn.mode,
        remarks: txn.remarks || "",
        receivedBy: txn.receivedBy?.name ?? "Cashier",
        date: new Date(txn.createdAt).toLocaleDateString(),
      }))}
    />
  );
};

export default PrintSaleTransactions;
