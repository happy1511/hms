"use client";

import { CompanyDetailsType } from "@/generated/prisma/enums";
import { PathologyTestResultType } from "@/lib/type";
import { cn } from "@/lib/utils";
import CompanyPrintHeader from "@/components/common/CompanyPrintHeader";
import PathologyPatientDetailsTable from "./PathologyPatientDetailsTable";
import PathologyReportContent from "./PathologyReportContent";

type Props = {
  data: PathologyTestResultType;
  layoutClassName?: string;
  showToolbar?: boolean;
};

const PathologyPrintBody = ({ data, layoutClassName = "" }: Props) => {
  return (
    <div
      className={cn(
        "mx-auto w-full max-w-6xl bg-white p-4 print:max-w-none print:p-0",
        layoutClassName,
      )}
    >
      <CompanyPrintHeader className="mb-2" type={CompanyDetailsType.LAB} />
      <PathologyPatientDetailsTable data={data} />
      <PathologyReportContent data={data} />
    </div>
  );
};

export default PathologyPrintBody;
