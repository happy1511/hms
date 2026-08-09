"use client";

import { CustomAlert } from "@/components/common/CustomAlert";
import CustomButton from "@/components/common/CustomButton";
import CustomFilters from "@/components/common/CustomFilters";
import CustomLayout from "@/components/common/CustomLayout";
import NoPermission from "@/components/common/NoPermission";
import { CustomTable } from "@/components/common/CustomTable";
import { SortableHeader } from "@/components/common/SortableHeader";
import FormField from "@/components/form-inputs/FormField";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Label } from "@/components/ui/label";
import {
  ActionType,
  FinanceCategoryType,
  ModuleType,
  PaymentMode,
} from "@/generated/prisma/enums";
import { useProfile } from "@/hooks/query/auth";
import { useInfiniteFinanceCategoryList } from "@/hooks/query/financeCategory";
import {
  IncomeWithCollector,
  useCreateIncome,
  useDeleteIncome,
  useIncomeList,
} from "@/hooks/query/income";
import { useUsersList, useInfiniteUsersList } from "@/hooks/query/user";
import { FormInfiniteSelect } from "@/components/form-inputs/FormInfiniteSelect";
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
  const [userSearch, setUserSearch] = useState("");
  const usersQuery = useInfiniteUsersList({ name: userSearch } as FilterValues, 20);
  const [categorySearch, setCategorySearch] = useState("");
  const categoryQuery = useInfiniteFinanceCategoryList(
    { type: FinanceCategoryType.INCOME, name: categorySearch },
    20,
  );

  const form = useForm<IncomeValidatorType>({
    defaultValues: {
      title: "",
      categoryId: 0,
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
      categoryId: 0,
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
                  <FormInfiniteSelect<
                    FinanceCategory,
                    PaginatedResponse<FinanceCategory>,
                    string,
                    IncomeValidatorType
                  >
                    name="categoryId"
                    control={form.control}
                    required
                    hideError
                    query={categoryQuery}
                    search={categorySearch}
                    getItems={(data) => data?.data}
                    onSearchChange={setCategorySearch}
                    valueKey={(i) => String(i?.id)}
                    labelKey={(i) => i?.name || ""}
                    placeholder="Select Category"
                  />
                </div>
              </div>
              <ErrorMessage
                name="categoryId"
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
                  <FormInfiniteSelect<
                    User,
                    PaginatedResponse<User>,
                    string,
                    IncomeValidatorType
                  >
                    name="collectedById"
                    control={form.control}
                    required
                    hideError
                    query={usersQuery}
                    search={userSearch}
                    getItems={(data) => data?.data}
                    onSearchChange={setUserSearch}
                    valueKey={(i) => String(i?.id)}
                    labelKey={(i) => `${i?.name || "Unknown"} ${i?.loginId ? `(${i.loginId})` : ""}`}
                    placeholder="Select User"
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
                  Remarks
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
            disabled={
              creating || usersQuery.isLoading || categoryQuery.isLoading
            }
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
  const { data, isLoading, isFetching, refetch, isError, error } =
    useIncomeList(filters, page, limit);

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
      cell: ({ row }) => row.original.category?.name || "--",
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
            onRefresh={refetch}
            isLoading={isLoading || isFetching}
            isRefreshing={isFetching}
            filtersContainerClassName="grid-cols-1 md:grid-cols-2"
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

export default Income;
