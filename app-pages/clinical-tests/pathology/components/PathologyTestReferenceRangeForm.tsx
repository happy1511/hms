"use client";

import CustomButton from "@/components/common/CustomButton";
import FormField from "@/components/form-inputs/FormField";
import { Form } from "@/components/ui/form";
import { ReferenceRangeSex } from "@/generated/prisma/enums";
import {
  useCreateReferenceRange,
  useUpdateReferenceRange,
} from "@/hooks/query/pathology";
import { fromDays } from "@/lib/utils";
import {
  addReferenceRangeToParameterValidator,
  AddReferenceRangeToParameterValidatorType,
} from "@/validators/api/masters/pathologyTest";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dispatch, SetStateAction, useEffect } from "react";
import { useForm } from "react-hook-form";
import { TableRowParameter } from "./PathologyTestParameterForm";

export type ParameterReferenceRangeItem = TableRowParameter["referenceRanges"][number];

export const PathologyTestReferenceRangeForm = ({
  editingRange,
  data,
  setEditingRange,
  testId,
}: {
  editingRange: ParameterReferenceRangeItem | null;
  data: TableRowParameter;
  setEditingRange: Dispatch<SetStateAction<ParameterReferenceRangeItem | null>>;
  testId: number;
}) => {
  const { mutateAsync: create, isPending: creating } =
    useCreateReferenceRange(testId);

  const { mutateAsync: update, isPending: updating } =
    useUpdateReferenceRange(testId);

  const form = useForm<AddReferenceRangeToParameterValidatorType>({
    resolver: zodResolver(addReferenceRangeToParameterValidator),
  });

  useEffect(() => {
    if (!data) return;

    if (editingRange) {
      const lowerRange = fromDays(editingRange.lowerAgeInDays || 0);
      const upperRange = fromDays(editingRange.upperAgeInDays || 0);

      form.reset({
        ...editingRange,
        parameterId: data.id,
        lowerAgeDay: lowerRange.days,
        lowerAgeMonth: lowerRange.months,
        lowerAgeYear: lowerRange.years,
        upperAgeDay: upperRange.days,
        upperAgeMonth: upperRange.months,
        upperAgeYear: upperRange.years,
      });
    } else {
      form.reset({
        parameterId: data.id,
      });
    }
  }, [editingRange, data, form]);

  const handleSubmit = async (
    values: AddReferenceRangeToParameterValidatorType,
  ) => {
    if (editingRange) {
      await update({
        referenceRangeId: editingRange.id,
        ...values,
      });
    } else {
      await create(values);
    }

    setEditingRange(null);
    form.reset({
      parameterId: data.id,
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)}>
        <div className="grid grid-cols-2 space-x-2">
          <FormField
            label="Lower Day"
            name="lowerAgeDay"
            type="text"
            control={form.control}
          />
          <FormField
            label="Upper Day"
            name="upperAgeDay"
            type="text"
            control={form.control}
          />
          <FormField
            label="Lower Month"
            name="lowerAgeMonth"
            type="text"
            control={form.control}
          />
          <FormField
            label="Upper Month"
            name="upperAgeMonth"
            type="text"
            control={form.control}
          />
          <FormField
            label="Lower Year"
            name="lowerAgeYear"
            type="text"
            control={form.control}
          />
          <FormField
            label="Upper Year"
            name="upperAgeYear"
            type="text"
            control={form.control}
          />
          <FormField
            label="Lower Range"
            name="lowerRange"
            type="text"
            control={form.control}
          />
          <FormField
            label="Upper Range"
            name="upperRange"
            type="text"
            control={form.control}
          />
          <FormField
            label="Sex"
            name="applicableGender"
            type="select"
            control={form.control}
            options={Object.values(ReferenceRangeSex).map((s) => ({
              value: s,
              label: s,
            }))}
            required
          />
          <FormField
            label="Unit"
            name="unit"
            type="text"
            control={form.control}
          />
        </div>
        <div className="col-span-2">
          <CustomButton type="submit" disabled={creating || updating}>
            {editingRange ? "Update Range" : "Add Range"}
          </CustomButton>
        </div>
      </form>
    </Form>
  );
};

export default PathologyTestReferenceRangeForm;
