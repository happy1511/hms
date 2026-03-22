"use client";

import { CustomAlert } from "@/components/common/CustomAlert";
import CustomFilters from "@/components/common/CustomFilters";
import CustomLayout from "@/components/common/CustomLayout";
import NoPermission from "@/components/common/NoPermission";
import { CustomTable } from "@/components/common/CustomTable";
import { SortableHeader } from "@/components/common/SortableHeader";
import FormField from "@/components/form-inputs/FormField";
import { Button } from "@/components/ui/button";
import { Expense } from "@/generated/prisma/client";
import { Form } from "@/components/ui/form";
import {
  ActionType,
  ExpenseCategory,
  ModuleType,
  PaymentMode,
} from "@/generated/prisma/enums";
import { useProfile } from "@/hooks/query/auth";
import {
  useCreateExpense,
  useDeleteExpense,
  useExpenseList,
} from "@/hooks/query/expense";
import { ColumnDefWithClass, FilterConfig, FilterValues } from "@/lib/type";
import { hasActionPermission } from "@/lib/utils";
import {
  expenseValidator,
  ExpenseValidatorType,
} from "@/validators/api/finance/expense";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { Edit2, Trash2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import CustomButton from "@/components/common/CustomButton";
import { Label } from "@/components/ui/label";
import { ErrorMessage } from "@hookform/error-message";

const CreateExpenseForm = () => {
  const { mutateAsync: createExpense, isPending: creating } =
    useCreateExpense();
  const form = useForm<ExpenseValidatorType>({
    defaultValues: {
      title: "",
      category: ExpenseCategory.OTHER_EXPENSES,
      amount: 0,
      paymentMode: PaymentMode.CASH,
      dateTime: new Date(),
      description: "",
    },
    resolver: zodResolver(expenseValidator),
  });

  const onSubmit = async (values: ExpenseValidatorType) => {
    await createExpense(values);
    form.reset({
      title: "",
      category: ExpenseCategory.OTHER_EXPENSES,
      amount: 0,
      paymentMode: PaymentMode.CASH,
      dateTime: new Date(),
      description: "",
    });
  };

  return (
    <CustomLayout title="Create Expense">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="grid grid-cols-2 gap-2">
            <div className="relative">
              <div className="relative grid grid-cols-5 border border-black/15 rounded-[4px]">
                <Label className="text-tiny col-span-2 border-r border-black/15 px-2 bg-pink-50">
                  Title
                </Label>
                <div className="col-span-3">
                  <FormField<ExpenseValidatorType>
                    type="text"
                    name="title"
                    control={form.control}
                    required
                    hideError
                  />
                </div>
              </div>
              <ErrorMessage
                name="title"
                errors={form.formState.errors}
                render={({ message }) => (
                  <p className="font-semibold text-tiny! ms-1">{message}</p>
                )}
              />
            </div>
            <div className="relative">
              <div className="relative grid grid-cols-5 border border-black/15 rounded-[4px]">
                <Label className="text-tiny col-span-2 border-r border-black/15 px-2 bg-pink-50">
                  Category
                </Label>
                <div className="col-span-3">
                  <FormField<ExpenseValidatorType>
                    type="select"
                    name="category"
                    control={form.control}
                    required
                    hideError
                    options={[
                      {
                        label: "Account deposit",
                        value: ExpenseCategory.ACCOUNT_DEPOSIT,
                      },
                      {
                        label: "Salary payment",
                        value: ExpenseCategory.SALARY_PAYMENT,
                      },
                      {
                        label: "Other expenses",
                        value: ExpenseCategory.OTHER_EXPENSES,
                      },
                    ]}
                  />
                </div>
              </div>
              <ErrorMessage
                name="category"
                errors={form.formState.errors}
                render={({ message }) => (
                  <p className="font-semibold text-tiny! ms-1">{message}</p>
                )}
              />
            </div>
            <div className="relative">
              <div className="relative grid grid-cols-5 border border-black/15 rounded-[4px]">
                <Label className="text-tiny col-span-2 border-r border-black/15 px-2 bg-pink-50">
                  Amount
                </Label>
                <div className="col-span-3">
                  <FormField<ExpenseValidatorType>
                    type="number"
                    name="amount"
                    control={form.control}
                    required
                    hideError
                  />
                </div>
              </div>
              <ErrorMessage
                name="amount"
                errors={form.formState.errors}
                render={({ message }) => (
                  <p className="font-semibold text-tiny! ms-1">{message}</p>
                )}
              />
            </div>
            <div className="relative">
              <div className="relative grid grid-cols-5 border border-black/15 rounded-[4px]">
                <Label className="text-tiny col-span-2 border-r border-black/15 px-2 bg-pink-50">
                  Payment Mode
                </Label>
                <div className="col-span-3">
                  <FormField<ExpenseValidatorType>
                    type="select"
                    name="paymentMode"
                    control={form.control}
                    required
                    options={Object.values(PaymentMode).map((mode) => ({
                      label: mode,
                      value: mode,
                    }))}
                    hideError
                  />
                </div>
              </div>
              <ErrorMessage
                name="paymentMode"
                errors={form.formState.errors}
                render={({ message }) => (
                  <p className="font-semibold text-tiny! ms-1">{message}</p>
                )}
              />
            </div>
            <div className="relative">
              <div className="relative grid grid-cols-5 border border-black/15 rounded-[4px]">
                <Label className="text-tiny col-span-2 border-r border-black/15 px-2 bg-pink-50">
                  Date/Time
                </Label>
                <div className="col-span-3">
                  <FormField<ExpenseValidatorType>
                    type="dateTime"
                    name="dateTime"
                    control={form.control}
                    required
                    hideError
                  />
                </div>
              </div>
              <ErrorMessage
                name="dateTime"
                errors={form.formState.errors}
                render={({ message }) => (
                  <p className="font-semibold text-tiny! ms-1">{message}</p>
                )}
              />
            </div>
            <div className="relative">
              <div className="relative grid grid-cols-5 border border-black/15 rounded-[4px]">
                <Label className="text-tiny col-span-2 border-r border-black/15 px-2 bg-pink-50">
                  Description
                </Label>
                <div className="col-span-3">
                  <FormField<ExpenseValidatorType>
                    type="textarea"
                    name="description"
                    control={form.control}
                    hideError
                  />
                </div>
              </div>
              <ErrorMessage
                name="description"
                errors={form.formState.errors}
                render={({ message }) => (
                  <p className="font-semibold text-tiny! ms-1">{message}</p>
                )}
              />
            </div>
          </div>
          <CustomButton type="submit" disabled={creating}>
            Create Expense
          </CustomButton>
        </form>
      </Form>
    </CustomLayout>
  );
};

const neededFilters: FilterConfig<FilterValues>[] = [
  {
    label: "Search",
    valueKey: "name",
    type: "text",
    placeholder: "Title/Category",
  },
  { label: "Date", valueKey: "createdAt", type: "dateRange" },
];

const Actions = ({
  data,
  canDelete,
  canEdit,
}: {
  data: Expense;
  canEdit: boolean;
  canDelete: boolean;
}) => {
  const { mutateAsync: deleteExpense, isPending } = useDeleteExpense();

  return (
    <>
      {canEdit && (
        <Link
          className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none outline-none border bg-background hover:bg-accent hover:text-accent-foreground has-[>svg]:px-3 h-auto shadow-none p-1 cursor-pointer"
          href={`/finance/expense/${data.id}`}
        >
          <Edit2 className="size-2.5" />
        </Link>
      )}
      {canDelete && (
        <CustomAlert
          triggerButton={
            <Button
              variant="outline"
              className="h-auto shadow-none p-1 cursor-pointer"
            >
              <Trash2 className="size-2.5 text-destructive" />
            </Button>
          }
          title="Delete expense?"
          description="Are you sure you want to delete this expense record?"
          cancelText="Cancel"
          confirmText="Delete"
          handleConfirm={() => deleteExpense({ expenseId: Number(data.id) })}
          pending={isPending}
        />
      )}
    </>
  );
};

const ExpensePage = () => {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [filters, setFilters] = useState<FilterValues>({});

  const { data: profile } = useProfile(false);
  const { data, isLoading, isError, error } = useExpenseList(
    filters,
    page,
    limit,
  );

  if (!profile) return <div />;

  const canView = hasActionPermission(
    profile.data,
    ModuleType.EXPENSE,
    ActionType.VIEW,
  );
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
  const canDelete = hasActionPermission(
    profile.data,
    ModuleType.EXPENSE,
    ActionType.DELETE,
  );

  const formatCategory = (value: string) =>
    value
      .split("_")
      .map((part) => part.charAt(0) + part.slice(1).toLowerCase())
      .join(" ");

  const columns: ColumnDefWithClass<Expense>[] = [
    {
      accessorKey: "id",
      header: ({ column }) => (
        <SortableHeader<Expense> label="ID" column={column} />
      ),
      cell: ({ row }) => <span>#{row.index + 1}</span>,
      headerClassName: "min-w-15 max-w-20",
      cellClassName: "min-w-15 max-w-20",
    },
    {
      accessorKey: "title",
      header: ({ column }) => (
        <SortableHeader<Expense> label="Title" column={column} />
      ),
      cell: ({ row }) => (
        <Link
          href={canUpdate ? `/finance/expense/${row.original.id}` : "#"}
          className="hover:underline"
        >
          {row.original.title}
        </Link>
      ),
      headerClassName: "min-w-40",
      cellClassName: "min-w-40",
    },
    {
      accessorKey: "category",
      header: ({ column }) => (
        <SortableHeader<Expense> label="Category" column={column} />
      ),
      cell: ({ row }) => formatCategory(String(row.original.category || "")),
      headerClassName: "min-w-35",
      cellClassName: "min-w-35",
    },
    {
      accessorKey: "paymentMode",
      header: ({ column }) => (
        <SortableHeader<Expense> label="Payment Mode" column={column} />
      ),
      headerClassName: "min-w-30",
      cellClassName: "min-w-30",
    },
    {
      accessorKey: "amount",
      header: ({ column }) => (
        <SortableHeader<Expense> label="Amount" column={column} />
      ),
      cell: ({ row }) => `Rs. ${Number(row.original.amount || 0).toFixed(2)}`,
      headerClassName: "min-w-30",
      cellClassName: "min-w-30",
    },
    {
      accessorKey: "dateTime",
      header: ({ column }) => (
        <SortableHeader<Expense> label="Date/Time" column={column} />
      ),
      cell: ({ row }) =>
        format(new Date(row.original.dateTime), "dd/MM/yyyy - h:mma"),
      headerClassName: "min-w-45",
      cellClassName: "min-w-45",
    },
    {
      accessorKey: "description",
      header: ({ column }) => (
        <SortableHeader<Expense> label="Description" column={column} />
      ),
      cell: ({ row }) => row.original.description || "--",
      headerClassName: "min-w-40",
      cellClassName: "min-w-40",
    },
    {
      id: "actions",
      header: () => <p>Action</p>,
      cell: ({ row }) => (
        <Actions
          data={row.original}
          canDelete={Boolean(canDelete)}
          canEdit={Boolean(canUpdate)}
        />
      ),
      headerClassName: "min-w-20 max-w-30",
      cellClassName: "min-w-20 max-w-30",
    },
  ];

  return (
    <CustomLayout title="Expense" contentClassName="space-y-4">
      {canCreate && <CreateExpenseForm />}
      {canView && (
        <>
          <CustomFilters<FilterValues>
            filters={neededFilters}
            onSubmit={setFilters}
          />
          <CustomTable
            columns={columns}
            data={data?.data || []}
            page={page}
            total={data?.total}
            enableSorting
            limit={limit}
            handleChangePage={setPage}
            isLoading={isLoading}
            handleChangeLimit={setLimit}
            getRowId={(row) => String(row.id)}
            isError={isError}
            error={error}
          />
        </>
      )}
      {!canView && <NoPermission />}
    </CustomLayout>
  );
};

export default ExpensePage;
