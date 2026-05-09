import { cn } from "@/lib/utils";
import Cell from "./Cell";
import { ReactNode } from "react";

const InfoRow = ({
  leftLabel,
  leftValue,
  rightLabel,
  rightValue,
  cellClassName,
}: {
  leftLabel: string;
  leftValue: string | ReactNode;
  rightLabel?: string;
  rightValue?: string | ReactNode;
  cellClassName?: string;
}) => (
  <table className="w-full border-collapse">
    <tbody>
      <tr>
        <Cell
          className={cn(
            "bg-[#dedede] font-semibold text-left",
            rightLabel && rightValue ? "w-[21%] " : "w-[21%]",
            cellClassName,
          )}
        >
          {leftLabel ? `${leftLabel}:` : ""}
        </Cell>
        <Cell
          className={cn(
            "text-left",
            rightLabel && rightValue ? "w-[29%] " : "w-[79%]",
            cellClassName,
          )}
        >
          {leftValue}
        </Cell>
        {rightLabel && rightValue && (
          <>
            <Cell
              className={cn(
                "w-[21%] bg-[#dedede] font-semibold text-left",
                cellClassName,
              )}
            >
              {rightLabel ? `${rightLabel}:` : ""}
            </Cell>
            <Cell className={cn("w-[29%] text-left", cellClassName)}>
              {rightValue}
            </Cell>
          </>
        )}
      </tr>
    </tbody>
  </table>
);

export default InfoRow;
