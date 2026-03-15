"use client";

import InvoicePrintDetails from "@/components/invoice/InvoicePrintDetails";
import InvoicePrintSummary from "@/components/invoice/InvoicePrintSummary";
import { InvoiceGroupedBySection } from "@/lib/type";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import InvoicePrintDayWise from "@/components/invoice/InvoicePrintDayWise";
import CustomButton from "../common/CustomButton";

type PreviewMode = "summary" | "details" | "dayWise" | "compact";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: InvoiceGroupedBySection;
  mode: PreviewMode;
  targetDay?: string;
  sectionIds?: Set<string> | null;
  printUrl?: string | null;
}

const filterSections = (
  data: InvoiceGroupedBySection,
  sectionIds: Set<string> | null,
): InvoiceGroupedBySection =>
  sectionIds
    ? {
        ...data,
        sections: data.sections.filter((section: any, idx: number) => {
          const sectionId = String(
            section?.invoiceBillingSectionId ?? section?.id ?? idx,
          );
          return sectionIds.has(sectionId);
        }),
      }
    : data;

const InvoicePreviewModal = ({
  open,
  onOpenChange,
  data,
  mode,
  targetDay,
  printUrl = null,
  sectionIds = null,
}: Props) => {
  const filteredData = filterSections(data, sectionIds);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw]! border-secondary border-4 bg-white h-[95dvh] flex flex-col p-4 print:max-w-none print:h-auto print:border-0 print:p-0 print:shadow-none">
        <DialogHeader className="sr-only">
          <DialogTitle>Print Preview</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-3 h-full">
          <div className="flex-1 overflow-auto bg-white print:mt-0 print:overflow-visible print:border-0 print:bg-white">
            <div className="bg-white text-tiny text-black">
              {mode === "summary" && (
                <InvoicePrintSummary data={filteredData} />
              )}
              {mode === "details" && (
                <InvoicePrintDetails data={filteredData} />
              )}
              {mode === "compact" && (
                <InvoicePrintDetails data={filteredData} hideCustomerInfo />
              )}
              {mode === "dayWise" && (
                <InvoicePrintDayWise
                  data={filteredData}
                  targetDay={
                    targetDay ||
                    new Date(filteredData.createdAt).toISOString().slice(0, 10)
                  }
                />
              )}
            </div>
          </div>

          <DialogFooter className="gap-2">
            <CustomButton
              variant="outline"
              onClick={() => {
                onOpenChange(false);
              }}
            >
              Close
            </CustomButton>
            <CustomButton
              onClick={() => {
                if (printUrl) {
                  window.open(printUrl, "_blank");
                } else {
                  window.print();
                }
              }}
            >
              Print
            </CustomButton>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default InvoicePreviewModal;
