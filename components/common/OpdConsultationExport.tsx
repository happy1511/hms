"use client";

import { cn } from "@/lib/utils";
import PrintToolbar from "./PrintToolbar";
import { useState } from "react";

type PrescribedDrugLine = {
  name?: string;
  frequency?: unknown;
  days?: unknown;
  remarks?: string | null;
};

type AdviceItem = {
  id?: unknown;
  name?: unknown;
};

type ConsultationExportData = {
  opdId?: unknown;
  createdAt?: unknown;
  patient?: {
    id?: number;
    firstName?: string;
    lastName?: string;
    uhid?: string;
    gender?: string;
    contacts?: { type?: string; value?: string }[];
    addresses?: {
      addressLineOne?: string | null;
      addressLineTwo?: string | null;
      addressLineThree?: string | null;
      location?: {
        city?: string | null;
        state?: string | null;
        country?: string | null;
        postcode?: string | null;
      } | null;
    }[];
  };
  consultantDoctorName?: string | null;
  referringDoctorName?: string | null;
  vitals?: {
    height?: unknown;
    weight?: unknown;
    bpMm?: unknown;
    bpHg?: unknown;
    pulse?: unknown;
    rbs?: unknown;
    rr?: unknown;
    spo2?: unknown;
    temp?: unknown;
  };
  notes?: string | null;
  generalExaminations?: string | null;
  systemicExaminations?: string | null;
  diagnosis?: string | null;
  chronicIllness?: string | null;
  advisedPathologyTests?: AdviceItem[] | null;
  advisedRadiologyTests?: AdviceItem[] | null;
  prescription?: {
    drugs?: PrescribedDrugLine[];
    followUpAfterDays?: unknown;
    followUpDate?: unknown;
    followUpAdvice?: string | null;
    otherAdvice?: string | null;
  };
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

const OpdConsultationExport = ({ data }: { data: ConsultationExportData }) => {
  const [fontSize, setFontSize] = useState<number>(10);
  const patientName = [data.patient?.firstName, data.patient?.lastName]
    .filter(Boolean)
    .join(" ");
  const mobile =
    data.patient?.contacts?.find((contact) => contact.type === "MOBILE")
      ?.value ||
    data.patient?.contacts?.find((contact) => contact.type === "PHONE")
      ?.value ||
    "--";
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
      <PrintToolbar fontSize={fontSize} onFontSizeChange={setFontSize} />
      <div
        style={{ fontSize }}
        className="w-full bg-white text-black print:bg-white"
      >
        <div className="mx-auto max-w-5xl space-y-4 bg-white p-4 print:max-w-none print:p-0">
          <header className="border border-black">
            <div className="flex items-center justify-center border-b border-black bg-[#dedede] px-3 py-2">
              <p className="font-semibold">OPD CONSULTATION</p>
            </div>
            <InfoRow
              label1="UHID"
              value1={valueOrDash(data.patient?.uhid)}
              label2="Date"
              value2={formatDateOrDash(data.createdAt, true)}
            />
            <InfoRow
              label1="Patient"
              value1={valueOrDash(patientName)}
              label2="OPD Number"
              value2={valueOrDash(data.opdId)}
            />
            <InfoRow
              label1="Gender"
              value1={valueOrDash(data.patient?.gender)}
              label2="Consultant"
              value2={valueOrDash(data.consultantDoctorName)}
            />
            <InfoRow
              label1="Mobile No."
              value1={valueOrDash(mobile)}
              label2="Referred By"
              value2={valueOrDash(data.referringDoctorName)}
            />
            <InfoRow label1="Address" value1={valueOrDash(address)} />
          </header>

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
                    <Cell className="text-left">{valueOrDash(drug.name)}</Cell>
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

const InfoRow = ({
  label1,
  value1,
  label2,
  value2,
}: {
  label1: string;
  value1: string;
  label2?: string;
  value2?: string;
}) => (
  <table className="w-full border-collapse border-t border-black">
    <tbody>
      <tr>
        <Cell className="w-[17%] bg-[#dedede] font-semibold text-left">
          {label1 ? `${label1}:` : ""}
        </Cell>
        <Cell className="w-[33%] text-left">{value1}</Cell>
        <Cell className="w-[17%] bg-[#dedede] font-semibold text-left">
          {label2 ? `${label2}:` : ""}
        </Cell>
        <Cell className="w-[33%] text-left">{value2}</Cell>
      </tr>
    </tbody>
  </table>
);

const KV = ({ label, value }: { label: string; value?: unknown }) => (
  <div className="flex min-h-[38px] items-center justify-between border-b border-r border-black px-2 py-1 last:border-r-0">
    <span className="font-semibold">{label}:</span>
    <span>{valueOrDash(value)}</span>
  </div>
);

const BodyRow = ({ label, value }: { label: string; value?: unknown }) => (
  <div className="flex min-h-[40px] border-b border-black">
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
