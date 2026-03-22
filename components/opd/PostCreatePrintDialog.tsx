"use client";

import CustomButton from "@/components/common/CustomButton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invoiceId: number | null;
  opdId: number | null;
  onDone: () => void;
};

const PostCreatePrintDialog = ({
  open,
  onOpenChange,
  invoiceId,
  opdId,
  onDone,
}: Props) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg border-secondary border-4 bg-white">
        <DialogHeader>
          <DialogTitle className="text-sm text-black/70">
            OPD Created Successfully
          </DialogTitle>
          <DialogDescription>
            Print invoice or consultation paper before closing.
          </DialogDescription>
        </DialogHeader>
        <div className="flex gap-2 justify-end">
          <CustomButton
            type="button"
            variant="outline"
            onClick={() => {
              if (invoiceId) {
                window.open(`/invoice/print/${invoiceId}`, "_blank");
              }
            }}
            disabled={!invoiceId}
          >
            Print Invoice
          </CustomButton>
          <CustomButton
            type="button"
            variant="outline"
            onClick={() => {
              if (invoiceId) {
                window.open(`/invoice/transactions/${invoiceId}`, "_blank");
              }
            }}
            disabled={!invoiceId}
          >
            Print Transaction Receipt
          </CustomButton>
          <CustomButton
            type="button"
            variant="outline"
            onClick={() => {
              if (opdId) {
                window.open(
                  `/opd/consultation-print/${opdId}?patientOnly=1`,
                  "_blank",
                );
              }
            }}
            disabled={!opdId}
          >
            Print Consult Page
          </CustomButton>
          <CustomButton type="button" onClick={onDone}>
            Done
          </CustomButton>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PostCreatePrintDialog;

