"use client";

import React from "react";
import { cn } from "@/lib/utils";
import CompanyPrintHeader from "@/components/common/CompanyPrintHeader";
import InfoRow from "../invoice/InfoRow";

interface TransactionItem {
  id?: number;
  amount: number;
  mode: string;
  transactionType?: string;
  remarks?: string;
  receivedBy: string;
  date: string;
}

interface ReceiptProps {
  customer: {
    name: string;
    uhid?: string;
    genderAge?: string;
    address?: string;
    phone?: string;
    email?: string;
  };
  receipt: {
    number: string;
    date: string;
    invoiceNo?: string;
    srn?: string;
  };
  transactions: TransactionItem[];
  className?: string;
  fontSize?: number;
}

const formatMoney = (value: number) => `Rs. ${value.toFixed(2)}`;

const TransactionReceiptExport = ({
  customer,
  receipt,
  transactions,
  className = "",
  fontSize = 10,
}: ReceiptProps) => {
  return (
    <div
      className={cn(
        "w-full bg-white text-black overflow-auto",
        "print:bg-white print:text-black",
        className,
      )}
      style={{ fontSize }}
    >
      <div className="mx-auto bg-white p-4 print:p-2 print:w-[190mm] print:max-w-[190mm] print:overflow-hidden">
        <CompanyPrintHeader />
        <header>
          <div className="flex items-center justify-center bg-[#dedede] px-3 py-2">
            <p className="font-semibold">TRANSACTION RECEIPT</p>
          </div>
          <InfoRow
            leftLabel="Patient Name"
            leftValue={customer.name || "-"}
            rightLabel="Patient UHID"
            rightValue={customer.uhid || "-"}
            cellClassName="border-b-0"
          />
          <InfoRow
            leftLabel="Age / Gender"
            leftValue={customer.genderAge || "-"}
            rightLabel="Mobile No."
            rightValue={customer.phone || "-"}
            cellClassName="border-b-0"
          />
          <InfoRow leftLabel="Address" leftValue={customer.address || "-"} />
        </header>

        <div className="grid gap-4 print:break-after-auto">
          {transactions.map((txn, index) => (
            <section key={txn.id ?? index} className="bg-white">
              <div className="flex items-center justify-between border-t border-x border-black bg-[#dedede] px-3 py-2 font-semibold">
                <span>{txn.transactionType || "PAYMENT"} RECEIPT</span>
                <span>
                  Receipt No.:{" "}
                  {transactions.length > 1
                    ? `${receipt.number}-${index + 1}`
                    : receipt.number}
                </span>
              </div>

              <table className="w-full border-collapse">
                <tbody>
                  <KeyValueRow label="SRN" value={receipt.srn || "-"} />
                  <KeyValueRow
                    label="INVOICE NO."
                    value={receipt.invoiceNo || "-"}
                  />
                  <KeyValueRow
                    label="PAYMENT ON"
                    value={txn.date || receipt.date}
                  />
                  <KeyValueRow
                    label="RECEIVED BY"
                    value={txn.receivedBy || "-"}
                  />
                  <KeyValueRow
                    label="TRANSACTION AMOUNT"
                    value={formatMoney(txn.amount)}
                  />
                  <KeyValueRow
                    label="TRANSACTION TYPE"
                    value={txn.transactionType || "-"}
                  />
                  <KeyValueRow label="PAYMENT MODE" value={txn.mode || "-"} />
                  <KeyValueRow
                    label="REMARKS"
                    value={txn.remarks || "-"}
                    isLast
                  />
                </tbody>
              </table>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
};

const KeyValueRow = ({
  label,
  value,
  isLast = false,
}: {
  label: string;
  value: string;
  isLast?: boolean;
}) => (
  <tr className={isLast ? "" : "border-b border-black"}>
    <Cell as="th" className="w-[38%] bg-[#f5f5f5] text-left font-semibold">
      {label}:
    </Cell>
    <Cell className="w-[62%] text-left">{value}</Cell>
  </tr>
);

const Cell = ({
  children,
  className = "",
  as = "td",
}: {
  children?: React.ReactNode;
  className?: string;
  as?: "td" | "th";
}) => {
  const Component = as;
  return (
    <Component
      className={cn(
        "border border-black px-2 py-1 align-middle",
        "font-normal",
        className,
      )}
    >
      {children}
    </Component>
  );
};

export default TransactionReceiptExport;
