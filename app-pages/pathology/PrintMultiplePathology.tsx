"use client";

import PrintToolbar from "@/components/common/PrintToolbar";
import CompanyPrintHeader from "@/components/common/CompanyPrintHeader";
import PathologyPatientDetailsTable from "@/components/pathology/PathologyPatientDetailsTable";
import PathologyReportContent from "@/components/pathology/PathologyReportContent";
import { usePathologyOrderParametersList } from "@/hooks/query/pathology";
import { LoaderIcon } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";

const formatDate = (value?: string | Date | null) => {
  if (!value) return "-";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "-";
  return d.toLocaleString();
};

const PrintMultiplePathology = () => {
  const searchParams = useSearchParams();
  const [fontSize, setFontSize] = useState(10);

  const orderIds = useMemo(
    () =>
      (searchParams.get("orderIds") || "")
        .split(",")
        .map((value) => Number(value.trim()))
        .filter((value) => Number.isFinite(value) && value > 0),
    [searchParams],
  );

  const { data, isLoading } = usePathologyOrderParametersList(orderIds);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <LoaderIcon className="animate-spin size-4" />
      </div>
    );
  }

  if (!data?.length) return <div />;

  const firstOrder = data[0];

  return (
    <>
      <PrintToolbar fontSize={fontSize} onFontSizeChange={setFontSize} />
      <div style={{ fontSize }} className="overflow-auto">
        <div className="mx-auto bg-white p-4 print:p-2 print:w-[190mm] print:max-w-[190mm] print:overflow-hidden">
          <CompanyPrintHeader className="mb-2" />
          <PathologyPatientDetailsTable data={firstOrder} />

          <div className="space-y-4 pt-3">
            {data.map((order) => (
              <section key={order.id} className="print:break-inside-avoid">
                <div className="mb-2 rounded-sm border border-black/20 bg-[#f7f7f7] px-2 py-1 text-xs">
                  <div className="font-semibold">Accession No: {order.id}</div>
                  <div className="flex flex-wrap gap-x-4 gap-y-1">
                    <span>Sample On: {formatDate(order.sampleTakenAt)}</span>
                    <span>Report On: {formatDate(new Date())}</span>
                  </div>
                </div>
                <PathologyReportContent data={order} />
              </section>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default PrintMultiplePathology;
