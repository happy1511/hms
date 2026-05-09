"use client";

import { cn } from "@/lib/utils";
import PrintToolbar from "./PrintToolbar";
import { useState } from "react";
import CompanyPrintHeader from "@/components/common/CompanyPrintHeader";
import PrintBarcodeValue from "@/components/common/PrintBarcodeValue";
import { opdConsultationDetailsType } from "@/lib/type";
import InfoRow from "../invoice/InfoRow";

type AdviceItem = {
  id?: unknown;
  name?: unknown;
};

const valueOrDash = (value?: unknown) => {
  if (value === null || value === undefined || value === "") return "--";
  return String(value);
};

const formatDateOrDash = (value?: unknown, withTime: boolean = false) => {
  if (!value) return "--";
  const date = new Date(value as string | number | Date);
  if (Number.isNaN(date.getTime())) return "--";
  return withTime ? date.toLocaleString() : date.toLocaleDateString();
};

const listToText = (items?: AdviceItem[] | null) => {
  if (!items?.length) return "--";
  return items.map((item) => valueOrDash(item.name)).join(", ");
};

const stripHtmlToText = (value?: unknown) => {
  if (value === null || value === undefined || value === "") return "--";
  const normalized = String(value)
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n")
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/\r\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]{2,}/g, " ")
    .trim();

  return normalized || "--";
};

