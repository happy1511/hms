"use client";

import { formatAddress } from "@/lib/address";
import { PathologyTestResultType } from "@/lib/type";
import { formatAge, fullName } from "@/lib/utils";
import { format } from "date-fns";
import InfoRow from "../invoice/InfoRow";

const formatDate = (value?: string | Date | null) => {
  if (!value) return "-";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "-";
  return format(d, "dd/MM/yy hh:mm a");
};

const PathologyPatientDetailsTable = ({
  data,
}: {
  data: PathologyTestResultType;
}) => {
  const patient = data.patient;
  const patientAge = patient?.dob ? formatAge(patient.dob) : "";
  const patientGender = patient?.gender ? String(patient.gender) : "";

  const consultantDoctor =
    data.opd?.consultantDoctor || data.ipd?.consultantDoctor;
  const consultantName = consultantDoctor ? fullName(consultantDoctor) : "";
  const referringDoctor =
    data.opd?.referringDoctor || data.ipd?.referringDoctor;
  const referredByName = referringDoctor ? fullName(referringDoctor) : "";

  return (
    <>
      <InfoRow
        leftLabel="Patient UHID"
        leftValue={patient?.uhid || "-"}
        rightLabel="Barcode"
        rightValue={patient?.uhid || "-"}
        cellClassName="border-b-0"
      />

      <InfoRow
        leftLabel="Patient"
        leftValue={
          patient
            ? `${patient.firstName || ""} ${patient.lastName || ""}`.trim()
            : "-"
        }
        rightLabel="Gender/Age"
        rightValue={`${patientGender || "-"}, ${patientAge || "-"}`}
        cellClassName="border-b-0"
      />
      <InfoRow
        leftLabel="Address"
        leftValue={
          patient?.addresses?.[0]
            ? formatAddress(patient.addresses[0])
            : ""
        }
        rightLabel="OPD No"
        rightValue={data.opdId ? String(data.opdId) : "-"}
        cellClassName="border-b-0"
      />
      <InfoRow
        leftLabel="Mobile Number"
        leftValue={patient?.contacts?.[0]?.value || ""}
        rightLabel="Consultant"
        rightValue={consultantName || "-"}
        cellClassName="border-b-0"
      />
      <InfoRow
        leftLabel="Accession No"
        leftValue={data.id ? String(data.id) : "-"}
        rightLabel="Referred By"
        rightValue={referredByName || "-"}
        cellClassName="border-b-0"
      />
      <InfoRow
        leftLabel="Sample On"
        leftValue={formatDate(data.sampleTakenAt)}
        rightLabel="Report On"
        rightValue={formatDate(new Date())}
      />
    </>
  );
};

export default PathologyPatientDetailsTable;
