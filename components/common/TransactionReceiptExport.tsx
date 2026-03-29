"use client";

import React from "react";
import { cn } from "@/lib/utils";
import CompanyPrintHeader from "@/components/common/CompanyPrintHeader";

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
      <div className="mx-auto min-w-200 max-w-3xl space-y-4 bg-white p-4 print:max-w-none print:p-0">
        <CompanyPrintHeader />
        <header>
          <div className="flex items-center border-t border-x justify-center border-b border-black bg-[#dedede] px-3 py-2">
            <p className="font-semibold">TRANSACTION RECEIPT</p>
          </div>
          <InfoRow
            label1="Patient Name"
            value1={customer.name || "-"}
            label2="Patient UHID"
            value2={customer.uhid || "-"}
          />
          <InfoRow
            label1="Age / Gender"
            value1={customer.genderAge || "-"}
            label2="Mobile No."
            value2={customer.phone || "-"}
          />
          <InfoRow label1="Address" value1={customer.address || "-"} />
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

const InfoRow = ({
  label1,
  value1,
  label2,
  value2,
}: {
  label1: string;
  value1: string;
  label2?: string;
  value2?: string;
}) => (
  <table className="w-full border-collapse border-t border-black text-left">
    <tbody>
      <tr>
        <Cell className="w-[18%] bg-[#dedede] font-semibold">
          {label1 ? `${label1}:` : ""}
        </Cell>
        <Cell className="w-[32%]">{value1}</Cell>
        {label2 !== undefined && (
          <>
            <Cell className="w-[18%] bg-[#dedede] font-semibold">
              {label2 ? `${label2}:` : ""}
            </Cell>
            <Cell className="w-[32%]">{value2}</Cell>
          </>
        )}
        {label2 === undefined && (
          <>
            <Cell className="w-[18%] bg-[#dedede]" />
            <Cell className="w-[32%]" />
          </>
        )}
      </tr>
    </tbody>
  </table>
);

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
