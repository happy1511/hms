"use client";

import CustomButton from "@/components/common/CustomButton";
import { FormInfiniteSelect } from "@/components/form-inputs/FormInfiniteSelect";
import { Form } from "@/components/ui/form";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useInfiniteDoctorList } from "@/hooks/query/doctor";
import { Doctor, PaginatedResponse } from "@/lib/type";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";

type PrintConsultationFormValues = {
  doctor: Doctor | null;
};

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  opdId?: number | null;
  currentConsultantName?: string | null;
};

const PrintConsultationModal = ({
  open,
  onOpenChange,
  opdId,
  currentConsultantName,
}: Props) => {
  const [doctorSearch, setDoctorSearch] = useState("");

  const doctorQuery = useInfiniteDoctorList(
    {
      doctorType: "consulting",
      name: doctorSearch,
    },
    10,
    open,
  );

  const form = useForm<PrintConsultationFormValues>({
    defaultValues: {
      doctor: null,
    },
  });

  const resolvedOpdId = useMemo(() => {
    if (opdId === null || opdId === undefined) return null;
    const parsed = Number(opdId);
    return Number.isFinite(parsed) ? parsed : null;
  }, [opdId]);

  const onSubmit = (values: PrintConsultationFormValues) => {
    if (!resolvedOpdId) return;

    const selectedDoctorId = values.doctor?.userId
      ? String(values.doctor.userId)
      : "";
    const url = selectedDoctorId
      ? `/opd/consultation-print/${resolvedOpdId}?doctorId=${encodeURIComponent(selectedDoctorId)}`
      : `/opd/consultation-print/${resolvedOpdId}`;

    window.open(url, "_blank");
    onOpenChange(false);
    form.reset({ doctor: null });
    setDoctorSearch("");
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        onOpenChange(nextOpen);
        if (!nextOpen) {
          form.reset({ doctor: null });
          setDoctorSearch("");
        }
      }}
    >
      <DialogContent className="max-w-lg border-secondary border-4 bg-white">
        <DialogHeader>
          <DialogTitle className="text-sm text-black/70">
            Print Consultation
          </DialogTitle>
          <DialogDescription>
            Current consultant: {currentConsultantName || "--"} (leave blank to
            keep same)
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-3 text-tiny"
          >
            <FormInfiniteSelect<
              Doctor,
              PaginatedResponse<Doctor>,
              string,
              PrintConsultationFormValues
            >
              name="doctor"
              label="Override Consultant (Optional)"
              control={form.control}
              query={doctorQuery}
              getItems={(d) => d?.data}
              labelKey={(i) => i.user.name}
              valueKey={(i) => String(i.userId)}
              search={doctorSearch}
              onSearchChange={setDoctorSearch}
              placeholder="Search doctor by name..."
              hideError
            />

            <div className="flex justify-end gap-2">
              <CustomButton
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </CustomButton>
              <CustomButton type="submit" disabled={!resolvedOpdId}>
                Print
              </CustomButton>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default PrintConsultationModal;
