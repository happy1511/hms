"use client";

import CustomButton from "@/components/common/CustomButton";
import CustomLayout from "@/components/common/CustomLayout";
import FormField from "@/components/form-inputs/FormField";
import { Form } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoaderIcon } from "lucide-react";
import { useParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { DrugCategory } from "@/generated/prisma/client";
import {
  drugCategoryValidator,
  drugCategoryValidatorType,
} from "@/validators/api/masters/drugCategory";
import {
  useCreateDrugCategory,
  useGetDrugCategory,
  useUpdateDrugCategory,
} from "@/hooks/query/drugCategory";

const getInitialValues = (data?: DrugCategory): drugCategoryValidatorType => ({
  name: data?.name ?? "",
  description: data?.description ?? "",
});

const UpdateCreateForm = ({ data }: { data?: DrugCategory }) => {
  const { mutateAsync: create, isPending: creating } = useCreateDrugCategory();
  const { mutateAsync: update, isPending: updating } = useUpdateDrugCategory();

  const form = useForm<drugCategoryValidatorType>({
    defaultValues: getInitialValues(data),
    resolver: zodResolver(drugCategoryValidator),
  });

  const onSubmit = (values: drugCategoryValidatorType) => {
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
          <FormField<drugCategoryValidatorType>
            label="Name"
            type="text"
            name="name"
            control={form.control}
            required
          />

          <FormField<drugCategoryValidatorType>
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

const DrugCategoryForm = () => {
  const { categoryId }: { categoryId?: string } = useParams();

  const { data, isLoading: fetchingRoomType } = useGetDrugCategory(categoryId);

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

export default DrugCategoryForm;
