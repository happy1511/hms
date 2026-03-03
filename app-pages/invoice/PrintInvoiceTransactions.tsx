"use client";

import TransactionReceiptExport from "@/components/common/TransactionReceiptExport";
import { useInvoiceDetails } from "@/hooks/query/invoice";
import { format } from "date-fns";
import { LoaderIcon } from "lucide-react";
import { useParams, useSearchParams } from "next/navigation";
import { useState } from "react";

const getPatientAge = (dob?: string | Date) => {
  if (!dob) return "";
  const birthDate = new Date(dob);
  if (Number.isNaN(birthDate.getTime())) return "";

  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < birthDate.getDate())
  ) {
    age -= 1;
  }

  return String(age);
};

const formatPatientAddress = (patient: any) => {
  if (!patient?.addresses?.length) return "";

  const homeAddress =
    patient.addresses.find((a: any) => a.type === "HOME") ||
    patient.addresses[0];

  if (!homeAddress) return "";

  const parts = [
    homeAddress.addressLineOne,
    homeAddress.addressLineTwo,
    homeAddress.addressLineThree,
    homeAddress.location?.postcode,
    homeAddress.location?.city,
    homeAddress.location?.state,
    homeAddress.location?.country,
  ].filter(Boolean);

  return parts.join(", ");
};

const PrintInvoiceTransactions = () => {
  const { invoiceId }: { invoiceId: string } = useParams();
  const searchParams = useSearchParams();

  const { data, isLoading } = useInvoiceDetails({
    invoiceId: Number(invoiceId),
  });

  const [selectedTransactions, setSelectedTransactions] = useState<
    number[] | null
  >(null);
  const transactionIdParam = searchParams.get("transactionId");
  const selectedTransactionId =
    transactionIdParam && transactionIdParam.trim() !== ""
      ? Number(transactionIdParam)
      : undefined;

  const patient = data?.opd?.patient || data?.ipd?.patient;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <LoaderIcon className="animate-spin size-4" />
      </div>
    );
  }

  if (!data) return <div />;

  const hasDirectTransactionFilter =
    selectedTransactionId !== undefined && Number.isFinite(selectedTransactionId);
  const defaultSelectedTransactions = hasDirectTransactionFilter
    ? [selectedTransactionId]
    : data.transactions.map((txn) => txn.id);
  const resolvedSelectedTransactions =
    selectedTransactions ?? defaultSelectedTransactions;

  const filteredTransactions = data.transactions.filter((txn) =>
    resolvedSelectedTransactions.includes(txn.id),
  );

  const receiptTransactions = filteredTransactions.map((txn) => ({
    id: txn.id,
    amount: txn.amount,
    mode: txn.mode,
    remarks: txn.remarks || "",
    receivedBy: txn.receivedBy?.name || "Cashier",
    date: format(new Date(txn.createdAt), "dd/MM/yyyy - hh:mm a"),
  }));

  const patientAge = getPatientAge(patient?.dob);
  const genderAge = `${patient?.gender ? String(patient.gender) : "-"}${patientAge ? `, ${patientAge} years` : ""}`;

  return (
    <div className="flex gap-6 h-full w-full">
      {/* LEFT PANEL */}
      <div className="w-64 border rounded-lg p-4 space-y-3">
        <h3 className="font-semibold text-sm">Select Transactions</h3>

        {data.transactions.map((txn) => (
          <div key={txn.id} className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={resolvedSelectedTransactions.includes(txn.id)}
              onChange={(e) => {
                const baseSelection =
                  selectedTransactions ?? defaultSelectedTransactions;

                if (e.target.checked) {
                  setSelectedTransactions(
                    baseSelection.includes(txn.id)
                      ? baseSelection
                      : [...baseSelection, txn.id],
                  );
                } else {
                  setSelectedTransactions(
                    baseSelection.filter((id) => id !== txn.id),
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
            uhid: patient?.uhid || "",
            genderAge,
            address: formatPatientAddress(patient),
            phone: patient?.contacts?.[0]?.value || "",
          }}
          receipt={{
            number: `PR-${data.id}`,
            date: format(new Date(data.createdAt), "dd/MM/yyyy - hh:mm a"),
            invoiceNo: `INV-${data.id}`,
            srn: String(data.opd?.id || data.ipd?.id || "-"),
          }}
          transactions={receiptTransactions}
        />
      </div>
    </div>
  );
};

export default PrintInvoiceTransactions;
