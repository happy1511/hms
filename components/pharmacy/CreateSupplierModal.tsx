"use client";

import CustomButton from "@/components/common/CustomButton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
import { DrugSupplier } from "@/generated/prisma/client";
import { useCreateDrugSupplierInline } from "@/hooks/query/drugSupplier";
import FormField from "@/components/form-inputs/FormField";
import { useForm } from "react-hook-form";
import {
  supplierValidator,
  supplierValidatorType,
} from "@/validators/api/masters/supplier";
import { zodResolver } from "@hookform/resolvers/zod";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: (supplier: DrugSupplier) => void;
};

const CreateSupplierModal = ({ open, onOpenChange, onCreated }: Props) => {
  const { mutateAsync: createSupplier, isPending } = useCreateDrugSupplierInline();
  const form = useForm<supplierValidatorType>({
    defaultValues: { name: "", phone: "", gstIn: "", email: "" },
    resolver: zodResolver(
      supplierValidator.pick({
        name: true,
        phone: true,
        gstIn: true,
        email: true,
      }),
    ),
  });

  const handleSubmit = async (values: supplierValidatorType) => {
    const created = await createSupplier(values);
    onCreated(created.data);
    form.reset({ name: "", phone: "", gstIn: "", email: "" });
    onOpenChange(false);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        onOpenChange(nextOpen);
        if (!nextOpen) {
          form.reset({ name: "", phone: "", gstIn: "", email: "" });
        }
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Supplier</DialogTitle>
          <DialogDescription>
            Create a supplier quickly with just the supplier name.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-3">
            <FormField<supplierValidatorType>
              label="Supplier Name"
              name="name"
              type="text"
              control={form.control}
              required
            />

            <DialogFooter>
              <CustomButton
                type="button"
                variant="outline"
                className="bg-white text-black"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </CustomButton>
              <CustomButton type="submit" disabled={isPending}>
                {isPending ? "Saving..." : "Create Supplier"}
              </CustomButton>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateSupplierModal;
