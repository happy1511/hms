import { ReactNode } from "react";

type PharmacySummaryRowProps = {
  label: string;
  value: ReactNode;
};

const PharmacySummaryRow = ({
  label,
  value,
}: PharmacySummaryRowProps) => {
  return (
    <div className="grid grid-cols-[1fr_120px] border-b border-black/15 last:border-b-0">
      <div className="border-r border-black/15 px-2 py-1 text-tiny font-medium">
        {label}
      </div>
      <div className="bg-white px-2 py-1 text-right text-tiny">{value}</div>
    </div>
  );
};

export default PharmacySummaryRow;
