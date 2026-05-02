"use client";

import CompanyPrintHeader from "@/components/common/CompanyPrintHeader";
import PrintBarcodeValue from "@/components/common/PrintBarcodeValue";
import { OpdCertificateType } from "@/lib/type";
import { formatAge } from "@/lib/utils";
import { format } from "date-fns";

const CertificateExport = ({
  data,
}: {
  data: OpdCertificateType;
}) => {
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
    <div className="border border-black bg-white text-black">
      <CompanyPrintHeader className="mb-3" />
      <div className="border-y border-black bg-[#dedede] px-3 py-2 text-center font-semibold">
        {data.type === "MEDICAL"
          ? "MEDICAL CERTIFICATE"
          : "MEDICAL FITNESS CERTIFICATE"}
      </div>
      <div className="border-b border-black">
        <InfoRow
          label1="Certificate No."
          value1={<PrintBarcodeValue value={data.id} />}
          label2="Date"
          value2={format(data.createdAt, "dd/MM/yyyy hh:mm a")}
        />
        <InfoRow
          label1="Patient UHID"
          value1={<PrintBarcodeValue value={patient.id} />}
          label2="OPD No."
          value2={<PrintBarcodeValue value={data.opd.id} />}
        />
        <InfoRow
          label1="Patient Name"
          value1={patientName || "--"}
          label2="Age / Gender"
          value2={`${formatAge(patient.dob)} / ${patient.gender || "--"}`}
        />
        <InfoRow
          label1="Consultant"
          value1={data.opd.consultantDoctor.user.name || "--"}
          label2="OPD Date"
          value2={format(data.opd.opdDateTime, "dd/MM/yyyy hh:mm a")}
        />
      </div>
      <div
        className="min-h-80 px-4 py-5 leading-6"
        dangerouslySetInnerHTML={{ __html: data.content }}
      />
    </div>
  );
};

const InfoRow = ({
  label1,
  value1,
  label2,
  value2,
}: {
  label1: string;
  value1: React.ReactNode;
  label2?: string;
  value2?: React.ReactNode;
}) => (
  <div className="grid grid-cols-2 border-b border-black last:border-b-0">
    <InfoCell label={label1} value={value1} />
    {label2 ? <InfoCell label={label2} value={value2} borderedLeft /> : <div />}
  </div>
);

const InfoCell = ({
  label,
  value,
  borderedLeft = false,
}: {
  label: string;
  value: React.ReactNode;
  borderedLeft?: boolean;
}) => (
  <div className={`grid grid-cols-[130px_1fr] ${borderedLeft ? "border-l border-black" : ""}`}>
    <div className="border-r border-black px-2 py-1 font-semibold">{label}</div>
    <div className="px-2 py-1">{value}</div>
  </div>
);

export default CertificateExport;
