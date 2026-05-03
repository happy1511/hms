"use client";

import { CustomAlert } from "@/components/common/CustomAlert";
import CustomButton from "@/components/common/CustomButton";
import CustomLayout from "@/components/common/CustomLayout";
import { CustomTable } from "@/components/common/CustomTable";
import { DataViewModal } from "@/components/common/DataViewModal";
import MasterImportModal from "@/components/common/MasterImportModal";
import NoPermission from "@/components/common/NoPermission";
import { SortableHeader } from "@/components/common/SortableHeader";
import { Button } from "@/components/ui/button";
import { RadiologyTemplate } from "@/generated/prisma/client";
import { ActionType, ModuleType } from "@/generated/prisma/enums";
import { useProfile } from "@/hooks/query/auth";
import {
  useDeleteRadiologyTemplate,
  useRadiologyTemplatesList,
} from "@/hooks/query/radiology";
import { ColumnDefWithClass, FilterValues } from "@/lib/type";
import { hasActionPermission } from "@/lib/utils";
import { format } from "date-fns";
import { EditIcon, Trash2 } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";

const Buttons = ({
  canCreate,
  canDelete,
}: {
  canCreate: boolean;
  canDelete: boolean;
}) => {
  const router = useRouter();

  if (!canCreate) {
    return null;
  }

  return (
    <div className="flex items-center gap-4">
      <CustomButton onClick={() => router.push("/clinical-tests/radiology-template/new")}>
        New Template
      </CustomButton>
      <MasterImportModal
        master="radiology-template"
        allowReplace={canDelete}
      />
    </div>
  );
};

const Actions = ({
  data,
  canDelete,
  canEdit,
  canView,
}: {
  data: RadiologyTemplate;
  canEdit: boolean;
  canDelete: boolean;
  canView: boolean;
}) => {
  const { mutateAsync: deleteTemplate, isPending: deletePending } =
    useDeleteRadiologyTemplate();
  const router = useRouter();

  return (
    <>
      {canView && (
        <DataViewModal<RadiologyTemplate>
          data={data}
          title="Template Details"
          fields={[
            { key: "id", label: "BedId" },
            { key: "status", label: "Status" },
            { key: "createdAt", label: "Created At" },
            { key: "updatedAt", label: "Updated At" },
          ]}
        />
      )}
      {canEdit && (
        <Button
          variant="outline"
          className="h-auto shadow-none p-1 cursor-pointer"
          onClick={() =>
            router.push("/clinical-tests/radiology-template/" + data.id)
          }
        >
          <EditIcon className="size-2.5 text-destructive" />
        </Button>
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
          title="Delete Test?"
          description="Are you sure you want to delete test?"
          cancelText="Cancel"
          confirmText="Delete"
          handleConfirm={() => deleteTemplate({ templateId: Number(data.id) })}
          pending={deletePending}
        />
      )}
    </>
  );
};

const RadiologyTemplates = () => {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [filters, setFilters] = useState<FilterValues>({});

  const { data: profile } = useProfile(false);
  const { data, isLoading, isError, error } = useRadiologyTemplatesList(
    filters,
    page,
    limit,
  );

  if (!profile) {
    return <div />;
  }

  const canView = hasActionPermission(
    profile?.data,
    ModuleType.RADIOLOGY_TEMPLATE_MASTER,
    ActionType.VIEW,
  );

  const canUpdate = hasActionPermission(
    profile?.data,
    ModuleType.RADIOLOGY_TEMPLATE_MASTER,
    ActionType.UPDATE,
  );
  const canCreate = hasActionPermission(
    profile?.data,
    ModuleType.RADIOLOGY_TEMPLATE_MASTER,
    ActionType.CREATE,
  );
  const canDelete = hasActionPermission(
    profile?.data,
    ModuleType.RADIOLOGY_TEMPLATE_MASTER,
    ActionType.DELETE,
  );

  if (!canView) {
    return <NoPermission />;
  }

  const columns: ColumnDefWithClass<RadiologyTemplate>[] = [
    {
      accessorKey: "id",
      header: ({ column }) => {
        return <SortableHeader<RadiologyTemplate> label="ID" column={column} />;
      },
      cell: ({ row }) => <span>#{row.index + 1}</span>,
      headerClassName: "min-w-15 max-w-20",
      cellClassName: "min-w-15 max-w-20",
    },
    {
      accessorKey: "name",
      header: ({ column }) => {
        return (
          <SortableHeader<RadiologyTemplate> label="Name" column={column} />
        );
      },
      headerClassName: "min-w-50",
      cellClassName: "min-w-50",
    },
    {
      accessorKey: "section",
      header: ({ column }) => {
        return (
          <SortableHeader<RadiologyTemplate> label="Section" column={column} />
        );
      },
      cell: ({ row }) => row.original.section || "-",
      headerClassName: "min-w-50",
      cellClassName: "min-w-50",
    },

    {
      accessorKey: "createdAt",
      header: ({ column }) => {
        return (
          <SortableHeader<RadiologyTemplate>
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
          <SortableHeader<RadiologyTemplate>
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
    <CustomLayout
      title="Radiology Templates"
      buttons={
        <Buttons
          canCreate={Boolean(canCreate)}
          canDelete={Boolean(canDelete)}
        />
      }
    >
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
        getRowId={(data) => String(data.id)}
      />
    </CustomLayout>
  );
};

export default RadiologyTemplates;
