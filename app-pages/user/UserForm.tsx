"use client";

import CustomButton from "@/components/common/CustomButton";
import CustomLayout from "@/components/common/CustomLayout";
import FormField from "@/components/form-inputs/FormField";
import PermissionsSection from "@/components/user/PermissionsSection";
import UserProfileFields from "@/components/user/UserProfileFields";
import { Form } from "@/components/ui/form";
import { Gender, NameTitle, Status } from "@/generated/prisma/enums";
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
      title: data.title,
      firstName: data.firstName,
      middleName: data.middleName || "",
      lastName: data.lastName,
      preferredName: data.preferredName,
      gender: data.gender,
      dob: data.dob ? new Date(data.dob) : undefined,
      maritalStatus: data.maritalStatus || undefined,
      address: data.address || "",
      city: data.city || "",
      country: data.country || "",
      state: data.state || "",
      postcode: data.postcode || "",
      contactNumber: data.contactNumber,
      email: data.email || "",
      identityType: data.identityType || undefined,
      identityNumber: data.identityNumber || "",
      education: data.education || "",
      qualifications: data.qualifications || "",
      department: data.department || "",
      password: data.password,
      status: data.status,
      permissions,
    };
  }

  return {
    title: NameTitle["MR"],
    firstName: "",
    middleName: "",
    lastName: "",
    preferredName: "",
    gender: Gender["Other"],
    dob: undefined,
    maritalStatus: undefined,
    address: "",
    city: "",
    country: "",
    state: "",
    postcode: "",
    contactNumber: "",
    email: "",
    identityType: undefined,
    identityNumber: "",
    education: "",
    qualifications: "",
    department: "",
    password: "",
    status: Status["active"],
    permissions,
  };
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
    resolver: zodResolver(userValidator) as any,
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
      <form onSubmit={form.handleSubmit(onSubmit as any)}>
        <div className="grid grid-cols-2 gap-x-2">
          <UserProfileFields
            control={form.control as any}
            contactNumberReadOnly={Boolean(data)}
          />
          <FormField<UserValidatorType>
            label="Password"
            type="password"
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
          <PermissionsSection
            control={form.control}
            permissions={permissions as any}
          />
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
