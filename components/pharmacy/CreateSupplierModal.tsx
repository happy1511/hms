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
  const form = useForm<Pick<supplierValidatorType, "name">>({
    defaultValues: { name: "" },
    resolver: zodResolver(supplierValidator.pick({ name: true })),
  });

  const handleSubmit = async (values: Pick<supplierValidatorType, "name">) => {
    const created = await createSupplier(values);
    onCreated(created.data);
    form.reset({ name: "" });
    onOpenChange(false);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        onOpenChange(nextOpen);
        if (!nextOpen) {
          form.reset({ name: "" });
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
            <FormField<Pick<supplierValidatorType, "name">>
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
