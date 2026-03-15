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
import { useInfiniteDoctorList } from "@/hooks/query/doctor";
import { useUpdateIpdDoctors } from "@/hooks/query/ipd";
import { Doctor, IPDType, PaginatedResponse } from "@/lib/type";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

type Mode = "consultant" | "referring";

type FormValues = {
  doctor: Doctor | null;
};

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ipd: IPDType | null;
  mode: Mode;
};

const ChangeIpdDoctorModal = ({ open, onOpenChange, ipd, mode }: Props) => {
  const [doctorSearch, setDoctorSearch] = useState("");
  const { mutateAsync, isPending } = useUpdateIpdDoctors();

  const doctorQuery = useInfiniteDoctorList(
    {
      doctorType: "consulting",
      name: doctorSearch,
    },
    10,
    open,
  );

  const form = useForm<FormValues>({
    defaultValues: { doctor: null },
  });

  const title =
    mode === "consultant" ? "Change Consultant" : "Change Referred By";
  const currentName =
    mode === "consultant"
      ? ipd?.consultantDoctor?.user?.name
      : ipd?.referringDoctor?.user?.name;

  const ipdId = useMemo(() => (ipd?.id ? Number(ipd.id) : null), [ipd?.id]);

  const handleClose = () => {
    onOpenChange(false);
    form.reset({ doctor: null });
    setDoctorSearch("");
  };

  const onSubmit = async (values: FormValues) => {
    if (!ipdId) return;
    if (!values.doctor?.userId) {
      toast.error("Please select a doctor");
      return;
    }

    const selectedUserId = Number(values.doctor.userId);
    if (!Number.isFinite(selectedUserId) || selectedUserId <= 0) {
      toast.error("Invalid doctor selected");
      return;
    }

    if (mode === "consultant") {
      await mutateAsync({
        ipdId,
        consultantDoctor: { userId: selectedUserId },
      });
    } else {
      await mutateAsync({
        ipdId,
        referredDoctor: { userId: selectedUserId },
      });
    }

    handleClose();
  };

  const handleClearReferring = async () => {
    if (!ipdId) return;
    await mutateAsync({
      ipdId,
      referredDoctor: null,
    });
    handleClose();
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => (next ? onOpenChange(true) : handleClose())}
    >
      <DialogContent className="max-w-lg border-secondary border-4 bg-white">
        <DialogHeader>
          <DialogTitle className="text-sm text-black/70">{title}</DialogTitle>
          <DialogDescription>Current: {currentName || "--"}</DialogDescription>
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
              FormValues
            >
              name="doctor"
              label="Select Doctor"
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
                onClick={handleClose}
              >
                Cancel
              </CustomButton>
              <CustomButton type="submit" disabled={isPending || !ipdId}>
                Save
              </CustomButton>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default ChangeIpdDoctorModal;
