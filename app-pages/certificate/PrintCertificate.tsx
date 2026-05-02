"use client";

import CertificateExport from "@/components/common/CertificateExport";
import PrintToolbar from "@/components/common/PrintToolbar";
import { useGetCertificate } from "@/hooks/query/certificate";
import { LoaderIcon } from "lucide-react";
import { useParams } from "next/navigation";
import { useState } from "react";

const PrintCertificate = () => {
  const { certificateId }: { certificateId: string } = useParams();
  const { data, isLoading } = useGetCertificate(Number(certificateId));
  const [fontSize, setFontSize] = useState<number>(10);

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <LoaderIcon className="size-4 animate-spin" />
      </div>
    );
  }

  if (!data) return <div />;

  return (
    <>
      <PrintToolbar fontSize={fontSize} onFontSizeChange={setFontSize} />
      <div style={{ fontSize }} className="overflow-auto bg-white text-black">
        <div className="mx-auto bg-white p-4 print:max-w-[190mm] print:w-[190mm] print:overflow-hidden print:p-2">
          <CertificateExport data={data} />
        </div>
      </div>
    </>
  );
};

export default PrintCertificate;
