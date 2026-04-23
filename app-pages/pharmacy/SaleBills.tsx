"use client";

import CustomActionDropdown, {
  DropdownItem,
} from "@/components/common/CustomActionDropdown";
import CustomButton from "@/components/common/CustomButton";
import CustomFilters from "@/components/common/CustomFilters";
import CustomLayout from "@/components/common/CustomLayout";
import { CustomTable } from "@/components/common/CustomTable";
import NoPermission from "@/components/common/NoPermission";
import { SortableHeader } from "@/components/common/SortableHeader";
import ViewSaleInvoiceModal from "@/components/pharmacy/ViewSaleInvoiceModal";
import { ActionType, ModuleType } from "@/generated/prisma/enums";
import { useProfile } from "@/hooks/query/auth";
import { useSaleBillList } from "@/hooks/query/pharmacySaleBill";
import {
  ColumnDefWithClass,
  FilterConfig,
  FilterValues,
  PharmacySaleBillType,
} from "@/lib/type";
import { hasActionPermission } from "@/lib/utils";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import { useState } from "react";

type SaleBillData = PharmacySaleBillType;

const neededFilters: FilterConfig<FilterValues>[] = [
  { label: "Search", valueKey: "name", type: "text" },
  { label: "Created Date", valueKey: "createdAt", type: "dateRange" },
];

const Buttons = ({ canCreate }: { canCreate: boolean }) => {
  const router = useRouter();
  return (
    <>
      {canCreate && (
        <CustomButton onClick={() => router.push("/pharmacy/sale-bill/new")}>
          New Sale Bill
        </CustomButton>
      )}
    </>
  );
};

const Actions = ({
  data,
  canUpdate,
  canPrint,
}: {
  data: SaleBillData;
  canUpdate: boolean;
  canPrint: boolean;
}) => {
  const [viewInvoiceModal, setViewInvoiceModal] = useState(false);
  const router = useRouter();
  const actions: DropdownItem[] = [];

  if (canUpdate) {
    actions.push({
      label: "Edit",
      onClick: () => router.push(`/pharmacy/sale-bill/${data.id}`),
    });
  }

  if (canPrint) {
    actions.push({ label: "Print", onClick: () => setViewInvoiceModal(true) });
  }

  return (
    <>
      <CustomActionDropdown
        triggerLabel="Actions"
        groups={[
          {
            label: "Sale Bill",
            items: actions,
          },
        ]}
      />
      <ViewSaleInvoiceModal
        billId={data.id}
        open={viewInvoiceModal}
        onOpenChange={setViewInvoiceModal}
        trigger={<div />}
      />
    </>
  );
};

const SaleBills = () => {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [filters, setFilters] = useState<FilterValues>({});

  const { data: profile } = useProfile(false);
  const { data, isLoading, isFetching, refetch, isError, error } =
    useSaleBillList(
    filters,
    page,
    limit,
  );

  if (!profile) {
    return <div />;
  }

  const canView = hasActionPermission(
    profile?.data,
    ModuleType.PHARMACY_SALE_BILL,
    ActionType.VIEW,
  );
  const canCreate = hasActionPermission(
    profile?.data,
    ModuleType.PHARMACY_SALE_BILL,
    ActionType.CREATE,
  );
  const canUpdate = hasActionPermission(
    profile?.data,
    ModuleType.PHARMACY_SALE_BILL,
    ActionType.UPDATE,
  );
  const canPrint = hasActionPermission(
    profile?.data,
    ModuleType.PHARMACY_SALE_BILL,
    ActionType.PRINT,
  );

  const columns: ColumnDefWithClass<SaleBillData>[] = [
    {
      accessorKey: "id",
      header: ({ column }) => (
        <SortableHeader<SaleBillData> label="ID" column={column} />
      ),
      cell: ({ row }) => <span>#{row.original.id}</span>,
      headerClassName: "min-w-15 max-w-20",
      cellClassName: "min-w-15 max-w-20",
    },
    {
      accessorKey: "name",
      header: ({ column }) => (
        <SortableHeader<SaleBillData> label="Customer" column={column} />
      ),
      cell: ({ row }) => row.original.customer?.name ?? row.original.name,
      headerClassName: "min-w-40",
      cellClassName: "min-w-40",
    },
    {
      accessorKey: "patient",
      header: ({ column }) => (
        <SortableHeader<SaleBillData> label="Patient" column={column} />
      ),
      cell: ({ row }) =>
        row.original.patient
          ? `${row.original.patient.firstName} ${row.original.patient.lastName}`
          : "-",
      headerClassName: "min-w-40",
      cellClassName: "min-w-40",
    },
    {
      accessorKey: "doctor",
      header: ({ column }) => (
        <SortableHeader<SaleBillData> label="Doctor" column={column} />
      ),
      cell: ({ row }) => row.original.doctor?.user?.name ?? "-",
      headerClassName: "min-w-40",
      cellClassName: "min-w-40",
    },
    {
      accessorKey: "isWholesaleBill",
      header: ({ column }) => (
        <SortableHeader<SaleBillData> label="Wholesale" column={column} />
      ),
      cell: ({ row }) => (row.original.isWholesaleBill ? "Yes" : "No"),
      headerClassName: "min-w-20 max-w-30",
      cellClassName: "min-w-20 max-w-30",
    },
    {
      accessorKey: "isLooseBill",
      header: ({ column }) => (
        <SortableHeader<SaleBillData> label="Loose" column={column} />
      ),
      cell: ({ row }) => (row.original.isLooseBill ? "Yes" : "No"),
      headerClassName: "min-w-20 max-w-30",
      cellClassName: "min-w-20 max-w-30",
    },
    {
      accessorKey: "items",
      header: ({ column }) => (
        <SortableHeader<SaleBillData> label="Items" column={column} />
      ),
      cell: ({ row }) => row.original.saleItems.length,
      headerClassName: "min-w-20 max-w-30",
      cellClassName: "min-w-20 max-w-30",
    },
    {
      accessorKey: "amount",
      header: ({ column }) => (
        <SortableHeader<SaleBillData> label="Total" column={column} />
      ),
      cell: ({ row }) => row.original.invoice.total,
      headerClassName: "min-w-20 max-w-30",
      cellClassName: "min-w-20 max-w-30",
    },
    {
      accessorKey: "createdAt",
      header: ({ column }) => (
        <SortableHeader<SaleBillData> label="Created At" column={column} />
      ),
      cell: ({ row }) =>
        row.original.invoice.createdAt
          ? format(row.original.invoice.createdAt, "MMM dd, yyyy")
          : "-",
      headerClassName: "min-w-30 max-w-40",
      cellClassName: "min-w-30 max-w-40",
    },
    {
      id: "actions",
      header: () => <p>Action</p>,
      cell: ({ row }) => (
        <Actions
          data={row.original}
          canUpdate={Boolean(canUpdate)}
          canPrint={Boolean(canPrint)}
        />
      ),
      headerClassName: "min-w-20 max-w-30",
      cellClassName: "min-w-20 max-w-30",
    },
  ];

  return (
    <CustomLayout
      title="Pharmacy Sale Bills"
      buttons={<Buttons canCreate={Boolean(canCreate)} />}
    >
      {canView && (
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
      )}
      {!canView && <NoPermission />}
    </CustomLayout>
  );
};

export default SaleBills;
