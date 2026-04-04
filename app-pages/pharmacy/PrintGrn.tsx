"use client";

import GrnPrintExport, {
  mapGrnToPrintExportProps,
} from "@/components/pharmacy/GrnPrintExport";
import { useGetGrn } from "@/hooks/query/pharmacyGrn";
import { LoaderIcon } from "lucide-react";
import { useParams } from "next/navigation";

const PrintGrn = () => {
  const { grnId }: { grnId: string } = useParams();
  const { data, isLoading } = useGetGrn(grnId);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <LoaderIcon className="size-4 animate-spin" />
      </div>
    );
  }

  if (!data) return <div />;

  return (
    <GrnPrintExport {...mapGrnToPrintExportProps(data)} />
  );
};

export default PrintGrn;
