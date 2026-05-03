"use client";

import CustomButton from "@/components/common/CustomButton";
import CustomFilters from "@/components/common/CustomFilters";
import CustomLayout from "@/components/common/CustomLayout";
import { CustomTable } from "@/components/common/CustomTable";
import NoPermission from "@/components/common/NoPermission";
import { SortableHeader } from "@/components/common/SortableHeader";
import { ActionType, ModuleType } from "@/generated/prisma/enums";
import { useProfile } from "@/hooks/query/auth";
import { useIpdIssueList } from "@/hooks/query/pharmacyIpdBill";
import {
  ColumnDefWithClass,
  FilterConfig,
  FilterValues,
  PharmacyIpdIssueType,
} from "@/lib/type";
import { hasActionPermission } from "@/lib/utils";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import { useState } from "react";

const PHARMACY_IPD_ISSUE_MODULE = "PHARMACY_IPD_ISSUE" as ModuleType;

const filtersConfig: FilterConfig<FilterValues>[] = [
  { label: "Search", valueKey: "name", type: "text" },
  { label: "Date Range", valueKey: "createdAt", type: "dateRange" },
];

const money = (value: number) => Number(value || 0).toFixed(2);
const patientName = (row: PharmacyIpdIssueType) =>
  [row.ipd.patient.firstName, row.ipd.patient.middleName, row.ipd.patient.lastName]
    .filter(Boolean)
    .join(" ");

const IpdIssues = () => {
  const router = useRouter();
  const { data: profile } = useProfile(false);
  const [filters, setFilters] = useState<FilterValues>({});
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const { data, isLoading, isError, error, refetch, isFetching } = useIpdIssueList(
    filters,
    page,
    limit,
  );

  if (!profile) return <div />;

  const canView = hasActionPermission(
    profile.data,
    PHARMACY_IPD_ISSUE_MODULE,
    ActionType.VIEW,
  );
  const canCreate = hasActionPermission(
    profile.data,
    PHARMACY_IPD_ISSUE_MODULE,
    ActionType.CREATE,
  );

  if (!canView) {
    return (
      <CustomLayout title="IPD Issues">
        <NoPermission />
      </CustomLayout>
    );
  }

  const columns: ColumnDefWithClass<PharmacyIpdIssueType>[] = [
    {
      accessorKey: "id",
      header: ({ column }) => (
        <SortableHeader<PharmacyIpdIssueType> label="Order" column={column} />
      ),
      cell: ({ row }) => `ISS-${row.original.id}`,
      headerClassName: "min-w-24",
      cellClassName: "min-w-24",
    },
    {
      accessorKey: "createdAt",
      header: ({ column }) => (
        <SortableHeader<PharmacyIpdIssueType> label="Date" column={column} />
      ),
      cell: ({ row }) => format(new Date(row.original.createdAt), "dd/MM/yyyy"),
      headerClassName: "min-w-24",
      cellClassName: "min-w-24",
    },
    {
      id: "patient",
      header: ({ column }) => (
        <SortableHeader<PharmacyIpdIssueType> label="Patient" column={column} />
      ),
      cell: ({ row }) => patientName(row.original),
      headerClassName: "min-w-48",
      cellClassName: "min-w-48",
    },
    {
      accessorKey: "ipdId",
      header: ({ column }) => (
        <SortableHeader<PharmacyIpdIssueType> label="IPD No." column={column} />
      ),
      cell: ({ row }) => row.original.ipdId,
      headerClassName: "min-w-24",
      cellClassName: "min-w-24",
    },
    {
      id: "items",
      header: ({ column }) => (
        <SortableHeader<PharmacyIpdIssueType> label="Items" column={column} />
      ),
      cell: ({ row }) => row.original.items.length,
      headerClassName: "min-w-20",
      cellClassName: "min-w-20",
    },
    {
      accessorKey: "discountAmount",
      header: ({ column }) => (
        <SortableHeader<PharmacyIpdIssueType> label="Discount" column={column} />
      ),
      cell: ({ row }) => money(row.original.discountAmount),
      headerClassName: "min-w-24",
      cellClassName: "min-w-24",
    },
    {
      accessorKey: "roundOffAmount",
      header: ({ column }) => (
        <SortableHeader<PharmacyIpdIssueType> label="Round Off" column={column} />
      ),
      cell: ({ row }) => money(row.original.roundOffAmount),
      headerClassName: "min-w-24",
      cellClassName: "min-w-24",
    },
    {
      accessorKey: "total",
      header: ({ column }) => (
        <SortableHeader<PharmacyIpdIssueType> label="Total" column={column} />
      ),
      cell: ({ row }) => money(row.original.total),
      headerClassName: "min-w-24",
      cellClassName: "min-w-24",
    },
  ];

  return (
    <CustomLayout
      title="IPD Issues"
      buttons={
        canCreate ? (
          <CustomButton onClick={() => router.push("/pharmacy/form/ipd-issue/new")}>
            New IPD Issue
          </CustomButton>
        ) : undefined
      }
    >
      <div className="space-y-4">
        <CustomFilters<FilterValues>
          filters={filtersConfig}
          onSubmit={(values) => {
            setPage(1);
            setFilters(values);
          }}
          onRefresh={refetch}
          isLoading={isLoading || isFetching}
          isRefreshing={isFetching}
        />
        <CustomTable
          columns={columns}
          data={data?.data || []}
          page={page}
          total={data?.total}
          limit={limit}
          handleChangePage={setPage}
          handleChangeLimit={setLimit}
          isLoading={isLoading}
          isError={isError}
          error={error}
          getRowId={(row) => String(row.id)}
        />
      </div>
    </CustomLayout>
  );
};

export default IpdIssues;
