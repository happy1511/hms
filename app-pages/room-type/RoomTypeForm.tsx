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
import { RoomTypeGetPayload } from "@/generated/prisma/models";
import { useProfile } from "@/hooks/query/auth";
import {
  useCreateRoomType,
  useGetRoomType,
  useUpdateRoomType,
} from "@/hooks/query/roomType";
import {
  roomTypeValidator,
  RoomTypeValidatorType,
} from "@/validators/api/masters/roomType";
import { useInfiniteDepartmentsList } from "@/hooks/query/department";
import { Department } from "@/generated/prisma/client";
import { hasActionPermission } from "@/lib/utils";

const getInitialValues = (
  data?: RoomTypeGetPayload<{ include: { department: true } }>,
): RoomTypeValidatorType => ({
  name: data?.name ?? "",
  description: data?.description ?? null,
  status: data?.status ?? Status["active"],
  department: data?.department ?? undefined,
});

const UpdateCreateForm = ({
  data,
}: {
  data?: RoomTypeGetPayload<{ include: { department: true } }>;
}) => {
  const [departmentSearchValue, setDepartmentSearchValue] = useState("");
  const { mutateAsync: create, isPending: creating } = useCreateRoomType();
  const { mutateAsync: update, isPending: updating } = useUpdateRoomType();
  const floorQuery = useInfiniteDepartmentsList(
    { name: departmentSearchValue, status: Status["active"] },
    20,
  );

  const form = useForm<RoomTypeValidatorType>({
    defaultValues: getInitialValues(data),
    resolver: zodResolver(roomTypeValidator),
  });

  const onSubmit = (values: RoomTypeValidatorType) => {
    if (data) {
      update({ typeId: Number(data.id), ...values });
    } else {
      create(values);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className="grid grid-cols-2 gap-x-2">
          <FormField<RoomTypeValidatorType>
            label="Name"
            type="text"
            name="name"
            control={form.control}
            required
          />
          <FormField<RoomTypeValidatorType>
            label="Status"
            type="select"
            name="status"
            options={Object.values(Status).map((s) => ({ value: s, label: s }))}
            control={form.control}
            required
          />
          <FormInfiniteSelect<
            Department,
            PaginatedResponse<Department>,
            string,
            RoomTypeValidatorType
          >
            label="Department"
            name="department"
            control={form.control}
            query={floorQuery}
            getItems={(p) => p?.data}
            valueKey={(i) => String(i?.id)}
            labelKey={(i) => i?.name}
            search={departmentSearchValue}
            onSearchChange={setDepartmentSearchValue}
            required
          />

          <FormField<RoomTypeValidatorType>
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

const RoomTypeForm = () => {
  const { typeId }: { typeId?: string } = useParams();
  const { data: profile } = useProfile(false);

  const { data, isLoading: fetchingRoomType } = useGetRoomType(typeId);

  if (fetchingRoomType) {
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

  if (typeId && !data) {
    return <div />;
  }

  if (!profile) {
    return <div />;
  }

  const canCreate = hasActionPermission(
    profile.data,
    ModuleType.ROOM_TYPE_MASTER,
    ActionType.CREATE,
  );
  const canUpdate = hasActionPermission(
    profile.data,
    ModuleType.ROOM_TYPE_MASTER,
    ActionType.UPDATE,
  );

  if ((typeId && !canUpdate) || (!typeId && !canCreate)) {
    return (
      <CustomLayout title={typeId ? "Edit Room Type" : "Create Room Type"}>
        <NoPermission />
      </CustomLayout>
    );
  }

  return (
    <CustomLayout title={typeId ? "Edit Room Type" : "Create Room Type"}>
      {typeId ? <UpdateCreateForm data={data} /> : <UpdateCreateForm />}
    </CustomLayout>
  );
};

export default RoomTypeForm;
