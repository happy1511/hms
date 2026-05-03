"use client";

import PrintToolbar from "@/components/common/PrintToolbar";
import { PharmacyGrnType } from "@/lib/type";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import React from "react";
import { useState } from "react";

export interface GrnPrintItem {
  itemName: string;
  categoryName?: string | null;
  batchNo: number | string;
  expiryDate?: Date | string | null;
  hsnSacCode?: number | string | null;
  quantity: number;
  freeQuantity: number;
  rate: number;
  cGstPercentage: number;
  sGstPercentage: number;
  iGstPercentage: number;
  mrp: number;
  saleRate: number;
}

export interface GrnPrintExportProps {
  title?: string;
  showToolbar?: boolean;
  grnNumber: string;
  supplierName: string;
  invoiceDate: Date | string;
  invoiceNumber: string;
  taxableAmount: number;
  discountAmount: number;
  cGstAmount: number;
  sGstAmount: number;
  iGstAmount: number;
  tcsAmount: number;
  packingForwarding: number;
  roundOffAmount: number;
  grandTotal: number;
  createdBy?: string | null;
  items: GrnPrintItem[];
  className?: string;
}

const money = (value: number) => Number(value || 0).toFixed(2);

const formatExpiry = (value?: Date | string | null) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return format(date, "MM/yy");
};

const formatDate = (value: Date | string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return format(date, "dd/MM/yyyy");
};

export const formatGrnNumber = (id: number, createdAt?: Date | string) => {
  const date = createdAt ? new Date(createdAt) : new Date();
  const year = Number.isNaN(date.getTime())
    ? new Date().getFullYear()
    : date.getFullYear();
  const month = String(
    Number.isNaN(date.getTime())
      ? new Date().getMonth() + 1
      : date.getMonth() + 1,
  ).padStart(2, "0");

  return `GRN/${year}-${month}/${id}`;
};

export const mapGrnToPrintExportProps = (data: PharmacyGrnType) => ({
  grnNumber: formatGrnNumber(data.id, data.createdAt),
  supplierName: data.order?.supplier?.name || data.challan?.supplier?.name || "-",
  invoiceDate: data.invoiceDate,
  invoiceNumber: data.invoiceNumber,
  taxableAmount: Number(data.taxableAmount || 0),
  discountAmount: Number(data.discountAmount || 0),
  cGstAmount: Number(data.cGstAmount || 0),
  sGstAmount: Number(data.sGstAmount || 0),
  iGstAmount: Number(data.iGstAmount || 0),
  tcsAmount: Number(data.tcsAmount || 0),
  packingForwarding: Number(data.packingForwarding || 0),
  roundOffAmount: Number(data.roundOffAmount || 0),
  grandTotal: Number(data.grandTotal || 0),
  createdBy: data.createdByUser?.name || "-",
  items: data.grnItems.map((item) => ({
    itemName:
      item.purchaseItem?.drug?.name ||
      item.challanItem?.drug?.name ||
      item.inventoryItem?.drug?.name ||
      "-",
    categoryName:
      item.purchaseItem?.category?.name || item.challanItem?.category?.name || "",
    batchNo: item.inventoryItem?.batchNo ?? "-",
    expiryDate: item.inventoryItem?.expiryDate,
    hsnSacCode:
      item.purchaseItem?.hsnSacCode ??
      item.challanItem?.hsnSacCode ??
      item.purchaseItem?.hsnSac?.code ??
      item.challanItem?.hsnSac?.code ??
      item.inventoryItem?.hsnSac?.code ??
      "-",
    quantity: Number(item.purchaseItem?.quantity || item.challanItem?.quantity || 0),
    freeQuantity: 0,
    rate: Number(
      item.purchaseItem?.rate ||
        item.challanItem?.purchasePrice ||
        item.inventoryItem?.purchasePrice ||
        0,
    ),
    cGstPercentage: Number(
      item.purchaseItem?.hsnSac?.cGstPercentage ||
        item.challanItem?.hsnSac?.cGstPercentage ||
        item.inventoryItem?.hsnSac?.cGstPercentage ||
        0,
    ),
    sGstPercentage: Number(
      item.purchaseItem?.hsnSac?.sGstPercentage ||
        item.challanItem?.hsnSac?.sGstPercentage ||
        item.inventoryItem?.hsnSac?.sGstPercentage ||
        0,
    ),
    iGstPercentage: Number(
      item.purchaseItem?.hsnSac?.iGstPercentage ||
        item.challanItem?.hsnSac?.iGstPercentage ||
        item.inventoryItem?.hsnSac?.iGstPercentage ||
        0,
    ),
    mrp: Number(item.inventoryItem?.mrp || 0),
    saleRate: Number(item.inventoryItem?.sellingPrice || 0),
  })),
});

