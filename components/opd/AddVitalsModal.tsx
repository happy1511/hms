import { vitalsValidator, vitalValidatorType } from "@/validators/api/opd/opd";
import { zodResolver } from "@hookform/resolvers/zod";
import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { PlusIcon } from "lucide-react";
import { Form } from "../ui/form";
import FormField from "../form-inputs/FormField";
import CustomButton from "../common/CustomButton";
import { useUpdateOpdVitals } from "@/hooks/query/opd";
import { OPDType } from "@/lib/type";

interface Props {
  opdId: number;
  vital: OPDType["vital"];
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger?: React.ReactNode;
}

const AddVitalsModal = ({
  opdId,
  vital,
  open,
  onOpenChange,
  trigger,
}: Props) => {
  const { mutateAsync, isPending } = useUpdateOpdVitals();

  const vitalsForm = useForm<vitalValidatorType>({
    defaultValues: {
      opdId: opdId,
    },
    resolver: zodResolver(vitalsValidator),
  });

  const onSubmit = (values: vitalValidatorType) => {
    mutateAsync(values, { onSuccess: () => onOpenChange?.(false) });
  };

  useEffect(() => {
    vitalsForm.reset({
      ...vital,
    });
  }, [vital, vitalsForm]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button
            variant="outline"
            className="h-auto shadow-none p-1 cursor-pointer"
          >
            <PlusIcon className="size-2.5 text-destructive" />
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="max-w-xl! border-secondary border-4 bg-white">
        <DialogHeader>
          <DialogTitle className="text-black/60 text-sm">
            Add Vitals Details
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 max-h-[70dvh] overflow-y-auto text-tiny">
          <Form {...vitalsForm}>
            <form onSubmit={vitalsForm.handleSubmit(onSubmit)}>
              <FormField
                control={vitalsForm.control}
                label="Height (cm)"
                name="height"
                type="number"
              />
              <FormField
                control={vitalsForm.control}
                label="Weight (kg)"
                name="weight"
                type="number"
              />
              <FormField
                control={vitalsForm.control}
                label="bp (mm)"
                name="bpMm"
                type="number"
              />
              <FormField
                control={vitalsForm.control}
                label="bp (Hg)"
                name="bpHg"
                type="number"
              />
              <FormField
                control={vitalsForm.control}
                label="Pulse (/min)"
                name="pulse"
                type="number"
              />
              <FormField
                control={vitalsForm.control}
                label="RBS (mg/dL)"
                name="rbs"
                type="number"
              />
              <FormField
                control={vitalsForm.control}
                label="RBS (/min)"
                name="rr"
                type="number"
              />
              <FormField
                control={vitalsForm.control}
                label="SpO2 (%)"
                name="spo2"
                type="number"
              />
              <FormField
                control={vitalsForm.control}
                label="Temp (F)"
                name="temp"
                type="number"
              />
              <div className="col-span-2 space-x-2">
                <div className="w-full flex justify-end">
                  <CustomButton
                    disabled={isPending}
                    type="submit"
                    className="self-end"
                  >
                    Save
                  </CustomButton>
                </div>
              </div>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddVitalsModal;
