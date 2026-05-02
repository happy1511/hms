"use client";

import CustomButton from "@/components/common/CustomButton";
import { CustomTable } from "@/components/common/CustomTable";
import { SortableHeader } from "@/components/common/SortableHeader";
import { ColumnDefWithClass, PatientDocumentType } from "@/lib/type";
import { format } from "date-fns";
import { AxiosError } from "axios";
import { ApiResponse } from "@/lib/type";

const getPatientName = (document: PatientDocumentType) => {
  const patient = document.opd?.patient ?? document.ipd?.patient;

  return [
    patient?.title ? `${patient.title}.` : "",
    patient?.firstName ?? "",
    patient?.middleName ?? "",
    patient?.lastName ?? "",
  ]
    .filter(Boolean)
    .join(" ")
    .trim();
};

const getSourceLabel = (document: PatientDocumentType) => {
  if (document.opd) return `OPD #${document.opd.id}`;
  if (document.ipd) {
    return `${document.ipd.isDayCare ? "Day Care" : "IPD"} #${document.ipd.id}`;
  }
  return "-";
};

export const patientDocumentColumns: ColumnDefWithClass<PatientDocumentType>[] =
  [
    {
      accessorKey: "id",
      header: ({ column }) => (
        <SortableHeader<PatientDocumentType> label="ID" column={column} />
      ),
      cell: ({ row }) => <span>#{row.original.id}</span>,
      headerClassName: "min-w-16",
      cellClassName: "min-w-16",
    },
    {
      accessorKey: "patient",
      header: ({ column }) => (
        <SortableHeader<PatientDocumentType> label="Patient" column={column} />
      ),
      cell: ({ row }) => getPatientName(row.original) || "-",
      headerClassName: "min-w-52",
      cellClassName: "min-w-52",
    },
    {
      accessorKey: "documentName",
      header: ({ column }) => (
        <SortableHeader<PatientDocumentType>
          label="Document Name"
          column={column}
        />
      ),
      cell: ({ row }) => row.original.documentName || "-",
      headerClassName: "min-w-40",
      cellClassName: "min-w-40",
    },
    {
      accessorKey: "source",
      header: ({ column }) => (
        <SortableHeader<PatientDocumentType> label="Source" column={column} />
      ),
      cell: ({ row }) => getSourceLabel(row.original),
      headerClassName: "min-w-28",
      cellClassName: "min-w-28",
    },
    {
      accessorKey: "originalName",
      header: ({ column }) => (
        <SortableHeader<PatientDocumentType> label="File" column={column} />
      ),
      cell: ({ row }) => row.original.originalName || "-",
      headerClassName: "min-w-56",
      cellClassName: "min-w-56",
    },
    {
      accessorKey: "createdAt",
      header: ({ column }) => (
        <SortableHeader<PatientDocumentType> label="Uploaded At" column={column} />
      ),
      cell: ({ row }) => format(row.original.createdAt, "dd/MM/yyyy hh:mm a"),
      headerClassName: "min-w-36",
      cellClassName: "min-w-36",
    },
    {
      accessorKey: "action",
      header: "Action",
      cell: ({ row }) => (
        <CustomButton
          type="button"
          variant="secondary"
          className="h-auto px-2 py-1"
          onClick={() => window.open(row.original.path, "_blank", "noopener,noreferrer")}
        >
          Open
        </CustomButton>
      ),
      headerClassName: "min-w-24",
      cellClassName: "min-w-24",
    },
  ];

const PatientDocumentsTable = ({
  data,
  page = 1,
  total,
  limit = 10,
  onPageChange,
  onLimitChange,
  isLoading = false,
  isError = false,
  error = null,
  hidePagination = false,
}: {
  data: PatientDocumentType[];
  page?: number;
  total?: number;
  limit?: number;
  onPageChange?: (page: number) => void;
  onLimitChange?: (limit: number) => void;
  isLoading?: boolean;
  isError?: boolean;
  error?: AxiosError<ApiResponse<null>> | null;
  hidePagination?: boolean;
}) => {
  return (
    <CustomTable
      columns={patientDocumentColumns}
      data={data}
      page={page}
      total={total}
      limit={limit}
      isLoading={isLoading}
      isError={isError}
      error={error}
      handleChangePage={onPageChange}
      handleChangeLimit={onLimitChange}
      hidePagination={hidePagination}
      getRowId={(row) => String(row.id)}
    />
  );
};

export default PatientDocumentsTable;
