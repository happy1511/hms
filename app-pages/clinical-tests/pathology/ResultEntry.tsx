"use client";

import CustomButton from "@/components/common/CustomButton";
import CustomLayout from "@/components/common/CustomLayout";
import FormField from "@/components/form-inputs/FormField";
import { FormInput } from "@/components/form-inputs/FormInput";
import { Form } from "@/components/ui/form";
import {
  useGetPathologyOrderParameters,
  useUpdatePathologyTestOrder,
} from "@/hooks/query/pathology";
import { PathologyTestResultType } from "@/lib/type";
import {
  PathologyResultEntryValidatorType,
  pathologyResultsEntry,
} from "@/validators/api/masters/pathologyTest";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { LoaderIcon } from "lucide-react";
import { useParams } from "next/navigation";
import { useForm } from "react-hook-form";

const buildDefaultValues = (data: PathologyTestResultType) => {
  const params: PathologyResultEntryValidatorType["parameters"] = [];

  data.test.testHeaders.forEach((header) => {
    header.testParameters.forEach((param) => {
      params.push({
        parameterId: param.id,
        optionId: undefined,
      });
    });
  });

  return { parameters: params, orderId: data.id };
};

const ResultEntryForm = ({ data }: { data: PathologyTestResultType }) => {
  const { mutateAsync, isPending } = useUpdatePathologyTestOrder();

  const form = useForm({
    resolver: zodResolver(pathologyResultsEntry),
    defaultValues: buildDefaultValues(data),
  });

  const { control, handleSubmit } = form;

  const onSubmit = (values: PathologyResultEntryValidatorType) => {
    mutateAsync({ ...values, orderId: data.id });
  };

  let globalIndex = 0;
  console.log(form.formState.errors);
  return (
    <Form {...form}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 my-2">
        {data.test.testHeaders?.map((header) => (
          <div key={header.id} className="rounded-xl overflow-hidden">
            {/* Header Title */}
            <div className="border border-primary/20 bg-primary py-1 text-center text-white text-tiny font-semibold">
              {header.name}
            </div>

            {/* Table */}
            <table className="w-full text-tiny border">
              <thead className="bg-muted text-left sticky top-0 z-10">
                <tr>
                  <th className="px-3 py-1  w-[35%]">Parameter</th>
                  <th className="px-3 py-1  w-[25%]">Result</th>
                  <th className="px-3 py-1  w-[15%]">Unit</th>
                  <th className="px-3 py-1  w-[25%]">Reference Range</th>
                </tr>
              </thead>

              <tbody>
                {header.testParameters.map((param, rowIndex) => {
                  const index = globalIndex++;
                  const ref = param.referenceRanges?.[0];

                  return (
                    <tr
                      key={param.id}
                      className={`border-t ${
                        rowIndex % 2 === 0 ? "bg-white" : "bg-muted/30"
                      }`}
                    >
                      {/* Parameter */}
                      <td className="px-3 xfo py-1 nt-medium">{param.name}</td>

                      {/* Result */}
                      <td className="px-2 py-1">
                        {param.isDescriptiveOnly ? (
                          <FormInput
                            control={control}
                            type="text"
                            name={`parameters.${index}.textValue`}
                            hideError
                          />
                        ) : param.parameterOptions?.length ? (
                          <>
                            <FormField
                              control={control}
                              type="select"
                              options={param.parameterOptions.map((o) => ({
                                value: o.id,
                                label: o.value,
                              }))}
                              name={`parameters.${index}.optionId`}
                              hideError
                            />
                          </>
                        ) : (
                          <>
                            <FormInput
                              control={control}
                              type="number"
                              name={`parameters.${index}.numericValue`}
                              hideError
                            />
                          </>
                        )}
                      </td>

                      {/* Unit */}
                      <td className="px-3 xte py-1 xt-muted-foreground">
                        {ref?.unit || "-"}
                      </td>

                      {/* Range */}
                      <td className="px-3 xte py-1 xt-muted-foreground">
                        {ref
                          ? `${ref.lowerRange || "-"} - ${ref.upperRange || "-"}`
                          : "-"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ))}

        <CustomButton disabled={isPending} type="submit">
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
    return <div />;
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
