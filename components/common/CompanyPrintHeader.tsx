"use client";

import { CompanyDetailsType } from "@/generated/prisma/enums";
import { useCompanyDetails } from "@/hooks/query/company";
import { cn } from "@/lib/utils";
import { useContext } from "react";
import { PrintPreferencesContext } from "@/components/common/PrintPreferencesProvider";

const CompanyPrintHeader = ({
  className = "",
  type = CompanyDetailsType.HOSPITAL,
}: {
  className?: string;
  type?: CompanyDetailsType;
}) => {
  const { includeHeader } = useContext(PrintPreferencesContext);
  const { data } = useCompanyDetails();

  if (!includeHeader) return null;

  const selectedDetails = data?.[type];

  const name = selectedDetails?.name?.trim() || "";
  const address = selectedDetails?.address?.trim() || "";
  const mobile = selectedDetails?.mobile?.trim() || "";

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
