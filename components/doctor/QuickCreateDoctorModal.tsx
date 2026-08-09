"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import FormField from "@/components/form-inputs/FormField";
import CustomButton from "@/components/common/CustomButton";
import CustomLayout from "@/components/common/CustomLayout";
import {
  DoctorType,
  Gender,
  NameTitle,
  Status,
} from "@/generated/prisma/enums";
import { useCreateDoctor } from "@/hooks/query/doctor";
import {
  doctorValidator,
  DoctorValidatorType,
} from "@/validators/api/masters/doctor";
import { Doctor } from "@/lib/type";

interface QuickCreateDoctorModalProps {
  doctorType?: DoctorType;
  onSuccess?: (createdDoctor: Doctor) => void;
  trigger?: React.ReactNode;
}

export default function QuickCreateDoctorModal({
  doctorType = DoctorType.consulting,
  onSuccess,
  trigger,
}: QuickCreateDoctorModalProps) {
  const [open, setOpen] = useState(false);
  const { mutateAsync: createDoctor, isPending } = useCreateDoctor();

  const form = useForm<DoctorValidatorType>({
    defaultValues: {
      doctorType,
      title: NameTitle.DR,
      firstName: "",
      middleName: "",
      lastName: "",
      gender: Gender.Male,
      userType: "Doctor",
      status: Status.active,
      consultationCharges: 0,
      phoneNumber: "",
    },
    resolver: zodResolver(doctorValidator),
  });

  const selectedDoctorType = form.watch("doctorType") || doctorType;
  const isConsulting = selectedDoctorType === DoctorType.consulting;

  const handleSubmit = async (values: DoctorValidatorType) => {
    try {
      const res = await createDoctor(values);
      if (res?.data) {
        onSuccess?.(res.data as Doctor);
      }
      form.reset();
      setOpen(false);
    } catch (e) {
      // Error handled by hook
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="h-9 w-9 shrink-0 border-dashed"
            title="Add Doctor"
          >
            <PlusIcon className="h-4 w-4" />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent showCloseButton={false} className="max-w-md sm:max-w-lg p-0 gap-0 border-4 border-secondary bg-white">
        <DialogHeader className="sr-only">
          <DialogTitle>Quick Create Doctor</DialogTitle>
        </DialogHeader>

        <CustomLayout title="Quick Create Doctor">
          <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
          >
            <FormField<DoctorValidatorType>
              label="Doctor Type"
              type="select"
              name="doctorType"
              options={Object.values(DoctorType).map((t) => ({
                value: t,
                label: t,
              }))}
              control={form.control}
              required
            />

            {isConsulting ? (
              <div className="grid grid-cols-2 gap-2">
                <FormField<DoctorValidatorType>
                  label="Title"
                  type="select"
                  name="title"
                  options={Object.values(NameTitle).map((t) => ({
                    value: t,
                    label: t,
                  }))}
                  control={form.control}
                  required
                />
                <FormField<DoctorValidatorType>
                  label="Gender"
                  type="select"
                  name="gender"
                  options={Object.values(Gender).map((g) => ({
                    value: g,
                    label: g,
                  }))}
                  control={form.control}
                  required
                />
                <FormField<DoctorValidatorType>
                  label="First Name"
                  type="text"
                  name="firstName"
                  control={form.control}
                  required
                />
                <FormField<DoctorValidatorType>
                  label="Middle Name"
                  type="text"
                  name="middleName"
                  control={form.control}
                />
                <FormField<DoctorValidatorType>
                  label="Last Name/Surname"
                  type="text"
                  name="lastName"
                  control={form.control}
                  required
                />
                <FormField<DoctorValidatorType>
                  label="User Type"
                  type="select"
                  name="userType"
                  options={[
                    { value: "Doctor", label: "Doctor" },
                    { value: "Doctor (Dental)", label: "Doctor (Dental)" },
                    {
                      value: "Doctor (Dermatologist)",
                      label: "Doctor (Dermatologist)",
                    },
                  ]}
                  control={form.control}
                  required
                />
                <FormField<DoctorValidatorType>
                  label="Consultation Charges"
                  type="number"
                  name="consultationCharges"
                  control={form.control}
                />
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <FormField<DoctorValidatorType>
                  label="First Name / Full Name"
                  type="text"
                  name="firstName"
                  control={form.control}
                  required
                />
                <FormField<DoctorValidatorType>
                  label="Phone Number"
                  type="text"
                  name="phoneNumber"
                  control={form.control}
                />
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <CustomButton type="submit" isLoading={isPending}>
                Create Doctor
              </CustomButton>
            </div>
          </form>
        </Form>
        </CustomLayout>
      </DialogContent>
    </Dialog>
  );
}
