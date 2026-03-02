"use client";

import CustomButton from "@/components/common/CustomButton";
import CustomLayout from "@/components/common/CustomLayout";
import FormField from "@/components/form-inputs/FormField";
import { Form } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoaderIcon } from "lucide-react";
import { useParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { DrugBillingCategory } from "@/generated/prisma/client";
import {
  drugBillingCategoryValidator,
  drugBillingCategoryValidatorType,
} from "@/validators/api/masters/drugBillingCategory";
import {
  useCreateDrugBillingCategory,
  useGetDrugBillingCategory,
  useUpdateDrugBillingCategory,
} from "@/hooks/query/drugBillingCategory";

const getInitialValues = (
  data?: DrugBillingCategory,
): drugBillingCategoryValidatorType => ({
  name: data?.name ?? "",
  description: data?.description ?? "",
});

const UpdateCreateForm = ({ data }: { data?: DrugBillingCategory }) => {
  const { mutateAsync: create, isPending: creating } =
    useCreateDrugBillingCategory();
  const { mutateAsync: update, isPending: updating } =
    useUpdateDrugBillingCategory();

  const form = useForm<drugBillingCategoryValidatorType>({
    defaultValues: getInitialValues(data),
    resolver: zodResolver(drugBillingCategoryValidator),
  });

  const onSubmit = (values: drugBillingCategoryValidatorType) => {
    if (data) {
      update({ categoryId: Number(data.id), ...values });
    } else {
      create(values);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className="grid grid-cols-2 gap-x-2">
          <FormField<drugBillingCategoryValidatorType>
            label="Name"
            type="text"
            name="name"
            control={form.control}
            required
          />

          <FormField<drugBillingCategoryValidatorType>
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

const DrugBillingCategoryForm = () => {
  const { categoryId }: { categoryId?: string } = useParams();

  const { data, isLoading: fetchingRoomType } =
    useGetDrugBillingCategory(categoryId);

  if (fetchingRoomType) {
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

  if (categoryId && !data) {
    return <div />;
  }

  return (
    <CustomLayout
      title={categoryId ? "Edit Drug Category" : "Create Drug Category"}
    >
      {categoryId ? <UpdateCreateForm data={data} /> : <UpdateCreateForm />}
    </CustomLayout>
  );
};

export default DrugBillingCategoryForm;