const OpdConsultationExport = ({
  data,
  patientOnly = false,
  showToolbar = true,
}: {
  data: opdConsultationDetailsType;
  patientOnly?: boolean;
  showToolbar?: boolean;
}) => {
  const [fontSize, setFontSize] = useState<number>(10);
  const patientName = [data.patient?.firstName, data.patient?.lastName]
    .filter(Boolean)
    .join(" ");
  const address = (() => {
    const homeAddress = data.patient?.addresses?.[0];
    if (!homeAddress) return "--";
    return [
      homeAddress.addressLineOne,
      homeAddress.addressLineTwo,
      homeAddress.addressLineThree,
      homeAddress.location?.city,
      homeAddress.location?.state,
      homeAddress.location?.postcode,
      homeAddress.location?.country,
    ]
      .filter(Boolean)
      .join(", ");
  })();

  const drugs =
    data.prescription?.drugs?.length && data.prescription.drugs.length > 0
      ? data.prescription.drugs
      : [{ name: "--", frequency: "--", days: "--", remarks: "--" }];

  return (
    <>
      {showToolbar && (
        <PrintToolbar fontSize={fontSize} onFontSizeChange={setFontSize} />
      )}
      <div
        style={{ fontSize }}
        className="w-full bg-white text-black print:bg-white overflow-auto"
      >
        <div className="mx-auto bg-white p-4 print:p-2 print:w-[190mm] print:max-w-[190mm] print:overflow-hidden">
          <CompanyPrintHeader />
          <header>
            <div className="flex items-center justify-center bg-[#dedede] px-3 py-2">
              <p className="font-semibold">OPD CONSULTATION</p>
            </div>
            <InfoRow
              leftLabel="Patient UHID"
              leftValue={<PrintBarcodeValue value={data.patient?.id} />}
              rightLabel="Date"
              rightValue={formatDateOrDash(data.createdAt, true)}
              cellClassName="border-b-0"
            />
            <InfoRow
              leftLabel="Patient"
              leftValue={valueOrDash(patientName)}
              rightLabel="OPD Number"
              rightValue={<PrintBarcodeValue value={data.opdId as number} />}
              cellClassName="border-b-0"
            />
            <InfoRow
              leftLabel="Gender"
              leftValue={valueOrDash(data.patient?.gender)}
              rightLabel="Consultant"
              rightValue={valueOrDash(data.consultantDoctorName)}
              cellClassName="border-b-0"
            />
            {/* <InfoRow
              leftLabel="Mobile No."
              leftValue={valueOrDash(mobile)}
              rightLabel="Referred By"
              rightValue={valueOrDash(data.referringDoctorName)}
            /> */}
            <InfoRow leftLabel="Address" leftValue={valueOrDash(address)} />
          </header>

          {!patientOnly && (
            <>
              <Section title="Vitals">
                <div className="grid grid-cols-4">
                  <KV label="Height" value={data.vitals?.height} />
                  <KV label="Weight" value={data.vitals?.weight} />
                  <KV
                    label="BP"
                    value={`${valueOrDash(data.vitals?.bpMm)}/${valueOrDash(data.vitals?.bpHg)}`}
                  />
                  <KV label="Pulse" value={data.vitals?.pulse} />
                  <KV label="RBS" value={data.vitals?.rbs} />
                  <KV label="RR" value={data.vitals?.rr} />
                  <KV label="SpO2" value={data.vitals?.spo2} />
                  <KV label="Temp" value={data.vitals?.temp} />
                </div>
              </Section>

              <Section title="Clinical Notes">
                <BodyRow label="Notes" value={data.notes} />
                <BodyRow
                  label="General Examination"
                  value={data.generalExaminations}
                />
                <BodyRow
                  label="Systemic Examination"
                  value={data.systemicExaminations}
                />
                <BodyRow label="Diagnosis" value={data.diagnosis} />
                <BodyRow label="Chronic Illness" value={data.chronicIllness} />
              </Section>

              <Section title="Advised Tests">
                <BodyRow
                  label="Pathology"
                  value={listToText(data.advisedPathologyTests)}
                />
                <BodyRow
                  label="Radiology"
                  value={listToText(data.advisedRadiologyTests)}
                />
              </Section>

              <Section title="Prescription">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-[#f2f2f2]">
                      <Cell as="th" className="w-[38%] text-left">
                        Drug
                      </Cell>
                      <Cell as="th" className="w-[16%] text-center">
                        Frequency
                      </Cell>
                      <Cell as="th" className="w-[16%] text-center">
                        Days
                      </Cell>
                      <Cell as="th" className="w-[30%] text-left">
                        Remarks
                      </Cell>
                    </tr>
                  </thead>
                  <tbody>
                    {drugs.map((drug, index) => (
                      <tr key={`drug-${index}`}>
                        <Cell className="text-left">
                          {valueOrDash(drug.name)}
                        </Cell>
                        <Cell className="text-center">
                          {valueOrDash(drug.frequency)}
                        </Cell>
                        <Cell className="text-center">
                          {valueOrDash(drug.days)}
                        </Cell>
                        <Cell className="text-left">
                          {valueOrDash(drug.remarks)}
                        </Cell>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Section>

              <Section title="Follow Up">
                <BodyRow
                  label="After Days"
                  value={valueOrDash(data.prescription?.followUpAfterDays)}
                />
                <BodyRow
                  label="Follow Up Date"
                  value={formatDateOrDash(data.prescription?.followUpDate)}
                />
                <BodyRow
                  label="Follow Up Advice"
                  value={stripHtmlToText(data.prescription?.followUpAdvice)}
                />
                <BodyRow
                  label="Other Advice"
                  value={stripHtmlToText(data.prescription?.otherAdvice)}
                />
              </Section>
            </>
          )}
        </div>
      </div>
    </>
  );
};

const Section = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => (
  <section className="border border-black">
    <div className="border-b border-black bg-[#f2f2f2] px-3 py-2 font-semibold">
      {title}
    </div>
    <div className="p-0">{children}</div>
  </section>
);

const KV = ({ label, value }: { label: string; value?: unknown }) => (
  <div className="flex min-h-[38px] items-center justify-between border-b border-r border-black px-2 py-1 last:border-r-0">
    <span className="font-semibold">{label}:</span>
    <span>{valueOrDash(value)}</span>
  </div>
);

const BodyRow = ({ label, value }: { label: string; value?: unknown }) => (
  <div className="flex min-h-10 border-b border-black">
    <div className="flex w-[26%] items-center border-r border-black bg-[#f9f9f9] px-3 py-2 font-semibold">
      {label}:
    </div>
    <div className="flex-1 items-center px-3 py-2">
      {stripHtmlToText(value)}
    </div>
  </div>
);

const Cell = ({
  children,
  className = "",
  as = "td",
}: {
  children: React.ReactNode;
  className?: string;
  as?: "td" | "th";
}) => {
  const Component = as;
  return (
    <Component
      className={cn(
        "border border-black px-2 py-1 align-middle font-normal",
        className,
      )}
    >
      {children}
    </Component>
  );
};

export default OpdConsultationExport;
