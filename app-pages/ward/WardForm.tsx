"use client";

import CustomButton from "@/components/common/CustomButton";
import CustomLayout from "@/components/common/CustomLayout";
import FormField from "@/components/form-inputs/FormField";
import { Form } from "@/components/ui/form";
import { Status } from "@/generated/prisma/enums";
import { useInfiniteFloorsList } from "@/hooks/query/floor";
import { useCreateWard, useGetWard, useUpdateWard } from "@/hooks/query/ward";
import { Floor } from "@/generated/prisma/client";
import {
  wardValidator,
  WardValidatorType,
} from "@/validators/api/masters/ward";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoaderIcon } from "lucide-react";
import { useParams } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { PaginatedResponse } from "@/lib/type";
import { FormInfiniteSelect } from "@/components/form-inputs/FormInfiniteSelect";
import { WardGetPayload } from "@/generated/prisma/models";

const getInitialValues = (
  data?: WardGetPayload<{ include: { floor: true } }>,
): WardValidatorType => ({
  name: data?.name ?? "",
  description: data?.description ?? null,
  status: data?.status ?? Status["active"],
  floor: data?.floor ?? undefined,
});

const UpdateCreateForm = ({
  data,
}: {
  data?: WardGetPayload<{ include: { floor: true } }>;
}) => {
  const [floorSearchValue, setFloorSearchValue] = useState("");
  const { mutateAsync: create, isPending: creating } = useCreateWard();
  const { mutateAsync: update, isPending: updating } = useUpdateWard();
  const floorQuery = useInfiniteFloorsList({ name: floorSearchValue }, 10);

  const form = useForm<WardValidatorType>({
    defaultValues: getInitialValues(data),
    resolver: zodResolver(wardValidator),
  });

  const onSubmit = (values: WardValidatorType) => {
    if (data) {
      update({ wardId: Number(data.id), ...values });
    } else {
      create(values);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className="grid grid-cols-2 gap-x-2">
          <FormField<WardValidatorType>
            label="Name"
            type="text"
            name="name"
            control={form.control}
            required
          />
          <FormField<WardValidatorType>
            label="Status"
            type="select"
            name="status"
            options={Object.values(Status).map((s) => ({ value: s, label: s }))}
            control={form.control}
            required
          />
          <FormInfiniteSelect<
            Floor,
            PaginatedResponse<Floor>,
            string,
            WardValidatorType
          >
            label="Floor"
            name="floor"
            control={form.control}
            query={floorQuery}
            getItems={(p) => p?.data}
            valueKey={(i) => String(i?.id)}
            labelKey={(i) => i?.name}
            search={floorSearchValue}
            onSearchChange={setFloorSearchValue}
            required
          />

          <FormField<WardValidatorType>
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

const WardForm = () => {
  const { wardId }: { wardId?: string } = useParams();

  const { data, isLoading: fetchingWard } = useGetWard(wardId);

  if (fetchingWard) {
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

  if (wardId && !data) {
    return <div />;
  }

  return (
    <CustomLayout title={wardId ? "Edit Ward" : "Create Ward"}>
      {wardId ? <UpdateCreateForm data={data} /> : <UpdateCreateForm />}
    </CustomLayout>
  );
};

export default WardForm;
