"use client";

import CustomActionDropdown from "@/components/common/CustomActionDropdown";
import DocumentUploadDialog from "@/components/common/DocumentUploadDialog";
import CustomFilters from "@/components/common/CustomFilters";
import CustomLayout from "@/components/common/CustomLayout";
import { CustomTable } from "@/components/common/CustomTable";
import NoPermission from "@/components/common/NoPermission";
import { SortableHeader } from "@/components/common/SortableHeader";
import {
  ActionType,
  ModuleType,
  PathologyOrderStatus,
  RadiologyOrderStatus,
} from "@/generated/prisma/enums";
import { useProfile } from "@/hooks/query/auth";
import {
  useCancelRadiologyTestOrder,
  useOutsourceRadiologyTestOrder,
  useRadiologyOrdersList,
  useUploadOutsourcedRadiologyReport,
} from "@/hooks/query/radiology";
import {
  ColumnDefWithClass,
  FilterConfig,
  FilterValues,
  RadiologyOrderByPatientsType,
  RadiologyOrderType,
} from "@/lib/type";
import { hasActionPermission } from "@/lib/utils";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

const Actions = ({
  canUpdate,
  data,
  canPrint,
}: {
  canUpdate: boolean;
  data: RadiologyOrderType;
  canPrint: boolean;
}) => {
  const { mutateAsync: outsource, isPending: outsourcing } =
    useOutsourceRadiologyTestOrder();
  const { mutateAsync: cancel, isPending: cancelling } =
    useCancelRadiologyTestOrder();
  const { mutateAsync: uploadReport, isPending: uploadingReport } =
    useUploadOutsourcedRadiologyReport();

  const router = useRouter();
  const [uploadOpen, setUploadOpen] = useState(false);

  const handleCancel = (value: boolean) => {
    cancel({ orderId: data.id, isCancelled: value });
  };

  const handleOutSource = (value: boolean) => {
    outsource({ orderId: data.id, isOutSourced: value });
  };

  const items = [];

  if (
    canUpdate &&
    !data.isCancelled &&
    !data.isOutSourced &&
    data.status !== RadiologyOrderStatus["COMPLETED"]
  ) {
    items.push({
      label: "Cancel",
      onClick: () => handleCancel(true),
      disabled: cancelling,
    });
  }

  if (canUpdate && data.isCancelled && !data.isOutSourced) {
    items.push({
      label: "Restore",
      onClick: () => handleCancel(false),
      disabled: cancelling,
    });
  }

  if (
    canUpdate &&
    !data.isOutSourced &&
    !data.isCancelled &&
    data.status !== RadiologyOrderStatus["COMPLETED"]
  ) {
    items.push({
      label: "OutSource",
      onClick: () => handleOutSource(true),
      disabled: outsourcing,
    });
  }

  if (canUpdate && data.isOutSourced) {
    items.push({
      label: "Cancel OutSource",
      onClick: () => handleOutSource(false),
      disabled: outsourcing,
    });
  }

  if (data.status === RadiologyOrderStatus["COMPLETED"] && canPrint) {
    items.push({
      label: "Print",
      onClick: () => router.push(`/radiology-print/${data.id}`),
      disabled: outsourcing,
    });
  }

  if (canUpdate && data.isOutSourced && !data.isCancelled) {
    items.push({
      label: "Upload Report",
      onClick: () => setUploadOpen(true),
      disabled: uploadingReport,
    });
  }

  if (canPrint && data.isOutSourced && data.scannedReportDocument?.path) {
    items.push({
      label: "Print Report",
      onClick: () =>
        window.open(
          data.scannedReportDocument?.path,
          "_blank",
          "noopener,noreferrer",
        ),
    });
  }

  if (
    canUpdate &&
    data.status !== RadiologyOrderStatus["COMPLETED"] &&
    !data.isCancelled &&
    !data.isOutSourced
  ) {
    items.push({
      label: "Result Entry",
      onClick: () => router.push(`/radiology/result-entry/${data.id}`),
    });
  }

  return (
    <>
      <CustomActionDropdown
        triggerLabel="Actions"
        groups={[
          {
            items: items,
            label: "Manage",
          },
        ]}
      />
      <DocumentUploadDialog
        open={uploadOpen}
        onOpenChange={setUploadOpen}
        title="Upload Scanned Report"
        description={`Order #${data.id} • ${data.test.name}`}
        existingFileUrl={data.scannedReportDocument?.path}
        uploading={uploadingReport}
        onUpload={async (file) => {
          await uploadReport({ orderId: data.id, file });
          setUploadOpen(false);
        }}
      />
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
    options: Object.values(PathologyOrderStatus).map((s) => ({
      label: s,
      value: s,
    })),
  },
  { label: "Created Date", valueKey: "createdAt", type: "dateRange" },
];

