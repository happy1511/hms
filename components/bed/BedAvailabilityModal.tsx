"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useBedAvailability } from "@/hooks/query/bed";
import { useGetPatient } from "@/hooks/query/patient";
import { AvailableBed, ColumnDefWithClass, PatientType } from "@/lib/type";
import { Bed, BedDouble, X } from "lucide-react";
import { useProfile } from "@/hooks/query/auth";
import { hasActionPermission } from "@/lib/utils";
import { ActionType, ModuleType } from "@/generated/prisma/enums";
import { format } from "date-fns";
import CustomTabs from "../common/CustomTabs";
import { CustomTable } from "../common/CustomTable";
import { PatientViewModal } from "../patient/PatientView";
import { SidebarMenuButton, SidebarMenuItem } from "../ui/sidebar";

const Loader = () => (
  <div className="flex items-center justify-center h-96">
    <div className="text-center">
      <div className="animate-spin mb-4">
        <BedDouble className="size-8 mx-auto text-primary" />
      </div>
      <p className="text-sm text-muted-foreground">
        Loading bed availability...
      </p>
    </div>
  </div>
);

const PatientDetailsPanel = ({
  patientId,
  onClose,
}: {
  patientId: number;
  onClose: () => void;
}) => {
  const { data: patient, isLoading } = useGetPatient(patientId?.toString());

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Loading patient details...</p>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Patient not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between pb-4 border-b">
        <h3 className="text-lg font-semibold">Patient Details</h3>
        <button
          onClick={onClose}
          className="text-muted-foreground hover:text-foreground"
        >
          <X className="size-4" />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <p className="text-muted-foreground font-medium">Name</p>
          <p className="font-semibold">
            {patient.firstName} {patient.lastName}
          </p>
        </div>
        <div>
          <p className="text-muted-foreground font-medium">UHID</p>
          <p className="font-semibold text-primary">{patient.uhid}</p>
        </div>
        <div>
          <p className="text-muted-foreground font-medium">Gender</p>
          <p className="font-semibold">{patient.gender}</p>
        </div>
        <div>
          <p className="text-muted-foreground font-medium">DOB</p>
          <p className="font-semibold">
            {patient.dob ? format(new Date(patient.dob), "dd/MM/yyyy") : "-"}
          </p>
        </div>
        <div className="col-span-2">
          <p className="text-muted-foreground font-medium">Marital Status</p>
          <p className="font-semibold">{patient.maritalStatus || "-"}</p>
        </div>
      </div>
    </div>
  );
};

interface BedTableRow {
  id: number;
  bedName: string;
  bedNumber: string;
  patient: string | null;
  patientUhid: string | null;
  patientId: string | null;
  ipdNo: string;
  ipdDate: string;
  isOccupied: boolean;
}

const BedAvailabilityModal = () => {
  const [open, setOpen] = useState(false);
  const { data: bedAvailabilityData, isLoading } = useBedAvailability();
  const { data: profile } = useProfile(false);

  const canViewPatient = profile?.data
    ? hasActionPermission(
        profile.data,
        ModuleType.PATIENT_MASTER,
        ActionType.VIEW,
      )
    : false;

  const columns: ColumnDefWithClass<AvailableBed>[] = [
    {
      accessorKey: "bedNumber",
      header: "Bed Name",
      cell: ({ row }) => (
        <span className={row.original.isOccupied ? "font-semibold" : ""}>
          {row.original.bedNumber}
        </span>
      ),
    },
    {
      accessorKey: "patient",
      header: "Patient",
      cell: ({ row }) => {
        if (!row.original.isOccupied || !row.original.currentIpd) {
          return <span className="text-muted-foreground">-</span>;
        }

        if (!canViewPatient) {
          return <span className="text-xs text-yellow-600">*****</span>;
        }

        return (
          <PatientViewModal
            data={row.original.currentIpd?.patient as PatientType}
            trigger={
              <div className="uppercase text-tiny font-medium hover:bg-orange-100 inline cursor-pointer">
                {[
                  row.original.currentIpd?.patient.firstName,
                  row.original.currentIpd?.patient.lastName,
                ].join(" ")}
              </div>
            }
          />
        );
      },
    },
    {
      accessorKey: "ipdNo",
      header: "IPD No",
      cell: ({ row }) => (
        <span className="text-sm">{row.original.currentIpdId}</span>
      ),
    },
    {
      accessorKey: "ipdDate",
      header: "IPD Date",
      cell: ({ row }) => (
        <span className="text-sm">
          {row.original.currentIpd?.createdAt &&
            format(row.original.currentIpd?.createdAt, "MMM dd, yyyy")}
        </span>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-semibold ${
            row.original.isOccupied
              ? "bg-red-100 text-red-800"
              : "bg-green-100 text-green-800"
          }`}
        >
          {row.original.isOccupied ? "Occupied" : "Available"}
        </span>
      ),
    },
  ];

  const tabItems =
    bedAvailabilityData?.map((roomType) => ({
      value: String(roomType.id),
      name: roomType.name,
      content: <CustomTable data={roomType.beds} columns={columns} />,
    })) || [];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <SidebarMenuItem>
          <SidebarMenuButton
            asChild
            className="pl-8 py-1.5 h-auto text-tiny! [&>svg]:size-3 font-semibold data-[active=true]:text-white hover:text-white text-black"
          >
            <div>
              <Bed />
              <span>Bed Availability</span>
            </div>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </DialogTrigger>
      <DialogContent className="sm:max-w-5xl! max-w-4xl w-full! max-h-[90vh] p-0 overflow-y-auto">
        <DialogHeader className="sr-only">
          <DialogTitle className="text-lg font-semibold sr-only">
            test
          </DialogTitle>
          <DialogDescription>
            View available and occupied beds by room type
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <Loader />
        ) : bedAvailabilityData && bedAvailabilityData.length > 0 ? (
          <CustomTabs
            tabs={tabItems}
            defaultValue={String(bedAvailabilityData[0]?.id) || ""}
          />
        ) : (
          <div className="flex items-center justify-center h-96">
            <p className="text-muted-foreground">No rooms available</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default BedAvailabilityModal;
