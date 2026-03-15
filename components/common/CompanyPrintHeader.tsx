"use client";

import { useCompanyDetails } from "@/hooks/query/company";
import { cn } from "@/lib/utils";
import { useContext } from "react";
import { PrintPreferencesContext } from "@/components/common/PrintPreferencesProvider";

const CompanyPrintHeader = ({ className = "" }: { className?: string }) => {
  const { includeHeader } = useContext(PrintPreferencesContext);
  const { data } = useCompanyDetails();

  if (!includeHeader) return null;

  const name = data?.name?.trim() || "";
  const address = data?.address?.trim() || "";
  const mobile = data?.mobile?.trim() || "";

  if (!name && !address && !mobile) return null;

  return (
    <div className={cn("w-full border border-black px-3 py-2", className)}>
      <div className="text-center leading-tight space-y-1">
        {name && <div className="font-bold uppercase text-base">{name}</div>}
        {address && <div className="text-[11px]">{address}</div>}
        {mobile && (
          <div className="text-[11px]">
            <span className="font-bold">Mobile:</span> {mobile}
          </div>
        )}
      </div>
    </div>
  );
};

export default CompanyPrintHeader;
