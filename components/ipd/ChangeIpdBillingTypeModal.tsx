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
import { PaymentCategory } from "@/generated/prisma/enums";
import { useUpdateIpdBillingType } from "@/hooks/query/ipd";
import { IPDType } from "@/lib/type";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

type FormValues = {
  billingType: PaymentCategory;
};

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ipd: IPDType | null;
};

const schema = z.object({
  billingType: z.enum(PaymentCategory),
});

const ChangeIpdBillingTypeModal = ({ open, onOpenChange, ipd }: Props) => {
  const { mutateAsync, isPending } = useUpdateIpdBillingType();

  const ipdId = useMemo(() => (ipd?.id ? Number(ipd.id) : null), [ipd?.id]);
  const currentType = ipd?.invoice?.billingType ?? PaymentCategory.SELF_PAY;

  const form = useForm<FormValues>({
    defaultValues: { billingType: currentType },
    resolver: zodResolver(schema),
  });

  const handleClose = () => {
    onOpenChange(false);
    form.reset({ billingType: currentType });
  };

  const onSubmit = async (values: FormValues) => {
    if (!ipdId) return;
    await mutateAsync({ ipdId, billingType: values.billingType });
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
            Change Billing Type
          </DialogTitle>
          <DialogDescription>
            Current: {String(currentType || "--")}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-3 text-tiny"
          >
            <FormField<FormValues>
              label="Billing Type"
              name="billingType"
              control={form.control}
              type="select"
              options={Object.values(PaymentCategory).map((p) => ({
                label: p,
                value: p,
              }))}
              required
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

export default ChangeIpdBillingTypeModal;

