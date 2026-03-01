"use client";

import CustomButton from "@/components/common/CustomButton";
import CustomLayout from "@/components/common/CustomLayout";
import FormField from "@/components/form-inputs/FormField";
import { Form } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoaderIcon } from "lucide-react";
import { useParams } from "next/navigation";
import { useForm } from "react-hook-form";
import {
  drugValidator,
  drugValidatorType,
} from "@/validators/api/masters/drug";
import { DrugGetPayload } from "@/generated/prisma/models";
import { useCreateDrug, useGetDrug, useUpdateDrug } from "@/hooks/query/drug";
import { useState } from "react";
import { useInfiniteDrugCategoryList } from "@/hooks/query/drugCategory";
import { FormInfiniteSelect } from "@/components/form-inputs/FormInfiniteSelect";
import { PaginatedResponse } from "@/lib/type";
import { DrugCategory } from "@/generated/prisma/client";

const getInitialValues = (
  data?: DrugGetPayload<{ include: { category: true } }>,
): drugValidatorType => ({
  name: data?.name ?? "",
  description: data?.description ?? "",
  category: data?.category ?? { id: null },
  cGstPercentage: data?.cGstPercentage ?? 0,
  sGstPercentage: data?.cGstPercentage ?? 0,
  iGstPercentage: data?.cGstPercentage ?? 0,
  gstPercentage: data?.gstPercentage ?? 0,
  hsnCode: data?.hsnCode ?? 0,
  manufacturer: data?.manufacturer ?? "",
  unit: data?.unit ?? "",
});

const UpdateCreateForm = ({
  data,
}: {
  data?: DrugGetPayload<{ include: { category: true } }>;
}) => {
  const [categorySearchValue, setCategorySearchValue] = useState("");
  const { mutateAsync: create, isPending: creating } = useCreateDrug();
  const { mutateAsync: update, isPending: updating } = useUpdateDrug();
  const floorQuery = useInfiniteDrugCategoryList(
    { name: categorySearchValue },
    10,
  );

  const form = useForm<drugValidatorType>({
    defaultValues: getInitialValues(data),
    resolver: zodResolver(drugValidator),
  });

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

          <FormInfiniteSelect<
            DrugCategory,
            PaginatedResponse<DrugCategory>,
            string,
            drugValidatorType
          >
            label="Category"
            name="category"
            control={form.control}
            query={floorQuery}
            getItems={(p) => p?.data}
            valueKey={(i) => String(i?.id)}
            labelKey={(i) => i?.name}
            search={categorySearchValue}
            onSearchChange={setCategorySearchValue}
            required
          />

          <FormField<drugValidatorType>
            label="HSN"
            type="number"
            name="hsnCode"
            control={form.control}
            required
          />

          <FormField<drugValidatorType>
            label="GST (%)"
            type="number"
            name="gstPercentage"
            control={form.control}
            required
          />

          <FormField<drugValidatorType>
            label="SGST (%)"
            type="number"
            name="sGstPercentage"
            control={form.control}
            required
          />

          <FormField<drugValidatorType>
            label="CGST (%)"
            type="number"
            name="cGstPercentage"
            control={form.control}
            required
          />

          <FormField<drugValidatorType>
            label="IGST (%)"
            type="number"
            name="iGstPercentage"
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

  return (
    <CustomLayout title={drugId ? "Edit Drug" : "Create Drug"}>
      {drugId ? <UpdateCreateForm data={data} /> : <UpdateCreateForm />}
    </CustomLayout>
  );
};

export default DrugForm;