const metaRows = (
  props: Omit<GrnPrintExportProps, "className" | "title" | "items">,
) => [
  [
    { label: "Supplier", value: props.supplierName },
    { label: "Invoice Date", value: formatDate(props.invoiceDate) },
    { label: "Invoice Number", value: props.invoiceNumber || "-" },
  ],
  [
    { label: "Taxable Amount", value: money(props.taxableAmount) },
    { label: "Discount", value: `Rs. ${money(props.discountAmount)}` },
    { label: "IGST Amount", value: money(props.iGstAmount) },
  ],
  [
    { label: "CGST Amount", value: money(props.cGstAmount) },
    { label: "SGST Amount", value: money(props.sGstAmount) },
    { label: "PNF Amount", value: money(props.packingForwarding) },
  ],
  [
    { label: "TCS Amount", value: money(props.tcsAmount) },
    { label: "Rounding off Amount", value: money(props.roundOffAmount) },
    { label: "Total Amount", value: money(props.grandTotal) },
  ],
  [{ label: "Created By", value: props.createdBy || "-" }],
];

const GrnPrintExport = ({
  title = "GOODS RECEIVED NOTE (GRN)",
  showToolbar = true,
  className,
  items,
  ...props
}: GrnPrintExportProps) => {
  const [fontSize, setFontSize] = useState<number>(10);

  return (
    <>
      {showToolbar && (
        <PrintToolbar fontSize={fontSize} onFontSizeChange={setFontSize} />
      )}
      <div
        style={{ fontSize }}
        className={cn(
          "w-full bg-white text-black print:bg-white overflow-auto",
          className,
        )}
      >
        <div className="mx-auto bg-white p-4 print:p-2 print:w-[190mm] print:max-w-[190mm] print:overflow-hidden">
          <div>
            <div className="bg-[#efefef] px-3 py-1 text-center font-semibold">
              {title} - GRN NO: {props.grnNumber}
            </div>
            <div className="space-y-2 px-3 py-3">
              {metaRows(props).map((row, rowIndex) => (
                <div
                  key={rowIndex}
                  className={cn(
                    "grid gap-x-8 gap-y-1",
                    row.length === 1
                      ? "grid-cols-1"
                      : "grid-cols-1 md:grid-cols-3",
                  )}
                >
                  {row.map((item) => (
                    <div
                      key={item.label}
                      className="grid grid-cols-[120px_1fr] gap-2"
                    >
                      <div className="font-semibold">{item.label}:</div>
                      <div>{item.value}</div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>

          <div className="overflow-hidden">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-[#efefef]">
                  <Cell as="th" className="text-left">
                    Item
                  </Cell>
                  <Cell as="th" className="text-left">
                    Category
                  </Cell>
                  <Cell as="th" className="text-left">
                    Batch
                  </Cell>
                  <Cell as="th" className="text-left">
                    Expiry
                  </Cell>
                  <Cell as="th" className="text-left">
                    HSN
                  </Cell>
                  <Cell as="th" className="text-right">
                    Quantity
                  </Cell>
                  <Cell as="th" className="text-right">
                    Free Qty
                  </Cell>
                  <Cell as="th" className="text-right">
                    Rate
                  </Cell>
                  <Cell as="th" className="text-right">
                    CGST
                  </Cell>
                  <Cell as="th" className="text-right">
                    SGST
                  </Cell>
                  <Cell as="th" className="text-right">
                    IGST
                  </Cell>
                  <Cell as="th" className="text-right">
                    MRP
                  </Cell>
                  <Cell as="th" className="text-right">
                    Sale Rate
                  </Cell>
                </tr>
              </thead>
              <tbody>
                {items.map((item, index) => (
                  <tr key={`${item.itemName}-${index}`}>
                    <Cell className="text-left">{item.itemName}</Cell>
                    <Cell className="text-left">{item.categoryName || ""}</Cell>
                    <Cell className="text-left">{item.batchNo}</Cell>
                    <Cell className="text-left">
                      {formatExpiry(item.expiryDate)}
                    </Cell>
                    <Cell className="text-left">{item.hsnSacCode ?? "-"}</Cell>
                    <Cell className="text-right">
                      {Number(item.quantity || 0).toFixed(2)}
                    </Cell>
                    <Cell className="text-right">
                      {Number(item.freeQuantity || 0).toFixed(2)}
                    </Cell>
                    <Cell className="text-right">{money(item.rate)}</Cell>
                    <Cell className="text-right">
                      {Number(item.cGstPercentage || 0).toFixed(2)}%
                    </Cell>
                    <Cell className="text-right">
                      {Number(item.sGstPercentage || 0).toFixed(2)}%
                    </Cell>
                    <Cell className="text-right">
                      {Number(item.iGstPercentage || 0).toFixed(2)}%
                    </Cell>
                    <Cell className="text-right">{money(item.mrp)}</Cell>
                    <Cell className="text-right">{money(item.saleRate)}</Cell>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
};

const Cell = ({
  children,
  className = "",
  as = "td",
}: {
  children: React.ReactNode;
  className?: string;
  as?: "td" | "th";
}) => {
  const Component = as;
  return (
    <Component
      className={cn("border border-black px-2 py-1 align-middle", className)}
    >
      {children}
    </Component>
  );
};

export default GrnPrintExport;
