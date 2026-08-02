"use client";

import { CompanyDetailsType } from "@/generated/prisma/enums";
import { useCompanyDetails } from "@/hooks/query/company";
import { cn } from "@/lib/utils";
import { useContext } from "react";
import { PrintPreferencesContext } from "@/components/common/PrintPreferencesProvider";
import Image from "next/image";

const CompanyPrintHeader = ({
  className = "",
  type = CompanyDetailsType.HOSPITAL,
}: {
  className?: string;
  type?: CompanyDetailsType;
}) => {
  const { includeHeader } = useContext(PrintPreferencesContext);
  const { data } = useCompanyDetails();

  const selectedDetails = data?.[type];

  const name = selectedDetails?.name?.trim() || "";
  const address = selectedDetails?.address?.trim() || "";
  const mobile = selectedDetails?.mobile?.trim() || "";
  const letterheadHeightCm =
    typeof selectedDetails?.letterheadHeightCm === "number" &&
    Number.isFinite(selectedDetails.letterheadHeightCm)
      ? Math.max(0, selectedDetails.letterheadHeightCm)
      : 0;
  const hasHeaderContent = Boolean(name || address || mobile);
  const shouldRenderContent = includeHeader && hasHeaderContent;

  if (!shouldRenderContent && letterheadHeightCm <= 0) return null;

  return (
    <div
      className={cn("w-full", className)}
      style={
        letterheadHeightCm > 0
          ? { minHeight: `${letterheadHeightCm}cm` }
          : undefined
      }
    >
      {shouldRenderContent ? (
        <div
          className="grid grid-cols-[100px_1fr_100px] w-full items-center border border-black px-3 py-2"
          style={
            letterheadHeightCm > 0
              ? { minHeight: `${letterheadHeightCm}cm` }
              : undefined
          }
        >
          <div className="flex items-center justify-start">
            <Image
              src="/exported-logo.png"
              alt="Logo"
              height={60}
              width={60}
              className="h-14 w-auto max-h-16 object-contain"
            />
          </div>
          <div className="text-center leading-tight space-y-1">
            {name && (
              <div className="font-bold uppercase text-base">{name}</div>
            )}
            {address && <div className="text-[11px]">{address}</div>}
            {mobile && (
              <div className="text-[11px]">
                <span className="font-bold">Mobile:</span> {mobile}
              </div>
            )}
          </div>
          <div />
        </div>
      ) : null}
    </div>
  );
};

export default CompanyPrintHeader;
