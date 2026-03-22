"use client";

import CustomButton from "@/components/common/CustomButton";
import CustomLayout from "@/components/common/CustomLayout";
import NoPermission from "@/components/common/NoPermission";
import FormField from "@/components/form-inputs/FormField";
import { Form } from "@/components/ui/form";
import { ActionType, ModuleType, Status } from "@/generated/prisma/enums";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoaderIcon } from "lucide-react";
import { useParams } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { PaginatedResponse } from "@/lib/type";
import { FormInfiniteSelect } from "@/components/form-inputs/FormInfiniteSelect";
import { RoomGetPayload } from "@/generated/prisma/models";
import { useInfiniteRoomTypeList } from "@/hooks/query/roomType";
import { RoomType } from "@/generated/prisma/client";
import { useProfile } from "@/hooks/query/auth";
import { hasActionPermission } from "@/lib/utils";
import {
  roomValidator,
  roomValidatorType,
} from "@/validators/api/masters/room";
import { useCreateRoom, useGetRoom, useUpdateRoom } from "@/hooks/query/room";

const getInitialValues = (
  data?: RoomGetPayload<{ include: { roomType: true } }>,
): roomValidatorType => ({
  name: data?.name ?? "",
  description: data?.description ?? null,
  status: data?.status ?? Status["active"],
  roomType: data?.roomType ?? undefined,
});

const UpdateCreateForm = ({
  data,
}: {
  data?: RoomGetPayload<{ include: { roomType: true } }>;
}) => {
  const [roomTypeSearchValue, setRoomTypeSearchValue] = useState("");
  const { mutateAsync: create, isPending: creating } = useCreateRoom();
  const { mutateAsync: update, isPending: updating } = useUpdateRoom();
  const floorQuery = useInfiniteRoomTypeList(
    { name: roomTypeSearchValue, status: Status["active"] },
    10,
  );

  const form = useForm<roomValidatorType>({
    defaultValues: getInitialValues(data),
    resolver: zodResolver(roomValidator),
  });

  const onSubmit = (values: roomValidatorType) => {
    if (data) {
      update({ roomId: Number(data.id), ...values });
    } else {
      create(values);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className="grid grid-cols-2 gap-x-2">
          <FormField<roomValidatorType>
            label="Name"
            type="text"
            name="name"
            control={form.control}
            required
          />
          <FormField<roomValidatorType>
            label="Status"
            type="select"
            name="status"
            options={Object.values(Status).map((s) => ({ value: s, label: s }))}
            control={form.control}
            required
          />
          <FormInfiniteSelect<
            RoomType,
            PaginatedResponse<RoomType>,
            string,
            roomValidatorType
          >
            label="Room Type"
            name="roomType"
            control={form.control}
            query={floorQuery}
            getItems={(p) => p?.data}
            valueKey={(i) => String(i?.id)}
            labelKey={(i) => i?.name}
            search={roomTypeSearchValue}
            onSearchChange={setRoomTypeSearchValue}
            required
          />

          <FormField<roomValidatorType>
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

const RoomForm = () => {
  const { roomId }: { roomId?: string } = useParams();
  const { data: profile } = useProfile(false);

  const { data, isLoading: fetchingRoom } = useGetRoom(roomId);

  if (fetchingRoom) {
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

  if (roomId && !data) {
    return <div />;
  }

  if (!profile) {
    return <div />;
  }

  const canCreate = hasActionPermission(
    profile.data,
    ModuleType.ROOM_MASTER,
    ActionType.CREATE,
  );
  const canUpdate = hasActionPermission(
    profile.data,
    ModuleType.ROOM_MASTER,
    ActionType.UPDATE,
  );

  if ((roomId && !canUpdate) || (!roomId && !canCreate)) {
    return (
      <CustomLayout title={roomId ? "Edit Room" : "Create Room"}>
        <NoPermission />
      </CustomLayout>
    );
  }

  return (
    <CustomLayout title={roomId ? "Edit Room" : "Create Room"}>
      {roomId ? <UpdateCreateForm data={data} /> : <UpdateCreateForm />}
    </CustomLayout>
  );
};

export default RoomForm;