const RadiologyOrders = ({
  cancelled,
  outsourced,
  forcedTestStatus,
  title,
}: {
  cancelled: boolean;
  outsourced: boolean;
  forcedTestStatus?: RadiologyOrderStatus[];
  title: string;
}) => {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [filters, setFilters] = useState<FilterValues>({});
  const [selectedPatient, setSelectedPatient] = useState<number | null>(null);

  const { data: profile } = useProfile(false);
  const { data, isLoading, isError, error } = useRadiologyOrdersList(
    {
      ...filters,
      cancelled,
      outsourced,
      testStatus:
        forcedTestStatus ??
        (!cancelled && !outsourced
          ? [RadiologyOrderStatus["RESULT_PENDING"]]
          : []),
    },
    page,
    limit,
  );

  const effectiveSelectedPatient =
    selectedPatient ?? data?.data?.[0]?.id ?? null;

  const patientOrders = useMemo(
    () =>
      data?.data.find((p) => p.id === effectiveSelectedPatient)
        ?.radiologyTestOrders || [],
    [effectiveSelectedPatient, data],
  );
  const selectedPatientData = useMemo(
    () => data?.data.find((p) => p.id === effectiveSelectedPatient) || null,
    [effectiveSelectedPatient, data],
  );

  if (!profile) {
    return <div />;
  }

  const canView = hasActionPermission(
    profile?.data,
    ModuleType.RADIOLOGY_ORDER,
    ActionType.VIEW,
  );
  const canPrint = hasActionPermission(
    profile?.data,
    ModuleType.RADIOLOGY_ORDER,
    ActionType.PRINT,
  );
  const canUpdate = hasActionPermission(
    profile?.data,
    ModuleType.RADIOLOGY_ORDER,
    ActionType.UPDATE,
  );

  const patientColumns: ColumnDefWithClass<RadiologyOrderByPatientsType>[] = [
    {
      accessorKey: "name",
      header: ({ column }) => {
        return (
          <SortableHeader<RadiologyOrderByPatientsType>
            label="Patient"
            column={column}
          />
        );
      },
      cell: ({ row }) => (
        <button onClick={() => setSelectedPatient(row.original.id)}>
          {[row.original.firstName, row.original.lastName].join(" ")}
        </button>
      ),
      headerClassName: "min-w-15 max-w-20",
      cellClassName: "min-w-15 max-w-20",
    },
  ];

  const columns: ColumnDefWithClass<RadiologyOrderType>[] = [
    {
      accessorKey: "id",
      header: ({ column }) => {
        return (
          <SortableHeader<RadiologyOrderType> label="ID" column={column} />
        );
      },
      cell: ({ row }) => <span>#{row.index + 1}</span>,
      headerClassName: "min-w-15 max-w-20",
      cellClassName: "min-w-15 max-w-20",
    },
    {
      accessorKey: "name",
      header: ({ column }) => {
        return (
          <SortableHeader<RadiologyOrderType> label="Test" column={column} />
        );
      },
      cell: ({ row }) => row.original.test.name,
      headerClassName: "min-w-50",
      cellClassName: "min-w-50",
    },
    {
      accessorKey: "Doctor",
      header: ({ column }) => {
        return (
          <SortableHeader<RadiologyOrderType> label="Doctor" column={column} />
        );
      },
      cell: ({ row }) => row.original.opd?.consultantDoctor.user.name || "-",
      headerClassName: "min-w-50",
      cellClassName: "min-w-50",
    },
    {
      accessorKey: "status",
      header: ({ column }) => {
        return (
          <SortableHeader<RadiologyOrderType> label="Status" column={column} />
        );
      },
      cell: ({ row }) => row.original.status || "-",
      headerClassName: "min-w-50",
      cellClassName: "min-w-50",
    },

    {
      accessorKey: "createdAt",
      header: ({ column }) => {
        return (
          <SortableHeader<RadiologyOrderType>
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
      id: "actions",
      header: () => <p>Action</p>,
      cell: ({ row }) => (
        <Actions
          canPrint={Boolean(canPrint)}
          canUpdate={Boolean(canUpdate)}
          data={row.original}
        />
      ),
      headerClassName: "min-w-20 max-w-30",
      cellClassName: "min-w-20 max-w-30",
    },
  ];

  return (
    <CustomLayout title={title}>
      <CustomFilters<FilterValues>
        filters={neededFilters}
        onSubmit={setFilters}
      />
      <div className="flex gap-4 items-center text-xs font-medium mb-2">
        <div className="flex items-center gap-1">
          <span className="w-3 h-3 bg-blue-100 border rounded-sm"></span>
          Result Pending
        </div>

        <div className="flex items-center gap-1">
          <span className="w-3 h-3 bg-green-100 border rounded-sm"></span>
          Completed
        </div>
      </div>
      <div className="grid grid-cols-[40%_60%] space-x-2">
        {canView ? (
          <div>
            <CustomTable
              columns={patientColumns}
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
              striped
              rowAltBgClass="bg-gray-200"
              rowBgClass="bg-gray-200"
              getRowId={(data) => String(data.id)}
            />
          </div>
        ) : (
          <NoPermission />
        )}
        <div className="space-y-3">
          {selectedPatientData && (
            <div className="border rounded-md p-3 bg-gray-50 text-xs">
              <div className="font-semibold text-sm mb-2">Patient Details</div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="font-medium">Name:</span>{" "}
                  {[
                    selectedPatientData.firstName,
                    selectedPatientData.lastName,
                  ].join(" ")}
                </div>

                <div>
                  <span className="font-medium">UHID:</span>{" "}
                  {selectedPatientData.uhid}
                </div>

                <div>
                  <span className="font-medium">Gender:</span>{" "}
                  {selectedPatientData.gender}
                </div>

                <div>
                  <span className="font-medium">DOB:</span>{" "}
                  {format(new Date(selectedPatientData.dob), "MMM dd, yyyy")}
                </div>

                <div>
                  <span className="font-medium">Blood Group:</span>{" "}
                  {selectedPatientData.bloodGroup}
                </div>

                <div>
                  <span className="font-medium">Created:</span>{" "}
                  {format(
                    new Date(selectedPatientData.createdAt),
                    "MMM dd, yyyy",
                  )}
                </div>
              </div>
            </div>
          )}

          <CustomTable
            columns={columns}
            data={patientOrders}
            enableSorting
            getRowId={(data) => String(data.id)}
            striped
            hidePagination
          />
        </div>
      </div>
    </CustomLayout>
  );
};

export default RadiologyOrders;
