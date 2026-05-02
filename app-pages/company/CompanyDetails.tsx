"use client";

import CustomButton from "@/components/common/CustomButton";
import CustomLayout from "@/components/common/CustomLayout";
import CustomTabs from "@/components/common/CustomTabs";
import NoPermission from "@/components/common/NoPermission";
import FormField from "@/components/form-inputs/FormField";
import { FormTextarea } from "@/components/form-inputs/FormTextArea";
import { Form } from "@/components/ui/form";
import { ActionType, CompanyDetailsType, ModuleType } from "@/generated/prisma/enums";
import { useProfile } from "@/hooks/query/auth";
import {
  CompanyDetails as CompanyDetailsRow,
  useCompanyDetails,
  useUpdateCompanyDetails,
} from "@/hooks/query/company";
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

const permissionModuleByType: Record<CompanyDetailsType, ModuleType> = {
  [CompanyDetailsType.HOSPITAL]: ModuleType.HOSPITAL_COMPANY_DETAILS,
  [CompanyDetailsType.LAB]: ModuleType.LAB_COMPANY_DETAILS,
  [CompanyDetailsType.PHARMACY]: ModuleType.PHARMACY_COMPANY_DETAILS,
};

const companyTypeLabels: Record<CompanyDetailsType, string> = {
  [CompanyDetailsType.HOSPITAL]: "Hospital",
  [CompanyDetailsType.LAB]: "Lab",
  [CompanyDetailsType.PHARMACY]: "Pharmacy",
};

const CompanyDetailsForm = ({
  type,
  details,
}: {
  type: CompanyDetailsType;
  details: CompanyDetailsRow | undefined;
}) => {
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
    form.reset({
      name: details?.name ?? "",
      address: details?.address ?? "",
      mobile: details?.mobile ?? "",
    });
  }, [details, form]);

  const onSubmit = async (values: FormValues) => {
    await mutateAsync({
      type,
      name: values.name,
      address: values.address ?? "",
      mobile: values.mobile ?? "",
    });
  };

  return (
    <div className="max-w-2xl rounded-lg border bg-white p-4">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
          <fieldset className="space-y-3">
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
            <CustomButton type="submit" disabled={isPending}>
              Save
            </CustomButton>
          </div>
        </form>
      </Form>
    </div>
  );
};

const CompanyDetails = () => {
  const { data: profile } = useProfile(false);
  const { data, isLoading, isFetching, refetch } = useCompanyDetails();

  if (!profile) return <div />;

  const editableTypes = [
    CompanyDetailsType.HOSPITAL,
    CompanyDetailsType.LAB,
    CompanyDetailsType.PHARMACY,
  ].filter((type) =>
    hasActionPermission(
      profile.data,
      permissionModuleByType[type],
      ActionType.UPDATE,
    ),
  );

  if (!editableTypes.length) {
    return (
      <CustomLayout title="Company Details" buttons={<div />}>
        <NoPermission />
      </CustomLayout>
    );
  }

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
        <div className="flex h-full items-center justify-center">
          <LoaderIcon className="size-4 animate-spin" />
        </div>
      ) : (
        <CustomTabs
          defaultValue={editableTypes[0]}
          tabs={editableTypes.map((type) => ({
            value: type,
            name: companyTypeLabels[type],
            content: <CompanyDetailsForm type={type} details={data?.[type]} />,
          }))}
        />
      )}
    </CustomLayout>
  );
};

export default CompanyDetails;
