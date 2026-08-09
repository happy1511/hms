"use client";

import PathologyOrderExport from "@/components/common/PathologyOrderExport";
import { useGetPathologyOrderParameters } from "@/hooks/query/pathology";
import { formatReferenceRangeText } from "@/lib/utils";
import { LoaderIcon } from "lucide-react";
import { useParams } from "next/navigation";

const PrintPathologyOrder = () => {
  const { orderId }: { orderId: string } = useParams();

  const { data, isLoading } = useGetPathologyOrderParameters(orderId);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <LoaderIcon className="animate-spin size-4" />
      </div>
    );
  }

  if (!data) return <div />;
  const patient = data.patient;

  const reportTests = [...data.test.testHeaders]
    .sort((a: any, b: any) => a.displayOrder - b.displayOrder)
    .map((header: any) => ({
      category: header.name,
      items: [...header.testParameters]
        .sort((a: any, b: any) => a.displayOrder - b.displayOrder)
        .map((param: any) => {
          const result = param.pathologyTestResults?.[0];
          const ref = param.referenceRanges?.[0];
          let resultValue = result?.numericValue ?? result?.textValue ?? "";

          if (result?.optionId) {
            const opt = param.parameterOptions?.find(
              (o: any) => o.id === result.optionId
            );
            if (opt) resultValue = opt.value;
          }

          return {
            name: param.name,
            result: resultValue,
            unit: ref?.unit ?? "",
            range: formatReferenceRangeText(ref),
          };
        }),
    }));

  if (data.test.parameters && data.test.parameters.length > 0) {
    reportTests.push({
      category: "Other Parameters",
      items: [...data.test.parameters]
        .sort((a: any, b: any) => a.displayOrder - b.displayOrder)
        .map((param: any) => {
          const result = param.pathologyTestResults?.[0];
          const ref = param.referenceRanges?.[0];
          let resultValue = result?.numericValue ?? result?.textValue ?? "";

          if (result?.optionId) {
            const opt = param.parameterOptions?.find(
              (o: any) => o.id === result.optionId
            );
            if (opt) resultValue = opt.value;
          }

          return {
            name: param.name,
            result: resultValue,
            unit: ref?.unit ?? "",
            range: formatReferenceRangeText(ref),
          };
        }),
    });
  }


  console.log("reportTests", reportTests);

  return (
    <div className="w-full h-full">
      <PathologyOrderExport
        data={{
          lab: {
            name: "Your Lab Name",
            address: "Lab Address",
            phone: "+91 XXXXX XXXXX",
            email: "lab@email.com",
            logo: "/logo.png",
          },

          patient: {
            name: `${patient.firstName} ${patient.lastName}`,
            age: "",
            gender: patient.gender,
            patientId: patient.uhid || "-",
          },

          doctor: {
            name: "-",
          },

          report: {
            reportNo: `RPT-${data.id}`,
            collectionDate: data.sampleTakenAt
              ? new Date(data.sampleTakenAt).toLocaleDateString()
              : "",
            reportDate: new Date(data.updatedAt).toLocaleDateString(),
            specimen: data.test.sampleType,
          },

          tests: reportTests,

          remarks: "",
          pathologist: "Authorized Signatory",
        }}
      />
    </div>
  );
};

export default PrintPathologyOrder;
