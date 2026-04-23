"use client";
import CustomActionDropdown, {
  DropdownItem,
} from "@/components/common/CustomActionDropdown";
import CustomFilters from "@/components/common/CustomFilters";
import CustomLayout from "@/components/common/CustomLayout";
import { CustomTable } from "@/components/common/CustomTable";
import NoPermission from "@/components/common/NoPermission";
import { SortableHeader } from "@/components/common/SortableHeader";
import CustomButton from "@/components/common/CustomButton";
import ViewGrnModal from "@/components/pharmacy/ViewGrnModal";
import { ActionType, ModuleType } from "@/generated/prisma/enums";
import { useProfile } from "@/hooks/query/auth";
import { useGrnList } from "@/hooks/query/pharmacyGrn";
import {
  ColumnDefWithClass,
  FilterConfig,
  FilterValues,
  PharmacyGrnType,
} from "@/lib/type";
import { hasActionPermission } from "@/lib/utils";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import { useState } from "react";

type GrnListRow = PharmacyGrnType;

const neededFilters: FilterConfig<FilterValues>[] = [
  { label: "Created Date", valueKey: "createdAt", type: "dateRange" },
];

const Buttons = ({ canCreate }: { canCreate: boolean }) => {
  const router = useRouter();
  return (
    <>
      {canCreate && (
        <div className="flex flex-wrap gap-2">
          <CustomButton onClick={() => router.push("/pharmacy/grn/create-via-po")}>
            Create GRN via PO
          </CustomButton>
          <CustomButton
            onClick={() => router.push("/pharmacy/grn/create-via-challan")}
          >
            Create GRN via Challan
          </CustomButton>
          <CustomButton onClick={() => router.push("/pharmacy/grn/new")}>
            New GRN
          </CustomButton>
        </div>
      )}
    </>
  );
};

const Actions = ({ data }: { data: GrnListRow }) => {
  const [viewGrnOpen, setViewGrnOpen] = useState(false);
  const router = useRouter();

  const items: DropdownItem[] = [
    {
      label: "View",
      onClick: () => setViewGrnOpen(true),
    },
    {
      label: "Print",
      onClick: () => router.push(`/pharmacy/grn/print/${data.id}`),
    },
  ];

  return (
    <>
      <CustomActionDropdown
        triggerLabel="Actions"
        groups={[
          {
            items,
          },
        ]}
      />
      <ViewGrnModal
        grnId={data.id}
        open={viewGrnOpen}
        onOpenChange={setViewGrnOpen}
        trigger={<div />}
      />
    </>
  );
};

