import { ReactNode } from "react";
import { cn } from "@/lib/utils";

type PharmacySummaryRowProps = {
  label: string;
  value: ReactNode;
  valueClassName?: string;
};

const PharmacySummaryRow = ({
  label,
  value,
  valueClassName,
}: PharmacySummaryRowProps) => {
  return (
    <div className="grid grid-cols-[1fr_120px] border-b border-black/15 last:border-b-0">
      <div className="border-r border-black/15 px-2 py-1 text-tiny font-medium">
        {label}
      </div>
      <div className={cn("bg-white px-2 py-1 text-right text-tiny", valueClassName)}>
        {value}
      </div>
    </div>
  );
};

export default PharmacySummaryRow;
