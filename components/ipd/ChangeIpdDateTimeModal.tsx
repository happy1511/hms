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
import { useUpdateIpdDateTime } from "@/hooks/query/ipd";
import { IPDType } from "@/lib/type";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ipd: IPDType | null;
};

const schema = z.object({
  ipdDateTime: z.date(),
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

const ChangeIpdDateTimeModal = ({ open, onOpenChange, ipd }: Props) => {
  const { mutateAsync, isPending } = useUpdateIpdDateTime();

  const ipdId = useMemo(() => (ipd?.id ? Number(ipd.id) : null), [ipd]);
  const currentDate = useMemo(() => {
    return toSafeDate(ipd?.ipdDateTime);
  }, [ipd]);

  const form = useForm<FormValues>({
    defaultValues: { ipdDateTime: currentDate },
    resolver: zodResolver(schema),
  });

  const handleClose = () => {
    onOpenChange(false);
    form.reset({ ipdDateTime: currentDate });
  };

  const onSubmit = async (values: FormValues) => {
    if (!ipdId) return;
    await mutateAsync({ ipdId, ipdDateTime: values.ipdDateTime });
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
            Change IPD Date/Time
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
              label="IPD Date/Time"
              name="ipdDateTime"
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

export default ChangeIpdDateTimeModal;
