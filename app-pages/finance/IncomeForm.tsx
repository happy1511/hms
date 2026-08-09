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
  PaymentMode,
} from "@/generated/prisma/enums";
import { useProfile } from "@/hooks/query/auth";
import { useInfiniteFinanceCategoryList } from "@/hooks/query/financeCategory";
import {
  useCreateIncome,
  useGetIncome,
  useUpdateIncome,
} from "@/hooks/query/income";
import { useInfiniteUsersList } from "@/hooks/query/user";
import { FormInfiniteSelect } from "@/components/form-inputs/FormInfiniteSelect";
import { PaginatedResponse, User, FilterValues } from "@/lib/type";
import { useState } from "react";
import { hasActionPermission } from "@/lib/utils";
import {
  incomeValidator,
  IncomeValidatorType,
} from "@/validators/api/finance/income";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoaderIcon } from "lucide-react";
import { useParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { FinanceCategory } from "@/generated/prisma/client";

const toDate = (value: unknown) => {
  if (value instanceof Date) return value;
  if (typeof value === "string" || typeof value === "number") {
    const parsed = new Date(value);
    if (!Number.isNaN(parsed.getTime())) return parsed;
  }
  return undefined;
};

const getInitialValues = (
  data?: Partial<IncomeValidatorType>,
): IncomeValidatorType => ({
  title: data?.title ?? "",
  mode: data?.mode ?? PaymentMode.CASH,
  amount: Number(data?.amount || 0),
  collectedOn: toDate(data?.collectedOn) ?? new Date(),
  collectedById: Number(data?.collectedById || 0),
  description: data?.description ?? "",
  categoryId: Number(data?.categoryId || 0),
});

const UpdateCreateForm = ({
  data,
}: {
  data?: Partial<IncomeValidatorType>;
}) => {
  const { mutateAsync: create, isPending: creating } = useCreateIncome();
  const { mutateAsync: update, isPending: updating } = useUpdateIncome();
  const { incomeId }: { incomeId?: string } = useParams();
  const [userSearch, setUserSearch] = useState("");
  const usersQuery = useInfiniteUsersList(
    { name: userSearch } as FilterValues,
    20,
  );
  const [categorySearch, setCategorySearch] = useState("");
  const categoryQuery = useInfiniteFinanceCategoryList(
    { type: FinanceCategoryType.INCOME, name: categorySearch },
    20,
  );

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
          <FormInfiniteSelect<
            FinanceCategory,
            PaginatedResponse<FinanceCategory>,
            string,
            IncomeValidatorType
          >
            label="Category"
            name="categoryId"
            control={form.control}
            required
            query={categoryQuery}
            searchValue={categorySearch}
            getItems={(data) => data?.data}
            onSearchChange={setCategorySearch}
            valueKey={(i) => String(i?.id)}
            labelKey={(i) => i?.name || ""}
            placeholder="Select Category"
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
          <FormInfiniteSelect<
            User,
            PaginatedResponse<User>,
            string,
            IncomeValidatorType
          >
            label="Collected By"
            name="collectedById"
            control={form.control}
            required
            query={usersQuery}
            searchValue={userSearch}
            getItems={(data) => data?.data}
            onSearchChange={setUserSearch}
            valueKey={(i) => String(i?.id)}
            labelKey={(i) =>
              `${i?.name || "Unknown"} ${i?.loginId ? `(${i.loginId})` : ""}`
            }
            placeholder="Select User"
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
            creating ||
            updating ||
            usersQuery.isLoading ||
            categoryQuery.isLoading
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
        <LoaderIcon
          role="status"
          aria-label="Loading"
          className="size-4 animate-spin"
        />
      </div>
    );
  }

  if (!profile) {
    return <div />;
  }

  const canCreate = hasActionPermission(
    profile.data,
    ModuleType.INCOME,
    ActionType.CREATE,
  );
  const canUpdate = hasActionPermission(
    profile.data,
    ModuleType.INCOME,
    ActionType.UPDATE,
  );

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
