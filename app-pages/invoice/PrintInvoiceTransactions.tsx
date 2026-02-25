"use client";

import TransactionReceiptExport from "@/components/common/TransactionReceiptExport";
import { useInvoiceDetails } from "@/hooks/query/invoice";
import { LoaderIcon } from "lucide-react";
import { useParams } from "next/navigation";
import { useState } from "react";

const PrintInvoiceTransactions = () => {
  const { invoiceId }: { invoiceId: string } = useParams();

  const { data, isLoading } = useInvoiceDetails({
    invoiceId: Number(invoiceId),
  });

  const [selectedTransactions, setSelectedTransactions] = useState<number[]>(
    [],
  );

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <LoaderIcon className="animate-spin size-4" />
      </div>
    );
  }

  if (!data) return <div />;

  const patient = data?.opd?.patient;

  // default select all after load
  if (selectedTransactions.length === 0 && data.transactions.length > 0) {
    setSelectedTransactions(data.transactions.map((t) => t.id));
  }

  const filteredTransactions = data.transactions.filter((txn) =>
    selectedTransactions.includes(txn.id),
  );

  const receiptTransactions = filteredTransactions.map((txn) => ({
    amount: txn.amount,
    mode: txn.mode,
    remarks: txn.remarks || "",
    receivedBy: `User-${txn.receivedBy?.name}`,
    date: new Date(txn.createdAt).toLocaleDateString(),
  }));

  return (
    <div className="flex gap-6 h-full w-full">
      {/* LEFT PANEL */}
      <div className="w-64 border rounded-lg p-4 space-y-3">
        <h3 className="font-semibold text-sm">Select Transactions</h3>

        {data.transactions.map((txn) => (
          <div key={txn.id} className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={selectedTransactions.includes(txn.id)}
              onChange={(e) => {
                if (e.target.checked) {
                  setSelectedTransactions((prev) => [...prev, txn.id]);
                } else {
                  setSelectedTransactions((prev) =>
                    prev.filter((id) => id !== txn.id),
                  );
                }
              }}
            />
            <span className="text-sm">
              ₹{txn.amount} — {txn.mode}
            </span>
          </div>
        ))}
      </div>

      {/* RIGHT PANEL */}
      <div className="flex-1">
        <TransactionReceiptExport
          customer={{
            name: `${patient?.firstName} ${patient?.lastName}`,
            address: patient?.addresses?.[0]?.addressLineOne || "",
            phone: patient?.contacts?.[0]?.value || "",
          }}
          receipt={{
            number: `RCPT-${data.id}`,
            date: new Date(data.createdAt).toLocaleDateString(),
          }}
          transactions={receiptTransactions}
        />
      </div>
    </div>
  );
};

export default PrintInvoiceTransactions;
