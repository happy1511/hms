"use client";

import CustomButton from "@/components/common/CustomButton";
import CustomLayout from "@/components/common/CustomLayout";
import NoPermission from "@/components/common/NoPermission";
import FormField from "@/components/form-inputs/FormField";
import { Form } from "@/components/ui/form";
import { ActionType, ModuleType } from "@/generated/prisma/enums";
import { useProfile } from "@/hooks/query/auth";
import {
  useGetRadiologyOrderTemplate,
  useUpdateRadiologyTestOrder,
} from "@/hooks/query/radiology";
import { RadiologyTestResultType } from "@/lib/type";
import { hasActionPermission } from "@/lib/utils";
import {
  RadiologyResultEntryValidatorType,
  radiologyResultsEntry,
} from "@/validators/api/masters/radiologyTest";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { LoaderIcon } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";

const buildDefaultValues = (data: RadiologyTestResultType) => {
  return {
    orderId: data.id,
    results: {
      templateId: data.test.templateId!,
      value: data.test.template?.content ?? "",
    },
  };
};

const ResultEntryForm = ({ data }: { data: RadiologyTestResultType }) => {
  const { mutateAsync, isPending } = useUpdateRadiologyTestOrder();
  const router = useRouter();

  const form = useForm<RadiologyResultEntryValidatorType>({
    resolver: zodResolver(radiologyResultsEntry),
    defaultValues: buildDefaultValues(data),
  });

  const { control, handleSubmit } = form;

  const onSubmit = (values: RadiologyResultEntryValidatorType) => {
    mutateAsync(
      {
        ...values,
        orderId: data.id,
      },
      { onSuccess: () => router.back() },
    );
  };

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 my-2">
        {/* Template Content Editor */}
        <FormField
          control={control}
          label="Report"
          name="results.value"
          type="richText"
          required
        />

        <CustomButton disabled={isPending} type="submit">
          Save Report
        </CustomButton>
      </form>
    </Form>
  );
};

const ResultEntry = () => {
  const { orderId }: { orderId: string } = useParams();
  const { data: profile } = useProfile(false);
  const { data, isLoading: fetching } = useGetRadiologyOrderTemplate(orderId);

  if (fetching) {
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

  if (!orderId || !data) {
    return <div />;
  }

  if (!profile) {
    return <div />;
  }

  const canUpdate = hasActionPermission(
    profile.data,
    ModuleType.RADIOLOGY_ORDER,
    ActionType.UPDATE,
  );

  if (!canUpdate) {
    return (
      <CustomLayout title="Radiology Result Entry">
        <NoPermission />
      </CustomLayout>
    );
  }

  return (
    <CustomLayout
      title={data?.patient.firstName + " " + data?.patient.lastName}
    >
      <div className="bg-white border rounded-xl p-4 text-tiny space-y-2">
        <div className="flex justify-between">
          <div>
            <p className="font-semibold">
              {data.patient.firstName} {data.patient.lastName}
            </p>
            <p className="text-muted-foreground">UHID: {data.patient.uhid}</p>
            <p className="text-muted-foreground">
              {data.patient.gender} • DOB:{" "}
              {new Date(data.patient.dob).toLocaleDateString()}
            </p>
          </div>

          <div className="text-right">
            <p className="font-semibold">{data.test.name}</p>
            {data.sampleTakenAt && (
              <p className="text-muted-foreground">
                Sample Taken: {format(String(data.sampleTakenAt), "dd/MM/yyyy")}
              </p>
            )}
            <p className="text-muted-foreground">Status: {data.status}</p>
          </div>
        </div>
      </div>
      <ResultEntryForm data={data} />
    </CustomLayout>
  );
};

export default ResultEntry;
