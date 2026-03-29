"use client";

import { PathologyTestResultType } from "@/lib/type";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Fragment, useMemo } from "react";
import Cell from "../invoice/Cell";
import CompanyPrintHeader from "@/components/common/CompanyPrintHeader";

type Props = {
  data: PathologyTestResultType;
  layoutClassName?: string;
  showToolbar?: boolean;
};

const toFiniteNumber = (value: unknown): number | null => {
  if (value === null || value === undefined) return null;
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed || trimmed === "-") return null;
    const parsed = Number.parseFloat(trimmed);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
};

const isOutOfRange = (result: unknown, min: unknown, max: unknown) => {
  const resultNumber = toFiniteNumber(result);
  const minNumber = toFiniteNumber(min);
  const maxNumber = toFiniteNumber(max);
  if (resultNumber === null || minNumber === null || maxNumber === null)
    return false;
  return resultNumber < minNumber || resultNumber > maxNumber;
};

const formatDate = (value?: string | Date | null) => {
  if (!value) return "-";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "-";
  return format(d, "dd/MM/yy hh:mm a");
};

const PathologyPrintBody = ({ data, layoutClassName = "" }: Props) => {
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

  const sectionRows = useMemo(() => {
    return (
      data.test?.testHeaders?.map((header) => ({
        name: header.name || "",
        parameters: (header.testParameters || []).map((param) => {
          const result = param.pathologyTestResults?.[0];
          const ref = param.referenceRanges?.[0];
          const refString = ref
            ? [ref.lowerRange, ref.upperRange, ref.unit ? ref.unit : ""]
                .filter((v) => v !== undefined && v !== null && v !== "")
                .join(" - ")
            : "-";

          const resultValue =
            result?.textValue ??
            (result?.numericValue !== null && result?.numericValue !== undefined
              ? result.numericValue
              : "-");

          return {
            name: param.name,
            result: resultValue,
            reference: refString,
            min: ref?.lowerRange ?? null,
            max: ref?.upperRange ?? null,
          };
        }),
      })) || []
    );
  }, [data]);

  return (
    <div
      className={cn(
        "mx-auto w-full max-w-6xl bg-white p-4 print:max-w-none print:p-0",
        layoutClassName,
      )}
    >
      <CompanyPrintHeader className="mb-2" />
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
            rightValue={formatDate(data.resultEnteredAt)}
          />
        </tbody>
      </table>
      <div className="w-full py-1 capitalize text-center bg-[#dedede] font-bold">
        {data.test?.section}
      </div>
      <div className="py-1 flex justify-between font-bold">
        <div>{data.test?.name || "LAB REPORT"}</div>
        <div>
          Sample Type: {data.test?.sampleType || "-"},{" "}
          {data.test?.container || ""}
        </div>
      </div>

      <div>
        <table className="w-full">
          <thead>
            <tr className="bg-[#dedede]">
              <Cell
                as="th"
                className="w-[45%] font-bold!s text-left border-t-0 border-x-0 border-b border-[#dedede]!"
              >
                Test Name
              </Cell>
              <Cell
                as="th"
                className="w-[25%] font-bold! text-left border-t-0 border-x-0 border-b border-[#dedede]!"
              >
                Result
              </Cell>
              <Cell
                as="th"
                className="w-[30%] font-bold! text-left border-t-0 border-x-0 border-b border-[#dedede]!"
              >
                Biological Reference
              </Cell>
            </tr>
          </thead>
          <tbody>
            {sectionRows.map((section, idx) => (
              <Fragment key={`${section.name}-${idx}`}>
                <tr className="bg-[#f5f5f5] font-semibold">
                  <Cell
                    colSpan={3}
                    className="font-bold! border-t-0 border-x-0 border-b border-[#dedede]!"
                  >
                    {section.name}
                  </Cell>
                </tr>
                {section.parameters.map((param, pIdx) => (
                  <tr key={`${section.name}-${pIdx}`}>
                    <Cell className="border-t-0 border-x-0 border-b border-[#dedede]!">
                      {param.name}
                    </Cell>
                    <Cell
                      className={
                        isOutOfRange(param.result, param.min, param.max)
                          ? "font-bold! border-t-0 border-x-0 border-b border-[#dedede]!"
                          : "font-normal border-t-0 border-x-0 border-b border-[#dedede]!"
                      }
                    >
                      {param.result}
                    </Cell>
                    <Cell className="border-t-0 border-x-0 border-b border-[#dedede]!">
                      {param.reference}
                    </Cell>
                  </tr>
                ))}
              </Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
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

export default PathologyPrintBody;
