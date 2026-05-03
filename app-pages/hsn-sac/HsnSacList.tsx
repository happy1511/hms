"use client";

import { CustomAlert } from "@/components/common/CustomAlert";
import CustomButton from "@/components/common/CustomButton";
import CustomFilters from "@/components/common/CustomFilters";
import CustomLayout from "@/components/common/CustomLayout";
import MasterImportModal from "@/components/common/MasterImportModal";
import NoPermission from "@/components/common/NoPermission";
import { CustomTable } from "@/components/common/CustomTable";
import { DataViewModal } from "@/components/common/DataViewModal";
import { SortableHeader } from "@/components/common/SortableHeader";
import { Button } from "@/components/ui/button";
import { ActionType, ModuleType } from "@/generated/prisma/enums";
import { useProfile } from "@/hooks/query/auth";
import { useDeleteHsnSac, useHsnSacList } from "@/hooks/query/hsnSac";
import {
  ColumnDefWithClass,
  FilterConfig,
  FilterValues,
  HsnSacType,
} from "@/lib/type";
import { hasActionPermission } from "@/lib/utils";
import { format } from "date-fns";
import { Edit2, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

const Buttons = ({
  canCreate,
  canDelete,
}: {
  canCreate: boolean;
  canDelete: boolean;
}) => {
  const router = useRouter();
  return canCreate ? (
    <div className="flex items-center gap-4">
      <CustomButton onClick={() => router.push("/hsn-sac/new")}>
        New HSN/SAC
      </CustomButton>
      <MasterImportModal master="hsn-sac" allowReplace={canDelete} />
    </div>
  ) : null;
};

const neededFilters: FilterConfig<FilterValues>[] = [
  {
    label: "Code",
    valueKey: "name",
    type: "text",
    placeholder: "Search by code here.",
  },
  { label: "Created Date", valueKey: "createdAt", type: "dateRange" },
];

const Actions = ({
  data,
  canDelete,
  canEdit,
  canView,
}: {
  data: HsnSacType;
  canEdit: boolean;
  canDelete: boolean;
  canView: boolean;
}) => {
  const { mutateAsync: deleteHsnSac, isPending: deleting } = useDeleteHsnSac();

  return (
    <>
      {canView && (
        <DataViewModal<HsnSacType>
          data={data}
          title="HSN/SAC Details"
          fields={[
            { key: "code", label: "Code" },
            { key: "cGstPercentage", label: "CGST (%)" },
            { key: "sGstPercentage", label: "SGST (%)" },
            { key: "iGstPercentage", label: "IGST (%)" },
            { key: "createdAt", label: "Created At" },
            { key: "updatedAt", label: "Updated At" },
          ]}
        />
      )}
      {canEdit && (
        <Link
          className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all border bg-background hover:bg-accent hover:text-accent-foreground h-auto shadow-none p-1 cursor-pointer"
          href={`/hsn-sac/${data.id}`}
        >
          <Edit2 className="size-2.5" />
        </Link>
      )}
      {canDelete && (
        <CustomAlert
          triggerButton={
            <Button variant="outline" className="h-auto shadow-none p-1 cursor-pointer">
              <Trash2 className="size-2.5 text-destructive" />
            </Button>
          }
          title="Delete HSN/SAC?"
          description="Are you sure you want to delete HSN/SAC?"
          cancelText="Cancel"
          confirmText="Delete"
          handleConfirm={() => deleteHsnSac({ hsnSacId: data.id })}
          pending={deleting}
        />
      )}
    </>
  );
};

const HsnSacList = () => {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [filters, setFilters] = useState<FilterValues>({});
  const { data: profile } = useProfile(false);
  const { data, isLoading, isFetching, refetch, isError, error } =
    useHsnSacList(filters, page, limit);

  if (!profile) {
    return <div />;
  }

  const canView = hasActionPermission(
    profile.data,
    ModuleType.PHARMACY_HSN_SAC_MASTER,
    ActionType.VIEW,
  );
  const canCreate = hasActionPermission(
    profile.data,
    ModuleType.PHARMACY_HSN_SAC_MASTER,
    ActionType.CREATE,
  );
  const canUpdate = hasActionPermission(
    profile.data,
    ModuleType.PHARMACY_HSN_SAC_MASTER,
    ActionType.UPDATE,
  );
  const canDelete = hasActionPermission(
    profile.data,
    ModuleType.PHARMACY_HSN_SAC_MASTER,
    ActionType.DELETE,
  );

  const columns: ColumnDefWithClass<HsnSacType>[] = [
    {
      accessorKey: "id",
      header: ({ column }) => <SortableHeader<HsnSacType> label="ID" column={column} />,
      cell: ({ row }) => <span>#{row.index + 1}</span>,
      headerClassName: "min-w-15 max-w-20",
      cellClassName: "min-w-15 max-w-20",
    },
    {
      accessorKey: "code",
      header: ({ column }) => <SortableHeader<HsnSacType> label="Code" column={column} />,
      cell: ({ row }) => (
        <Link
          href={canUpdate ? `/hsn-sac/${row.original.id}` : "#"}
          className="hover:underline"
        >
          {row.original.code}
        </Link>
      ),
      headerClassName: "min-w-32",
      cellClassName: "min-w-32",
    },
    {
      accessorKey: "cGstPercentage",
      header: ({ column }) => <SortableHeader<HsnSacType> label="CGST%" column={column} />,
    },
    {
      accessorKey: "sGstPercentage",
      header: ({ column }) => <SortableHeader<HsnSacType> label="SGST%" column={column} />,
    },
    {
      accessorKey: "iGstPercentage",
      header: ({ column }) => <SortableHeader<HsnSacType> label="IGST%" column={column} />,
    },
    {
      accessorKey: "createdAt",
      header: ({ column }) => <SortableHeader<HsnSacType> label="Created At" column={column} />,
      cell: ({ row }) =>
        row.original.createdAt ? format(row.original.createdAt, "MMM dd, yyyy") : "-",
      headerClassName: "min-w-40 max-w-50",
      cellClassName: "min-w-40 max-w-50",
    },
    {
      accessorKey: "updatedAt",
      header: ({ column }) => <SortableHeader<HsnSacType> label="Updated At" column={column} />,
      cell: ({ row }) =>
        row.original.updatedAt ? format(row.original.updatedAt, "MMM dd, yyyy") : "-",
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
      title="HSN/SAC"
      buttons={
        <Buttons
          canCreate={Boolean(canCreate)}
          canDelete={Boolean(canDelete)}
        />
      }
    >
      {canView ? (
        <>
          <CustomFilters<FilterValues>
            filters={neededFilters}
            onSubmit={setFilters}
            onRefresh={refetch}
            isLoading={isLoading || isFetching}
            isRefreshing={isFetching}
            defaultToday={false}
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
      ) : (
        <NoPermission />
      )}
    </CustomLayout>
  );
};

export default HsnSacList;
