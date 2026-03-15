"use client";

import { cn } from "@/lib/utils";
import CompanyPrintHeader from "@/components/common/CompanyPrintHeader";

const sanitizeInline = (html: string) => {
  if (!html) return "";
  return html
    .replace(/<strong>(.*?)<\/strong>/gi, "<b>$1</b>")
    .replace(/<br ?\/?>/gi, "<br />")
    .replace(/&nbsp;/g, " ");
};

const RadiologyReportPDF = ({ data }: any) => {
  const patient = data.patient;
  const reportHtml =
    sanitizeInline(data.results?.[0]?.value || data.test?.template?.content || "");

  return (
    <div className="w-full bg-white text-[11px] text-black print:bg-white">
      <div className="mx-auto max-w-4xl space-y-4 bg-white p-4 print:max-w-none print:p-0">
        <CompanyPrintHeader />
        {/* Header */}
        <div className="flex items-start justify-between border border-black p-4">
          <div>
            <p className="text-lg font-semibold">Radiology Report</p>
            <p className="text-xs">Report ID: RPT-{data.id}</p>
          </div>
          <div className="text-right text-xs">
            <p>{new Date(data.updatedAt).toLocaleDateString()}</p>
            <p>Department: {data.test.section}</p>
          </div>
        </div>

        {/* Patient info */}
        <div className="border border-black p-3 text-xs">
          <p className="font-semibold text-sm mb-2">Patient Information</p>
          <div className="grid grid-cols-2 gap-2">
            <InfoLine label="Name" value={`${patient.firstName} ${patient.lastName}`} />
            <InfoLine label="Gender" value={patient.gender} />
            <InfoLine label="UHID" value={patient.uhid} />
            <InfoLine label="Age" value={patient.age ?? "-"} />
          </div>
        </div>

        {/* Report Details */}
        <div className="border border-black p-3 text-xs">
          <p className="mb-2 text-sm font-semibold">Report Details</p>
          <div
            className="space-y-2 leading-relaxed"
            dangerouslySetInnerHTML={{ __html: reportHtml || "<p>--</p>" }}
          />
        </div>

        {/* Footer */}
        <div className="flex justify-end pt-4 text-xs">
          <div className="text-right">
            <p>--------------------------</p>
            <p>Authorized Signatory</p>
          </div>
        </div>
      </div>
    </div>
  );
};

const InfoLine = ({ label, value }: { label: string; value: string }) => (
  <p className="text-[11px]">
    <span className="font-semibold">{label}:</span> {value || "-"}
  </p>
);

export default RadiologyReportPDF;
