"use client";

import CustomButton from "@/components/common/CustomButton";
import CustomLayout from "@/components/common/CustomLayout";
import NoPermission from "@/components/common/NoPermission";
import FormField from "@/components/form-inputs/FormField";
import { Form } from "@/components/ui/form";
import { ActionType, ModuleType } from "@/generated/prisma/enums";
import { useProfile } from "@/hooks/query/auth";
import {
  useCreateHsnSac,
  useGetHsnSac,
  useUpdateHsnSac,
} from "@/hooks/query/hsnSac";
import { HsnSacType } from "@/lib/type";
import { hasActionPermission } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoaderIcon } from "lucide-react";
import { useParams } from "next/navigation";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import {
  hsnSacValidator,
  hsnSacValidatorType,
} from "@/validators/api/masters/hsnSac";

const getInitialValues = (data?: HsnSacType): hsnSacValidatorType => ({
  code: data?.code ?? 0,
  cGstPercentage: data?.cGstPercentage ?? 0,
  sGstPercentage: data?.sGstPercentage ?? 0,
  iGstPercentage: data?.iGstPercentage ?? 0,
});

const UpdateCreateForm = ({ data }: { data?: HsnSacType }) => {
  const { mutateAsync: create, isPending: creating } = useCreateHsnSac();
  const { mutateAsync: update, isPending: updating } = useUpdateHsnSac();

  const form = useForm<hsnSacValidatorType>({
    defaultValues: getInitialValues(data),
    resolver: zodResolver(hsnSacValidator),
  });

  useEffect(() => {
    form.reset(getInitialValues(data));
  }, [data, form]);

  const onSubmit = (values: hsnSacValidatorType) => {
    if (data) {
      update({ hsnSacId: data.id, ...values });
      return;
    }

    create(values);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className="grid grid-cols-2 gap-x-2">
          <FormField<hsnSacValidatorType>
            label="Code"
            type="number"
            name="code"
            control={form.control}
            required
          />
          <FormField<hsnSacValidatorType>
            label="CGST (%)"
            type="number"
            name="cGstPercentage"
            control={form.control}
            required
          />
          <FormField<hsnSacValidatorType>
            label="SGST (%)"
            type="number"
            name="sGstPercentage"
            control={form.control}
            required
          />
          <FormField<hsnSacValidatorType>
            label="IGST (%)"
            type="number"
            name="iGstPercentage"
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

const HsnSacForm = () => {
  const { hsnSacId }: { hsnSacId?: string } = useParams();
  const { data: profile } = useProfile(false);
  const { data, isLoading } = useGetHsnSac(hsnSacId);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <LoaderIcon className="size-4 animate-spin" />
      </div>
    );
  }

  if (hsnSacId && !data) {
    return <div />;
  }

  if (!profile) {
    return <div />;
  }

  const canCreate = hasActionPermission(
    profile.data,
    ModuleType.PHARMACY_HSN_SAC_MASTER,
    ActionType.CREATE,
  );
  const canUpdate = hasActionPermission(
    profile.data,
    ModuleType.PHARMACY_HSN_SAC_MASTER,
    ActionType.UPDATE,
  );

  if ((hsnSacId && !canUpdate) || (!hsnSacId && !canCreate)) {
    return (
      <CustomLayout title={hsnSacId ? "Edit HSN/SAC" : "Create HSN/SAC"}>
        <NoPermission />
      </CustomLayout>
    );
  }

  return (
    <CustomLayout title={hsnSacId ? "Edit HSN/SAC" : "Create HSN/SAC"}>
      <UpdateCreateForm data={data} />
    </CustomLayout>
  );
};

export default HsnSacForm;
