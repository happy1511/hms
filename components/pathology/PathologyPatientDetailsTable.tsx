"use client";

import { PathologyTestResultType } from "@/lib/type";
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
  const patientAge = patient?.dob
    ? String(
        Math.max(
          0,
          new Date().getFullYear() - new Date(patient.dob).getFullYear(),
        ),
      )
    : "";
  const patientGender = patient?.gender ? String(patient.gender) : "";

  const consultantName =
    data.opd?.consultantDoctor?.user?.name ||
    data.ipd?.consultantDoctor?.user?.name ||
    "";
  const referredByName =
    data.opd?.referringDoctor?.user?.name ||
    data.ipd?.referringDoctor?.user?.name ||
    "";

  return (
    <>
      <InfoRow
        leftLabel="Patient UHID"
        leftValue={String(patient?.id || "-")}
        rightLabel="Barcode"
        rightValue={String(patient?.id || "-")}
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
        rightValue={`${patientGender || "-"}, ${`${patientAge} years`}`}
        cellClassName="border-b-0"
      />
      <InfoRow
        leftLabel="Address"
        leftValue={
          patient?.addresses?.[0]
            ? [
                patient.addresses[0].addressLineOne,
                patient.addresses[0].addressLineTwo,
                patient.addresses[0].addressLineThree,
                patient.addresses[0].location?.city,
                patient.addresses[0].location?.state,
                patient.addresses[0].location?.postcode,
              ]
                .filter(Boolean)
                .join(", ")
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
