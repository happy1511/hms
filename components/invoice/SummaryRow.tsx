import Cell from "./Cell";

const SummaryRow = ({
  leftLabel,
  leftValue,
  rightLabel,
  rightValue,
  isLast = false,
}: {
  leftLabel: string;
  leftValue: string;
  rightLabel: string;
  rightValue: string;
  isLast?: boolean;
}) => (
  <tr className={isLast ? "" : "border-b border-black"}>
    <Cell className="w-[31%] bg-[#dedede] font-semibold text-left">
      {leftLabel}
    </Cell>
    <Cell className="w-[19%] text-right">{leftValue}</Cell>
    <Cell className="w-[31%] bg-[#dedede] font-semibold text-left">
      {rightLabel}
    </Cell>
    <Cell className="w-[19%] text-right">{rightValue}</Cell>
  </tr>
);

export default SummaryRow;
