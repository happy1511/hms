import Cell from "./Cell";

const InfoRow = ({
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
  <table className="w-full border-collapse">
    <tbody>
      <tr>
        <Cell className="w-[21%] bg-[#dedede] font-semibold text-left">
          {leftLabel ? `${leftLabel}:` : ""}
        </Cell>
        <Cell className="w-[29%] text-left">{leftValue}</Cell>
        <Cell className="w-[21%] bg-[#dedede] font-semibold text-left">
          {rightLabel ? `${rightLabel}:` : ""}
        </Cell>
        <Cell className="w-[29%] text-left">{rightValue}</Cell>
      </tr>
    </tbody>
  </table>
);

export default InfoRow;
