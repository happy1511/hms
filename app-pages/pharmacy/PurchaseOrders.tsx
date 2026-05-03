"use client";

import CustomActionDropdown, {
  DropdownItem,
} from "@/components/common/CustomActionDropdown";
import { CustomAlert } from "@/components/common/CustomAlert";
import CustomButton from "@/components/common/CustomButton";
import CustomFilters from "@/components/common/CustomFilters";
import CustomLayout from "@/components/common/CustomLayout";
import { CustomTable } from "@/components/common/CustomTable";
import NoPermission from "@/components/common/NoPermission";
import { SortableHeader } from "@/components/common/SortableHeader";
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
import { useRouter } from "next/navigation";
import { useState } from "react";

type PurchaseOrderRow = PurchaseOrderGetPayload<{
  include: {
    supplier: true;
    items: { include: { category: true; drug: true } };
  };
}>;

const neededFilters: FilterConfig<FilterValues>[] = [
  { label: "Search", valueKey: "name", type: "text" },
  { label: "Created Date", valueKey: "createdAt", type: "dateRange" },
];

const money = (value: number) => Number(value || 0).toFixed(2);

const Buttons = ({ canCreate }: { canCreate: boolean }) => {
  const router = useRouter();

  if (!canCreate) {
    return null;
  }

  return (
    <CustomButton onClick={() => router.push("/pharmacy/form/purchase-order/new")}>
      New PO
    </CustomButton>
  );
};

const Actions = ({
  data,
  canUpdate,
  canDelete,
}: {
  data: PurchaseOrderRow;
  canUpdate: boolean;
  canDelete: boolean;
}) => {
  const router = useRouter();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const { mutateAsync: deleteOrder, isPending: deleting } =
    useDeletePurchaseOrder();
  const actions: DropdownItem[] = [];

  actions.push({
    label: "Edit",
    onClick: () => router.push(`/pharmacy/form/purchase-order/${data.id}`),
    disabled: !canUpdate,
  });

  if (data.grnId) {
    actions.push({
      label: "Open GRN",
      onClick: () => router.push(`/pharmacy/form/grn/${data.id}`),
    });
  }

  if (canDelete) {
    actions.push({
      label: "Delete",
      onClick: () => setDeleteOpen(true),
    });
  }

  return (
    <>
      <CustomActionDropdown
        triggerLabel="Actions"
        groups={[{ items: actions }]}
      />
      <CustomAlert
        triggerButton={<div />}
        title="Delete purchase order?"
        description="This purchase order will be marked deleted and removed from the active list."
        cancelText="Cancel"
        confirmText="Delete"
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        pending={deleting}
        handleConfirm={() => deleteOrder({ orderId: data.id })}
      />
    </>
  );
};

