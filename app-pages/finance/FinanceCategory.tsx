"use client";

import { CustomAlert } from "@/components/common/CustomAlert";
import CustomButton from "@/components/common/CustomButton";
import CustomFilters from "@/components/common/CustomFilters";
import CustomLayout from "@/components/common/CustomLayout";
import NoPermission from "@/components/common/NoPermission";
import { CustomTable } from "@/components/common/CustomTable";
import { SortableHeader } from "@/components/common/SortableHeader";
import { Button } from "@/components/ui/button";
import { FinanceCategory } from "@/generated/prisma/client";
import { ActionType, FinanceCategoryType, ModuleType } from "@/generated/prisma/enums";
import { useProfile } from "@/hooks/query/auth";
import {
  FinanceCategoryFilters,
  useDeleteFinanceCategory,
  useFinanceCategoryList,
} from "@/hooks/query/financeCategory";
import { ColumnDefWithClass, FilterConfig } from "@/lib/type";
import { hasActionPermission } from "@/lib/utils";
import { format } from "date-fns";
import { Edit2, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

const formatType = (type?: FinanceCategoryType) =>
  type === FinanceCategoryType.INCOME ? "Income" : "Expense";

const Buttons = ({ canCreate }: { canCreate: boolean }) => {
  const router = useRouter();

  if (!canCreate) return null;

  return (
    <CustomButton onClick={() => router.push("/finance/categories/new")}>
      New Category
    </CustomButton>
  );
};

const neededFilters: FilterConfig<FinanceCategoryFilters>[] = [
  {
    label: "Name",
    valueKey: "name",
    type: "text",
    placeholder: "Search by category name",
  },
  {
    label: "Type",
    valueKey: "type",
    type: "select",
    placeholder: "Select type",
    options: Object.values(FinanceCategoryType).map((type) => ({
      label: formatType(type),
      value: type,
    })),
  },
  { label: "Created Date", valueKey: "createdAt", type: "dateRange" },
];

const Actions = ({
  data,
  canEdit,
  canDelete,
}: {
  data: FinanceCategory;
  canEdit: boolean;
  canDelete: boolean;
}) => {
  const { mutateAsync: deleteFinanceCategory, isPending } =
    useDeleteFinanceCategory();

  return (
    <>
      {canEdit && (
        <Link
          className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md border bg-background p-1 text-sm font-medium transition-all hover:bg-accent hover:text-accent-foreground"
          href={`/finance/categories/${data.id}`}
        >
          <Edit2 className="size-2.5" />
        </Link>
      )}
      {canDelete && (
        <CustomAlert
          triggerButton={
            <Button
              variant="outline"
              className="h-auto cursor-pointer p-1 shadow-none"
            >
              <Trash2 className="size-2.5 text-destructive" />
            </Button>
          }
          title="Delete category?"
          description="Are you sure you want to delete this finance category?"
          cancelText="Cancel"
          confirmText="Delete"
          handleConfirm={() =>
            deleteFinanceCategory({ categoryId: Number(data.id) })
          }
          pending={isPending}
        />
      )}
    </>
  );
};

const FinanceCategoryPage = () => {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [filters, setFilters] = useState<FinanceCategoryFilters>({});

  const { data: profile } = useProfile(false);
  const { data, isLoading, isFetching, refetch, isError, error } =
    useFinanceCategoryList(filters, page, limit);

  if (!profile) return <div />;

  const canView = hasActionPermission(
    profile.data,
    ModuleType.FINANCE_CATEGORY_MASTER,
    ActionType.VIEW,
  );
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
  const canDelete = hasActionPermission(
    profile.data,
    ModuleType.FINANCE_CATEGORY_MASTER,
    ActionType.DELETE,
  );

  const columns: ColumnDefWithClass<FinanceCategory>[] = [
    {
      accessorKey: "id",
      header: ({ column }) => (
        <SortableHeader<FinanceCategory> label="ID" column={column} />
      ),
      cell: ({ row }) => <span>#{row.index + 1}</span>,
      headerClassName: "min-w-15 max-w-20",
      cellClassName: "min-w-15 max-w-20",
    },
    {
      accessorKey: "name",
      header: ({ column }) => (
        <SortableHeader<FinanceCategory> label="Name" column={column} />
      ),
      cell: ({ row }) => (
        <Link
          href={canUpdate ? `/finance/categories/${row.original.id}` : "#"}
          className="hover:underline"
        >
          {row.original.name}
        </Link>
      ),
      headerClassName: "min-w-45",
      cellClassName: "min-w-45",
    },
    {
      accessorKey: "type",
      header: ({ column }) => (
        <SortableHeader<FinanceCategory> label="Type" column={column} />
      ),
      cell: ({ row }) => formatType(row.original.type),
      headerClassName: "min-w-30",
      cellClassName: "min-w-30",
    },
    {
      accessorKey: "description",
      header: ({ column }) => (
        <SortableHeader<FinanceCategory> label="Description" column={column} />
      ),
      cell: ({ row }) => row.original.description || "--",
      headerClassName: "min-w-50",
      cellClassName: "min-w-50",
    },
    {
      accessorKey: "createdAt",
      header: ({ column }) => (
        <SortableHeader<FinanceCategory> label="Created At" column={column} />
      ),
      cell: ({ row }) => format(row.original.createdAt, "dd/MM/yyyy"),
      headerClassName: "min-w-30",
      cellClassName: "min-w-30",
    },
    {
      id: "actions",
      header: () => <p>Action</p>,
      cell: ({ row }) => (
        <Actions
          data={row.original}
          canEdit={Boolean(canUpdate)}
          canDelete={Boolean(canDelete)}
        />
      ),
      headerClassName: "min-w-20 max-w-30",
      cellClassName: "min-w-20 max-w-30",
    },
  ];

  return (
    <CustomLayout
      title="Finance Categories"
      buttons={<Buttons canCreate={Boolean(canCreate)} />}
    >
      {canView && (
        <>
          <CustomFilters<FinanceCategoryFilters>
            filters={neededFilters}
            onSubmit={setFilters}
            onRefresh={refetch}
            isLoading={isLoading || isFetching}
            isRefreshing={isFetching}
            defaultToday={false}
            filtersContainerClassName="grid-cols-1 md:grid-cols-3"
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

export default FinanceCategoryPage;
