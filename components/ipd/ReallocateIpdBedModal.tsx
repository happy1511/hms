"use client";

import CustomButton from "@/components/common/CustomButton";
import { FormInfiniteSelect } from "@/components/form-inputs/FormInfiniteSelect";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
import { BedGetPayload } from "@/generated/prisma/models";
import { useInfiniteBedsList } from "@/hooks/query/bed";
import { useUpdateIpdBed } from "@/hooks/query/ipd";
import { FilterValues, IPDType, PaginatedResponse } from "@/lib/type";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

type BedWithDetails = BedGetPayload<{
  include: {
    room: { include: { roomType: { include: { department: true } } } };
  };
}>;

type FormValues = {
  bed: BedWithDetails | null;
};

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ipd: IPDType | null;
};

const ReallocateIpdBedModal = ({ open, onOpenChange, ipd }: Props) => {
  const [bedSearch, setBedSearch] = useState("");
  const { mutateAsync, isPending } = useUpdateIpdBed();

  const ipdId = useMemo(() => (ipd?.id ? Number(ipd.id) : null), [ipd?.id]);
  const currentBedLabel = useMemo(() => {
    const bed = ipd?.bed;
    if (!bed) return "--";
    const dept = bed.room?.roomType?.department?.name;
    const roomType = bed.room?.roomType?.name;
    const room = bed.room?.name;
    const bedName = bed.name || bed.bedNumber;
    return [dept, roomType, room, bedName].filter(Boolean).join(" / ") || "--";
  }, [ipd]);

  const bedFilters: FilterValues = useMemo(
    () => ({
      name: bedSearch,
      nonOccupied: true,
    }),
    [bedSearch],
  );

  const bedQuery = useInfiniteBedsList(bedFilters, 10, open);

  const form = useForm<FormValues>({
    defaultValues: { bed: null },
  });

  const handleClose = () => {
    onOpenChange(false);
    form.reset({ bed: null });
    setBedSearch("");
  };

  const onSubmit = async (values: FormValues) => {
    if (!ipdId) return;
    if (!values.bed?.id) {
      toast.error("Please select a bed");
      return;
    }

    const selectedBedId = Number(values.bed.id);
    if (!Number.isFinite(selectedBedId) || selectedBedId <= 0) {
      toast.error("Invalid bed selected");
      return;
    }

    await mutateAsync({ ipdId, bedId: selectedBedId });
    handleClose();
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => (next ? onOpenChange(true) : handleClose())}
    >
      <DialogContent className="max-w-lg border-secondary border-4 bg-white">
        <DialogHeader>
          <DialogTitle className="text-sm text-black/70">
            Reallocate Bed
          </DialogTitle>
          <DialogDescription>Current: {currentBedLabel}</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-3 text-tiny"
          >
            <FormInfiniteSelect<
              BedWithDetails,
              PaginatedResponse<BedWithDetails>,
              string,
              FormValues
            >
              name="bed"
              label="Select Bed"
              control={form.control}
              query={bedQuery as any}
              getItems={(d) => (d as any)?.data ?? []}
              labelKey={(b) => {
                const dept = b.room?.roomType?.department?.name;
                const roomType = b.room?.roomType?.name;
                const room = b.room?.name;
                const bedName = b.name || b.bedNumber;
                return [dept, roomType, room, bedName]
                  .filter(Boolean)
                  .join(" / ");
              }}
              valueKey={(b) => String(b.id)}
              searchValue={bedSearch}
              onSearchChange={setBedSearch}
              placeholder="Search bed..."
              hideError
            />

            <div className="flex justify-end gap-2">
              <CustomButton
                type="button"
                variant="outline"
                onClick={handleClose}
              >
                Cancel
              </CustomButton>
              <CustomButton type="submit" disabled={!ipdId} isLoading={isPending}>
                Save
              </CustomButton>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default ReallocateIpdBedModal;
