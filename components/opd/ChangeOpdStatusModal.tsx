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
import { OpdStatus } from "@/generated/prisma/enums";
import { useUpdateOpdStatus } from "@/hooks/query/opd";
import { OPDType } from "@/lib/type";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const schema = z.object({
  status: z.enum(OpdStatus),
});

type FormValues = z.infer<typeof schema>;

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  opd: OPDType | null;
};

const ChangeOpdStatusModal = ({ open, onOpenChange, opd }: Props) => {
  const { mutateAsync, isPending } = useUpdateOpdStatus();

  const opdId = useMemo(() => (opd?.id ? Number(opd.id) : null), [opd]);
  const currentStatus = (opd as any)?.status ?? OpdStatus.IN_QUEUE;

  const form = useForm<FormValues>({
    defaultValues: { status: currentStatus },
    resolver: zodResolver(schema),
  });

  const handleClose = () => {
    onOpenChange(false);
    form.reset({ status: currentStatus });
  };

  const onSubmit = async (values: FormValues) => {
    if (!opdId) return;
    await mutateAsync({ opdId, status: values.status });
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
            Change OPD Status
          </DialogTitle>
          <DialogDescription>
            Current: {String(currentStatus || "--")}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-3 text-tiny"
          >
            <FormField<FormValues>
              label="Status"
              name="status"
              control={form.control}
              type="select"
              options={Object.values(OpdStatus).map((s) => ({
                label: s.replaceAll("_", " ").toLowerCase(),
                value: s,
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

export default ChangeOpdStatusModal;

