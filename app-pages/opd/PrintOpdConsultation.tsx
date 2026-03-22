"use client";

import OpdConsultationExport from "@/components/common/OpdConsultationExport";
import { useGetConsultationFile } from "@/hooks/query/opd";
import { LoaderIcon } from "lucide-react";
import { useParams, useSearchParams } from "next/navigation";

const PrintOpdConsultation = () => {
  const { opdId }: { opdId: string } = useParams();
  const searchParams = useSearchParams();
  const doctorId = searchParams.get("doctorId") || undefined;
  const patientOnly = ["1", "true", "yes"].includes(
    (searchParams.get("patientOnly") || "").toLowerCase(),
  );
  const { data, isLoading } = useGetConsultationFile(opdId, doctorId);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <LoaderIcon className="size-4 animate-spin" />
      </div>
    );
  }

  if (!data) return <div />;

  return <OpdConsultationExport data={data} patientOnly={patientOnly} />;
};

export default PrintOpdConsultation;