const PurchaseOrders = () => {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [filters, setFilters] = useState<FilterValues>({});
  const { data: profile } = useProfile(false);
  const { data, isLoading, isFetching, refetch, isError, error } =
    usePurchaseOrderList(
    filters,
    page,
    limit,
  );

  if (!profile) {
    return <div />;
  }

  const canView = hasActionPermission(
    profile.data,
    ModuleType.PHARMACY_PURCHASE_ORDER,
    ActionType.VIEW,
  );
  const canCreate = hasActionPermission(
    profile.data,
    ModuleType.PHARMACY_PURCHASE_ORDER,
    ActionType.CREATE,
  );
  const canUpdate = hasActionPermission(
    profile.data,
    ModuleType.PHARMACY_PURCHASE_ORDER,
    ActionType.UPDATE,
  );
  const canDelete = hasActionPermission(
    profile.data,
    ModuleType.PHARMACY_PURCHASE_ORDER,
    ActionType.DELETE,
  );

  const columns: ColumnDefWithClass<PurchaseOrderRow>[] = [
    {
      accessorKey: "id",
      header: ({ column }) => (
        <SortableHeader<PurchaseOrderRow> label="ID" column={column} />
      ),
      cell: ({ row }) => row.original.id,
      headerClassName: "min-w-16",
      cellClassName: "min-w-16",
    },
    {
      id: "supplier",
      header: ({ column }) => (
        <SortableHeader<PurchaseOrderRow> label="Supplier" column={column} />
      ),
      cell: ({ row }) => row.original.supplier.name || "-",
      headerClassName: "min-w-40",
      cellClassName: "min-w-40",
    },
    {
      id: "poNumber",
      header: ({ column }) => (
        <SortableHeader<PurchaseOrderRow> label="PO Number" column={column} />
      ),
      cell: ({ row }) => row.original.id,
      headerClassName: "min-w-20",
      cellClassName: "min-w-20",
    },
    {
      accessorKey: "orderDate",
      header: ({ column }) => (
        <SortableHeader<PurchaseOrderRow> label="PO Date" column={column} />
      ),
      cell: ({ row }) => format(row.original.orderDate, "MMM dd, yyyy"),
      headerClassName: "min-w-28",
      cellClassName: "min-w-28",
    },
    {
      id: "itemsCount",
      header: ({ column }) => (
        <SortableHeader<PurchaseOrderRow>
          label="Items (count)"
          column={column}
        />
      ),
      cell: ({ row }) => row.original.items.length,
      headerClassName: "min-w-22",
      cellClassName: "min-w-22",
    },
    {
      accessorKey: "taxableAmount",
      header: ({ column }) => (
        <SortableHeader<PurchaseOrderRow>
          label="Taxable Amount"
          column={column}
        />
      ),
      cell: ({ row }) => money(row.original.taxableAmount),
      headerClassName: "min-w-28",
      cellClassName: "min-w-28",
    },
    {
      accessorKey: "packingForwarding",
      header: ({ column }) => (
        <SortableHeader<PurchaseOrderRow> label="P&F" column={column} />
      ),
      cell: ({ row }) => money(row.original.packingForwarding),
      headerClassName: "min-w-20",
      cellClassName: "min-w-20",
    },
    {
      accessorKey: "cGstAmount",
      header: ({ column }) => (
        <SortableHeader<PurchaseOrderRow> label="CGST" column={column} />
      ),
      cell: ({ row }) => money(row.original.cGstAmount),
      headerClassName: "min-w-20",
      cellClassName: "min-w-20",
    },
    {
      accessorKey: "sGstAmount",
      header: ({ column }) => (
        <SortableHeader<PurchaseOrderRow> label="SGST" column={column} />
      ),
      cell: ({ row }) => money(row.original.sGstAmount),
      headerClassName: "min-w-20",
      cellClassName: "min-w-20",
    },
    {
      accessorKey: "iGstAmount",
      header: ({ column }) => (
        <SortableHeader<PurchaseOrderRow> label="IGST" column={column} />
      ),
      cell: ({ row }) => money(row.original.iGstAmount),
      headerClassName: "min-w-20",
      cellClassName: "min-w-20",
    },
    {
      accessorKey: "tcsAmount",
      header: ({ column }) => (
        <SortableHeader<PurchaseOrderRow> label="TCS" column={column} />
      ),
      cell: ({ row }) => money(row.original.tcsAmount),
      headerClassName: "min-w-20",
      cellClassName: "min-w-20",
    },
    {
      accessorKey: "discountAmount",
      header: ({ column }) => (
        <SortableHeader<PurchaseOrderRow> label="Discount" column={column} />
      ),
      cell: ({ row }) => money(row.original.discountAmount),
      headerClassName: "min-w-22",
      cellClassName: "min-w-22",
    },
    {
      accessorKey: "grandTotal",
      header: ({ column }) => (
        <SortableHeader<PurchaseOrderRow> label="Total" column={column} />
      ),
      cell: ({ row }) => money(row.original.grandTotal),
      headerClassName: "min-w-24",
      cellClassName: "min-w-24",
    },
    {
      id: "linkedGrn",
      header: ({ column }) => (
        <SortableHeader<PurchaseOrderRow>
          label="Linked GRN No"
          column={column}
        />
      ),
      cell: ({ row }) => row.original.grnId || "-",
      headerClassName: "min-w-24",
      cellClassName: "min-w-24",
    },
    {
      id: "actions",
      header: () => <span>Actions</span>,
      cell: ({ row }) => (
        <Actions
          data={row.original}
          canUpdate={Boolean(canUpdate)}
          canDelete={Boolean(canDelete)}
        />
      ),
      headerClassName: "min-w-24",
      cellClassName: "min-w-24",
    },
  ];

  return (
    <CustomLayout
      title="Purchase Orders"
      buttons={<Buttons canCreate={Boolean(canCreate)} />}
    >
      {canView ? (
        <>
          <CustomFilters<FilterValues>
            filters={neededFilters}
            onSubmit={setFilters}
            onRefresh={refetch}
            isLoading={isLoading || isFetching}
            isRefreshing={isFetching}
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

export default PurchaseOrders;