const Grns = () => {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [filters, setFilters] = useState<FilterValues>({});

  const { data: profile } = useProfile(false);
  const { data, isLoading, isFetching, refetch, isError, error } = useGrnList(
    filters,
    page,
    limit,
  );

  if (!profile) {
    return <div />;
  }

  const canView = hasActionPermission(
    profile?.data,
    ModuleType.PHARMACY_GRN,
    ActionType.VIEW,
  );
  const canCreate = hasActionPermission(
    profile?.data,
    ModuleType.PHARMACY_GRN,
    ActionType.CREATE,
  );

  const columns: ColumnDefWithClass<GrnListRow>[] = [
    {
      id: "serial",
      header: ({ column }) => {
        return (
          <SortableHeader<GrnListRow> label="No." column={column} />
        );
      },
      cell: ({ row }) => <span>#{row.index + 1}</span>,
      headerClassName: "min-w-16",
      cellClassName: "min-w-16",
    },
    {
      accessorKey: "supplierName",
      header: ({ column }) => {
        return <SortableHeader<GrnListRow> label="Supplier" column={column} />;
      },
      cell: ({ row }) =>
        row.original.order?.supplier?.name ||
        row.original.challan?.supplier?.name ||
        "-",
      headerClassName: "min-w-40",
      cellClassName: "min-w-40",
    },
    {
      accessorKey: "invoiceNumber",
      header: ({ column }) => {
        return (
          <SortableHeader<GrnListRow> label="Invoice No." column={column} />
        );
      },
      cell: ({ row }) => row.original.invoiceNumber,
      headerClassName: "min-w-28",
      cellClassName: "min-w-28",
    },
    {
      accessorKey: "invoiceDate",
      header: ({ column }) => (
        <SortableHeader<any> label="Invoice Date" column={column} />
      ),
      cell: ({ row }) => format(row.original.invoiceDate, "MMM dd, yyyy"),
      headerClassName: "min-w-28",
      cellClassName: "min-w-28",
    },
    {
      id: "totalItems",
      header: ({ column }) => (
        <SortableHeader<any> label="Total Items" column={column} />
      ),
      cell: ({ row }) => row.original.grnItems.length,
      headerClassName: "min-w-22",
      cellClassName: "min-w-22",
    },
    {
      accessorKey: "taxableAmount",
      header: ({ column }) => (
        <SortableHeader<any> label="Taxable Amt." column={column} />
      ),
      cell: ({ row }) => Number(row.original.taxableAmount || 0).toFixed(2),
      headerClassName: "min-w-28",
      cellClassName: "min-w-28",
    },
    {
      accessorKey: "discountAmount",
      header: ({ column }) => (
        <SortableHeader<any> label="Discount" column={column} />
      ),
      cell: ({ row }) => Number(row.original.discountAmount || 0).toFixed(2),
      headerClassName: "min-w-22",
      cellClassName: "min-w-22",
    },
    {
      accessorKey: "cGstAmount",
      header: ({ column }) => <SortableHeader<any> label="CGST" column={column} />,
      cell: ({ row }) => Number(row.original.cGstAmount || 0).toFixed(2),
      headerClassName: "min-w-22",
      cellClassName: "min-w-22",
    },
    {
      accessorKey: "sGstAmount",
      header: ({ column }) => <SortableHeader<any> label="SGST" column={column} />,
      cell: ({ row }) => Number(row.original.sGstAmount || 0).toFixed(2),
      headerClassName: "min-w-22",
      cellClassName: "min-w-22",
    },
    {
      accessorKey: "iGstAmount",
      header: ({ column }) => <SortableHeader<any> label="IGST" column={column} />,
      cell: ({ row }) => Number(row.original.iGstAmount || 0).toFixed(2),
      headerClassName: "min-w-22",
      cellClassName: "min-w-22",
    },
    {
      accessorKey: "tcsAmount",
      header: ({ column }) => <SortableHeader<any> label="TCS" column={column} />,
      cell: ({ row }) => Number(row.original.tcsAmount || 0).toFixed(2),
      headerClassName: "min-w-20",
      cellClassName: "min-w-20",
    },
    {
      accessorKey: "packingForwarding",
      header: ({ column }) => <SortableHeader<any> label="P&F" column={column} />,
      cell: ({ row }) =>
        Number(row.original.packingForwarding || 0).toFixed(2),
      headerClassName: "min-w-20",
      cellClassName: "min-w-20",
    },
    {
      accessorKey: "roundOffAmount",
      header: ({ column }) => (
        <SortableHeader<any> label="Round Off" column={column} />
      ),
      cell: ({ row }) => Number(row.original.roundOffAmount || 0).toFixed(2),
      headerClassName: "min-w-24",
      cellClassName: "min-w-24",
    },
    {
      accessorKey: "grandTotal",
      header: ({ column }) => (
        <SortableHeader<any> label="Total Amount" column={column} />
      ),
      cell: ({ row }) => Number(row.original.grandTotal || 0).toFixed(2),
      headerClassName: "min-w-26",
      cellClassName: "min-w-26",
    },
    {
      accessorKey: "id",
      header: ({ column }) => <SortableHeader<any> label="GRN No" column={column} />,
      cell: ({ row }) => row.original.id,
      headerClassName: "min-w-20",
      cellClassName: "min-w-20",
    },
    {
      id: "linkedPo",
      header: ({ column }) => (
        <SortableHeader<any> label="Linked Source" column={column} />
      ),
      cell: ({ row }) => row.original.order?.id || row.original.challan?.id || "-",
      headerClassName: "min-w-22",
      cellClassName: "min-w-22",
    },
    {
      id: "actions",
      header: () => <p>Action</p>,
      cell: ({ row }) => <Actions data={row.original} />,
      headerClassName: "min-w-24",
      cellClassName: "min-w-24",
    },
  ];

  return (
    <CustomLayout
      title="GRNs"
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

export default Grns;
