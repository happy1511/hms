"use client";

import CustomButton from "@/components/common/CustomButton";
import FormField from "@/components/form-inputs/FormField";
import { Form } from "@/components/ui/form";
import {
  useCreateTestParameterHeader,
  useUpdateTestParameterHeader,
} from "@/hooks/query/pathology";
import {
  addParameterHeaderToTestValidator,
  AddParameterHeaderToTestValidatorType,
} from "@/validators/api/masters/pathologyTest";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dispatch, SetStateAction, useEffect } from "react";
import { useForm } from "react-hook-form";

export type TableRowHeader = {
  type: "header";
  id: number;
  name: string;
  note?: string;
  displayOrder: number;
};

export const PathologyTestHeaderForm = ({
  editingHeader,
  testId,
  setEditingHeader,
}: {
  editingHeader: TableRowHeader | null;
  testId: number;
  setEditingHeader: Dispatch<SetStateAction<TableRowHeader | null>>;
}) => {
  const { mutateAsync: createHeader, isPending: creatingHeader } =
    useCreateTestParameterHeader();

  const { mutateAsync: updateHeader, isPending: updatingHeader } =
    useUpdateTestParameterHeader();

  const headerForm = useForm<AddParameterHeaderToTestValidatorType>({
    defaultValues: { testId },
    resolver: zodResolver(addParameterHeaderToTestValidator),
  });

  const handleHeaderSubmit = async (
    values: AddParameterHeaderToTestValidatorType,
  ) => {
    if (editingHeader) {
      await updateHeader({ headerId: editingHeader.id, ...values });
    } else {
      await createHeader(values);
    }

    setEditingHeader(null);
    headerForm.reset({ testId });
  };

  useEffect(() => {
    if (!editingHeader) return;

    headerForm.reset({
      testId,
      name: editingHeader.name,
      note: editingHeader.note ?? "",
      displayOrder: editingHeader.displayOrder.toString(),
    });
  }, [editingHeader, testId, headerForm]);

  return (
    <Form {...headerForm}>
      <form
        onSubmit={headerForm.handleSubmit(handleHeaderSubmit)}
        className="grid grid-cols-2 gap-2"
      >
        <FormField
          label="Name"
          name="name"
          type="text"
          control={headerForm.control}
          required
        />

        <FormField
          label="Display Order"
          name="displayOrder"
          type="select"
          control={headerForm.control}
          options={[...Array(25)].map((_, i) => ({
            value: i.toString(),
            label: i.toString(),
          }))}
          required
        />

        <div className="col-span-2">
          <FormField
            label="Note"
            name="note"
            type="textarea"
            control={headerForm.control}
          />
        </div>

        <div className="col-span-2">
          <CustomButton
            type="submit"
            disabled={creatingHeader || updatingHeader}
          >
            {editingHeader ? "Update Header" : "Add Header"}
          </CustomButton>
        </div>
      </form>
    </Form>
  );
};

export default PathologyTestHeaderForm;
