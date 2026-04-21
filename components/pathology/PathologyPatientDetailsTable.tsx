"use client";

import Cell from "@/components/invoice/Cell";
import { PathologyTestResultType } from "@/lib/type";
import { format } from "date-fns";

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
    <table className="w-full border border-black border-collapse">
      <tbody>
        <HeaderRow
          leftLabel="Patient UHID"
          leftValue={String(patient?.id || "-")}
          rightLabel="Barcode"
          rightValue={String(patient?.id || "-")}
        />
        <HeaderRow
          leftLabel="Patient"
          leftValue={
            patient
              ? `${patient.firstName || ""} ${patient.lastName || ""}`.trim()
              : "-"
          }
          rightLabel="Gender/Age"
          rightValue={`${patientGender || "-"}, ${`${patientAge} years`}`}
        />
        <HeaderRow
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
        />
        <HeaderRow
          leftLabel="Mobile Number"
          leftValue={patient?.contacts?.[0]?.value || ""}
          rightLabel="Consultant"
          rightValue={consultantName || "-"}
        />
        <HeaderRow
          leftLabel="Accession No"
          leftValue={data.id ? String(data.id) : "-"}
          rightLabel="Referred By"
          rightValue={referredByName || "-"}
        />
        <HeaderRow
          leftLabel="Sample On"
          leftValue={formatDate(data.sampleTakenAt)}
          rightLabel="Report On"
          rightValue={formatDate(new Date())}
        />
      </tbody>
    </table>
  );
};

const HeaderRow = ({
  leftLabel,
  leftValue,
  rightLabel,
  rightValue,
}: {
  leftLabel: string;
  leftValue: string;
  rightLabel: string;
  rightValue: string;
}) => (
  <tr>
    <Cell className="w-[12%] bg-[#dedede] font-bold!">{leftLabel}</Cell>
    <Cell className="w-[38%]">{leftValue}</Cell>
    <Cell className="w-[12%] bg-[#dedede] font-bold!">{rightLabel}</Cell>
    <Cell className="w-[38%]">{rightValue}</Cell>
  </tr>
);

export default PathologyPatientDetailsTable;
