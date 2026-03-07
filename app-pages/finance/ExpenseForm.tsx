"use client";

import CustomButton from "@/components/common/CustomButton";
import CustomLayout from "@/components/common/CustomLayout";
import FormField from "@/components/form-inputs/FormField";
import { Form } from "@/components/ui/form";
import { ExpenseCategory, PaymentMode } from "@/generated/prisma/enums";
import { useCreateExpense, useGetExpense, useUpdateExpense } from "@/hooks/query/expense";
import {
  expenseValidator,
  ExpenseValidatorType,
} from "@/validators/api/finance/expense";
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

const getInitialValues = (data?: Partial<ExpenseValidatorType>): ExpenseValidatorType => ({
  title: data?.title ?? "",
  category: data?.category ?? ExpenseCategory.OTHER_EXPENSES,
  amount: Number(data?.amount || 0),
  paymentMode: data?.paymentMode ?? PaymentMode.CASH,
  dateTime: toDate(data?.dateTime) ?? new Date(),
  description: data?.description ?? "",
});

const UpdateCreateForm = ({ data }: { data?: Partial<ExpenseValidatorType> }) => {
  const { mutateAsync: create, isPending: creating } = useCreateExpense();
  const { mutateAsync: update, isPending: updating } = useUpdateExpense();
  const { expenseId }: { expenseId?: string } = useParams();

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
          <FormField<ExpenseValidatorType>
            label="Category"
            type="select"
            name="category"
            control={form.control}
            required
            options={[
              { label: "Account deposit", value: ExpenseCategory.ACCOUNT_DEPOSIT },
              { label: "Salary payment", value: ExpenseCategory.SALARY_PAYMENT },
              { label: "Other expenses", value: ExpenseCategory.OTHER_EXPENSES },
            ]}
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
        <CustomButton disabled={creating || updating} type="submit">
          Submit
        </CustomButton>
      </form>
    </Form>
  );
};

const ExpenseForm = () => {
  const { expenseId }: { expenseId?: string } = useParams();
  const { data, isLoading } = useGetExpense(expenseId);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <LoaderIcon role="status" aria-label="Loading" className="size-4 animate-spin" />
      </div>
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
