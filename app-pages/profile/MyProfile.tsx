"use client";

import CustomButton from "@/components/common/CustomButton";
import CustomLayout from "@/components/common/CustomLayout";
import UserProfileFields from "@/components/user/UserProfileFields";
import { Form } from "@/components/ui/form";
import { useProfile, useUpdateProfile } from "@/hooks/query/auth";
import { User } from "@/lib/type";
import {
  ProfileUpdateValidatorType,
  profileUpdateValidator,
} from "@/validators/api/auth/profile";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoaderIcon } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";

const getInitialValues = (data?: User): ProfileUpdateValidatorType => ({
  title: data?.title ?? "MR",
  firstName: data?.firstName ?? "",
  middleName: data?.middleName ?? "",
  lastName: data?.lastName ?? "",
  preferredName: data?.preferredName ?? "",
  gender: data?.gender ?? "Other",
  dob: data?.dob ? new Date(data.dob) : undefined,
  maritalStatus: data?.maritalStatus ?? undefined,
  address: data?.address ?? "",
  city: data?.city ?? "",
  country: data?.country ?? "",
  state: data?.state ?? "",
  postcode: data?.postcode ?? "",
  contactNumber: data?.contactNumber ?? "",
  email: data?.email ?? "",
  identityType: data?.identityType ?? undefined,
  identityNumber: data?.identityNumber ?? "",
  education: data?.education ?? "",
  qualifications: data?.qualifications ?? "",
  department: data?.department ?? "",
});

const MyProfile = () => {
  const { data, isLoading } = useProfile();
  const { mutateAsync: updateProfile, isPending } = useUpdateProfile();

  const form = useForm<ProfileUpdateValidatorType>({
    defaultValues: getInitialValues(),
    resolver: zodResolver(profileUpdateValidator) as any,
  });

  useEffect(() => {
    if (data?.data) {
      form.reset(getInitialValues(data.data));
    }
  }, [data, form]);

  if (isLoading || !data?.data) {
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

  return (
    <CustomLayout title="My Profile">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(
            ((values: ProfileUpdateValidatorType) => updateProfile(values)) as any,
          )}
        >
          <div className="grid grid-cols-2 gap-x-2">
            <UserProfileFields control={form.control as any} />
          </div>
          <CustomButton disabled={isPending} type="submit">
            Save Profile
          </CustomButton>
        </form>
      </Form>
    </CustomLayout>
  );
};

export default MyProfile;
