"use client";

import CustomButton from "@/components/common/CustomButton";
import CustomLayout from "@/components/common/CustomLayout";
import FormField from "@/components/form-inputs/FormField";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
import { Location } from "@/generated/prisma/client";
import { useCreateLocation, useUpdateLocation } from "@/hooks/query/locations";
import {
  locationValidator,
  LocationValidatorType,
} from "@/validators/api/masters/location";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";

const UpdateForm = ({
  data,
  onSuccess,
}: {
  data?: Location;
  onSuccess: () => void;
}) => {
  const { mutateAsync: create, isPending: creating } = useCreateLocation();
  const { mutateAsync: update, isPending: updating } = useUpdateLocation();

  const form = useForm<LocationValidatorType>({
    defaultValues: {
      city: data?.city || "",
      state: data?.state || "",
      country: data?.country || "",
      postcode: data?.postcode || "",
      postName: data?.postName || "",
    },
    resolver: zodResolver(locationValidator),
  });

  const onSubmit = async (values: LocationValidatorType) => {
    if (data) {
      await update({ ...values, id: Number(data.id) });
    } else {
      await create({ ...values });
    }
    form.reset();
    onSuccess();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className="grid grid-cols-2 gap-x-2">
          <FormField<LocationValidatorType>
            label="City"
            type="text"
            name="city"
            control={form.control}
            required
          />
          <FormField<LocationValidatorType>
            label="State"
            type="text"
            name="state"
            control={form.control}
            required
          />
          <FormField<LocationValidatorType>
            label="Country"
            type="text"
            name="country"
            control={form.control}
            required
          />
          <FormField<LocationValidatorType>
            label="Post Code"
            type="text"
            name="postcode"
            control={form.control}
            required
          />
          <FormField<LocationValidatorType>
            label="Post Name"
            type="text"
            name="postName"
            control={form.control}
            required
          />
        </div>
        <CustomButton isLoading={updating || creating} type="submit">
          Submit
        </CustomButton>
      </form>
    </Form>
  );
};

const LocationForm = ({
  data,
  trigger,
}: {
  data?: Location;
  trigger: React.ReactNode;
}) => {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={(open) => setOpen(open)}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent
        showCloseButton={false}
        className="max-w-4xl! border-secondary border-4 bg-white p-0 gap-0"
      >
        <DialogHeader>
          <DialogTitle className="sr-only"></DialogTitle>
          <DialogDescription className="sr-only">
            This action cannot be undone. This will permanently delete your
            account and remove your data from our servers.
          </DialogDescription>
        </DialogHeader>
        <CustomLayout title={data ? "Edit Location" : "Create Location"}>
          <UpdateForm data={data} onSuccess={() => setOpen(false)} />
        </CustomLayout>
      </DialogContent>
    </Dialog>
  );
};

export default LocationForm;
