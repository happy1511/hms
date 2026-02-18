"use client";

import CustomButton from "@/components/common/CustomButton";
import CustomLayout from "@/components/common/CustomLayout";
import FormField from "@/components/form-inputs/FormField";
import { FormInput } from "@/components/form-inputs/FormInput";
import { Form } from "@/components/ui/form";
import { useGetPathologyOrderParameters } from "@/hooks/query/pathology";
import { PathologyTestResultType } from "@/lib/type";
import {
  pathologyResultEntry,
  PathologyResultEntryValidatorType,
} from "@/validators/api/masters/pathologyTest";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoaderIcon } from "lucide-react";
import { useParams } from "next/navigation";
import { useForm } from "react-hook-form";

const buildDefaultValues = (data: PathologyTestResultType) => {
  const params: PathologyResultEntryValidatorType["parameters"] = [];

  data.test.testHeaders.forEach((header) => {
    header.testParameters.forEach((param) => {
      params.push({
        parameterId: param.id,
        value: "",
        optionId: undefined,
      });
    });
  });

  return { parameters: params };
};

const ResultEntryForm = ({ data }: { data: PathologyTestResultType }) => {
  const form = useForm({
    resolver: zodResolver(pathologyResultEntry),
    defaultValues: buildDefaultValues(data),
  });

  const { control, handleSubmit } = form;

  const onSubmit = (values: PathologyResultEntryValidatorType) => {
    console.log(values);
  };

  let globalIndex = 0; // important to map index

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {data.test.testHeaders?.map((header) => (
          <div key={header.id} className="rounded-xl overflow-hidden">
            {/* Header Title */}
            <div className="bg-muted px-4 py-2 text-tiny font-semibold">
              {header.name}
            </div>

            {/* Table */}
            <table className="w-full text-tiny">
              <thead className="bg-gray-50 text-left">
                <tr>
                  <th className="p-2">Parameter</th>
                  <th className="p-2 w-50">Result</th>
                  <th className="p-2 w-30">Unit</th>
                  <th className="p-2 w-50">Reference Range</th>
                </tr>
              </thead>

              <tbody>
                {header.testParameters.map((param) => {
                  const index = globalIndex++;

                  const ref = param.referenceRanges?.[0];

                  return (
                    <tr key={param.id} className="border-t">
                      {/* Parameter Name */}
                      <td className="p-2 font-medium">{param.name}</td>

                      {/* Result Input */}
                      <td className="p-2">
                        {param.isDescriptiveOnly ? (
                          <FormField
                            control={control}
                            type="select"
                            options={param.parameterOptions.map((o) => ({
                              value: o.id,
                              label: o.value,
                            }))}
                            name={`parameters.${index}.optionId`}
                          />
                        ) : (
                          <FormInput
                            control={control}
                            type="text"
                            name={`parameters.${index}.value`}
                          />
                        )}
                      </td>

                      {/* Unit */}
                      <td className="p-2 text-muted-foreground">
                        {ref?.unit || "-"}
                      </td>

                      {/* Reference Range */}
                      <td className="p-2 text-muted-foreground">
                        {ref
                          ? `${ref.lowerRange || "-"} - ${
                              ref.upperRange || "-"
                            }`
                          : "-"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ))}

        <CustomButton type="submit" className="w-full">
          Save Results
        </CustomButton>
      </form>
    </Form>
  );
};

const ResultEntry = () => {
  const { orderId }: { orderId: string } = useParams();
  const { data, isLoading: fetching } = useGetPathologyOrderParameters(orderId);

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
    return <></>;
  }

  return (
    <CustomLayout
      title={data?.patient.firstName + " " + data?.patient.lastName}
    >
      <ResultEntryForm data={data} />
    </CustomLayout>
  );
};

export default ResultEntry;
