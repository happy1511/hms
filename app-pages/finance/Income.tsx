"use client";

import { CustomAlert } from "@/components/common/CustomAlert";
import CustomButton from "@/components/common/CustomButton";
import CustomFilters from "@/components/common/CustomFilters";
import CustomLayout from "@/components/common/CustomLayout";
import { CustomTable } from "@/components/common/CustomTable";
import { SortableHeader } from "@/components/common/SortableHeader";
import FormField from "@/components/form-inputs/FormField";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Label } from "@/components/ui/label";
import {
  ActionType,
  IncomeCategory,
  ModuleType,
  PaymentMode,
} from "@/generated/prisma/enums";
import { useProfile } from "@/hooks/query/auth";
import {
  IncomeWithCollector,
  useCreateIncome,
  useDeleteIncome,
  useIncomeList,
} from "@/hooks/query/income";
import { useUsersList } from "@/hooks/query/user";
import { ColumnDefWithClass, FilterConfig, FilterValues } from "@/lib/type";
import { hasActionPermission } from "@/lib/utils";
import {
  incomeValidator,
  IncomeValidatorType,
} from "@/validators/api/finance/income";
import { ErrorMessage } from "@hookform/error-message";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { Edit2, Trash2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";

const CreateIncomeForm = () => {
  const { mutateAsync: createIncome, isPending: creating } = useCreateIncome();
  const { data: profile } = useProfile(false);
  const usersQuery = useUsersList({} as FilterValues, 1, 200);
  const userOptions = (usersQuery.data?.data || []).map((u) => ({
    label: `${u.name || "Unknown"}`,
    value: String(u.id),
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
    defaultValues: {
      title: "",
      category: IncomeCategory.OUT_PR_DRESSING,
      mode: PaymentMode.CASH,
      amount: 0,
      collectedOn: new Date(),
      collectedById: Number(profile?.data?.id || 0),
      description: "",
    },
    resolver: zodResolver(incomeValidator),
  });

  const onSubmit = async (values: IncomeValidatorType) => {
    await createIncome(values);
    form.reset({
      title: "",
      category: IncomeCategory.OUT_PR_DRESSING,
      mode: PaymentMode.CASH,
      amount: 0,
      collectedOn: new Date(),
      collectedById: Number(profile?.data?.id || 0),
      description: "",
    });
  };

  return (
    <CustomLayout title="Create Income">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="grid grid-cols-2 gap-2">
            <div className="relative">
              <div className="relative grid grid-cols-5 border border-black/15 rounded-[4px]">
                <Label className="text-tiny col-span-2 border-r border-black/15 px-2 bg-pink-50">
                  Title
                </Label>
                <div className="col-span-3">
                  <FormField<IncomeValidatorType>
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
                  <FormField<IncomeValidatorType>
                    type="select"
                    name="category"
                    control={form.control}
                    required
                    hideError
                    options={[
                      {
                        label: "OUT pr dressing",
                        value: IncomeCategory.OUT_PR_DRESSING,
                      },
                      { label: "OUT PT ECG", value: IncomeCategory.OUT_PT_ECG },
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
                  Mode
                </Label>
                <div className="col-span-3">
                  <FormField<IncomeValidatorType>
                    type="select"
                    name="mode"
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
                name="mode"
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
                  <FormField<IncomeValidatorType>
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
                  Collected On
                </Label>
                <div className="col-span-3">
                  <FormField<IncomeValidatorType>
                    type="dateTime"
                    name="collectedOn"
                    control={form.control}
                    required
                    hideError
                  />
                </div>
              </div>
              <ErrorMessage
                name="collectedOn"
                errors={form.formState.errors}
                render={({ message }) => (
                  <p className="font-semibold text-tiny! ms-1">{message}</p>
                )}
              />
            </div>
            <div className="relative">
              <div className="relative grid grid-cols-5 border border-black/15 rounded-[4px]">
                <Label className="text-tiny col-span-2 border-r border-black/15 px-2 bg-pink-50">
                  Collected By
                </Label>
                <div className="col-span-3">
                  <FormField<IncomeValidatorType>
                    type="select"
                    name="collectedById"
                    control={form.control}
                    required
                    hideError
                    options={userOptions}
                  />
                </div>
              </div>
              <ErrorMessage
                name="collectedById"
                errors={form.formState.errors}
                render={({ message }) => (
                  <p className="font-semibold text-tiny! ms-1">{message}</p>
                )}
              />
            </div>
            <div className="relative">
              <div className="relative grid grid-cols-5 border border-black/15 rounded-[4px]">
                <Label className="text-tiny col-span-2 border-r border-black/15 px-2 bg-pink-50">
                  Collected By
                </Label>
                <div className="col-span-3">
                  <FormField<IncomeValidatorType>
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
          <CustomButton
            type="submit"
            disabled={creating || usersQuery.isLoading}
          >
            Create Income
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
  { label: "Collected Date", valueKey: "createdAt", type: "dateRange" },
];

const Actions = ({
  data,
  canDelete,
  canEdit,
}: {
  data: IncomeWithCollector;
  canEdit: boolean;
  canDelete: boolean;
}) => {
  const { mutateAsync: deleteIncome, isPending } = useDeleteIncome();

  return (
    <>
      {canEdit && (
        <Link
          className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none outline-none border bg-background hover:bg-accent hover:text-accent-foreground has-[>svg]:px-3 h-auto shadow-none p-1 cursor-pointer"
          href={`/finance/income/${data.id}`}
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
          title="Delete income?"
          description="Are you sure you want to delete this income record?"
          cancelText="Cancel"
          confirmText="Delete"
          handleConfirm={() => deleteIncome({ incomeId: Number(data.id) })}
          pending={isPending}
        />
      )}
    </>
  );
};

const Income = () => {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [filters, setFilters] = useState<FilterValues>({});

  const { data: profile } = useProfile(false);
  const { data, isLoading, isError, error } = useIncomeList(
    filters,
    page,
    limit,
  );

  if (!profile) return <div />;

  const canView = hasActionPermission(
    profile.data,
    ModuleType.INCOME,
    ActionType.VIEW,
  );
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
  const canDelete = hasActionPermission(
    profile.data,
    ModuleType.INCOME,
    ActionType.DELETE,
  );

  const formatCategory = (value: string) =>
    value
      .split("_")
      .map((part) => part.charAt(0) + part.slice(1).toLowerCase())
      .join(" ");

  const columns: ColumnDefWithClass<IncomeWithCollector>[] = [
    {
      accessorKey: "id",
      header: ({ column }) => (
        <SortableHeader<IncomeWithCollector> label="ID" column={column} />
      ),
      cell: ({ row }) => <span>#{row.index + 1}</span>,
      headerClassName: "min-w-15 max-w-20",
      cellClassName: "min-w-15 max-w-20",
    },
    {
      accessorKey: "title",
      header: ({ column }) => (
        <SortableHeader<IncomeWithCollector> label="Title" column={column} />
      ),
      cell: ({ row }) => (
        <Link
          href={canUpdate ? `/finance/income/${row.original.id}` : "#"}
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
        <SortableHeader<IncomeWithCollector> label="Category" column={column} />
      ),
      cell: ({ row }) => formatCategory(String(row.original.category || "")),
      headerClassName: "min-w-35",
      cellClassName: "min-w-35",
    },
    {
      accessorKey: "mode",
      header: ({ column }) => (
        <SortableHeader<IncomeWithCollector> label="Mode" column={column} />
      ),
      headerClassName: "min-w-30",
      cellClassName: "min-w-30",
    },
    {
      accessorKey: "amount",
      header: ({ column }) => (
        <SortableHeader<IncomeWithCollector> label="Amount" column={column} />
      ),
      cell: ({ row }) => `Rs. ${Number(row.original.amount || 0).toFixed(2)}`,
      headerClassName: "min-w-30",
      cellClassName: "min-w-30",
    },
    {
      accessorKey: "collectedOn",
      header: ({ column }) => (
        <SortableHeader<IncomeWithCollector>
          label="Collected On"
          column={column}
        />
      ),
      cell: ({ row }) =>
        format(new Date(row.original.collectedOn), "dd/MM/yyyy - h:mma"),
      headerClassName: "min-w-45",
      cellClassName: "min-w-45",
    },
    {
      accessorKey: "collectedBy",
      header: ({ column }) => (
        <SortableHeader<IncomeWithCollector>
          label="Collected By"
          column={column}
        />
      ),
      cell: ({ row }) =>
        row.original.collectedBy?.name ||
        row.original.collectedBy?.loginId ||
        "--",
      headerClassName: "min-w-35",
      cellClassName: "min-w-35",
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
    <CustomLayout title="Income" contentClassName="space-y-4">
      {canCreate && <CreateIncomeForm />}
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
    </CustomLayout>
  );
};

export default Income;
