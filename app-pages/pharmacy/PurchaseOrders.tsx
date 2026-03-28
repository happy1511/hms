"use client";
import CustomActionDropdown, {
  DropdownItem,
} from "@/components/common/CustomActionDropdown";
import { CustomAlert } from "@/components/common/CustomAlert";
import CustomButton from "@/components/common/CustomButton";
import CustomFilters from "@/components/common/CustomFilters";
import CustomLayout from "@/components/common/CustomLayout";
import { CustomTable } from "@/components/common/CustomTable";
import { DataViewModal } from "@/components/common/DataViewModal";
import NoPermission from "@/components/common/NoPermission";
import { SortableHeader } from "@/components/common/SortableHeader";
import StatusBadge from "@/components/common/StatusBadge";
import { ActionType, ModuleType } from "@/generated/prisma/enums";
import { PurchaseOrderGetPayload } from "@/generated/prisma/models";
import { useProfile } from "@/hooks/query/auth";
import {
  useDeletePurchaseOrder,
  usePurchaseOrderList,
} from "@/hooks/query/pharmacyPurchaseOrder";
import { ColumnDefWithClass, FilterConfig, FilterValues } from "@/lib/type";
import { hasActionPermission } from "@/lib/utils";
import { format } from "date-fns";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

const Buttons = ({ canCreate }: { canCreate: boolean }) => {
  const router = useRouter();
  return (
    <>
      {canCreate && (
        <CustomButton
          onClick={() => router.push("/pharmacy/purchase-order/new")}
        >
          New PO
        </CustomButton>
      )}
    </>
  );
};

const neededFilters: FilterConfig<FilterValues>[] = [
  { label: "Created Date", valueKey: "createdAt", type: "dateRange" },
];

const Actions = ({
  data,
  canDelete,
  canEdit,
  canView,
  canCreateGrn,
}: {
  data: PurchaseOrderGetPayload<{
    include: {
      supplier: true;
      items: { include: { category: true; drug: true } };
    };
  }>;
  canEdit: boolean;
  canDelete: boolean;
  canView: boolean;
  canCreateGrn: boolean;
}) => {
  const [deleteModal, setDeleteModal] = useState(false);
  const [detailsModal, setDetailsModal] = useState(false);
  const { mutateAsync: deleteOrder, isPending: deletePending } =
    useDeletePurchaseOrder();
  const router = useRouter();
  const actions: DropdownItem[] = [];

  if (canView) {
    actions.push({
      label: "View PO",
      onClick: () => setDetailsModal(true),
    });
  }

  if (canCreateGrn && !data.grnId) {
    actions.push({
      label: "Create GRN",
      onClick: () => {
        console.log("object");
        router.push(`/pharmacy/grn/${data.id}`);
      },
    });
  }

  if (canEdit) {
    actions.push({
      label: "Edit PO",
      onClick: () => router.push(`/pharmacy/purchase-order/${data.id}`),
    });
  }

  if (canDelete) {
    actions.push({
      label: "Delete PO",
      onClick: () => setDeleteModal(true),
    });
  }

  return (
    <>
      <CustomActionDropdown
        triggerLabel="Actions"
        groups={[
          {
            items: actions,
            label: "PO",
          },
        ]}
      />

      {canView && (
        <DataViewModal<
          PurchaseOrderGetPayload<{
            include: {
              supplier: true;
              items: { include: { category: true; drug: true } };
            };
          }>
        >
          data={data}
          title="PO Details"
          open={detailsModal}
          onOpenChange={setDetailsModal}
          trigger={<div />}
          fields={[
            { key: "id", label: "typeId" },
            { key: "status", label: "Status" },
            { key: "orderDate", label: "Ordered At" },
            { key: "createdAt", label: "Created At" },
            { key: "updatedAt", label: "Updated At" },
          ]}
        />
      )}

      {canDelete && (
        <CustomAlert
          triggerButton={<div />}
          title="Delete PO?"
          description="Are you sure you want to delete PO?"
          cancelText="Cancel"
          confirmText="Delete"
          handleConfirm={() => deleteOrder({ orderId: Number(data.id) })}
          pending={deletePending}
          open={deleteModal}
          onOpenChange={setDeleteModal}
        />
      )}
    </>
  );
};

