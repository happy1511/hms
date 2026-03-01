"use client";
import { CustomAlert } from "@/components/common/CustomAlert";
import CustomButton from "@/components/common/CustomButton";
import CustomFilters from "@/components/common/CustomFilters";
import CustomLayout from "@/components/common/CustomLayout";
import { CustomTable } from "@/components/common/CustomTable";
import { DataViewModal } from "@/components/common/DataViewModal";
import { SortableHeader } from "@/components/common/SortableHeader";
import { Button } from "@/components/ui/button";
import { DrugSupplier } from "@/generated/prisma/client";
import { ActionType, ModuleType, Status } from "@/generated/prisma/enums";
import { useProfile } from "@/hooks/query/auth";
import {
  useDeleteDrugSupplier,
  useDrugSupplierList,
} from "@/hooks/query/drugSupplier";
import { ColumnDefWithClass, FilterConfig, FilterValues } from "@/lib/type";
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
        <CustomButton onClick={() => router.push("/drug-supplier/new")}>
          New Supplier
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
  data: DrugSupplier;
  canEdit: boolean;
  canDelete: boolean;
  canView: boolean;
}) => {
  const { mutateAsync: deleteDrugSupplier, isPending: deletePending } =
    useDeleteDrugSupplier();

  return (
    <>
      {canView && (
        <DataViewModal<DrugSupplier>
          data={data}
          title="Room Type Details"
          fields={[
            { key: "id", label: "typeId" },
            { key: "name", label: "Name" },
            { key: "gstIn", label: "GST In" },
            { key: "phone", label: "Phone" },
            { key: "email", label: "Email" },
            { key: "createdAt", label: "Created At" },
            { key: "updatedAt", label: "Updated At" },
          ]}
        />
      )}
      {canEdit && (
        <Link
          className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive border bg-background hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50 has-[>svg]:px-3 h-auto shadow-none p-1 cursor-pointer"
          href={`/drug-supplier/${data.id}`}
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
          title="Delete Supplier?"
          description="Are you sure you want to delete supplier?"
          cancelText="Cancel"
          confirmText="Delete"
          handleConfirm={() =>
            deleteDrugSupplier({ supplierId: Number(data.id) })
          }
          pending={deletePending}
        />
      )}
    </>
  );
};

const DrugSupplierList = () => {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [filters, setFilters] = useState<FilterValues>({});

  const { data: profile } = useProfile(false);
  const { data, isLoading, isError, error } = useDrugSupplierList(
    filters,
    page,
    limit,
  );

  if (!profile) {
    return <div />;
  }

  const canView = hasActionPermission(
    profile?.data,
    ModuleType.PHARMACY_SUPPLIER,
    ActionType.VIEW,
  );
  const canCreate = hasActionPermission(
    profile?.data,
    ModuleType.PHARMACY_SUPPLIER,
    ActionType.CREATE,
  );
  const canUpdate = hasActionPermission(
    profile?.data,
    ModuleType.PHARMACY_SUPPLIER,
    ActionType.UPDATE,
  );
  const canDelete = hasActionPermission(
    profile?.data,
    ModuleType.PHARMACY_SUPPLIER,
    ActionType.DELETE,
  );

  const columns: ColumnDefWithClass<DrugSupplier>[] = [
    {
      accessorKey: "id",
      header: ({ column }) => {
        return <SortableHeader<DrugSupplier> label="ID" column={column} />;
      },
      cell: ({ row }) => <span>#{row.index + 1}</span>,
      headerClassName: "min-w-15 max-w-20",
      cellClassName: "min-w-15 max-w-20",
    },
    {
      accessorKey: "name",
      header: ({ column }) => {
        return <SortableHeader<DrugSupplier> label="Name" column={column} />;
      },
      cell: ({ row }) => (
        <Link
          href={canUpdate ? `/drug-supplier/${row.original.id}` : "#"}
          className="hover:underline"
        >
          {row.original.name || "-"}
        </Link>
      ),
      headerClassName: "min-w-50",
      cellClassName: "min-w-50",
    },

    {
      accessorKey: "phone",
      header: ({ column }) => {
        return (
          <SortableHeader<DrugSupplier> label="Phone Number" column={column} />
        );
      },
      headerClassName: "min-w-40 max-w-50",
      cellClassName: "min-w-40 max-w-50",
    },

    {
      accessorKey: "email",
      header: ({ column }) => {
        return <SortableHeader<DrugSupplier> label="Email" column={column} />;
      },
      headerClassName: "min-w-40 max-w-50",
      cellClassName: "min-w-40 max-w-50",
    },
    {
      accessorKey: "createdAt",
      header: ({ column }) => {
        return (
          <SortableHeader<DrugSupplier> label="Created at" column={column} />
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
          <SortableHeader<DrugSupplier> label="Updated at" column={column} />
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
      title="Drug Category"
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

export default DrugSupplierList;
