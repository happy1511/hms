"use client";

import React from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

const flag = (value: number | string, range: string) => {
  if (!range || value === "" || value === null || value === undefined)
    return "";
  const [low, high] = range.split("-").map(Number);
  const numeric = Number(value);
  if (Number.isNaN(numeric)) return "";
  if (numeric < low) return "L";
  if (numeric > high) return "H";
  return "";
};

const PathologyOrderExport = ({ data }: any) => (
  <div className="w-full bg-white text-[11px] text-black print:bg-white">
    <div className="mx-auto max-w-5xl space-y-4 bg-white p-4 print:max-w-none print:p-0">
      {/* Header */}
      <div className="flex items-start justify-between border border-black p-4">
        <div className="flex items-center gap-3">
          {data.lab.logo ? (
            <Image
              src={data.lab.logo}
              alt="Lab Logo"
              width={90}
              height={60}
              className="object-contain"
            />
          ) : null}
          <div>
            <p className="text-lg font-semibold">{data.lab.name}</p>
            <p className="text-xs">{data.lab.address}</p>
            <p className="text-xs">{data.lab.phone}</p>
            <p className="text-xs">{data.lab.email}</p>
          </div>
        </div>
        <div className="text-right text-xs">
          <p className="font-semibold">Report No: {data.report.reportNo}</p>
          <p>Specimen: {data.report.specimen}</p>
          <p>Collected: {data.report.collectionDate}</p>
          <p>Reported: {data.report.reportDate}</p>
        </div>
      </div>

      {/* Patient info */}
      <div className="grid grid-cols-2 gap-4 border border-black p-3 text-xs">
        <div className="space-y-1">
          <InfoLine label="Patient" value={data.patient.name} />
          <InfoLine label="Gender" value={data.patient.gender} />
          <InfoLine label="Patient UHID" value={data.patient.patientId} />
          <InfoLine label="Referred By" value={data.doctor.name} />
        </div>
        <div className="space-y-1 text-right">
          <InfoLine label="Age" value={data.patient.age ?? "-"} align="right" />
          <InfoLine
            label="Phone"
            value={data.patient.phone ?? "-"}
            align="right"
          />
          <InfoLine
            label="Email"
            value={data.patient.email ?? "-"}
            align="right"
          />
        </div>
      </div>

      {/* Tests */}
      <div className="overflow-hidden border border-black">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-[#dedede]">
              <Cell as="th" className="w-[32%] text-left">
                Test
              </Cell>
              <Cell as="th" className="w-[14%] text-right">
                Result
              </Cell>
              <Cell as="th" className="w-[14%] text-left">
                Unit
              </Cell>
              <Cell as="th" className="w-[30%] text-left">
                Reference Range
              </Cell>
              <Cell as="th" className="w-[10%] text-center">
                Flag
              </Cell>
            </tr>
          </thead>
          <tbody>
            {data.tests.map((group: any, gi: number) => (
              <React.Fragment key={`group-${gi}`}>
                <tr>
                  <Cell
                    colSpan={5}
                    className="bg-[#f7f7f7] font-semibold text-left"
                  >
                    {group.category}
                  </Cell>
                </tr>
                {group.items.map((t: any, idx: number) => (
                  <tr key={`${group.category}-${idx}`}>
                    <Cell className="text-left">{t.name}</Cell>
                    <Cell className="text-right">{t.result}</Cell>
                    <Cell className="text-left">{t.unit}</Cell>
                    <Cell className="text-left">{t.range}</Cell>
                    <Cell className="text-center font-semibold">
                      {flag(t.result, t.range)}
                    </Cell>
                  </tr>
                ))}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>

      {/* Remarks */}
      {data.remarks ? (
        <div className="border border-black p-3 text-xs">
          <p className="font-semibold">Clinical Remarks</p>
          <p>{data.remarks}</p>
        </div>
      ) : null}

      {/* Signature */}
      <div className="flex justify-end pt-6 text-xs">
        <div className="text-right">
          <p>-----------------------------</p>
          <p className="font-semibold">{data.pathologist}</p>
          <p>Pathologist</p>
        </div>
      </div>
    </div>
  </div>
);

const InfoLine = ({
  label,
  value,
  align = "left",
}: {
  label: string;
  value: string;
  align?: "left" | "right";
}) => (
  <p className={cn("text-[11px]", align === "right" ? "text-right" : "")}>
    <span className="font-semibold">{label}:</span> {value || "-"}
  </p>
);

const Cell = ({
  children,
  className = "",
  as = "td",
  colSpan,
}: {
  children: React.ReactNode;
  className?: string;
  as?: "td" | "th";
  colSpan?: number;
}) => {
  const Component = as;
  return (
    <Component
      colSpan={colSpan}
      className={cn(
        "border border-black px-2 py-1 align-middle text-[11px] font-normal",
        className,
      )}
    >
      {children}
    </Component>
  );
};

export default PathologyOrderExport;
