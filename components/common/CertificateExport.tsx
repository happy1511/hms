"use client";

import CompanyPrintHeader from "@/components/common/CompanyPrintHeader";
import PrintBarcodeValue from "@/components/common/PrintBarcodeValue";
import { OpdCertificateType } from "@/lib/type";
import { formatAge } from "@/lib/utils";
import { format } from "date-fns";
import InfoRow from "../invoice/InfoRow";

const CertificateExport = ({ data }: { data: OpdCertificateType }) => {
  const patient = data.opd.patient;
  const patientName = [
    patient.title ? `${patient.title}.` : "",
    patient.firstName,
    patient.middleName,
    patient.lastName,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className="bg-white text-black">
      <CompanyPrintHeader className="mb-3" />
      <div className="bg-[#dedede] px-3 py-2 text-center font-semibold">
        {data.type === "MEDICAL"
          ? "MEDICAL CERTIFICATE"
          : "MEDICAL FITNESS CERTIFICATE"}
      </div>
      <div className="border-b border-black">
        <InfoRow
          leftLabel="Certificate No."
          leftValue={<PrintBarcodeValue value={data.id} />}
          rightLabel="Date"
          rightValue={format(data.createdAt, "dd/MM/yyyy hh:mm a")}
          cellClassName="border-b-0"
        />
        <InfoRow
          leftLabel="Patient UHID"
          leftValue={<PrintBarcodeValue value={patient.uhid} />}
          rightLabel="OPD No."
          rightValue={<PrintBarcodeValue value={data.opd.id} />}
          cellClassName="border-b-0"
        />
        <InfoRow
          leftLabel="Patient Name"
          leftValue={patientName || "--"}
          rightLabel="Age / Gender"
          rightValue={`${formatAge(patient.dob)} / ${patient.gender || "--"}`}
          cellClassName="border-b-0"
        />
        <InfoRow
          leftLabel="Consultant"
          leftValue={data.opd.consultantDoctor.user.name || "--"}
          rightLabel="OPD Date"
          rightValue={format(data.opd.opdDateTime, "dd/MM/yyyy hh:mm a")}
          cellClassName="border-b-0"
        />
      </div>
      <div
        className="min-h-80 px-4 py-5 leading-6"
        dangerouslySetInnerHTML={{ __html: data.content }}
      />
    </div>
  );
};

export default CertificateExport;
