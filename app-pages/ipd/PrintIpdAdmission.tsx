"use client";

import IpdAdmissionPrint from "@/components/ipd/IpdAdmissionPrint";
import { useGetIpdAdmissionPrint } from "@/hooks/query/ipd";
import { LoaderIcon } from "lucide-react";
import { useParams } from "next/navigation";

const PrintIpdAdmission = () => {
  const { ipdId }: { ipdId: string } = useParams();
  const { data, isLoading } = useGetIpdAdmissionPrint(ipdId);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <LoaderIcon className="size-4 animate-spin" />
      </div>
    );
  }

  if (!data) return <div />;

  return <IpdAdmissionPrint data={data} />;
};

export default PrintIpdAdmission;

