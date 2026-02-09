"use client";

import CustomButton from "@/components/common/CustomButton";
import CustomLayout from "@/components/common/CustomLayout";
import FormField from "@/components/form-inputs/FormField";
import { Form } from "@/components/ui/form";
import { Floor } from "@/generated/prisma/client";
import { Status } from "@/generated/prisma/enums";
import {
  useCreateFloor,
  useGetFloor,
  useUpdateFloor,
} from "@/hooks/query/floor";
import { FloorType } from "@/lib/type";
import {
  floorValidator,
  FloorValidatorType,
} from "@/validators/api/masters/floor";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoaderIcon } from "lucide-react";
import { useParams } from "next/navigation";
import { useForm } from "react-hook-form";

const getInitialValues = (data?: FloorType): FloorValidatorType => ({
  name: data?.name ?? "",
  description: data?.description ?? null,
  status: data?.status ?? Status["active"],
});

const UpdateCreateForm = ({ data }: { data?: Floor }) => {
  const { mutateAsync: create, isPending: creating } = useCreateFloor();
  const { mutateAsync: update, isPending: updating } = useUpdateFloor();

  const form = useForm<FloorValidatorType>({
    defaultValues: getInitialValues(data),
    resolver: zodResolver(floorValidator),
  });

  const onSubmit = (values: FloorValidatorType) => {
    if (data) {
      update({ floorId: Number(data.id), ...values });
    } else {
      create(values);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className="grid grid-cols-2 gap-x-2">
          <FormField<FloorValidatorType>
            label="Name"
            type="text"
            name="name"
            control={form.control}
            required
          />

          <FormField<FloorValidatorType>
            label="Status"
            type="select"
            name="status"
            options={Object.values(Status).map((s) => ({ value: s, label: s }))}
            control={form.control}
            required
          />
          <FormField<FloorValidatorType>
            label="Description"
            type="textarea"
            name="description"
            control={form.control}
            required
          />
        </div>
        <CustomButton disabled={creating || updating} type="submit">
          Submit
        </CustomButton>
      </form>
    </Form>
  );
};

const FloorForm = () => {
  const { floorId }: { floorId?: string } = useParams();

  const { data, isLoading: fetchingFloor } = useGetFloor(floorId);

  if (fetchingFloor) {
    return (
      <div className="flex justify-center items-center h-full">
        <LoaderIcon
          role="status"
          aria-label="Loading"
          className="size-4 animate-spin"
        />
      </div>
    );
  }

  if (floorId && !data) {
    return <></>;
  }

  return (
    <CustomLayout title={floorId ? "Edit Floor" : "Create Floor"}>
      {floorId ? <UpdateCreateForm data={data} /> : <UpdateCreateForm />}
    </CustomLayout>
  );
};

export default FloorForm;
