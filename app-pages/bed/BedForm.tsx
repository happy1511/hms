"use client";

import CustomButton from "@/components/common/CustomButton";
import CustomLayout from "@/components/common/CustomLayout";
import FormField from "@/components/form-inputs/FormField";
import { FormInfiniteSelect } from "@/components/form-inputs/FormInfiniteSelect";
import { Form } from "@/components/ui/form";
import { Room } from "@/generated/prisma/client";
import { Status } from "@/generated/prisma/enums";
import { BedGetPayload } from "@/generated/prisma/models";
import { useCreateBed, useGetBed, useUpdateBed } from "@/hooks/query/bed";
import { useInfiniteRoomsList } from "@/hooks/query/room";
import { PaginatedResponse } from "@/lib/type";
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
  const [roomSearchValue, setRoomSearchValue] = useState("");
  const { mutateAsync: create, isPending: creating } = useCreateBed();
  const roomQuery = useInfiniteRoomsList(
    { name: roomSearchValue, status: Status["active"] },
    10,
  );

  const form = useForm<BedValidatorType>({
    resolver: zodResolver(bedValidator),
  });

  const onSubmit = (values: BedValidatorType) => {
    create(values);
  };

  console.log(form.getValues());

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
            Room,
            PaginatedResponse<Room>,
            number,
            BedValidatorType
          >
            name="room"
            label="Room"
            control={form.control}
            query={roomQuery}
            getItems={(data) => data?.data}
            labelKey={(data) => data?.name}
            valueKey={(data) => data.id}
            search={roomSearchValue}
            onSearchChange={setRoomSearchValue}
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

const UpdateForm = ({
  data,
}: {
  data: BedGetPayload<{ include: { room: true } }>;
}) => {
  const { mutateAsync: update, isPending: updating } = useUpdateBed();
  const [roomSearch, setRoomSearch] = useState("");
  const roomQuery = useInfiniteRoomsList({ name: roomSearch }, 10);

  const form = useForm<PartialBedValidatorType>({
    defaultValues: {
      bedNumber: data.bedNumber,
      room: data.room,
      status: data.status,
      bedId: Number(data.id),
    },
    resolver: zodResolver(partialBedValidator),
  });

  const onSubmit = (values: PartialBedValidatorType) => {
    update({ ...values, bedId: Number(data.id) });
  };

  console.log(form.getValues());

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
            Room,
            PaginatedResponse<Room>,
            number,
            PartialBedValidatorType
          >
            name="room"
            control={form.control}
            query={roomQuery}
            getItems={(data) => data?.data}
            labelKey={(data) => data?.name}
            valueKey={(data) => data.id}
            search={roomSearch}
            onSearchChange={setRoomSearch}
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
