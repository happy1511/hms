"use client";

import { BillingSections } from "@/lib/type";
import { Checkbox } from "../ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Separator } from "../ui/separator";
import { useMemo, useState } from "react";
import CustomButton from "../common/CustomButton";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sections: BillingSections[];
  onConfirm: (sectionIds: string[] | null) => void;
}

const SectionPickerModal = ({
  open,
  onOpenChange,
  sections,
  onConfirm,
}: Props) => {
  const allIds = useMemo(
    () =>
      sections.map((s, idx) =>
        String(s?.invoiceBillingSectionId ?? s?.id ?? idx),
      ),
    [sections],
  );

  // `null` means "all sections selected" (works even if `sections` loads later)
  const [selectedSectionIds, setSelectedSectionIds] = useState<string[] | null>(
    null,
  );

  const handleToggle = (id: string, checked: boolean) => {
    setSelectedSectionIds((prev) => {
      if (prev === null) {
        return checked ? allIds : allIds.filter((sid) => sid !== id);
      }
      if (checked) {
        return prev.includes(id) ? prev : [...prev, id];
      }
      return prev.filter((sid) => sid !== id);
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-tiny">
            Select sections to include
          </DialogTitle>
        </DialogHeader>
        <div className="max-h-80 overflow-auto text-tiny space-y-2 py-2">
          {sections.map((section, idx) => {
            const id = String(
              section?.invoiceBillingSectionId ?? section?.id ?? idx,
            );
            const checked =
              selectedSectionIds === null
                ? true
                : selectedSectionIds.includes(id);
            return (
              <button
                type="button"
                key={id}
                className="flex w-full items-center gap-2 rounded border px-3 py-2 text-left cursor-pointer hover:bg-muted/40"
                onClick={() => handleToggle(id, !checked)}
              >
                <Checkbox
                  className="size-3"
                  checked={checked}
                  onCheckedChange={(value) => handleToggle(id, Boolean(value))}
                  onClick={(e) => e.stopPropagation()}
                />
                <span>{section.name || `Section ${idx + 1}`}</span>
              </button>
            );
          })}
        </div>
        <Separator className="my-2" />
        <DialogFooter className="gap-2">
          <CustomButton
            variant="outline"
            onClick={() => {
              setSelectedSectionIds(null);
              onOpenChange(false);
            }}
          >
            Reset
          </CustomButton>
          <CustomButton
            onClick={() => {
              onConfirm(selectedSectionIds);
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

export default SectionPickerModal;
