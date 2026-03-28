"use client";

import PrintToolbar from "@/components/common/PrintToolbar";
import PathologyPrintBody from "@/components/pathology/PathologyPrintBody";
import { usePathologyOrderParameters } from "@/hooks/query/pathology";
import { LoaderIcon } from "lucide-react";
import { useParams } from "next/navigation";
import { useState } from "react";

const PrintPathology = () => {
  const { orderId }: { orderId: string } = useParams();
  const { data, isLoading } = usePathologyOrderParameters(Number(orderId));
  const [fontSize, setFontSize] = useState(10);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <LoaderIcon className="animate-spin size-4" />
      </div>
    );
  }

  if (!data?.data) return <div />;

  return (
    <>
      <PrintToolbar fontSize={fontSize} onFontSizeChange={setFontSize} />
      <div style={{ fontSize }} className="overflow-auto">
        <div className="min-w-200 ">
          <PathologyPrintBody data={data.data} />
        </div>
      </div>
    </>
  );
};

export default PrintPathology;
