"use client";

import CustomButton from "@/components/common/CustomButton";
import { CustomTable } from "@/components/common/CustomTable";
import { SortableHeader } from "@/components/common/SortableHeader";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { usePatientsList } from "@/hooks/query/patient";
import { ColumnDefWithClass, FilterValues, PatientType } from "@/lib/type";
import { formatAge } from "@/lib/utils";
import { useState } from "react";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (patient: PatientType) => void;
}

const SelectHospitalPatientModal = ({
  open,
  onOpenChange,
  onSelect,
}: Props) => {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [filters, setFilters] = useState<FilterValues>({});
  const [name, setName] = useState("");
  const [uhid, setUhid] = useState("");
  const [contactNo, setContactNo] = useState("");

  const { data, isLoading, isError, error } = usePatientsList(
    filters,
    page,
    limit,
  );

  const columns: ColumnDefWithClass<PatientType>[] = [
    {
      accessorKey: "id",
      header: ({ column }) => (
        <SortableHeader<PatientType> label="UHID" column={column} />
      ),
      cell: ({ row }) => row.original.id,
      headerClassName: "min-w-20",
      cellClassName: "min-w-20",
    },
    {
      accessorKey: "name",
      header: ({ column }) => (
        <SortableHeader<PatientType> label="Patient" column={column} />
      ),
      cell: ({ row }) =>
        [
          `${row.original.title}.`,
          row.original.firstName,
          row.original.lastName,
        ].join(" "),
      headerClassName: "min-w-40",
      cellClassName: "min-w-40",
    },
    {
      accessorKey: "gender",
      header: ({ column }) => (
        <SortableHeader<PatientType> label="Gender / Age" column={column} />
      ),
      cell: ({ row }) =>
        `${row.original.gender} / ${formatAge(row.original.dob)}`,
      headerClassName: "min-w-28",
      cellClassName: "min-w-28",
    },
    {
      accessorKey: "contact",
      header: "Contact",
      cell: ({ row }) => row.original.contacts?.[0]?.value || "-",
      headerClassName: "min-w-28",
      cellClassName: "min-w-28",
    },
    {
      accessorKey: "action",
      header: "Action",
      cell: ({ row }) => (
        <button
          type="button"
          className="text-blue-500 hover:underline"
          onClick={() => {
            onSelect(row.original);
            onOpenChange(false);
          }}
        >
          Select
        </button>
      ),
      headerClassName: "min-w-20",
      cellClassName: "min-w-20",
    },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl! border-secondary border-4 bg-white">
        <DialogHeader>
          <DialogTitle className="text-sm">Select Hospital Patient</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="grid grid-cols-4 gap-2">
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Search name"
              className="rounded border px-2 py-1 text-tiny"
            />
            <input
              value={uhid}
              onChange={(event) => setUhid(event.target.value)}
              placeholder="UHID"
              className="rounded border px-2 py-1 text-tiny"
            />
            <input
              value={contactNo}
              onChange={(event) => setContactNo(event.target.value)}
              placeholder="Contact no"
              className="rounded border px-2 py-1 text-tiny"
            />
            <CustomButton
              type="button"
              onClick={() => {
                setPage(1);
                setFilters({
                  ...(name ? { name } : {}),
                  ...(uhid ? { uhid: Number(uhid) } : {}),
                  ...(contactNo ? { contactNo } : {}),
                });
              }}
            >
              Search
            </CustomButton>
          </div>
          <CustomTable
            columns={columns}
            data={data?.data || []}
            page={page}
            total={data?.total}
            enableSorting
            limit={limit}
            handleChangePage={setPage}
            handleChangeLimit={setLimit}
            isLoading={isLoading}
            isError={isError}
            error={error}
            getRowId={(row) => String(row.id)}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SelectHospitalPatientModal;
