"use client";
import { CustomAlert } from "@/components/common/CustomAlert";
import CustomFilters from "@/components/common/CustomFilters";
import CustomLayout from "@/components/common/CustomLayout";
import NoPermission from "@/components/common/NoPermission";
import { CustomTable } from "@/components/common/CustomTable";
import { SortableHeader } from "@/components/common/SortableHeader";
import { PatientViewModal } from "@/components/patient/PatientView";
import { Button } from "@/components/ui/button";
import { ActionType, ModuleType } from "@/generated/prisma/enums";
import { useProfile } from "@/hooks/query/auth";
import { useInfiniteDoctorList } from "@/hooks/query/doctor";
import { useDeleteOpdQueue, useOpdQueueList } from "@/hooks/query/opd";
import {
  ColumnDefWithClass,
  Doctor,
  FilterConfig,
  FilterValues,
  OPDType,
  PaginatedResponse,
  PatientType,
} from "@/lib/type";
import { hasActionPermission } from "@/lib/utils";
import { format, formatDuration, intervalToDuration, isAfter } from "date-fns";
import { Trash2 } from "lucide-react";
import { useState } from "react";

const Actions = ({
  data,
  canDelete,
}: {
  data: OPDType;
  canDelete: boolean;
}) => {
  const { mutateAsync: deleteQueue, isPending: deletePending } =
    useDeleteOpdQueue();

  return (
    <>
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
          title="Delete Queue?"
          description="Are you sure you want to delete queue?"
          cancelText="Cancel"
          confirmText="Delete"
          handleConfirm={() => deleteQueue({ opdId: Number(data.id) })}
          pending={deletePending}
        />
      )}
    </>
  );
};

const WalkInQueue = () => {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [filters, setFilters] = useState<FilterValues>({});
  const [consultantValue, setConsultantValue] = useState("");

  const consultantQuery = useInfiniteDoctorList(
    {
      doctorType: "consulting",
      name: consultantValue,
    },
    10,
  );
  const { data: profile } = useProfile(false);
  const { data, isLoading, isError, error } = useOpdQueueList(
    filters,
    page,
    limit,
  );

  if (!profile) {
    return <div />;
  }

  const canView = hasActionPermission(
    profile?.data,
    ModuleType.OPD_QUEUE,
    ActionType.VIEW,
  );

  const canDelete = hasActionPermission(
    profile?.data,
    ModuleType.OPD_QUEUE,
    ActionType.DELETE,
  );

  const columns: ColumnDefWithClass<OPDType>[] = [
    {
      accessorKey: "id",
      header: ({ column }) => {
        return <SortableHeader<OPDType> label="ID" column={column} />;
      },
      cell: ({ row }) => <span>#{row.index + 1}</span>,
      headerClassName: "min-w-15 max-w-20",
      cellClassName: "min-w-15 max-w-20",
    },
    {
      accessorKey: "patientName",
      header: ({ column }) => {
        return <SortableHeader<OPDType> label="Patient" column={column} />;
      },
      cell: ({ row }) => (
        <PatientViewModal
          data={row.original.patient as PatientType}
          trigger={
            <span className="text-blue-500">
              {[
                row.original.patient.firstName,
                row.original.patient.middleName,
                row.original.patient.lastName,
              ].join(" ")}
            </span>
          }
        />
      ),
      headerClassName: "min-w-50",
      cellClassName: "min-w-50",
    },
    {
      accessorKey: "doctor",
      header: ({ column }) => {
        return <SortableHeader<OPDType> label="Consultant" column={column} />;
      },
      cell: ({ row }) =>
        [
          row.original.consultantDoctor.user.name,
          row.original.consultantDoctor.user.name,
          row.original.consultantDoctor.user.name,
        ].join(" "),
      headerClassName: "min-w-50",
      cellClassName: "min-w-50",
    },
    {
      accessorKey: "createdDate",
      header: ({ column }) => {
        return <SortableHeader<OPDType> label="Walk In Time" column={column} />;
      },
      cell: ({ row }) => (
        <div className="flex items-center text-tiny gap-2">
          {format(row.original.createdAt, "MMM d yyyy h:mma")}
          <div className="bg-secondary px-2 text-white">
            Arrived{" "}
            {formatDuration(
              intervalToDuration({
                start: isAfter(row.original.createdAt, new Date())
                  ? new Date()
                  : row.original.createdAt,
                end: isAfter(row.original.createdAt, new Date())
                  ? row.original.createdAt
                  : new Date(),
              }),
              {
                format: ["hours", "minutes"],
              },
            )}{" "}
            ago
          </div>
        </div>
      ),
      headerClassName: "min-w-50",
      cellClassName: "min-w-50",
    },
    {
      accessorKey: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <Actions data={row.original} canDelete={Boolean(canDelete)} />
      ),
      headerClassName: "min-w-50",
      cellClassName: "min-w-50",
    },
  ];

  const neededFilters: FilterConfig<FilterValues>[] = [
    {
      label: "Filter by Consultant",
      valueKey: "consultantDoctor",
      type: "infiniteSelect",
      placeholder: "Search by name here.",
      query: consultantQuery,
      getItems: (d) => (d as PaginatedResponse<Doctor>)?.data,
      valueKeyExtractor: (i) => String((i as Doctor).userId),
      labelKey: (i) => (i as Doctor).user.name,
      search: consultantValue,
      onSearchChange: setConsultantValue,
    },
  ];

  return (
    <CustomLayout title="Walk In Queue">
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
      {!canView && <NoPermission />}
    </CustomLayout>
  );
};

export default WalkInQueue;
