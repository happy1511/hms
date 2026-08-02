"use client";

import CustomButton from "@/components/common/CustomButton";
import FormField from "@/components/form-inputs/FormField";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
import { MlcInsuranceType } from "@/generated/prisma/enums";
import { useDeclareIpdMlc } from "@/hooks/query/ipd";
import { IPDType } from "@/lib/type";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const schema = z.object({
  isMlcPatient: z.coerce.boolean().default(true),
  mlcInsuranceType: z.enum(MlcInsuranceType).optional().nullable(),
  mlcPolicyOrCardNumber: z.string().optional().nullable(),
});

type FormValues = z.input<typeof schema>;

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ipd: IPDType | null;
};

const MarkIpdMlcModal = ({ open, onOpenChange, ipd }: Props) => {
  const { mutateAsync, isPending } = useDeclareIpdMlc();

  const form = useForm<FormValues>({
    defaultValues: {
      isMlcPatient: Boolean(ipd?.patient?.isMlcPatient),
      mlcInsuranceType: ipd?.patient?.mlcInsuranceType ?? null,
      mlcPolicyOrCardNumber: ipd?.patient?.mlcPolicyOrCardNumber ?? "",
    },
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    form.reset({
      isMlcPatient: Boolean(ipd?.patient?.isMlcPatient),
      mlcInsuranceType: ipd?.patient?.mlcInsuranceType ?? null,
      mlcPolicyOrCardNumber: ipd?.patient?.mlcPolicyOrCardNumber ?? "",
    });
  }, [form, ipd]);

  const handleClose = () => {
    onOpenChange(false);
    form.reset({
      isMlcPatient: Boolean(ipd?.patient?.isMlcPatient),
      mlcInsuranceType: ipd?.patient?.mlcInsuranceType ?? null,
      mlcPolicyOrCardNumber: ipd?.patient?.mlcPolicyOrCardNumber ?? "",
    });
  };

  const onSubmit = async (values: FormValues) => {
    if (!ipd?.id) return;

    await mutateAsync({
      ipdId: Number(ipd.id),
      isMlcPatient: Boolean(values.isMlcPatient),
      mlcInsuranceType: values.mlcInsuranceType ?? null,
      mlcPolicyOrCardNumber: values.mlcPolicyOrCardNumber ?? "",
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
          <DialogTitle className="text-sm text-black/70">
            {ipd?.patient?.isMlcPatient ? "Edit MLC Details" : "Mark as MLC"}
          </DialogTitle>
          <DialogDescription>
            {[ipd?.patient?.firstName, ipd?.patient?.lastName]
              .filter(Boolean)
              .join(" ") || "Patient"}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-3 text-tiny"
          >
            <FormField<FormValues>
              label="Medico Legal (MLC)"
              name="isMlcPatient"
              control={form.control}
              type="checkbox"
            />

            <FormField<FormValues>
              label="Insurance Type"
              name="mlcInsuranceType"
              control={form.control}
              type="select"
              options={Object.values(MlcInsuranceType).map((value) => ({
                label: value,
                value,
              }))}
            />
            <FormField<FormValues>
              label="Policy / Card Number"
              name="mlcPolicyOrCardNumber"
              control={form.control}
              type="text"
            />

            <div className="flex justify-end gap-2">
              <CustomButton
                type="button"
                variant="outline"
                onClick={handleClose}
              >
                Cancel
              </CustomButton>
              <CustomButton type="submit" disabled={!ipd?.id} isLoading={isPending}>
                Save
              </CustomButton>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default MarkIpdMlcModal;