const PurchaseOrders = () => {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [filters, setFilters] = useState<FilterValues>({});

  const { data: profile } = useProfile(false);
  const { data, isLoading, isError, error } = usePurchaseOrderList(
    filters,
    page,
    limit,
  );

  if (!profile) {
    return <div />;
  }

  const canView = hasActionPermission(
    profile?.data,
    ModuleType.PHARMACY_PURCHASE_ORDER,
    ActionType.VIEW,
  );
  const canCreateGrn = hasActionPermission(
    profile?.data,
    ModuleType.PHARMACY_GRN,
    ActionType.CREATE,
  );
  const canCreate = hasActionPermission(
    profile?.data,
    ModuleType.PHARMACY_PURCHASE_ORDER,
    ActionType.CREATE,
  );
  const canUpdate = hasActionPermission(
    profile?.data,
    ModuleType.PHARMACY_PURCHASE_ORDER,
    ActionType.UPDATE,
  );
  const canDelete = hasActionPermission(
    profile?.data,
    ModuleType.PHARMACY_PURCHASE_ORDER,
    ActionType.DELETE,
  );

  const columns: ColumnDefWithClass<
    PurchaseOrderGetPayload<{
      include: {
        supplier: true;
        items: { include: { category: true; drug: true } };
      };
    }>
  >[] = [
    {
      accessorKey: "id",
      header: ({ column }) => {
        return (
          <SortableHeader<
            PurchaseOrderGetPayload<{
              include: {
                supplier: true;
                items: { include: { category: true; drug: true } };
              };
            }>
          >
            label="ID"
            column={column}
          />
        );
      },
      cell: ({ row }) => <span>#{row.index + 1}</span>,
      headerClassName: "min-w-15 max-w-20",
      cellClassName: "min-w-15 max-w-20",
    },
    {
      accessorKey: "supplierName",
      header: ({ column }) => {
        return (
          <SortableHeader<
            PurchaseOrderGetPayload<{
              include: {
                supplier: true;
                items: { include: { category: true; drug: true } };
              };
            }>
          >
            label="Supplier Name"
            column={column}
          />
        );
      },
      cell: ({ row }) => (
        <Link
          href={canUpdate ? `/pharmacy/purchase-order/${row.original.id}` : "#"}
          className="hover:underline"
        >
          {row.original.supplier.name || "-"}
        </Link>
      ),
      headerClassName: "min-w-50",
      cellClassName: "min-w-50",
    },
    {
      accessorKey: "grn",
      header: ({ column }) => {
        return (
          <SortableHeader<
            PurchaseOrderGetPayload<{
              include: {
                supplier: true;
                items: { include: { category: true; drug: true } };
              };
            }>
          >
            label="Linked GRN"
            column={column}
          />
        );
      },
      cell: ({ row }) => row.original.grnId || "-",
      headerClassName: "min-w-50",
      cellClassName: "min-w-50",
    },
    {
      accessorKey: "items",
      header: ({ column }) => {
        return (
          <SortableHeader<
            PurchaseOrderGetPayload<{
              include: {
                supplier: true;
                items: { include: { category: true; drug: true } };
              };
            }>
          >
            label="Items"
            column={column}
          />
        );
      },
      cell: ({ row }) => row.original.items.length,
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
      accessorKey: "orderDate",
      header: () => {
        return <button className="flex">Order Date</button>;
      },
      cell: ({ row }) => {
        return (
          <div className="flex">
            {row.original.createdAt &&
              format(row.original.createdAt, "MMM dd, yyyy")}
          </div>
        );
      },
      headerClassName: "min-w-20 max-w-30",
      cellClassName: "min-w-20 max-w-30",
    },
    {
      accessorKey: "createdAt",
      header: ({ column }) => {
        return (
          <SortableHeader<
            PurchaseOrderGetPayload<{
              include: {
                supplier: true;
                items: { include: { category: true; drug: true } };
              };
            }>
          >
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
          <SortableHeader<
            PurchaseOrderGetPayload<{
              include: {
                supplier: true;
                items: { include: { category: true; drug: true } };
              };
            }>
          >
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
          canCreateGrn={Boolean(canCreateGrn)}
        />
      ),
      headerClassName: "min-w-20 max-w-30",
      cellClassName: "min-w-20 max-w-30",
    },
  ];

  return (
    <CustomLayout
      title="Purchase Orders"
      buttons={<Buttons canCreate={Boolean(canCreate)} />}
    >
      {canView && (
        <>
          <CustomFilters<FilterValues>
            filters={neededFilters}
            onSubmit={setFilters}
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
            getRowId={(data) => String(data.id)}
            isError={isError}
            error={error}
          />
        </>
      )}
      {!canView && <NoPermission />}
    </CustomLayout>
  );
};

export default PurchaseOrders;
