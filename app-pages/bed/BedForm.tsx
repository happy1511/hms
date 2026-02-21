"use client";

import CustomButton from "@/components/common/CustomButton";
import CustomLayout from "@/components/common/CustomLayout";
import FormField from "@/components/form-inputs/FormField";
import { FormInfiniteSelect } from "@/components/form-inputs/FormInfiniteSelect";
import { Form } from "@/components/ui/form";
import { Status } from "@/generated/prisma/enums";
import { useCreateBed, useGetBed, useUpdateBed } from "@/hooks/query/bed";
import { useInfiniteWardsList } from "@/hooks/query/ward";
import { BedType, PaginatedResponse, WardType } from "@/lib/type";
import {
  bedValidator,
  BedValidatorType,
  partialBedValidator,
  PartialBedValidatorType,
} from "@/validators/api/masters/bed";

import { zodResolver } from "@hookform/resolvers/zod";
import { LoaderIcon } from "lucide-react";
import { useParams } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";

const CreateForm = () => {
  const [floorSearchValue, setFloorSearchValue] = useState("");
  const { mutateAsync: create, isPending: creating } = useCreateBed();
  const wardQuery = useInfiniteWardsList({ name: floorSearchValue }, 10);

  const form = useForm<BedValidatorType>({
    defaultValues: {},
    resolver: zodResolver(bedValidator),
  });

  const onSubmit = (values: BedValidatorType) => {
    create(values);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className="grid grid-cols-2 gap-x-2">
          <FormField<BedValidatorType>
            label="Number of Beds"
            type="number"
            name="countOfBEd"
            control={form.control}
            required
          />
          <FormInfiniteSelect<
            WardType,
            PaginatedResponse<WardType>,
            string,
            BedValidatorType
          >
            name="wardId"
            control={form.control}
            query={wardQuery}
            getItems={(data) => data?.data}
            labelKey={(data) => data?.name}
            valueKey={(data) => String(data?.id)}
            search={floorSearchValue}
            onSearchChange={setFloorSearchValue}
            required
          />
        </div>
        <CustomButton disabled={creating} type="submit">
          Submit
        </CustomButton>
      </form>
    </Form>
  );
};

const UpdateForm = ({ data }: { data: BedType }) => {
  const { mutateAsync: update, isPending: updating } = useUpdateBed();
  const [wardSearch, setWardSearch] = useState("");
  const wardQuery = useInfiniteWardsList({ name: wardSearch }, 10);

  const form = useForm<PartialBedValidatorType>({
    defaultValues: {
      bedNumber: data.bedNumber,
      wardId: data.wardId,
      status: data.status,
      occupied: data.occupied,
      bedId: Number(data.id),
    },
    resolver: zodResolver(partialBedValidator),
  });

  const onSubmit = (values: PartialBedValidatorType) => {
    update({ ...values, bedId: Number(data.id) });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className="grid grid-cols-2 gap-x-2">
          <FormField<PartialBedValidatorType>
            label="Bed Number"
            type="text"
            name="bedNumber"
            control={form.control}
            required
            readOnly
          />
          <FormField<PartialBedValidatorType>
            label="Status"
            type="select"
            name="status"
            options={Object.values(Status).map((s) => ({ value: s, label: s }))}
            control={form.control}
            required
          />
          <FormInfiniteSelect<
            WardType,
            PaginatedResponse<WardType>,
            string,
            PartialBedValidatorType
          >
            name="wardId"
            control={form.control}
            query={wardQuery}
            getItems={(data) => data?.data}
            labelKey={(data) => data?.name}
            valueKey={(data) => String(data?.id)}
            search={wardSearch}
            onSearchChange={setWardSearch}
            required
          />
        </div>
        <CustomButton disabled={updating} type="submit">
          Submit
        </CustomButton>
      </form>
    </Form>
  );
};

const BedForm = () => {
  const { bedId }: { bedId?: string } = useParams();

  const { data, isLoading: fetchingBed } = useGetBed(bedId);

  if (fetchingBed) {
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

  if (bedId && !data) {
    return <div />;
  }

  return (
    <CustomLayout title={bedId ? "Edit Bed" : "Create Bed"}>
      {bedId && data ? <UpdateForm data={data} /> : <CreateForm />}
    </CustomLayout>
  );
};

export default BedForm;
