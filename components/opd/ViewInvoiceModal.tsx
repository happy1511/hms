"use client";

import { useInvoiceDetails } from "@/hooks/query/invoice";
import { OPDType } from "@/lib/type";
import { LoaderIcon, PlusIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { Dialog, DialogContent, DialogTrigger } from "../ui/dialog";
import { Button } from "../ui/button";
import { Checkbox } from "../ui/checkbox";
import CustomButton from "../common/CustomButton";
import SectionPickerModal from "./SectionPickerModal";
import InvoicePrintDetails from "../invoice/InvoicePrintDetails";

interface Props {
  opd?: OPDType;
  invoiceId?: number;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger?: React.ReactNode;
}

const ViewInvoiceModal = ({
  open,
  onOpenChange,
  opd,
  invoiceId,
  trigger,
}: Props) => {
  const router = useRouter();
  const [includePaymentHistory, setIncludePaymentHistory] = useState(false);
  const [includeRemarks, setIncludeRemarks] = useState(false);
  const [sectionPickerOpen, setSectionPickerOpen] = useState(false);

  const effectiveInvoiceId = invoiceId ?? opd?.invoice?.id ?? 0;

  const { data, isLoading } = useInvoiceDetails({
    invoiceId: effectiveInvoiceId,
  });

  if (!effectiveInvoiceId) return null;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogTrigger asChild>
          {trigger ?? (
            <Button
              variant="outline"
              className="h-auto shadow-none p-1 cursor-pointer"
            >
              <PlusIcon className="size-2.5 text-destructive" />
            </Button>
          )}
        </DialogTrigger>

        <DialogContent className="max-w-[98vw]! border-secondary border-4 bg-white h-[95dvh] flex flex-col p-4 print:max-w-none print:h-auto print:border-0 print:p-0 print:shadow-none">
          <div className="text-sm font-medium print:hidden">Invoice</div>

          <div className="mt-1 flex items-center gap-4 text-xs print:hidden">
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

          <div className="mt-3 flex-1 overflow-auto text-tiny bg-[#e8e8e8] print:mt-0 print:overflow-visible print:border-0 print:bg-white">
            {isLoading || !data ? (
              <div className="h-full w-full flex items-center justify-center">
                <LoaderIcon className="size-4 animate-spin" />
              </div>
            ) : (
              <InvoicePrintDetails
                data={data}
                includeRemarks={includeRemarks}
                includePaymentHistory={includePaymentHistory}
                layoutClassName="max-w-full"
              />
            )}
          </div>

          <div className="mt-3 flex justify-center gap-2 print:hidden">
            <CustomButton
              type="button"
              variant="secondary"
              onClick={() => setSectionPickerOpen(true)}
            >
              Choose Sections to Print
            </CustomButton>
            <CustomButton
              type="button"
              onClick={() => router.push(`/invoice/${effectiveInvoiceId}`)}
            >
              View More Details
            </CustomButton>
            <CustomButton
              type="button"
              onClick={() =>
                window.open(
                  `/invoice/transactions/${effectiveInvoiceId}`,
                  "_blank",
                )
              }
            >
              Print Payment Receipt
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

      <SectionPickerModal
        open={sectionPickerOpen}
        onOpenChange={setSectionPickerOpen}
        sections={data?.sections || []}
        onConfirm={(ids) => {
          window.open(
            `/invoice/print/${data?.id}${
              ids && ids.length ? `?sectionIds=${ids.join(",")}` : ""
            }`,
            "_blank",
          );
        }}
      />
    </>
  );
};

export default ViewInvoiceModal;
