"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import CustomLayout from "@/components/common/CustomLayout";
import { Form } from "@/components/ui/form";
import FormField from "@/components/form-inputs/FormField";
import {
  ActionType,
  ModuleType,
  RadiologySection,
  Status,
} from "@/generated/prisma/enums";
import CustomButton from "@/components/common/CustomButton";
import { RadiologyTemplate, RadiologyTest } from "@/generated/prisma/client";
import {
  radiologyTemplateValidator,
  RadiologyTemplateValidatorType,
} from "@/validators/api/masters/radiologyTest";
import {
  useCreateRadiologyTemplate,
  useInfiniteRadiologyTestsList,
  useRadiologyTemplate,
  useUpdateRadiologyTemplate,
} from "@/hooks/query/radiology";
import { useParams, useRouter } from "next/navigation";
import { LoaderIcon } from "lucide-react";
import { useProfile } from "@/hooks/query/auth";
import { hasActionPermission } from "@/lib/utils";
import { useState } from "react";
import { FormInfiniteSelect } from "@/components/form-inputs/FormInfiniteSelect";
import { PaginatedResponse } from "@/lib/type";

const CreateUpdateForm = ({ data }: { data?: RadiologyTemplate }) => {
  const [radiologySearchValue, setRadiologySearchValue] = useState("");
  const { mutateAsync: update, isPending: updating } =
    useUpdateRadiologyTemplate();
  const { mutateAsync: create, isPending: creating } =
    useCreateRadiologyTemplate();

  const radiologyTests = useInfiniteRadiologyTestsList(
    {
      name: radiologySearchValue,
    },
    10,
  );

  const form = useForm<RadiologyTemplateValidatorType>({
    defaultValues: {
      content: data?.content || "",
      name: data?.name || "",
      section: data?.section || undefined,
      status: data?.status || undefined,
    },
    resolver: zodResolver(radiologyTemplateValidator),
  });

  const onSubmit = (values: RadiologyTemplateValidatorType) => {
    if (data) {
      update({ ...values, templateId: Number(data.id) });
    } else {
      create(values);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className="grid grid-cols-2 gap-x-2">
          <FormField<RadiologyTemplateValidatorType>
            label="Name"
            type="text"
            name="name"
            control={form.control}
            required
          />
          <FormField
            label="Section"
            type="select"
            control={form.control}
            name="section"
            options={Object.values(RadiologySection).map((s) => ({
              value: s,
              label: s,
            }))}
            required
          />

          <FormField<RadiologyTemplateValidatorType>
            label="Status"
            type="select"
            name="status"
            options={Object.values(Status).map((s) => ({ value: s, label: s }))}
            control={form.control}
            required
          />
          <FormInfiniteSelect<
            RadiologyTest,
            PaginatedResponse<RadiologyTest>,
            string,
            RadiologyTemplateValidatorType
          >
            name="radiologyTests"
            label="Connected Tests"
            control={form.control}
            query={radiologyTests}
            getItems={(d) => d?.data}
            labelKey={(i) => i.name}
            valueKey={(i) => String(i?.id)}
            search={radiologySearchValue}
            onSearchChange={setRadiologySearchValue}
            multiple
          />
          <div className="col-span-2">
            <FormField<RadiologyTemplateValidatorType>
              label="Content"
              type="richText"
              name="content"
              control={form.control}
              required
              readOnly
            />
          </div>
        </div>
        <CustomButton disabled={updating || creating} type="submit">
          Submit
        </CustomButton>
      </form>
    </Form>
  );
};

const Buttons = ({ canView }: { canView: boolean }) => {
  const router = useRouter();
  return (
    <>
      {canView && (
        <CustomButton
          onClick={() => router.push("/clinical-tests/radiology-template")}
        >
          List All Templates
        </CustomButton>
      )}
    </>
  );
};

const RadiologyTemplateForm = () => {
  const { templateId }: { templateId?: string } = useParams();
  const { data: profile } = useProfile(false);

  const { data, isLoading: fetchingTemplate } =
    useRadiologyTemplate(templateId);

  if (!profile) {
    return <div />;
  }
  const canView = hasActionPermission(
    profile?.data,
    ModuleType.BED_MASTER,
    ActionType.VIEW,
  );

  if (fetchingTemplate) {
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

  if (templateId && !data) {
    return <div />;
  }

  return (
    <CustomLayout
      buttons={<Buttons canView={Boolean(canView)} />}
      title={templateId ? "Edit Template" : "Create Template"}
    >
      {templateId && data ? (
        <CreateUpdateForm data={data} />
      ) : (
        <CreateUpdateForm />
      )}
    </CustomLayout>
  );
};

export default RadiologyTemplateForm;
