"use client";

import CustomButton from "@/components/common/CustomButton";
import CustomLayout from "@/components/common/CustomLayout";
import FormField from "@/components/form-inputs/FormField";
import { Form } from "@/components/ui/form";
import { NameTitle, Status } from "@/generated/prisma/enums";
import { usePermissionsList } from "@/hooks/query/permission";
import { useCreateUser, useGetUser, useUpdateUser } from "@/hooks/query/user";
import { User } from "@/lib/type";
import {
  userValidator,
  UserValidatorType,
} from "@/validators/api/masters/user";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoaderIcon } from "lucide-react";
import { useParams } from "next/navigation";
import { useForm } from "react-hook-form";

const getInitialValues = (
  permissions: UserValidatorType["permissions"],
  data?: User,
): UserValidatorType => {
  if (data) {
    return {
      name: data.name,
      password: data.password,
      title: data.title,
      status: data.status,
      loginId: data.loginId,
      permissions,
    };
  } else {
    return {
      name: "",
      password: "",
      title: NameTitle["MR"],
      status: Status["active"],
      permissions,
    };
  }
};

const UpdateCreateForm = ({
  data,
  permissions,
}: {
  data?: User;
  permissions: UserValidatorType["permissions"];
}) => {
  const { mutateAsync: create, isPending: creating } = useCreateUser();
  const { mutateAsync: update, isPending: updating } = useUpdateUser();

  const form = useForm<UserValidatorType>({
    defaultValues: getInitialValues(permissions, data),
    resolver: zodResolver(userValidator),
  });

  const onSubmit = (values: UserValidatorType) => {
    if (data) {
      update({ id: data.id, ...values });
    } else {
      create(values);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className="grid grid-cols-2 gap-x-2">
          <FormField<UserValidatorType>
            label="Name"
            type="text"
            name="name"
            control={form.control}
            required
          />
          {data && (
            <FormField<UserValidatorType>
              label="LoginId"
              type="text"
              name="loginId"
              control={form.control}
              required
              readOnly
            />
          )}
          <FormField<UserValidatorType>
            label="Password"
            type="text"
            name="password"
            control={form.control}
            required
          />
          <FormField<UserValidatorType>
            label="Status"
            type="select"
            name="status"
            options={Object.values(Status).map((s) => ({ value: s, label: s }))}
            control={form.control}
            required
          />
          {permissions?.map(({ module, actions }, moduleIndex) => (
            <div key={module.id} className="col-span-2 gap-1">
              <h3 className="text-tiny">{module.name}</h3>
              <div className="flex items-center gap-2">
                {actions.map((action, actionIndex) => (
                  <FormField
                    type="checkbox"
                    key={action.id}
                    control={form.control}
                    name={`permissions.${moduleIndex}.actions.${actionIndex}.assigned`}
                    label={action.name}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
        <CustomButton disabled={creating || updating} type="submit">
          Submit
        </CustomButton>
      </form>
    </Form>
  );
};

const UserForm = () => {
  const { userId }: { userId?: string } = useParams();

  const { data, isLoading: fetchingUser } = useGetUser(userId);
  const { data: permissions, isLoading: fetchingPermission } =
    usePermissionsList(!userId);

  if (fetchingPermission || fetchingUser) {
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

  if (!permissions && !userId) {
    return <div />;
  }

  return (
    <CustomLayout title={userId ? "Edit User" : "Create User"}>
      {userId ? (
        <UpdateCreateForm data={data} permissions={data?.permissions || []} />
      ) : (
        <UpdateCreateForm permissions={permissions || []} />
      )}
    </CustomLayout>
  );
};

export default UserForm;
