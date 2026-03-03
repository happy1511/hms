"use client";
import CustomFilters from "@/components/common/CustomFilters";
import CustomLayout from "@/components/common/CustomLayout";
import { CustomTable } from "@/components/common/CustomTable";
import { SortableHeader } from "@/components/common/SortableHeader";
import CustomButton from "@/components/common/CustomButton";
import { ActionType, ModuleType } from "@/generated/prisma/enums";
import { GRNGetPayload } from "@/generated/prisma/models";
import { useProfile } from "@/hooks/query/auth";
import { useGrnList } from "@/hooks/query/pharmacyGrn";
import { ColumnDefWithClass, FilterConfig, FilterValues } from "@/lib/type";
import { hasActionPermission } from "@/lib/utils";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import { useState } from "react";

const neededFilters: FilterConfig<FilterValues>[] = [
  { label: "Created Date", valueKey: "createdAt", type: "dateRange" },
];

const Buttons = ({ canCreate }: { canCreate: boolean }) => {
  const router = useRouter();
  return (
    <>
      {canCreate && (
        <CustomButton onClick={() => router.push("/pharmacy/grn/new")}>
          New GRN
        </CustomButton>
      )}
    </>
  );
};

const Grns = () => {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [filters, setFilters] = useState<FilterValues>({});

  const { data: profile } = useProfile(false);
  const { data, isLoading, isError, error } = useGrnList(filters, page, limit);

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

  const columns: ColumnDefWithClass<
    GRNGetPayload<{
      include: {
        order: { include: { supplier: true } };
        grnItems: true;
      };
    }>
  >[] = [
    {
      accessorKey: "id",
      header: ({ column }) => {
        return (
          <SortableHeader<
            GRNGetPayload<{
              include: {
                order: { include: { supplier: true } };
                grnItems: true;
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
            GRNGetPayload<{
              include: {
                order: { include: { supplier: true } };
                grnItems: true;
              };
            }>
          >
            label="Supplier Name"
            column={column}
          />
        );
      },
      cell: ({ row }) => row.original.order?.supplier.name,
      headerClassName: "min-w-50",
      cellClassName: "min-w-50",
    },
    {
      accessorKey: "items",
      header: ({ column }) => {
        return (
          <SortableHeader<
            GRNGetPayload<{
              include: {
                order: { include: { supplier: true } };
                grnItems: true;
              };
            }>
          >
            label="Items"
            column={column}
          />
        );
      },
      cell: ({ row }) => row.original.grnItems.length,
      headerClassName: "min-w-50",
      cellClassName: "min-w-50",
    },

    {
      accessorKey: "orderId",
      header: () => {
        return <button className="flex">Order Id</button>;
      },
      cell: ({ row }) => {
        return <div className="flex">{row.original.order?.id}</div>;
      },
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
            {row.original.order?.orderDate &&
              format(row.original.order?.orderDate, "MMM dd, yyyy")}
          </div>
        );
      },
      headerClassName: "min-w-20 max-w-30",
      cellClassName: "min-w-20 max-w-30",
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

export default Grns;
