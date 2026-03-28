"use client";
import CustomButton from "@/components/common/CustomButton";
import CustomFilters from "@/components/common/CustomFilters";
import CustomLayout from "@/components/common/CustomLayout";
import NoPermission from "@/components/common/NoPermission";
import { CustomTable } from "@/components/common/CustomTable";
import { SortableHeader } from "@/components/common/SortableHeader";
import StatusBadge from "@/components/common/StatusBadge";
import { ActionType, DocumentType, ModuleType } from "@/generated/prisma/enums";
import { useProfile } from "@/hooks/query/auth";
import {
  ColumnDefWithClass,
  FilterConfig,
  FilterValues,
  PatientDocumentType,
} from "@/lib/type";
import { hasActionPermission } from "@/lib/utils";
import { format } from "date-fns";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { usePatientDocumentsList } from "@/hooks/query/patient";
import PatientSearchModal from "@/components/patient/PatientSearchModal";

const Buttons = ({ canCreate = false }: { canCreate?: boolean }) => {
  const router = useRouter();
  return (
    <>
      {canCreate && (
        <CustomButton onClick={() => router.push("/users/new")}>
          New User
        </CustomButton>
      )}
    </>
  );
};

const neededFilters: FilterConfig<FilterValues>[] = [
  {
    label: "Document Type",
    valueKey: "doctorType",
    type: "select",
    placeholder: "Select Document Type",
    options: Object.values(DocumentType).map((s) => ({
      label: s,
      value: s,
    })),
  },

  { label: "Created Date", valueKey: "createdAt", type: "dateRange" },
];

const PatientDocuments = () => {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [filters, setFilters] = useState<
    FilterValues & { patient?: PatientDocumentType }
  >({});

  const { data: profile } = useProfile(false);
  const { data, isLoading, isError, error } = usePatientDocumentsList(
    { ...filters, uhid: filters?.uhid },
    page,
    limit,
  );

  if (!profile) {
    return <div />;
  }

  const canView = hasActionPermission(
    profile?.data,
    ModuleType.PATIENT_MASTER,
    ActionType.VIEW,
  );

  const canCreate = hasActionPermission(
    profile?.data,
    ModuleType.PATIENT_MASTER,
    ActionType.CREATE,
  );
  const canUpdate = hasActionPermission(
    profile?.data,
    ModuleType.PATIENT_MASTER,
    ActionType.UPDATE,
  );

  const columns: ColumnDefWithClass<PatientDocumentType>[] = [
    {
      accessorKey: "id",
      header: ({ column }) => {
        return (
          <SortableHeader<PatientDocumentType> label="ID" column={column} />
        );
      },
      cell: ({ row }) => <span>#{row.index + 1}</span>,
      headerClassName: "min-w-15 max-w-20",
      cellClassName: "min-w-15 max-w-20",
    },
    {
      accessorKey: "patientId",
      header: ({ column }) => {
        return (
          <SortableHeader<PatientDocumentType>
            label="Patient ID"
            column={column}
          />
        );
      },
      cell: ({ row }) => (
        <Link
          href={canUpdate ? `/patients/${row.original.patientId}` : "#"}
          className="hover:underline"
        >
          {row.original.patient.firstName +
            " " +
            row.original.patient.lastName || "-"}
        </Link>
      ),
      headerClassName: "min-w-50",
      cellClassName: "min-w-50",
    },
    {
      accessorKey: "type",
      header: ({ column }) => {
        return (
          <SortableHeader<PatientDocumentType>
            label="Document Type"
            column={column}
          />
        );
      },
      cell: ({ row }) => (
        <Link
          href={canUpdate ? `/patients/${row.original.id}` : "#"}
          className="hover:underline"
        >
          {row.original.type || "-"}
        </Link>
      ),
      headerClassName: "min-w-50",
      cellClassName: "min-w-50",
    },

    {
      accessorKey: "status",
      header: () => {
        return <button className="flex">Status</button>;
      },
      cell: ({ row }) => <StatusBadge status={row.original.active} />,
      headerClassName: "min-w-20 max-w-30",
      cellClassName: "min-w-20 max-w-30",
    },
    {
      accessorKey: "createdAt",
      header: ({ column }) => {
        return (
          <SortableHeader<PatientDocumentType>
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
          <SortableHeader<PatientDocumentType>
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
  ];

  return (
    <>
      <CustomLayout title="Search Patient">
        {canView && (
          <>
            <PatientSearchModal
              trigger={
                <CustomButton className="bg-secondary flex justify-start">
                  {filters.patient ? `${filters.name}` : "Search Patient"}
                </CustomButton>
              }
              actions={(row, setOpen) => {
                return (
                  <CustomButton
                    onClick={() => {
                      setFilters((prev) => ({
                        ...prev,
                        patient: row as PatientDocumentType,
                      }));
                      setOpen(false);
                    }}
                  >
                    Select
                  </CustomButton>
                );
              }}
            />
          </>
        )}
        {!canView && <NoPermission />}
      </CustomLayout>
      <CustomLayout
        title="Patient Documents"
        buttons={<Buttons canCreate={canCreate} />}
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
              handleChangePage={setPage}
              isLoading={isLoading}
              handleChangeLimit={setLimit}
              getRowId={(data) => String(data.id)}
              limit={limit}
              isError={isError}
              error={error}
            />
          </>
        )}
        {!canView && <NoPermission />}
      </CustomLayout>
    </>
  );
};

export default PatientDocuments;
