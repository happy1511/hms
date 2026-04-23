"use client";

import CustomButton from "@/components/common/CustomButton";
import CustomLayout from "@/components/common/CustomLayout";
import NoPermission from "@/components/common/NoPermission";
import FormField from "@/components/form-inputs/FormField";
import { Form } from "@/components/ui/form";
import { ActionType, ModuleType } from "@/generated/prisma/enums";
import { useProfile } from "@/hooks/query/auth";
import { hasActionPermission } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoaderIcon } from "lucide-react";
import { useParams } from "next/navigation";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import {
  drugValidator,
  drugValidatorType,
} from "@/validators/api/masters/drug";
import { useCreateDrug, useGetDrug, useUpdateDrug } from "@/hooks/query/drug";
import { PharmacyDrugType } from "@/lib/type";

const getInitialValues = (data?: PharmacyDrugType): drugValidatorType => ({
  name: data?.name ?? "",
  description: data?.description ?? "",
  manufacturer: data?.manufacturer ?? "",
  unit: data?.unit ?? "",
});

const UpdateCreateForm = ({ data }: { data?: PharmacyDrugType }) => {
  const { mutateAsync: create, isPending: creating } = useCreateDrug();
  const { mutateAsync: update, isPending: updating } = useUpdateDrug();

  const form = useForm<drugValidatorType>({
    defaultValues: getInitialValues(data),
    resolver: zodResolver(drugValidator),
  });

  useEffect(() => {
    form.reset(getInitialValues(data));
  }, [data, form]);

  const onSubmit = (values: drugValidatorType) => {
    if (data) {
      update({ drugId: Number(data.id), ...values });
    } else {
      create(values);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className="grid grid-cols-2 gap-x-2">
          <FormField<drugValidatorType>
            label="Name"
            type="text"
            name="name"
            control={form.control}
            required
          />

          <FormField<drugValidatorType>
            label="Manufacturer Name"
            type="text"
            name="manufacturer"
            control={form.control}
            required
          />

          <FormField<drugValidatorType>
            label="Unit"
            type="text"
            name="unit"
            control={form.control}
            required
          />

          <FormField<drugValidatorType>
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

const DrugForm = () => {
  const { drugId }: { drugId?: string } = useParams();
  const { data: profile } = useProfile(false);

  const { data, isLoading } = useGetDrug(drugId);

  if (isLoading) {
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

  if (drugId && !data) {
    return <div />;
  }

  if (!profile) {
    return <div />;
  }

  const canCreate = hasActionPermission(
    profile.data,
    ModuleType.PHARMACY_DRUG_MASTER,
    ActionType.CREATE,
  );
  const canUpdate = hasActionPermission(
    profile.data,
    ModuleType.PHARMACY_DRUG_MASTER,
    ActionType.UPDATE,
  );

  if ((drugId && !canUpdate) || (!drugId && !canCreate)) {
    return (
      <CustomLayout title={drugId ? "Edit Drug" : "Create Drug"}>
        <NoPermission />
      </CustomLayout>
    );
  }

  return (
    <CustomLayout title={drugId ? "Edit Drug" : "Create Drug"}>
      {drugId ? <UpdateCreateForm data={data} /> : <UpdateCreateForm />}
    </CustomLayout>
  );
};

export default DrugForm;
