"use client";

import CustomButton from "@/components/common/CustomButton";
import FormField from "@/components/form-inputs/FormField";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
import { useCreatePharmacyCustomer } from "@/hooks/query/pharmacyCustomer";
import { formatPatientAddress } from "@/lib/address";
import { PatientType, PharmacyCustomerType } from "@/lib/type";
import { pharmacyCustomerValidatorType } from "@/validators/api/masters/pharmacyCustomer";
import { useEffect } from "react";
import { useForm } from "react-hook-form";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: (customer: PharmacyCustomerType) => void;
  selectedPatient?: PatientType | null;
}

const CreatePharmacyCustomerModal = ({
  open,
  onOpenChange,
  onCreated,
  selectedPatient,
}: Props) => {
  const { mutateAsync, isPending } = useCreatePharmacyCustomer();

  const form = useForm<pharmacyCustomerValidatorType>({
    defaultValues: {
      name: "",
      address: "",
      contact: "",
      isBusinessCustomer: false,
      dlNumber: "",
      gstNumber: "",
    },
  });

  useEffect(() => {
    const patientName = selectedPatient
      ? [
          `${selectedPatient.title}.`,
          selectedPatient.firstName,
          selectedPatient.lastName,
        ].join(" ")
      : "";
    const patientContact = selectedPatient?.contacts?.[0]?.value || "";
    const patientAddress = formatPatientAddress(selectedPatient ?? undefined);

    form.reset({
      name: patientName,
      contact: patientContact,
      address: patientAddress,
      isBusinessCustomer: false,
      dlNumber: "",
      gstNumber: "",
    });
  }, [form, selectedPatient]);

  const isBusinessCustomer = Boolean(form.watch("isBusinessCustomer"));

  const onSubmit = async (values: pharmacyCustomerValidatorType) => {
    const response = await mutateAsync({
      name: values.name,
      address: values.address || null,
      contact: values.contact || null,
      isBusinessCustomer: Boolean(values.isBusinessCustomer),
      dlNumber: values.dlNumber || null,
      gstNumber: values.gstNumber || null,
      patientId: selectedPatient?.id ? Number(selectedPatient.id) : undefined,
    });

    form.reset();
    onCreated(response.data);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl! border-secondary border-4 bg-white">
        <DialogHeader>
          <DialogTitle className="text-sm">New Pharmacy Customer</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <FormField
                label="Customer Name"
                type="text"
                name="name"
                control={form.control}
                required
              />
              <FormField
                label="Contact"
                type="text"
                name="contact"
                control={form.control}
              />
              <div className="col-span-2">
                <FormField
                  label="Address"
                  type="textarea"
                  name="address"
                  control={form.control}
                />
              </div>
              <FormField
                label="Business Customer"
                type="checkbox"
                name="isBusinessCustomer"
                control={form.control}
              />
              {isBusinessCustomer && (
                <>
                  <FormField
                    label="DL Number"
                    type="text"
                    name="dlNumber"
                    control={form.control}
                  />
                  <FormField
                    label="GST Number"
                    type="text"
                    name="gstNumber"
                    control={form.control}
                  />
                </>
              )}
            </div>
            <div className="flex justify-end gap-2">
              <CustomButton
                type="button"
                variant="outline"
                className="bg-white text-black"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </CustomButton>
              <CustomButton type="submit" disabled={isPending}>
                Save Customer
              </CustomButton>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default CreatePharmacyCustomerModal;
