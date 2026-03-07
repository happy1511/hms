"use client";

import CustomButton from "@/components/common/CustomButton";
import CustomLayout from "@/components/common/CustomLayout";
import FormField from "@/components/form-inputs/FormField";
import { Form } from "@/components/ui/form";
import { useChangePassword } from "@/hooks/query/auth";
import {
  ChangePasswordValidatorType,
  changePasswordValidator,
} from "@/validators/api/auth/profile";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

const ChangePassword = () => {
  const { mutateAsync: changePassword, isPending } = useChangePassword();
  const form = useForm<ChangePasswordValidatorType>({
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
    resolver: zodResolver(changePasswordValidator),
  });

  return (
    <CustomLayout title="Change Password">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(async (values) => {
            await changePassword(values);
            form.reset();
          })}
          className="max-w-xl"
        >
          <div className="grid gap-x-2">
            <FormField<ChangePasswordValidatorType>
              label="Current Password"
              type="password"
              name="currentPassword"
              control={form.control}
              required
            />
            <FormField<ChangePasswordValidatorType>
              label="New Password"
              type="password"
              name="newPassword"
              control={form.control}
              required
            />
            <FormField<ChangePasswordValidatorType>
              label="Confirm Password"
              type="password"
              name="confirmPassword"
              control={form.control}
              required
            />
          </div>
          <CustomButton disabled={isPending} type="submit">
            Update Password
          </CustomButton>
        </form>
      </Form>
    </CustomLayout>
  );
};

export default ChangePassword;
