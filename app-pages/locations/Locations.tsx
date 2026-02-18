"use client";
import { CustomAlert } from "@/components/common/CustomAlert";
import CustomButton from "@/components/common/CustomButton";
import CustomFilters from "@/components/common/CustomFilters";
import CustomLayout from "@/components/common/CustomLayout";
import { CustomTable } from "@/components/common/CustomTable";
import { DataViewModal } from "@/components/common/DataViewModal";
import { SortableHeader } from "@/components/common/SortableHeader";
import { Button } from "@/components/ui/button";
import { ActionType, ModuleType } from "@/generated/prisma/enums";
import { useProfile } from "@/hooks/query/auth";
import { useDeleteBed } from "@/hooks/query/bed";
import { useLocationsList } from "@/hooks/query/locations";
import {
  BedType,
  ColumnDefWithClass,
  FilterConfig,
  FilterValues,
} from "@/lib/type";
import { hasActionPermission } from "@/lib/utils";
import { Edit2, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

const Buttons = ({ canCreate }: { canCreate: boolean }) => {
  const router = useRouter();
  return (
    <>
      {canCreate && (
        <CustomButton onClick={() => router.push("/beds/new")}>
          New Location
        </CustomButton>
      )}
    </>
  );
};

const neededFilters: FilterConfig<FilterValues>[] = [
  {
    label: "Search",
    valueKey: "name",
    type: "text",
    placeholder: "Search by city, state, postcode here.",
  },
];

const Actions = ({
  data,
  canDelete,
  canEdit,
  canView,
}: {
  data: BedType;
  canEdit: boolean;
  canDelete: boolean;
  canView: boolean;
}) => {
  const { mutateAsync: deleteBed, isPending: deletePending } = useDeleteBed();

  return (
    <>
      {canView && (
        <DataViewModal<BedType>
          data={data}
          title="Bed Details"
          fields={[
            { key: "id", label: "BedId" },
            { key: "bedNumber", label: "bedNumber" },
            { key: "status", label: "Status" },
            { key: "createdAt", label: "Created At" },
            { key: "updatedAt", label: "Updated At" },
          ]}
        />
      )}
      {canEdit && (
        <Link
          className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive border bg-background hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50 has-[>svg]:px-3 h-auto shadow-none p-1 cursor-pointer"
          href={`/beds/${data.id}`}
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
          handleConfirm={() => deleteBed({ bedId: Number(data.id) })}
          pending={deletePending}
        />
      )}
    </>
  );
};

const Locations = () => {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [filters, setFilters] = useState<FilterValues>({});

  const { data: profile } = useProfile(false);
  const { data, isLoading, isError, error } = useLocationsList(
    filters,
    page,
    limit,
  );

  if (!profile) {
    return <></>;
  }

  const canView = hasActionPermission(
    profile?.data,
    ModuleType.LOCATION_MASTER,
    ActionType.VIEW,
  );
  const canCreate = hasActionPermission(
    profile?.data,
    ModuleType.LOCATION_MASTER,
    ActionType.CREATE,
  );
  const canUpdate = hasActionPermission(
    profile?.data,
    ModuleType.LOCATION_MASTER,
    ActionType.UPDATE,
  );
  const canDelete = hasActionPermission(
    profile?.data,
    ModuleType.LOCATION_MASTER,
    ActionType.DELETE,
  );

  const columns: ColumnDefWithClass<BedType>[] = [
    {
      accessorKey: "id",
      header: ({ column }) => {
        return <SortableHeader<BedType> label="ID" column={column} />;
      },
      cell: ({ row }) => <span>#{row.index + 1}</span>,
      headerClassName: "min-w-15 max-w-20",
      cellClassName: "min-w-15 max-w-20",
    },
    {
      accessorKey: "city",
      header: "City",
      headerClassName: "min-w-50",
      cellClassName: "min-w-50",
    },
    {
      accessorKey: "state",
      header: "State",
      headerClassName: "min-w-50",
      cellClassName: "min-w-50",
    },
    {
      accessorKey: "country",
      header: "Country",
      headerClassName: "min-w-50",
      cellClassName: "min-w-50",
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
      title="Locations"
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
            isError={isError}
            error={error}
          />
        </>
      )}
    </CustomLayout>
  );
};

export default Locations;
