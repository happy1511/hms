"use client";

import CustomLayout from "@/components/common/CustomLayout";
import CustomFilters from "@/components/common/CustomFilters";
import { CustomTable } from "@/components/common/CustomTable";
import NoPermission from "@/components/common/NoPermission";
import { SortableHeader } from "@/components/common/SortableHeader";
import { PatientViewModal } from "@/components/patient/PatientView";
import { ActionType, ModuleType } from "@/generated/prisma/enums";
import { useProfile } from "@/hooks/query/auth";
import { useIpdList } from "@/hooks/query/ipd";
import {
  ColumnDefWithClass,
  FilterConfig,
  FilterValues,
  IPDType,
  PatientType,
} from "@/lib/type";
import { formatAge, hasActionPermission } from "@/lib/utils";
import { endOfDay, format, startOfDay } from "date-fns";
import { useState } from "react";

const MlcPatients = () => {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [filters, setFilters] = useState<FilterValues>({
    isMlcPatient: true,
    mlcDeclarationDate: { from: startOfDay(new Date()), to: endOfDay(new Date()) },
  });

  const { data: profile } = useProfile(false);
  const { data, isLoading, isFetching, refetch, isError, error } = useIpdList(
    filters,
    page,
    limit,
  );

  if (!profile) return <div />;

  const canView = hasActionPermission(
    profile.data,
    ModuleType.IPD_MLC,
    ActionType.VIEW,
  );

  const columns: ColumnDefWithClass<IPDType>[] = [
    {
      accessorKey: "patient",
      header: ({ column }) => (
        <SortableHeader<IPDType> label="Patient" column={column} />
      ),
      cell: ({ row }) => (
        <div>
          <PatientViewModal
            data={row.original.patient as PatientType}
            trigger={
              <div className="uppercase text-tiny font-medium hover:bg-orange-100 inline cursor-pointer">
                {[
                  row.original.patient.firstName,
                  row.original.patient.lastName,
                ]
                  .filter(Boolean)
                  .join(" ")}
              </div>
            }
          />
          <div className="text-[10px]">
            {row.original.patient.gender}, {formatAge(row.original.patient.dob)}
          </div>
          <div className="text-[10px] text-black/70">
            {[
              row.original.bed?.room?.roomType?.department?.name,
              row.original.bed?.room?.roomType?.name,
              row.original.bed?.room?.name,
              row.original.bed?.name || row.original.bed?.bedNumber,
            ]
              .filter(Boolean)
              .join(" / ") || "--"}
          </div>
        </div>
      ),
      headerClassName: "min-w-80",
      cellClassName: "min-w-80",
    },
    {
      accessorKey: "mlcDeclarationDate",
      header: ({ column }) => (
        <SortableHeader<IPDType> label="Medico-Legal Date" column={column} />
      ),
      cell: ({ row }) => (
        <div className="text-tiny">
          {row.original.mlcDeclarationDate
            ? format(new Date(row.original.mlcDeclarationDate), "dd/MM - h:mma")
            : "--"}
        </div>
      ),
      headerClassName: "min-w-50",
      cellClassName: "min-w-50",
    },
    {
      accessorKey: "mlcDeclaredByUser",
      header: ({ column }) => (
        <SortableHeader<IPDType> label="Declared By" column={column} />
      ),
      cell: ({ row }) => (
        <div className="text-tiny">
          {row.original.mlcDeclaredByUser?.name || "--"}
        </div>
      ),
      headerClassName: "min-w-50",
      cellClassName: "min-w-50",
    },
  ];

  const neededFilters: FilterConfig<FilterValues>[] = [
    { label: "Medico-Legal Date", valueKey: "mlcDeclarationDate", type: "dateRange" },
  ];

  if (!canView) {
    return (
      <CustomLayout title="MLC Patients">
        <NoPermission />
      </CustomLayout>
    );
  }

  return (
    <CustomLayout title="MLC Patients">
      <CustomFilters<FilterValues>
        filters={neededFilters}
        defaultValues={filters}
        onRefresh={refetch}
        isLoading={isLoading || isFetching}
        isRefreshing={isFetching}
        onSubmit={setFilters}
        filtersContainerClassName="grid-cols-1"
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
        getRowId={(row) => String(row.id)}
      />
    </CustomLayout>
  );
};

export default MlcPatients;
