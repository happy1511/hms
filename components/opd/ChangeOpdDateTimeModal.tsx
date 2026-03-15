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
import { useUpdateOpdDateTime } from "@/hooks/query/opd";
import { OPDType } from "@/lib/type";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  opd: OPDType | null;
};

const schema = z.object({
  opdDateTime: z.date(),
});

type FormValues = z.infer<typeof schema>;

const toSafeDate = (value: unknown): Date => {
  if (value instanceof Date) return value;
  if (typeof value === "string" || typeof value === "number") {
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? new Date() : d;
  }
  return new Date();
};

const ChangeOpdDateTimeModal = ({ open, onOpenChange, opd }: Props) => {
  const { mutateAsync, isPending } = useUpdateOpdDateTime();

  const opdId = useMemo(() => (opd?.id ? Number(opd.id) : null), [opd]);
  const currentDate = useMemo(() => {
    return toSafeDate(opd?.opdDateTime);
  }, [opd]);

  const form = useForm<FormValues>({
    defaultValues: { opdDateTime: currentDate },
    resolver: zodResolver(schema),
  });

  const handleClose = () => {
    onOpenChange(false);
    form.reset({ opdDateTime: currentDate });
  };

  const onSubmit = async (values: FormValues) => {
    if (!opdId) return;
    await mutateAsync({ opdId, opdDateTime: values.opdDateTime });
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
            Change OPD Date/Time
          </DialogTitle>
          <DialogDescription>
            Current: {currentDate.toLocaleString()}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-3 text-tiny"
          >
            <FormField<FormValues>
              label="OPD Date/Time"
              name="opdDateTime"
              control={form.control}
              type="dateTime"
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
              <CustomButton type="submit" disabled={isPending || !opdId}>
                Save
              </CustomButton>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default ChangeOpdDateTimeModal;
