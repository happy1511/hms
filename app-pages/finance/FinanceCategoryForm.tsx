"use client";

import CustomButton from "@/components/common/CustomButton";
import CustomLayout from "@/components/common/CustomLayout";
import NoPermission from "@/components/common/NoPermission";
import FormField from "@/components/form-inputs/FormField";
import { Form } from "@/components/ui/form";
import {
  ActionType,
  FinanceCategoryType,
  ModuleType,
} from "@/generated/prisma/enums";
import { useProfile } from "@/hooks/query/auth";
import {
  useCreateFinanceCategory,
  useGetFinanceCategory,
  useUpdateFinanceCategory,
} from "@/hooks/query/financeCategory";
import { hasActionPermission } from "@/lib/utils";
import {
  financeCategoryValidator,
  FinanceCategoryValidatorType,
} from "@/validators/api/finance/category";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoaderIcon } from "lucide-react";
import { useParams } from "next/navigation";
import { useForm } from "react-hook-form";

const getInitialValues = (
  data?: Partial<FinanceCategoryValidatorType>,
): FinanceCategoryValidatorType => ({
  name: data?.name ?? "",
  type: data?.type ?? FinanceCategoryType.INCOME,
  description: data?.description ?? "",
});

const typeOptions = Object.values(FinanceCategoryType).map((type) => ({
  label: type === FinanceCategoryType.INCOME ? "Income" : "Expense",
  value: type,
}));

const UpdateCreateForm = ({
  data,
}: {
  data?: Partial<FinanceCategoryValidatorType>;
}) => {
  const { mutateAsync: create, isPending: creating } = useCreateFinanceCategory();
  const { mutateAsync: update, isPending: updating } = useUpdateFinanceCategory();
  const { categoryId }: { categoryId?: string } = useParams();

  const form = useForm<FinanceCategoryValidatorType>({
    defaultValues: getInitialValues(data),
    resolver: zodResolver(financeCategoryValidator),
  });

  const onSubmit = (values: FinanceCategoryValidatorType) => {
    if (categoryId) {
      update({ categoryId: Number(categoryId), ...values });
      return;
    }

    create(values);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className="grid grid-cols-2 gap-x-2">
          <FormField<FinanceCategoryValidatorType>
            label="Name"
            type="text"
            name="name"
            control={form.control}
            required
          />
          <FormField<FinanceCategoryValidatorType>
            label="Type"
            type="select"
            name="type"
            control={form.control}
            required
            options={typeOptions}
          />
          <div className="col-span-2">
            <FormField<FinanceCategoryValidatorType>
              label="Description"
              type="textarea"
              name="description"
              control={form.control}
            />
          </div>
        </div>
        <CustomButton disabled={creating || updating} type="submit">
          Submit
        </CustomButton>
      </form>
    </Form>
  );
};

const FinanceCategoryForm = () => {
  const { categoryId }: { categoryId?: string } = useParams();
  const { data, isLoading } = useGetFinanceCategory(categoryId);
  const { data: profile } = useProfile(false);

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <LoaderIcon role="status" aria-label="Loading" className="size-4 animate-spin" />
      </div>
    );
  }

  if (!profile) return <div />;

  const canCreate = hasActionPermission(
    profile.data,
    ModuleType.FINANCE_CATEGORY_MASTER,
    ActionType.CREATE,
  );
  const canUpdate = hasActionPermission(
    profile.data,
    ModuleType.FINANCE_CATEGORY_MASTER,
    ActionType.UPDATE,
  );

  if ((categoryId && !canUpdate) || (!categoryId && !canCreate)) {
    return (
      <CustomLayout title={categoryId ? "Edit Finance Category" : "Create Finance Category"}>
        <NoPermission />
      </CustomLayout>
    );
  }

  if (categoryId && !data) {
    return <div />;
  }

  return (
    <CustomLayout title={categoryId ? "Edit Finance Category" : "Create Finance Category"}>
      {categoryId ? <UpdateCreateForm data={data} /> : <UpdateCreateForm />}
    </CustomLayout>
  );
};

export default FinanceCategoryForm;
