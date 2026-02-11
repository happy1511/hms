import { CustomAlert } from "@/components/common/CustomAlert";
import { CustomTable } from "@/components/common/CustomTable";
import { DataViewModal } from "@/components/common/DataViewModal";
import { SortableHeader } from "@/components/common/SortableHeader";
import { Button } from "@/components/ui/button";
import { ActionType, ModuleType } from "@/generated/prisma/enums";
import { useProfile } from "@/hooks/query/auth";
import {
  useDeletePathologyTest,
  usePathologyTestsList,
} from "@/hooks/query/pathology";
import {
  ColumnDefWithClass,
  FilterValues,
  PathologyTestDataType,
} from "@/lib/type";
import { hasActionPermission } from "@/lib/utils";
import { format } from "date-fns";
import { Edit2, Trash2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

const Actions = ({
  data,
  canDelete,
  canEdit,
  canView,
}: {
  data: PathologyTestDataType;
  canEdit: boolean;
  canDelete: boolean;
  canView: boolean;
}) => {
  const { mutateAsync: deleteBed, isPending: deletePending } =
    useDeletePathologyTest();

  return (
    <>
      {canView && (
        <DataViewModal<PathologyTestDataType>
          data={data}
          title="Bed Details"
          fields={[
            { key: "id", label: "BedId" },
            { key: "status", label: "Status" },
            { key: "createdAt", label: "Created At" },
            { key: "updatedAt", label: "Updated At" },
          ]}
        />
      )}
      {canEdit && (
        <Link
          className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive border bg-background hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50 has-[>svg]:px-3 h-auto shadow-none p-1 cursor-pointer"
          href={`/clinical-tests/pathology-test/${data.id}`}
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
          title="Delete Ward?"
          description="Are you sure you want to delete ward?"
          cancelText="Cancel"
          confirmText="Delete"
          handleConfirm={() => deleteBed({ testId: Number(data.id) })}
          pending={deletePending}
        />
      )}
    </>
  );
};

const PathologyTests = () => {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [filters, setFilters] = useState<FilterValues>({});

  const { data: profile } = useProfile(false);
  const { data, isLoading, isError, error } = usePathologyTestsList(
    filters,
    page,
    limit,
  );

  if (!profile) {
    return <></>;
  }

  const canView = hasActionPermission(
    profile?.data,
    ModuleType.PATHOLOGY_TEST_MASTER,
    ActionType.VIEW,
  );
  const canCreate = hasActionPermission(
    profile?.data,
    ModuleType.PATHOLOGY_TEST_MASTER,
    ActionType.CREATE,
  );
  const canUpdate = hasActionPermission(
    profile?.data,
    ModuleType.PATHOLOGY_TEST_MASTER,
    ActionType.UPDATE,
  );
  const canDelete = hasActionPermission(
    profile?.data,
    ModuleType.PATHOLOGY_TEST_MASTER,
    ActionType.DELETE,
  );

  const columns: ColumnDefWithClass<PathologyTestDataType>[] = [
    {
      accessorKey: "id",
      header: ({ column }) => {
        return (
          <SortableHeader<PathologyTestDataType> label="ID" column={column} />
        );
      },
      cell: ({ row }) => <span>#{row.index + 1}</span>,
      headerClassName: "min-w-15 max-w-20",
      cellClassName: "min-w-15 max-w-20",
    },
    {
      accessorKey: "name",
      header: ({ column }) => {
        return (
          <SortableHeader<PathologyTestDataType> label="Name" column={column} />
        );
      },
      cell: ({ row }) => (
        <Link
          href={canUpdate ? `/beds/${row.original.id}` : "#"}
          className="hover:underline"
        >
          {row.original.name || "-"}
        </Link>
      ),
      headerClassName: "min-w-50",
      cellClassName: "min-w-50",
    },
    {
      accessorKey: "section",
      header: ({ column }) => {
        return (
          <SortableHeader<PathologyTestDataType>
            label="Section"
            column={column}
          />
        );
      },
      cell: ({ row }) => row.original.section || "-",
      headerClassName: "min-w-50",
      cellClassName: "min-w-50",
    },
    {
      accessorKey: "alias",
      header: ({ column }) => {
        return (
          <SortableHeader<PathologyTestDataType>
            label="Alias"
            column={column}
          />
        );
      },
      cell: ({ row }) => row.original.alias || "-",
      headerClassName: "min-w-50",
      cellClassName: "min-w-50",
    },

    {
      accessorKey: "createdAt",
      header: ({ column }) => {
        return (
          <SortableHeader<PathologyTestDataType>
            label="Created at"
            column={column}
          />
        );
      },
      cell: ({ row }) => {
        return (
          <div className="flex">
            {row.original.createdAt &&
              format(row.original.createdAt, "MMM dd, yyyy")}
          </div>
        );
      },
      headerClassName: "min-w-40 max-w-50",
      cellClassName: "min-w-40 max-w-50",
    },
    {
      accessorKey: "updatedAt",
      header: ({ column }) => {
        return (
          <SortableHeader<PathologyTestDataType>
            label="Updated at"
            column={column}
          />
        );
      },
      cell: ({ row }) => {
        return (
          <div className="flex">
            {row.original.updatedAt &&
              format(row.original.updatedAt, "MMM dd, yyyy")}
          </div>
        );
      },
      headerClassName: "min-w-40 max-w-50",
      cellClassName: "min-w-40 max-w-50",
    },
    {
      id: "actions",
      header: () => <p>Action</p>,
      cell: ({ row }) => (
        <Actions
          data={row.original}
          canDelete={Boolean(canDelete)}
          canEdit={Boolean(canUpdate)}
          canView={Boolean(canView)}
        />
      ),
      headerClassName: "min-w-20 max-w-30",
      cellClassName: "min-w-20 max-w-30",
    },
  ];
  return (
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
      isError={isError}
      error={error}
      enableGrouping
      grouping={["section"]}
    />
  );
};

export default PathologyTests;
