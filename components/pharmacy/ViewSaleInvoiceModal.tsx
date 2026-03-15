"use client";

import SaleInvoiceExport from "@/components/common/SaleInvoiceExport";
import CustomButton from "@/components/common/CustomButton";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { useGetSaleBill } from "@/hooks/query/pharmacySaleBill";
import { format } from "date-fns";
import { LoaderIcon, PlusIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useMemo, useState } from "react";
import { Button } from "../ui/button";

interface Props {
  billId: number;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger?: React.ReactNode;
}

const ViewSaleInvoiceModal = ({ billId, open, onOpenChange, trigger }: Props) => {
  const router = useRouter();
  const [includePaymentHistory, setIncludePaymentHistory] = useState(false);
  const [includeRemarks, setIncludeRemarks] = useState(false);
  const { data, isLoading } = useGetSaleBill(String(billId));

  const previewData = useMemo(() => {
    if (!data) return null;

    return {
      billNo: `SB-${data.id}`,
      billDate: format(new Date(data.invoice.createdAt), "dd/MM/yy hh:mm a"),
      patientName: data.patient
        ? `${data.patient.firstName} ${data.patient.lastName}`
        : "Walk-in Customer",
      doctorName: data.doctor?.user?.name ?? undefined,
      lines: data.saleItems.map((item) => ({
        name: item.inventoryItem.drug.name,
        batchNo: item.inventoryItem.batchNo,
        qty: item.quantity,
        rate: item.rate,
        taxableAmount: item.taxableAmount ?? item.total,
        gstAmount: item.gstAmount ?? 0,
        cGstAmount: item.cGstAmount ?? 0,
        sGstAmount: item.sGstAmount ?? 0,
        iGstAmount: item.iGstAmount ?? 0,
        total: item.total,
      })),
      invoiceDiscount: data.invoice.discountValue,
      invoiceTotal: data.invoice.total,
      transactions: data.invoice.transactions.map((txn) => ({
        date: format(new Date(txn.createdAt), "dd/MM/yyyy hh:mm a"),
        mode: String(txn.mode),
        remarks: txn.remarks || "",
        receivedBy: txn.receivedBy?.name || "-",
        amount: txn.amount,
      })),
    };
  }, [data]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button variant="outline" className="h-auto shadow-none p-1 cursor-pointer">
            <PlusIcon className="size-2.5 text-destructive" />
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="max-w-[98vw]! border-secondary border-4 bg-white h-[95dvh] flex flex-col p-4">
        <div className="text-sm font-medium">Sale Invoice</div>

        <div className="flex items-center gap-4 text-xs mt-1">
          <label className="flex items-center gap-2">
            <Checkbox
              checked={includePaymentHistory}
              onCheckedChange={(value) => {
                const checked = Boolean(value);
                setIncludePaymentHistory(checked);
                if (!checked) {
                  setIncludeRemarks(false);
                }
              }}
            />
            Include Payment History
          </label>
          <label className="flex items-center gap-2">
            <Checkbox
              disabled={!includePaymentHistory}
              checked={includeRemarks}
              onCheckedChange={(value) => setIncludeRemarks(Boolean(value))}
            />
            Include Remarks
          </label>
        </div>

        <div className="flex-1 overflow-hidden border mt-3 bg-white">
          {isLoading || !previewData ? (
            <div className="h-full w-full flex items-center justify-center">
              <LoaderIcon className="size-4 animate-spin" />
            </div>
          ) : (
            <div className="h-full w-full overflow-auto bg-white print:overflow-visible">
              <SaleInvoiceExport
                {...previewData}
                includePaymentHistory={includePaymentHistory}
                includeRemarks={includeRemarks}
              />
            </div>
          )}
        </div>

        <div className="flex justify-center gap-2 mt-3">
          <CustomButton
            type="button"
            onClick={() => router.push(`/pharmacy/sale-bill/${billId}`)}
          >
            View More Details
          </CustomButton>
          <CustomButton
            type="button"
            onClick={() => window.open(`/pharmacy/sale-transactions/${billId}`, "_blank")}
          >
            Print Payment Receipt
          </CustomButton>
          <CustomButton
            type="button"
            onClick={() => window.open(`/pharmacy/sale-invoice/${billId}`, "_blank")}
          >
            Print Detailed Invoice
          </CustomButton>
          <CustomButton
            type="button"
            className="bg-destructive"
            onClick={() => onOpenChange?.(false)}
          >
            Close
          </CustomButton>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ViewSaleInvoiceModal;

