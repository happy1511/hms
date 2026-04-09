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
  const allIds = useMemo(() => sections.map((s) => String(s?.id)), [sections]);

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const handleToggle = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(value) => {
        if (value) {
          setSelectedIds(new Set(allIds));
        }
        onOpenChange(value);
      }}
    >
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-tiny">
            Select sections to include
          </DialogTitle>
        </DialogHeader>

        <div className="max-h-80 overflow-auto text-tiny space-y-2 py-2">
          {sections.map((section, idx) => {
            const id = String(section?.id);
            const checked = selectedIds.has(id);

            return (
              <button
                type="button"
                key={id}
                className="flex w-full items-center gap-2 rounded border px-3 py-2 text-left cursor-pointer hover:bg-muted/40"
                onClick={() => handleToggle(id)}
              >
                <Checkbox className="size-3" checked={checked} />
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
              setSelectedIds(new Set(allIds));
            }}
          >
            Reset
          </CustomButton>

          <CustomButton
            onClick={() => {
              if (selectedIds.size === allIds.length) {
                onConfirm(null);
              } else {
                onConfirm(Array.from(selectedIds));
              }
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
