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
import { FormInfiniteSelect } from "@/components/form-inputs/FormInfiniteSelect";
import { PaginatedResponse } from "@/lib/type";
import { useState } from "react";
import { useInfiniteFinanceCategoryList } from "@/hooks/query/financeCategory";
import {
  useCreateExpense,
  useGetExpense,
  useUpdateExpense,
} from "@/hooks/query/expense";
import { hasActionPermission } from "@/lib/utils";
import {
  expenseValidator,
  ExpenseValidatorType,
} from "@/validators/api/finance/expense";
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
  data?: Partial<ExpenseValidatorType>,
): ExpenseValidatorType => ({
  title: data?.title ?? "",
  categoryId: Number(data?.categoryId || 0),
  amount: Number(data?.amount || 0),
  paymentMode: data?.paymentMode ?? PaymentMode.CASH,
  dateTime: toDate(data?.dateTime) ?? new Date(),
  description: data?.description ?? "",
});

const UpdateCreateForm = ({
  data,
}: {
  data?: Partial<ExpenseValidatorType>;
}) => {
  const { mutateAsync: create, isPending: creating } = useCreateExpense();
  const { mutateAsync: update, isPending: updating } = useUpdateExpense();
  const { expenseId }: { expenseId?: string } = useParams();
  const [categorySearch, setCategorySearch] = useState("");
  const categoryQuery = useInfiniteFinanceCategoryList(
    { type: FinanceCategoryType.EXPENSE, name: categorySearch },
    20,
  );

  const form = useForm<ExpenseValidatorType>({
    defaultValues: getInitialValues(data),
    resolver: zodResolver(expenseValidator),
  });

  const onSubmit = (values: ExpenseValidatorType) => {
    if (expenseId) {
      update({ expenseId: Number(expenseId), ...values });
    } else {
      create(values);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className="grid grid-cols-2 gap-x-2">
          <FormField<ExpenseValidatorType>
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
            ExpenseValidatorType
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
          <FormField<ExpenseValidatorType>
            label="Amount"
            type="number"
            name="amount"
            control={form.control}
            required
          />
          <FormField<ExpenseValidatorType>
            label="Payment Mode"
            type="select"
            name="paymentMode"
            control={form.control}
            required
            options={Object.values(PaymentMode).map((mode) => ({
              label: mode,
              value: mode,
            }))}
          />
          <FormField<ExpenseValidatorType>
            label="Date/Time"
            type="dateTime"
            name="dateTime"
            control={form.control}
            required
          />
          <div className="col-span-2">
            <FormField<ExpenseValidatorType>
              label="Description"
              type="textarea"
              name="description"
              control={form.control}
            />
          </div>
        </div>
        <CustomButton
          disabled={creating || updating || categoryQuery.isLoading}
          type="submit"
        >
          Submit
        </CustomButton>
      </form>
    </Form>
  );
};

const ExpenseForm = () => {
  const { expenseId }: { expenseId?: string } = useParams();
  const { data, isLoading } = useGetExpense(expenseId);
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
    ModuleType.EXPENSE,
    ActionType.CREATE,
  );
  const canUpdate = hasActionPermission(
    profile.data,
    ModuleType.EXPENSE,
    ActionType.UPDATE,
  );

  if ((expenseId && !canUpdate) || (!expenseId && !canCreate)) {
    return (
      <CustomLayout title={expenseId ? "Edit Expense" : "Create Expense"}>
        <NoPermission />
      </CustomLayout>
    );
  }

  if (expenseId && !data) {
    return <div />;
  }

  return (
    <CustomLayout title={expenseId ? "Edit Expense" : "Create Expense"}>
      {expenseId ? <UpdateCreateForm data={data} /> : <UpdateCreateForm />}
    </CustomLayout>
  );
};

export default ExpenseForm;
