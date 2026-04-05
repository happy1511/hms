"use client";

import CustomButton from "@/components/common/CustomButton";
import CustomLayout from "@/components/common/CustomLayout";
import NoPermission from "@/components/common/NoPermission";
import FormField from "@/components/form-inputs/FormField";
import { FormTextarea } from "@/components/form-inputs/FormTextArea";
import { Form } from "@/components/ui/form";
import { ActionType, ModuleType } from "@/generated/prisma/enums";
import { useProfile } from "@/hooks/query/auth";
import { useCompanyDetails, useUpdateCompanyDetails } from "@/hooks/query/company";
import { hasActionPermission } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoaderIcon } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const schema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  address: z.string().optional(),
  mobile: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

const CompanyDetails = () => {
  const { data: profile } = useProfile(false);
  const { data, isLoading, isFetching, refetch } = useCompanyDetails();
  const { mutateAsync, isPending } = useUpdateCompanyDetails();

  const form = useForm<FormValues>({
    defaultValues: {
      name: "",
      address: "",
      mobile: "",
    },
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    if (!data) return;
    form.reset({
      name: data.name ?? "",
      address: data.address ?? "",
      mobile: data.mobile ?? "",
    });
  }, [data, form]);

  if (!profile) return <div />;

  const canView = hasActionPermission(
    profile.data,
    ModuleType.COMPANY_DETAILS,
    ActionType.VIEW,
  );
  const canUpdate = hasActionPermission(
    profile.data,
    ModuleType.COMPANY_DETAILS,
    ActionType.UPDATE,
  );

  if (!canView) {
    return (
      <CustomLayout title="Company Details" buttons={<div />}>
        <NoPermission />
      </CustomLayout>
    );
  }

  const onSubmit = async (values: FormValues) => {
    await mutateAsync(values);
  };

  return (
    <CustomLayout
      title="Company Details"
      buttons={
        <CustomButton
          type="button"
          variant="outline"
          className="bg-white text-primary shadow-none"
          onClick={() => refetch()}
          isLoading={isFetching}
        >
          Refresh
        </CustomButton>
      }
    >
      {isLoading ? (
        <div className="flex justify-center items-center h-full">
          <LoaderIcon className="animate-spin size-4" />
        </div>
      ) : (
        <div className="max-w-2xl rounded-lg border bg-white p-4">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-3"
            >
              <fieldset disabled={!canUpdate} className="space-y-3">
                <FormField<FormValues>
                  label="Name"
                  name="name"
                  control={form.control}
                  type="text"
                  required
                />

                <FormTextarea<FormValues>
                  label="Address"
                  name="address"
                  control={form.control}
                  rows={3}
                  hideError
                  className="text-tiny"
                />

                <FormField<FormValues>
                  label="Mobile"
                  name="mobile"
                  control={form.control}
                  type="text"
                />
              </fieldset>

              <div className="flex justify-end">
                <CustomButton type="submit" disabled={!canUpdate || isPending}>
                  Save
                </CustomButton>
              </div>
            </form>
          </Form>
        </div>
      )}
    </CustomLayout>
  );
};

export default CompanyDetails;
