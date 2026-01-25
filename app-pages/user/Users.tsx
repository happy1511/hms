"use client";
import { CustomAlert } from "@/components/common/CustomAlert";
import CustomButton from "@/components/common/CustomButton";
import CustomFilters from "@/components/common/CustomFilters";
import CustomLayout from "@/components/common/CustomLayout";
import { CustomTable } from "@/components/common/CustomTable";
import { SortableHeader } from "@/components/common/SortableHeader";
import { Button } from "@/components/ui/button";
import { ActionType, ModuleType, Status } from "@/generated/prisma/enums";
import { useProfile } from "@/hooks/query/auth";
import { useDeleteUser, useUsersList } from "@/hooks/query/user";
import {
  ColumnDefWithClass,
  FilterConfig,
  User,
  UserFilterValues,
} from "@/lib/type";
import { hasActionPermission } from "@/lib/utils";
import { format } from "date-fns";
import { Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

const Buttons = ({ canCreate = false }: { canCreate?: boolean }) => {
  const router = useRouter();
  return (
    <>
      {canCreate && (
        <CustomButton onClick={() => router.push("/users/new")}>
          New User
        </CustomButton>
      )}
    </>
  );
};

const neededFilters: FilterConfig<UserFilterValues>[] = [
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

const Users = () => {
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<UserFilterValues>({});

  const { data: profile } = useProfile(false);
  const { data } = useUsersList(filters, page, 10);
  const { mutateAsync: deleteUser, isPending: deletePending } = useDeleteUser(
    filters,
    page,
    10,
  );

  if (!profile) {
    return <></>;
  }

  const canView = hasActionPermission(
    profile?.data,
    ModuleType.USER,
    ActionType.VIEW,
  );

  const canCreate = hasActionPermission(
    profile?.data,
    ModuleType.USER,
    ActionType.CREATE,
  );
  const canUpdate = hasActionPermission(
    profile?.data,
    ModuleType.USER,
    ActionType.UPDATE,
  );
  const canDelete = hasActionPermission(
    profile?.data,
    ModuleType.USER,
    ActionType.DELETE,
  );

  const columns: ColumnDefWithClass<User>[] = [
    {
      accessorKey: "id",
      header: ({ column }) => {
        return <SortableHeader<User> label="ID" column={column} />;
      },
      cell: ({ row }) => <span>#{row.index + 1}</span>,
      headerClassName: "min-w-15 max-w-20",
      cellClassName: "min-w-15 max-w-20",
    },
    {
      accessorKey: "name",
      header: ({ column }) => {
        return <SortableHeader<User> label="User Name" column={column} />;
      },
      cell: ({ row }) => (
        <Link
          href={canUpdate ? `/users/${row.original.id}` : "#"}
          className="hover:underline"
        >
          {row.original.name || "-"}
        </Link>
      ),
      headerClassName: "min-w-50",
      cellClassName: "min-w-50",
    },
    {
      accessorKey: "permissions",
      header: ({ column }) => {
        return (
          <SortableHeader<User> label="Assigned Modules" column={column} />
        );
      },
      cell: ({ row }) => {
        return (
          <div className="flex gap-1 items-center">
            {row.original.permissions.slice(0, 3).map((p, _) => (
              <span
                key={_}
                className="capitalize border border-success bg-success/10 px-2 rounded-sm text-success"
              >
                {p.module.name}
              </span>
            ))}
            <span className="capitalize px-2 rounded-sm text-success">
              +More
            </span>
          </div>
        );
      },
      headerClassName: "min-w-50",
      cellClassName: "min-w-50",
    },
    {
      accessorKey: "status",
      header: () => {
        return <button className="flex">Status</button>;
      },
      cell: ({ row }) =>
        row.original.status === "inactive" ? (
          <span className="capitalize border border-destructive bg-destructive/10 px-2 rounded-sm text-destructive">
            InActive
          </span>
        ) : (
          <span className="capitalize border border-success bg-success/10 px-2 rounded-sm text-success">
            Active
          </span>
        ),
      headerClassName: "min-w-20 max-w-30",
      cellClassName: "min-w-20 max-w-30",
    },
    {
      accessorKey: "createdAt",
      header: ({ column }) => {
        return <SortableHeader<User> label="Created at" column={column} />;
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
        return <SortableHeader<User> label="Updated at" column={column} />;
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
      cell: ({ row }) =>
        canDelete && (
          <CustomAlert
            triggerButton={
              <Button
                variant="outline"
                className="h-auto shadow-none p-1 cursor-pointer"
              >
                <Trash2 className="size-2.5 text-destructive" />
              </Button>
            }
            title="Delete User?"
            description="Are you sure you want to delete user?"
            cancelText="Cancel"
            confirmText="Delete"
            handleConfirm={() => deleteUser({ id: row.original.id })}
            pending={deletePending}
          />
        ),
      headerClassName: "min-w-20 max-w-30",
      cellClassName: "min-w-20 max-w-30",
    },
  ];

  return (
    <CustomLayout title="Users" buttons={<Buttons canCreate={canCreate} />}>
      {canView && (
        <>
          <CustomFilters<UserFilterValues>
            filters={neededFilters}
            onSubmit={setFilters}
          />
          <CustomTable
            columns={columns}
            data={data?.data || []}
            page={page}
            total={data?.total}
            enableSorting
            handleChangePage={setPage}
          />
        </>
      )}
    </CustomLayout>
  );
};

export default Users;
