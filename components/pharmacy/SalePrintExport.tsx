"use client";

import PrintToolbar from "@/components/common/PrintToolbar";
import SaleInvoiceExport from "@/components/common/SaleInvoiceExport";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { useState } from "react";

export interface SalePrintLine {
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

export interface SalePrintExportProps {
  billNo: string;
  billDate: Date | string;
  patientName: string;
  doctorName?: string;
  lines: SalePrintLine[];
  invoiceDiscount: number;
  invoiceTotal: number;
  className?: string;
}

const formatBillDate = (value: Date | string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return format(date, "dd/MM/yyyy hh:mm a");
};

const SalePrintExport = ({
  billDate,
  className,
  ...props
}: SalePrintExportProps) => {
  const [fontSize, setFontSize] = useState<number>(11);

  return (
    <>
      <PrintToolbar fontSize={fontSize} onFontSizeChange={setFontSize} />
      <div
        style={{ fontSize }}
        className={cn(
          "w-full bg-white text-black print:bg-white overflow-auto",
          className,
        )}
      >
        <div className="mx-auto min-w-200 max-w-6xl bg-white p-4 print:max-w-none print:p-0">
          <SaleInvoiceExport
            {...props}
            billDate={formatBillDate(billDate)}
            fontSize={fontSize}
            className="print:text-black"
          />
        </div>
      </div>
    </>
  );
};

export default SalePrintExport;
