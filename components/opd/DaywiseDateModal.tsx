"use client";

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useState } from "react";
import CustomButton from "../common/CustomButton";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultDate?: string;
  onConfirm: (date: string) => void;
}

const DaywiseDateModal = ({
  open,
  onOpenChange,
  defaultDate,
  onConfirm,
}: Props) => {
  const [date, setDate] = useState<string>(
    defaultDate || new Date().toISOString().slice(0, 10),
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-sm">Print Day-wise Invoice</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 text-tiny">
          <label className="flex flex-col gap-1">
            <span>Select Date</span>
            <input
              type="date"
              className="rounded border px-2 py-1"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </label>
        </div>
        <DialogFooter className="gap-2">
          <CustomButton variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </CustomButton>
          <CustomButton
            onClick={() => {
              if (!date) return;
              onConfirm(date);
              onOpenChange(false);
            }}
          >
            Print
          </CustomButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DaywiseDateModal;
