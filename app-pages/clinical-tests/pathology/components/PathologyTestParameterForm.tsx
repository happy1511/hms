"use client";

import CustomButton from "@/components/common/CustomButton";
import FormField from "@/components/form-inputs/FormField";
import { Form } from "@/components/ui/form";
import {
  useCreateTestParameter,
  useGetPathologyTestHeaders,
  useUpdateTestParameter,
} from "@/hooks/query/pathology";
import { PathologyTestDataType } from "@/lib/type";
import {
  addParameterToTestValidator,
  AddParameterToTestValidatorType,
} from "@/validators/api/masters/pathologyTest";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dispatch, SetStateAction, useEffect } from "react";
import { useForm } from "react-hook-form";

export type TableRowParameter = PathologyTestDataType["parameters"][number] & {
  type: "parameter";
};

export const PathologyTestParameterForm = ({
  editingParameter,
  testId,
  testHeaders: propHeaders,
  setEditingParameter,
}: {
  editingParameter: TableRowParameter | null;
  testId: number;
  testHeaders?: Array<{ id: number; name: string }>;
  setEditingParameter: Dispatch<SetStateAction<TableRowParameter | null>>;
}) => {
  const { data: fetchedHeaders } = useGetPathologyTestHeaders(String(testId));
  const headers = propHeaders || fetchedHeaders || [];

  const { mutateAsync: createParameter, isPending: creatingParameter } =
    useCreateTestParameter();

  const { mutateAsync: updateParameter, isPending: updatingParameter } =
    useUpdateTestParameter();

  const parameterForm = useForm<AddParameterToTestValidatorType>({
    defaultValues: { testId, name: "", displayOrder: "0" },
    resolver: zodResolver(addParameterToTestValidator),
  });

  useEffect(() => {
    if (!editingParameter) return;

    parameterForm.reset({
      testId,
      name: editingParameter.name,
      displayOrder: editingParameter.displayOrder.toString(),
      headerId: editingParameter.headerId?.toString(),
      isDescriptiveOnly: editingParameter.isDescriptiveOnly,
    });
  }, [editingParameter, testId, parameterForm]);

  const handleParameterSubmit = async (
    values: AddParameterToTestValidatorType,
  ) => {
    if (editingParameter) {
      await updateParameter({
        parameterId: editingParameter.id,
        ...values,
      });
    } else {
      await createParameter(values);
    }

    setEditingParameter(null);
    parameterForm.reset({ testId });
  };

  return (
    <Form {...parameterForm}>
      <form
        onSubmit={parameterForm.handleSubmit(handleParameterSubmit)}
        className="grid grid-cols-2 gap-2"
      >
        <FormField
          label="Name"
          name="name"
          type="text"
          control={parameterForm.control}
          required
        />

        <FormField
          label="Display Order"
          name="displayOrder"
          type="select"
          control={parameterForm.control}
          options={[...Array(25)].map((_, i) => ({
            value: i.toString(),
            label: i.toString(),
          }))}
          required
        />

        <FormField
          label="Header"
          name="headerId"
          type="select"
          control={parameterForm.control}
          options={headers.map((h) => ({
            value: h.id.toString(),
            label: h.name,
          }))}
        />

        <FormField
          label="Descriptive Only"
          name="isDescriptiveOnly"
          type="checkbox"
          control={parameterForm.control}
        />

        <div className="col-span-2">
          <CustomButton
            type="submit"
            disabled={creatingParameter || updatingParameter}
          >
            {editingParameter ? "Update Parameter" : "Add Parameter"}
          </CustomButton>
        </div>
      </form>
    </Form>
  );
};

export default PathologyTestParameterForm;
