"use client";

import PrintToolbar from "@/components/common/PrintToolbar";
import InvoicePrintDayWise from "@/components/invoice/InvoicePrintDayWise";
import InvoicePrintDetails from "@/components/invoice/InvoicePrintDetails";
import InvoicePrintSummary from "@/components/invoice/InvoicePrintSummary";
import { useInvoiceDetails } from "@/hooks/query/invoice";
import { InvoiceGroupedBySection } from "@/lib/type";
import { filterSections } from "@/lib/utils";
import { LoaderIcon } from "lucide-react";
import { useParams, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";

type InvoicePrintBodyProps = {
  data: InvoiceGroupedBySection;
  sectionIds?: Set<string> | null;
};

export const InvoiceDetailsPrintBody = ({
  data,
  sectionIds = null,
}: InvoicePrintBodyProps) => {
  const filteredData = useMemo(
    () => filterSections(data, sectionIds),
    [data, sectionIds],
  );
  return <InvoicePrintDetails data={filteredData} />;
};

export const InvoiceDayWisePrintBody = ({
  data,
  sectionIds = null,
}: InvoicePrintBodyProps) => {
  const searchParams = useSearchParams();
  const selectedDate = searchParams.get("date");
  const targetDate = selectedDate
    ? new Date(selectedDate)
    : new Date(data.createdAt);
  const targetDay = targetDate.toISOString().slice(0, 10);

  const filteredData = useMemo(
    () => filterSections(data, sectionIds),
    [data, sectionIds],
  );

  return <InvoicePrintDayWise data={filteredData} targetDay={targetDay} />;
};

export const InvoiceCompactPrintBody = ({
  data,
  sectionIds = null,
}: InvoicePrintBodyProps) => {
  const filteredData = useMemo(
    () => filterSections(data, sectionIds),
    [data, sectionIds],
  );
  return <InvoicePrintDetails data={filteredData} hideCustomerInfo />;
};

const PrintInvoice = ({
  mode = "details",
}: {
  mode?: "details" | "dayWise" | "compact" | "summary";
}) => {
  const { invoiceId }: { invoiceId: string } = useParams();
  const searchParams = useSearchParams();
  const sectionIdsParam = searchParams.get("sectionIds");
  const sectionIdSet =
    sectionIdsParam && sectionIdsParam.trim() !== ""
      ? new Set(sectionIdsParam.split(",").map((id) => id.trim()))
      : null;

  const { data, isLoading } = useInvoiceDetails({
    invoiceId: Number(invoiceId),
  });
  const [fontSize, setFontSize] = useState<number>(10);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <LoaderIcon className="animate-spin size-4" />
      </div>
    );
  }

  if (!data) return <div />;

  const renderLayout = () => {
    switch (mode) {
      case "dayWise":
        return (
          <InvoiceDayWisePrintBody data={data} sectionIds={sectionIdSet} />
        );
      case "details":
        return (
          <InvoiceDetailsPrintBody data={data} sectionIds={sectionIdSet} />
        );
      case "compact":
        return (
          <InvoiceCompactPrintBody data={data} sectionIds={sectionIdSet} />
        );
      case "summary":
        return <InvoicePrintSummary data={data} />;
    }
  };

  return (
    <>
      <PrintToolbar fontSize={fontSize} onFontSizeChange={setFontSize} />
      <div style={{ fontSize }} className="bg-white text-black overflow-auto ">
        <div className="min-w-200 ">{renderLayout()}</div>
      </div>
    </>
  );
};

export default PrintInvoice;
