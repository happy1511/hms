"use client";

import CustomButton from "@/components/common/CustomButton";
import CustomLayout from "@/components/common/CustomLayout";
import NoPermission from "@/components/common/NoPermission";
import FormField from "@/components/form-inputs/FormField";
import { Form } from "@/components/ui/form";
import { ActionType, FinanceCategoryType, ModuleType, PaymentMode } from "@/generated/prisma/enums";
import { useProfile } from "@/hooks/query/auth";
import { useFinanceCategoryList } from "@/hooks/query/financeCategory";
import { useCreateIncome, useGetIncome, useUpdateIncome } from "@/hooks/query/income";
import { useUsersList } from "@/hooks/query/user";
import { FilterValues } from "@/lib/type";
import { hasActionPermission } from "@/lib/utils";
import {
  incomeValidator,
  IncomeValidatorType,
} from "@/validators/api/finance/income";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoaderIcon } from "lucide-react";
import { useParams } from "next/navigation";
import { useForm } from "react-hook-form";

const toDate = (value: unknown) => {
  if (value instanceof Date) return value;
  if (typeof value === "string" || typeof value === "number") {
    const parsed = new Date(value);
    if (!Number.isNaN(parsed.getTime())) return parsed;
  }
  return undefined;
};

const getInitialValues = (data?: Partial<IncomeValidatorType>): IncomeValidatorType => ({
  title: data?.title ?? "",
  mode: data?.mode ?? PaymentMode.CASH,
  amount: Number(data?.amount || 0),
  collectedOn: toDate(data?.collectedOn) ?? new Date(),
  collectedById: Number(data?.collectedById || 0),
  description: data?.description ?? "",
  categoryId: Number(data?.categoryId || 0),
});

const UpdateCreateForm = ({ data }: { data?: Partial<IncomeValidatorType> }) => {
  const { mutateAsync: create, isPending: creating } = useCreateIncome();
  const { mutateAsync: update, isPending: updating } = useUpdateIncome();
  const { incomeId }: { incomeId?: string } = useParams();
  const { data: profile } = useProfile(false);
  const categoryQuery = useFinanceCategoryList(
    { type: FinanceCategoryType.INCOME },
    1,
    100,
  );

  const usersQuery = useUsersList({} as FilterValues, 1, 200);
  const userOptions = (usersQuery.data?.data || []).map((u) => ({
    label: `${u.name || "Unknown"} (${u.loginId})`,
    value: String(u.id),
  }));
  const categoryOptions = (categoryQuery.data?.data || []).map((category) => ({
    label: category.name,
    value: String(category.id),
  }));

  if (profile?.data?.id) {
    const currentValue = String(profile.data.id);
    if (!userOptions.some((option) => option.value === currentValue)) {
      userOptions.unshift({
        label: `${profile.data.name || "Current User"} (${profile.data.loginId})`,
        value: currentValue,
      });
    }
  }

  const form = useForm<IncomeValidatorType>({
    defaultValues: getInitialValues(data),
    resolver: zodResolver(incomeValidator),
  });

  const onSubmit = (values: IncomeValidatorType) => {
    if (incomeId) {
      update({ incomeId: Number(incomeId), ...values });
    } else {
      create(values);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className="grid grid-cols-2 gap-x-2">
          <FormField<IncomeValidatorType>
            label="Title"
            type="text"
            name="title"
            control={form.control}
            required
          />
          <FormField<IncomeValidatorType>
            label="Category"
            type="select"
            name="categoryId"
            control={form.control}
            required
            options={categoryOptions}
          />
          <FormField<IncomeValidatorType>
            label="Mode"
            type="select"
            name="mode"
            control={form.control}
            required
            options={Object.values(PaymentMode).map((mode) => ({
              label: mode,
              value: mode,
            }))}
          />
          <FormField<IncomeValidatorType>
            label="Amount"
            type="number"
            name="amount"
            control={form.control}
            required
          />
          <FormField<IncomeValidatorType>
            label="Collected On"
            type="dateTime"
            name="collectedOn"
            control={form.control}
            required
          />
          <FormField<IncomeValidatorType>
            label="Collected By"
            type="select"
            name="collectedById"
            control={form.control}
            required
            options={userOptions}
          />
          <div className="col-span-2">
            <FormField<IncomeValidatorType>
              label="Description"
              type="textarea"
              name="description"
              control={form.control}
            />
          </div>
        </div>

        <CustomButton
          disabled={
            creating || updating || usersQuery.isLoading || categoryQuery.isLoading
          }
          type="submit"
        >
          Submit
        </CustomButton>
      </form>
    </Form>
  );
};

const IncomeForm = () => {
  const { incomeId }: { incomeId?: string } = useParams();
  const { data, isLoading } = useGetIncome(incomeId);
  const { data: profile } = useProfile(false);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <LoaderIcon role="status" aria-label="Loading" className="size-4 animate-spin" />
      </div>
    );
  }

  if (!profile) {
    return <div />;
  }

  const canCreate = hasActionPermission(profile.data, ModuleType.INCOME, ActionType.CREATE);
  const canUpdate = hasActionPermission(profile.data, ModuleType.INCOME, ActionType.UPDATE);

  if ((incomeId && !canUpdate) || (!incomeId && !canCreate)) {
    return (
      <CustomLayout title={incomeId ? "Edit Income" : "Create Income"}>
        <NoPermission />
      </CustomLayout>
    );
  }

  if (incomeId && !data) {
    return <div />;
  }

  return (
    <CustomLayout title={incomeId ? "Edit Income" : "Create Income"}>
      {incomeId ? <UpdateCreateForm data={data} /> : <UpdateCreateForm />}
    </CustomLayout>
  );
};

export default IncomeForm;
