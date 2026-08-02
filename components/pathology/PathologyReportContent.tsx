"use client";

import { PathologyTestResultType } from "@/lib/type";
import { Fragment, useMemo } from "react";
import Cell from "../invoice/Cell";

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
  if (resultNumber === null) return false;

  const minNumber = toFiniteNumber(min);
  const maxNumber = toFiniteNumber(max);

  if (minNumber !== null && resultNumber < minNumber) return true;
  if (maxNumber !== null && resultNumber > maxNumber) return true;

  return false;
};

const PathologyReportContent = ({
  data,
  className = "",
}: {
  data: PathologyTestResultType;
  className?: string;
}) => {
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
    <div className={className}>
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
                          ? "font-extrabold! text-black dark:text-black border-t-0 border-x-0 border-b border-[#dedede]!"
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

export default PathologyReportContent;
