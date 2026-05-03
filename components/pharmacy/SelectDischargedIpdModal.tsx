"use client";

import CustomButton from "@/components/common/CustomButton";
import { CustomTable } from "@/components/common/CustomTable";
import { SortableHeader } from "@/components/common/SortableHeader";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { usePharmacyIpdPatients } from "@/hooks/query/pharmacyIpdBill";
import { ColumnDefWithClass, FilterValues, IPDType } from "@/lib/type";
import { format } from "date-fns";
import { useState } from "react";

const patientName = (ipd: IPDType) =>
  [ipd.patient.firstName, ipd.patient.middleName, ipd.patient.lastName]
    .filter(Boolean)
    .join(" ");

const SelectDischargedIpdModal = ({
  onSelect,
  disabled = false,
}: {
  onSelect: (ipd: IPDType) => void;
  disabled?: boolean;
}) => {
  const [open, setOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const { data, isLoading, isError, error } = usePharmacyIpdPatients(
    { isDischarged: true } as FilterValues,
    page,
    limit,
  );

  const columns: ColumnDefWithClass<IPDType>[] = [
    {
      accessorKey: "id",
      header: ({ column }) => (
        <SortableHeader<IPDType> label="IPD No." column={column} />
      ),
      cell: ({ row }) => row.original.id,
      headerClassName: "min-w-24",
      cellClassName: "min-w-24",
    },
    {
      id: "patient",
      header: ({ column }) => (
        <SortableHeader<IPDType> label="Patient" column={column} />
      ),
      cell: ({ row }) => patientName(row.original),
      headerClassName: "min-w-48",
      cellClassName: "min-w-48",
    },
    {
      accessorKey: "ipdDateTime",
      header: ({ column }) => (
        <SortableHeader<IPDType> label="IPD Date" column={column} />
      ),
      cell: ({ row }) => format(new Date(row.original.ipdDateTime), "dd/MM/yyyy"),
      headerClassName: "min-w-24",
      cellClassName: "min-w-24",
    },
    {
      accessorKey: "dischargedAt",
      header: ({ column }) => (
        <SortableHeader<IPDType> label="Discharged" column={column} />
      ),
      cell: ({ row }) =>
        row.original.dischargedAt
          ? format(new Date(row.original.dischargedAt), "dd/MM/yyyy")
          : "-",
      headerClassName: "min-w-24",
      cellClassName: "min-w-24",
    },
    {
      id: "action",
      header: () => <span>Action</span>,
      cell: ({ row }) => (
        <CustomButton
          type="button"
          onClick={() => {
            onSelect(row.original);
            setOpen(false);
          }}
        >
          Select
        </CustomButton>
      ),
      headerClassName: "min-w-28",
      cellClassName: "min-w-28",
    },
  ];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <CustomButton type="button" variant="secondary" disabled={disabled}>
          Search Discharged Patients
        </CustomButton>
      </DialogTrigger>
      <DialogContent className="max-w-5xl! border-4 border-secondary bg-white">
        <DialogHeader>
          <DialogTitle className="text-sm text-black/70">
            Select Discharged IPD Patient
          </DialogTitle>
        </DialogHeader>
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
      </DialogContent>
    </Dialog>
  );
};

export default SelectDischargedIpdModal;
