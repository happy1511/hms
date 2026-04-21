"use client";

import CustomButton from "@/components/common/CustomButton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const formatCurrency = (value: number) => `Rs. ${Number(value || 0).toFixed(2)}`;

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  dueAmount: number;
  onConfirm: () => void | Promise<void>;
  pending?: boolean;
};

const DischargeDueConfirmModal = ({
  open,
  onOpenChange,
  dueAmount,
  onConfirm,
  pending = false,
}: Props) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg border-secondary border-4 bg-white">
        <DialogHeader>
          <DialogTitle className="text-sm text-black/70">
            Discharge With Due Amount
          </DialogTitle>
          <DialogDescription>
            This patient still has an outstanding due of{" "}
            <span className="font-semibold text-destructive">
              {formatCurrency(dueAmount)}
            </span>
            . Do you want to discharge the patient anyway?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <CustomButton
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={pending}
          >
            Cancel
          </CustomButton>
          <CustomButton type="button" onClick={onConfirm} isLoading={pending}>
            Yes, Discharge
          </CustomButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DischargeDueConfirmModal;
