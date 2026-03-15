"use client";

import IpdDischargePrint from "@/components/ipd/IpdDischargePrint";
import { useGetIpdDischargePrint } from "@/hooks/query/ipd";
import { LoaderIcon } from "lucide-react";
import { useParams } from "next/navigation";

const PrintIpdDischarge = () => {
  const { ipdId }: { ipdId: string } = useParams();
  const { data, isLoading } = useGetIpdDischargePrint(ipdId);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <LoaderIcon className="size-4 animate-spin" />
      </div>
    );
  }

  if (!data) return <div />;

  return <IpdDischargePrint data={data} />;
};

export default PrintIpdDischarge;

