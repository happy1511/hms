"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface SaleInvoiceLine {
  name: string;
  batchNo: number;
  qty: number;
  rate: number;
  taxableAmount: number;
  gstAmount: number;
  cGstAmount: number;
  sGstAmount: number;
  iGstAmount: number;
  total: number;
}

interface SaleInvoiceExportProps {
  billNo: string;
  billDate: string;
  patientName: string;
  doctorName?: string;
  lines: SaleInvoiceLine[];
  invoiceDiscount: number;
  invoiceTotal: number;
  includePaymentHistory?: boolean;
  includeRemarks?: boolean;
  transactions?: {
    date: string;
    mode: string;
    remarks?: string;
    receivedBy?: string;
    amount: number;
  }[];
  className?: string;
}

const money = (value: number) => value.toFixed(2);

const SaleInvoiceExport = ({
  billNo,
  billDate,
  patientName,
  doctorName,
  lines,
  invoiceDiscount,
  invoiceTotal,
  includePaymentHistory = false,
  includeRemarks = false,
  transactions = [],
  className = "",
}: SaleInvoiceExportProps) => {
  const taxableSubTotal = lines.reduce((sum, l) => sum + l.taxableAmount, 0);
  const gstTotal = lines.reduce((sum, l) => sum + l.gstAmount, 0);
  const cGstTotal = lines.reduce((sum, l) => sum + l.cGstAmount, 0);
  const sGstTotal = lines.reduce((sum, l) => sum + l.sGstAmount, 0);
  const iGstTotal = lines.reduce((sum, l) => sum + l.iGstAmount, 0);

  return (
    <div
      className={cn(
        "w-full bg-white text-[11px] text-black",
        "print:bg-white print:text-black",
        className,
      )}
    >
      <div className="mx-auto max-w-5xl space-y-4 bg-white p-4 print:max-w-none print:p-0">
        {/* Header */}
        <div className="border border-black">
          <div className="flex items-center justify-center border-b border-black bg-[#dedede] px-3 py-2">
            <p className="font-semibold">PHARMACY SALE INVOICE</p>
          </div>
          <InfoRow
            label1="Bill No"
            value1={billNo}
            label2="Date"
            value2={billDate}
          />
          <InfoRow
            label1="Patient"
            value1={patientName}
            label2="Doctor"
            value2={doctorName || "-"}
          />
        </div>

        {/* Items table */}
        <div className="overflow-hidden border border-black">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-[#dedede]">
                <Cell as="th" className="w-[20%] text-left">
                  Drug
                </Cell>
                <Cell as="th" className="w-[8%] text-right">
                  Batch
                </Cell>
                <Cell as="th" className="w-[8%] text-right">
                  Qty
                </Cell>
                <Cell as="th" className="w-[8%] text-right">
                  Rate
                </Cell>
                <Cell as="th" className="w-[9%] text-right">
                  Taxable
                </Cell>
                <Cell as="th" className="w-[9%] text-right">
                  CGST
                </Cell>
                <Cell as="th" className="w-[9%] text-right">
                  SGST
                </Cell>
                <Cell as="th" className="w-[9%] text-right">
                  IGST
                </Cell>
                <Cell as="th" className="w-[9%] text-right">
                  GST
                </Cell>
                <Cell as="th" className="w-[9%] text-right">
                  Total
                </Cell>
              </tr>
            </thead>
            <tbody>
              {lines.map((line, index) => (
                <tr key={index}>
                  <Cell className="text-left">{line.name}</Cell>
                  <Cell className="text-right">{line.batchNo}</Cell>
                  <Cell className="text-right">{line.qty}</Cell>
                  <Cell className="text-right">{money(line.rate)}</Cell>
                  <Cell className="text-right">{money(line.taxableAmount)}</Cell>
                  <Cell className="text-right">{money(line.cGstAmount)}</Cell>
                  <Cell className="text-right">{money(line.sGstAmount)}</Cell>
                  <Cell className="text-right">{money(line.iGstAmount)}</Cell>
                  <Cell className="text-right">{money(line.gstAmount)}</Cell>
                  <Cell className="text-right">{money(line.total)}</Cell>
                </tr>
              ))}
              <tr>
                <Cell colSpan={9} className="text-right font-semibold">
                  Taxable Subtotal
                </Cell>
                <Cell className="text-right font-semibold">
                  {money(taxableSubTotal)}
                </Cell>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Payment history */}
        {includePaymentHistory && (
          <div className="overflow-hidden border border-black">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-[#dedede]">
                  <Cell as="th" className="w-[22%] text-left">
                    Date
                  </Cell>
                  <Cell as="th" className="w-[15%] text-left">
                    Mode
                  </Cell>
                  {includeRemarks && (
                    <Cell as="th" className="w-[33%] text-left">
                      Remarks
                    </Cell>
                  )}
                  <Cell as="th" className="w-[18%] text-left">
                    Received By
                  </Cell>
                  <Cell as="th" className="w-[12%] text-right">
                    Amount
                  </Cell>
                </tr>
              </thead>
              <tbody>
                {transactions.length ? (
                  transactions.map((txn, index) => (
                    <tr key={index}>
                      <Cell className="text-left">{txn.date}</Cell>
                      <Cell className="text-left">{txn.mode}</Cell>
                      {includeRemarks && (
                        <Cell className="text-left">
                          {txn.remarks || "-"}
                        </Cell>
                      )}
                      <Cell className="text-left">
                        {txn.receivedBy || "-"}
                      </Cell>
                      <Cell className="text-right">
                        {money(txn.amount)}
                      </Cell>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <Cell
                      colSpan={includeRemarks ? 5 : 4}
                      className="text-center"
                    >
                      No payment transactions found
                    </Cell>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Summary */}
        <div className="ml-auto w-full max-w-xl overflow-hidden border border-black">
          <table className="w-full border-collapse">
            <tbody>
              <SummaryRow
                leftLabel="GST Total"
                leftValue={money(gstTotal)}
                rightLabel="Invoice Discount"
                rightValue={money(invoiceDiscount)}
              />
              <SummaryRow
                leftLabel="CGST Total"
                leftValue={money(cGstTotal)}
                rightLabel="SGST Total"
                rightValue={money(sGstTotal)}
              />
              <SummaryRow
                leftLabel="IGST Total"
                leftValue={money(iGstTotal)}
                rightLabel="Grand Total"
                rightValue={money(invoiceTotal)}
                isLast
              />
            </tbody>
          </table>
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
  label2: string;
  value2: string;
}) => (
  <table className="w-full border-collapse">
    <tbody>
      <tr>
        <Cell className="w-[17%] bg-[#dedede] font-semibold text-left">
          {label1}:
        </Cell>
        <Cell className="w-[33%] text-left">{value1}</Cell>
        <Cell className="w-[17%] bg-[#dedede] font-semibold text-left">
          {label2}:
        </Cell>
        <Cell className="w-[33%] text-left">{value2}</Cell>
      </tr>
    </tbody>
  </table>
);

const SummaryRow = ({
  leftLabel,
  leftValue,
  rightLabel,
  rightValue,
  isLast = false,
}: {
  leftLabel: string;
  leftValue: string;
  rightLabel: string;
  rightValue: string;
  isLast?: boolean;
}) => (
  <tr className={isLast ? "" : "border-b border-black"}>
    <Cell className="w-[31%] bg-[#dedede] font-semibold text-left">
      {leftLabel}
    </Cell>
    <Cell className="w-[19%] text-right">{leftValue}</Cell>
    <Cell className="w-[31%] bg-[#dedede] font-semibold text-left">
      {rightLabel}
    </Cell>
    <Cell className="w-[19%] text-right">{rightValue}</Cell>
  </tr>
);

const Cell = ({
  children,
  className = "",
  as = "td",
  colSpan,
}: {
  children: React.ReactNode;
  className?: string;
  as?: "td" | "th";
  colSpan?: number;
}) => {
  const Component = as;
  return (
    <Component
      colSpan={colSpan}
      className={cn(
        "border border-black px-2 py-1 align-middle font-normal",
        className,
      )}
    >
      {children}
    </Component>
  );
};

export default SaleInvoiceExport;
