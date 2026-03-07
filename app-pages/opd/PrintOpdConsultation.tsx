"use client";

import OpdConsultationExport from "@/components/common/OpdConsultationExport";
import { useGetConsultationFile } from "@/hooks/query/opd";
import { LoaderIcon } from "lucide-react";
import { useParams } from "next/navigation";

const PrintOpdConsultation = () => {
  const { opdId }: { opdId: string } = useParams();
  const { data, isLoading } = useGetConsultationFile(opdId);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <LoaderIcon className="size-4 animate-spin" />
      </div>
    );
  }

  if (!data) return <div />;

  return <OpdConsultationExport data={data} />;
};

export default PrintOpdConsultation;
