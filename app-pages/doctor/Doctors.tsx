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
  ActionType,
  DoctorType,
  ModuleType,
  Status,
} from "@/generated/prisma/enums";
import { useProfile } from "@/hooks/query/auth";
import { useDeleteDoctor, useDoctorsList } from "@/hooks/query/doctor";
import {
  ColumnDefWithClass,
  Doctor,
  DoctorFilterValues,
  FilterConfig,
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
        <CustomButton onClick={() => router.push("/doctors/new")}>
          New Doctor
        </CustomButton>
      )}
    </>
  );
};

const neededFilters: FilterConfig<DoctorFilterValues>[] = [
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
  {
    label: "Doctor Type",
    valueKey: "doctorType",
    type: "select",
    placeholder: "Select Type",
    options: Object.values(DoctorType).map((s) => ({
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
  data: Doctor;
  canEdit: boolean;
  canDelete: boolean;
  canView: boolean;
}) => {
  const { mutateAsync: deleteDoctor, isPending: deletePending } =
    useDeleteDoctor();

  return (
    <>
      {canView && (
        <DataViewModal<Doctor>
          data={data}
          title="Doctor Details"
          fields={[
            { key: "userId", label: "UserId" },
            { key: "loginId", label: "LoginId" },
            { key: "password", label: "Password" },
            { key: "name", label: "Name" },
            { key: "licenseNumber", label: "License Number" },
            { key: "status", label: "Status" },
            { key: "createdAt", label: "Created At" },
            { key: "updatedAt", label: "Updated At" },
          ]}
        />
      )}
      {canEdit && (
        <Link
          className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive border bg-background hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50 has-[>svg]:px-3 h-auto shadow-none p-1 cursor-pointer"
          href={`/doctors/${data.userId}`}
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
          title="Delete Doctor?"
          description="Are you sure you want to delete doctor?"
          cancelText="Cancel"
          confirmText="Delete"
          handleConfirm={() => deleteDoctor({ userId: Number(data.userId) })}
          pending={deletePending}
        />
      )}
    </>
  );
};

const Doctors = () => {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [filters, setFilters] = useState<DoctorFilterValues>({});

  const { data: profile } = useProfile(false);
  const { data, isLoading } = useDoctorsList(filters, page, limit);

  if (!profile) {
    return <></>;
  }

  const canView = hasActionPermission(
    profile?.data,
    ModuleType.DOCTOR_MASTER,
    ActionType.VIEW,
  );
  const canCreate = hasActionPermission(
    profile?.data,
    ModuleType.DOCTOR_MASTER,
    ActionType.CREATE,
  );
  const canUpdate = hasActionPermission(
    profile?.data,
    ModuleType.DOCTOR_MASTER,
    ActionType.UPDATE,
  );
  const canDelete = hasActionPermission(
    profile?.data,
    ModuleType.DOCTOR_MASTER,
    ActionType.DELETE,
  );

  const columns: ColumnDefWithClass<Doctor>[] = [
    {
      accessorKey: "id",
      header: ({ column }) => {
        return <SortableHeader<Doctor> label="ID" column={column} />;
      },
      cell: ({ row }) => <span>#{row.index + 1}</span>,
      headerClassName: "min-w-15 max-w-20",
      cellClassName: "min-w-15 max-w-20",
    },
    {
      accessorKey: "name",
      header: ({ column }) => {
        return <SortableHeader<Doctor> label="Doctor Name" column={column} />;
      },
      cell: ({ row }) => (
        <Link
          href={canUpdate ? `/doctors/${row.original.userId}` : "#"}
          className="hover:underline"
        >
          {row.original.user.name || "-"}
        </Link>
      ),
      headerClassName: "min-w-50",
      cellClassName: "min-w-50",
    },
    {
      accessorKey: "licenseNumber",
      header: ({ column }) => {
        return (
          <SortableHeader<Doctor> label="License Number" column={column} />
        );
      },
      cell: ({ row }) => (
        <Link
          href={canUpdate ? `/doctors/${row.original.userId}` : "#"}
          className="hover:underline"
        >
          {row.original.licenseNumber || "-"}
        </Link>
      ),
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
        return <SortableHeader<Doctor> label="Created at" column={column} />;
      },
      cell: ({ row }) => {
        return (
          <div className="flex">
            {row.original.user.createdAt &&
              format(row.original.user.createdAt, "MMM dd, yyyy")}
          </div>
        );
      },
      headerClassName: "min-w-40 max-w-50",
      cellClassName: "min-w-40 max-w-50",
    },
    {
      accessorKey: "updatedAt",
      header: ({ column }) => {
        return <SortableHeader<Doctor> label="Updated at" column={column} />;
      },
      cell: ({ row }) => {
        return (
          <div className="flex">
            {row.original.user.updatedAt &&
              format(row.original.user.updatedAt, "MMM dd, yyyy")}
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
      title="Doctors"
      buttons={<Buttons canCreate={Boolean(canCreate)} />}
    >
      {canView && (
        <>
          <CustomFilters<DoctorFilterValues>
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
          />
        </>
      )}
    </CustomLayout>
  );
};

export default Doctors;
