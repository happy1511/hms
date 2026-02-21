"use client";
import { CustomAlert } from "@/components/common/CustomAlert";
import CustomButton from "@/components/common/CustomButton";
import CustomFilters from "@/components/common/CustomFilters";
import CustomLayout from "@/components/common/CustomLayout";
import { CustomTable } from "@/components/common/CustomTable";
import { DataViewModal } from "@/components/common/DataViewModal";
import { SortableHeader } from "@/components/common/SortableHeader";
import StatusBadge from "@/components/common/StatusBadge";
import { Button } from "@/components/ui/button";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { ActionType, ModuleType, Status } from "@/generated/prisma/enums";
import { useProfile } from "@/hooks/query/auth";
import { useDeleteService, useServicesList } from "@/hooks/query/service";
import {
  ColumnDefWithClass,
  FilterConfig,
  FilterValues,
  ServiceDataType,
} from "@/lib/type";
import { hasActionPermission } from "@/lib/utils";
import { format } from "date-fns";
import { Edit2, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

const Buttons = ({ canCreate }: { canCreate: boolean }) => {
  const router = useRouter();
  return (
    <>
      {canCreate && (
        <CustomButton onClick={() => router.push("/services/new")}>
          New Service
        </CustomButton>
      )}
    </>
  );
};

const neededFilters: FilterConfig<FilterValues>[] = [
  {
    label: "Name",
    valueKey: "name",
    type: "text",
    placeholder: "Search by name here.",
  },
  {
    label: "Status",
    valueKey: "status",
    type: "select",
    placeholder: "Select Status",
    options: Object.values(Status).map((s) => ({
      label: s,
      value: s,
    })),
  },
  { label: "Created Date", valueKey: "createdAt", type: "dateRange" },
];

const Actions = ({
  data,
  canDelete,
  canEdit,
  canView,
}: {
  data: ServiceDataType;
  canEdit: boolean;
  canDelete: boolean;
  canView: boolean;
}) => {
  const { mutateAsync: deleteService, isPending: deletePending } =
    useDeleteService();

  return (
    <>
      {canView && (
        <DataViewModal<ServiceDataType>
          data={data}
          title="Service Details"
          fields={[
            { key: "id", label: "Service Id" },
            { key: "name", label: "Name" },
            { key: "description", label: "Description" },
            { key: "status", label: "Status" },
            { key: "createdAt", label: "Created At" },
            { key: "updatedAt", label: "Updated At" },
          ]}
        />
      )}
      {canEdit && (
        <Link
          className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive border bg-background hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50 has-[>svg]:px-3 h-auto shadow-none p-1 cursor-pointer"
          href={`/services/${data.id}`}
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
          handleConfirm={() => deleteService({ serviceId: Number(data.id) })}
          pending={deletePending}
        />
      )}
    </>
  );
};

const Tests = ({
  data,
}: {
  data: ServiceDataType["pathologyTests"] | ServiceDataType["radiologyTests"];
}) => {
  return (
    <HoverCard openDelay={150}>
      <HoverCardTrigger asChild>
        <span className="cursor-pointer capitalize border border-success bg-success px-2 rounded-sm text-white text-tiny">
          {data?.length}
        </span>
      </HoverCardTrigger>

      <HoverCardContent className="w-64">
        <div className="space-y-2">
          {data?.length ? (
            <div className="flex flex-wrap gap-1">
              {data.map((action) => (
                <span
                  key={action.id}
                  className="capitalize border border-primary bg-primary/10 px-2 py-0.5 rounded-sm text-primary text-xs"
                >
                  {action.test.name}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">No Tests Assigned</p>
          )}
        </div>
      </HoverCardContent>
    </HoverCard>
  );
};

const Services = () => {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [filters, setFilters] = useState<FilterValues>({});

  const { data: profile } = useProfile(false);
  const { data, isLoading, isError, error } = useServicesList(
    filters,
    page,
    limit,
  );

  if (!profile) {
    return <div />;
  }

  const canView = hasActionPermission(
    profile?.data,
    ModuleType.SERVICE_MASTER,
    ActionType.VIEW,
  );
  const canCreate = hasActionPermission(
    profile?.data,
    ModuleType.SERVICE_MASTER,
    ActionType.CREATE,
  );
  const canUpdate = hasActionPermission(
    profile?.data,
    ModuleType.SERVICE_MASTER,
    ActionType.UPDATE,
  );
  const canDelete = hasActionPermission(
    profile?.data,
    ModuleType.SERVICE_MASTER,
    ActionType.DELETE,
  );

  const columns: ColumnDefWithClass<ServiceDataType>[] = [
    {
      accessorKey: "id",
      header: ({ column }) => {
        return <SortableHeader<ServiceDataType> label="ID" column={column} />;
      },
      cell: ({ row }) => <span>#{row.index + 1}</span>,
      headerClassName: "min-w-15 max-w-20",
      cellClassName: "min-w-15 max-w-20",
    },
    {
      accessorKey: "name",
      header: ({ column }) => {
        return <SortableHeader<ServiceDataType> label="Name" column={column} />;
      },
      cell: ({ row }) => (
        <Link
          href={canUpdate ? `/billing-sections/${row.original.id}` : "#"}
          className="hover:underline"
        >
          {row.original.name || "-"}
        </Link>
      ),
      headerClassName: "min-w-50",
      cellClassName: "min-w-50",
    },
    {
      accessorKey: "description",
      header: ({ column }) => {
        return (
          <SortableHeader<ServiceDataType>
            label="Description"
            column={column}
          />
        );
      },
      cell: ({ row }) => row.original.description || "-",
      headerClassName: "min-w-50",
      cellClassName: "min-w-50",
    },

    {
      accessorKey: "type",
      header: ({ column }) => {
        return <SortableHeader<ServiceDataType> label="Type" column={column} />;
      },
      headerClassName: "min-w-50",
      cellClassName: "min-w-50",
    },

    {
      accessorKey: "price",
      header: ({ column }) => {
        return (
          <SortableHeader<ServiceDataType> label="Price" column={column} />
        );
      },
      headerClassName: "min-w-50",
      cellClassName: "min-w-50",
    },

    {
      accessorKey: "Pathology Tests",
      header: ({ column }) => {
        return (
          <SortableHeader<ServiceDataType>
            label="Pathology Tests"
            column={column}
          />
        );
      },
      cell: ({ row }) => <Tests data={row.original.pathologyTests} />,
      headerClassName: "min-w-50",
      cellClassName: "min-w-50",
    },

    {
      accessorKey: "Radiology Tests",
      header: ({ column }) => {
        return (
          <SortableHeader<ServiceDataType>
            label="Radiology Tests"
            column={column}
          />
        );
      },
      cell: ({ row }) => <Tests data={row.original.radiologyTests} />,
      headerClassName: "min-w-50",
      cellClassName: "min-w-50",
    },

    {
      accessorKey: "status",
      header: () => {
        return <button className="flex">Status</button>;
      },
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
      headerClassName: "min-w-20 max-w-30",
      cellClassName: "min-w-20 max-w-30",
    },
    {
      accessorKey: "createdAt",
      header: ({ column }) => {
        return (
          <SortableHeader<ServiceDataType> label="Created at" column={column} />
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
          <SortableHeader<ServiceDataType> label="Updated at" column={column} />
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
    <CustomLayout
      title="Services"
      buttons={<Buttons canCreate={Boolean(canCreate)} />}
    >
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
            getRowId={(data) => String(data.id)}
            isError={isError}
            error={error}
          />
        </>
      )}
    </CustomLayout>
  );
};

export default Services;
