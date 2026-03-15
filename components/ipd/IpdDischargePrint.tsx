"use client";

import CompanyPrintHeader from "@/components/common/CompanyPrintHeader";
import PrintToolbar from "@/components/common/PrintToolbar";
import { IpdDischargePrintResponse } from "@/hooks/query/ipd";
import { cn, formatAge } from "@/lib/utils";
import { type ReactNode, useMemo, useState } from "react";

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

const Cell = ({
  as = "td",
  className,
  children,
  colSpan,
}: {
  as?: "td" | "th";
  className?: string;
  children: ReactNode;
  colSpan?: number;
}) => {
  const Tag = as;
  return (
    <Tag
      colSpan={colSpan}
      className={cn("border border-black/30 p-1 align-top", className)}
    >
      {children}
    </Tag>
  );
};

const IpdDischargePrint = ({ data }: { data: IpdDischargePrintResponse }) => {
  const [fontSize, setFontSize] = useState<number>(10);

  const patientName = useMemo(() => {
    return [data.patient?.firstName, data.patient?.lastName]
      .filter(Boolean)
      .join(" ");
  }, [data.patient?.firstName, data.patient?.lastName]);

  const ageSex = useMemo(() => {
    const age = data.patient?.dob ? formatAge(data.patient.dob) : "--";
    const gender = valueOrDash(data.patient?.gender);
    return `${age}, ${gender}`;
  }, [data.patient?.dob, data.patient?.gender]);

  const contact = useMemo(() => {
    const mobile =
      data.patient?.contacts?.find((c) => c.type === "MOBILE")?.value ||
      data.patient?.contacts?.find((c) => c.type === "PHONE")?.value;
    return valueOrDash(mobile);
  }, [data.patient?.contacts]);

  const address = useMemo(() => {
    const home = data.patient?.addresses?.[0] as any;
    if (!home) return "--";
    return [
      home.addressLineOne,
      home.addressLineTwo,
      home.addressLineThree,
      home.location?.city,
      home.location?.state,
      home.location?.postcode,
      home.location?.country,
    ]
      .filter(Boolean)
      .join(", ");
  }, [data.patient?.addresses]);

  const consultantName = data.consultantDoctor?.user?.name;
  const referredByName = data.referringDoctor?.user?.name;

  const bedText = useMemo(() => {
    const bed = data.bed;
    if (!bed) return "--";
    const dept = bed.room?.roomType?.department?.name;
    const roomType = bed.room?.roomType?.name;
    const room = bed.room?.name;
    const bedNo = bed.bedNumber || bed.name;
    return [dept, roomType, room, bedNo].filter(Boolean).join(" : ");
  }, [data.bed]);

  const summary = data.dischargeSummary;
  const summaryIpdDate = summary?.ipdDateTime || data.ipdDateTime;

  const drugs = summary?.drugs?.length
    ? summary.drugs
    : [
        {
          drug: { name: "--" },
          unit: "--",
          route: "--",
          frequency: "--",
          days: "--",
          remarks: "--",
        } as any,
      ];

  return (
    <>
      <PrintToolbar fontSize={fontSize} onFontSizeChange={setFontSize} />
      <div style={{ fontSize }} className="w-full bg-white">
        <CompanyPrintHeader />

        <div className="bg-white text-black">
          <div className="mx-auto w-full max-w-275 bg-white p-6 print:max-w-none print:border-0 print:p-0">
            <div className="text-center border-t border-x font-semibold py-1">
              DISCHARGE SUMMARY
            </div>

            <table className="w-full border-collapse">
              <tbody>
                <tr>
                  <Cell className="bg-[#f2f2f2] font-semibold">IPD No:</Cell>
                  <Cell>{valueOrDash(data.id)}</Cell>
                  <Cell className="bg-[#f2f2f2] font-semibold">UHID:</Cell>
                  <Cell>{valueOrDash(data.patient?.uhid)}</Cell>
                </tr>
                <tr>
                  <Cell className="bg-[#f2f2f2] font-semibold">Patient:</Cell>
                  <Cell>{valueOrDash(patientName)}</Cell>
                  <Cell className="bg-[#f2f2f2] font-semibold">Age/Sex:</Cell>
                  <Cell>{valueOrDash(ageSex)}</Cell>
                </tr>
                <tr>
                  <Cell className="bg-[#f2f2f2] font-semibold">Address:</Cell>
                  <Cell colSpan={3}>{valueOrDash(address)}</Cell>
                </tr>
                <tr>
                  <Cell className="bg-[#f2f2f2] font-semibold">Contact:</Cell>
                  <Cell>{valueOrDash(contact)}</Cell>
                  <Cell className="bg-[#f2f2f2] font-semibold">
                    Billing Type:
                  </Cell>
                  <Cell>{valueOrDash((data.invoice as any)?.billingType)}</Cell>
                </tr>
                <tr>
                  <Cell className="bg-[#f2f2f2] font-semibold">
                    Admission Date/Time:
                  </Cell>
                  <Cell>{formatDateOrDash(data.ipdDateTime, true)}</Cell>
                  <Cell className="bg-[#f2f2f2] font-semibold">
                    Discharged Date/Time:
                  </Cell>
                  <Cell>{formatDateOrDash(data.dischargedAt, true)}</Cell>
                </tr>
                <tr>
                  <Cell className="bg-[#f2f2f2] font-semibold">
                    Consultant:
                  </Cell>
                  <Cell>{valueOrDash(consultantName)}</Cell>
                  <Cell className="bg-[#f2f2f2] font-semibold">Bed:</Cell>
                  <Cell>{valueOrDash(bedText)}</Cell>
                </tr>
                <tr>
                  <Cell className="bg-[#f2f2f2] font-semibold">
                    Referred By:
                  </Cell>
                  <Cell colSpan={3}>{valueOrDash(referredByName)}</Cell>
                </tr>
              </tbody>
            </table>

            <div className="p-2 space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <div className="font-semibold">IPD Date:</div>
                  <div>{formatDateOrDash(summaryIpdDate, true)}</div>
                </div>
                <div>
                  <div className="font-semibold">
                    Unfit for further medical surgical management:
                  </div>
                  <div>
                    {summary?.isUnfitForFurtherManagement ? "Yes" : "No"}
                  </div>
                </div>
              </div>

              <div>
                <div className="font-semibold">Diagnosis:</div>
                <div className="whitespace-pre-line">
                  {valueOrDash(summary?.diagnosis)}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <div className="font-semibold">Procedure Date:</div>
                  <div>{formatDateOrDash(summary?.procedureDate)}</div>
                </div>
                <div>
                  <div className="font-semibold">
                    When to obtain urgent care?:
                  </div>
                  <div className="whitespace-pre-line">
                    {valueOrDash(summary?.urgentCareWhen)}
                  </div>
                </div>
              </div>

              <div>
                <div className="font-semibold">Procedure:</div>
                <div className="whitespace-pre-line">
                  {stripHtmlToText(summary?.procedure)}
                </div>
              </div>

              <div>
                <div className="font-semibold">Course in the Hospital:</div>
                <div className="whitespace-pre-line">
                  {stripHtmlToText(summary?.courseInHospital)}
                </div>
              </div>

              <div>
                <div className="font-semibold">Investigation Results:</div>
                <div className="whitespace-pre-line">
                  {valueOrDash(summary?.investigationResults)}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <div className="font-semibold">Allergies:</div>
                  <div>{valueOrDash(summary?.allergies)}</div>
                </div>
                <div>
                  <div className="font-semibold">Diet:</div>
                  <div>{valueOrDash(summary?.diet)}</div>
                </div>
                <div>
                  <div className="font-semibold">Physical Activity:</div>
                  <div>{valueOrDash(summary?.physicalActivity)}</div>
                </div>
              </div>

              <div>
                <div className="font-semibold">Transferred:</div>
                <div>{summary?.isTransferred ? "Yes" : "No"}</div>
              </div>

              <div>
                <div className="font-semibold">Remarks:</div>
                <div className="whitespace-pre-line">
                  {valueOrDash(summary?.remarks)}
                </div>
              </div>

              <div className="border-t border-black/30 pt-2">
                <div className="font-semibold mb-1">Prescription</div>
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-[#f2f2f2]">
                      <Cell as="th" className="text-left w-[30%]">
                        Drug
                      </Cell>
                      <Cell as="th" className="text-center w-[10%]">
                        Unit
                      </Cell>
                      <Cell as="th" className="text-left w-[18%]">
                        Route
                      </Cell>
                      <Cell as="th" className="text-center w-[10%]">
                        Freq.
                      </Cell>
                      <Cell as="th" className="text-center w-[10%]">
                        Days
                      </Cell>
                      <Cell as="th" className="text-left w-[22%]">
                        Remarks
                      </Cell>
                    </tr>
                  </thead>
                  <tbody>
                    {drugs.map((drug, index) => (
                      <tr key={`drug-${index}`}>
                        <Cell className="text-left">
                          {valueOrDash((drug as any)?.drug?.name)}
                        </Cell>
                        <Cell className="text-center">
                          {valueOrDash(drug.unit)}
                        </Cell>
                        <Cell className="text-left">
                          {valueOrDash(drug.route)}
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
              </div>

              <div className="border-t border-black/30 pt-2 space-y-1">
                <div className="font-semibold">Follow Up</div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="font-semibold">After Days: </span>
                    {valueOrDash(summary?.followUpAfterDays)}
                  </div>
                  <div>
                    <span className="font-semibold">On Date: </span>
                    {formatDateOrDash(summary?.followUpDate)}
                  </div>
                </div>
                <div>
                  <div className="font-semibold">Follow Up Advice:</div>
                  <div className="whitespace-pre-line">
                    {valueOrDash(summary?.followUpAdvice)}
                  </div>
                </div>
                <div>
                  <div className="font-semibold">Other Advice:</div>
                  <div className="whitespace-pre-line">
                    {valueOrDash(summary?.otherAdvice)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default IpdDischargePrint;
