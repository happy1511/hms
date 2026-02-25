"use client";

import RadiologyReportPDF from "@/components/common/RadiologyOrderExport";
import { useGetRadiologyOrderTemplate } from "@/hooks/query/radiology";
import { LoaderIcon } from "lucide-react";
import { useParams } from "next/navigation";

const PrintRadiologyOrder = () => {
  const { orderId }: { orderId: string } = useParams();

  const { data, isLoading } = useGetRadiologyOrderTemplate(orderId);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <LoaderIcon className="animate-spin size-4" />
      </div>
    );
  }

  if (!data) return <div />;

  return (
    <div className="w-full h-full">
      <RadiologyReportPDF data={data} />
    </div>
  );
};

export default PrintRadiologyOrder;
