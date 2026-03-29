"use client";

import PathologyOrderExport from "@/components/common/PathologyOrderExport";
import { useGetPathologyOrderParameters } from "@/hooks/query/pathology";
import { LoaderIcon } from "lucide-react";
import { useParams } from "next/navigation";

const formatPatientAddress = (patient: any) => {
  if (!patient?.addresses?.length) return "";

  // Prefer HOME address
  const homeAddress =
    patient.addresses.find((a: any) => a.type === "HOME") ||
    patient.addresses[0];

  if (!homeAddress) return "";

  const parts = [
    homeAddress.addressLineOne,
    homeAddress.addressLineTwo,
    homeAddress.addressLineThree,
    homeAddress.location?.postcode,
    homeAddress.location?.city,
    homeAddress.location?.state,
    homeAddress.location?.country,
  ].filter(Boolean);

  return parts.join(", ");
};

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

  const reportTests = data.test.testHeaders
    .sort((a: any, b: any) => a.displayOrder - b.displayOrder)
    .map((header: any) => ({
      category: header.name,
      items: header.testParameters
        .sort((a: any, b: any) => a.displayOrder - b.displayOrder)
        .map((param: any) => {
          const result = param.pathologyTestResults?.[0];

          return {
            name: param.name,
            result: result?.numericValue ?? result?.textValue ?? "",
            unit: "", // you can map later if unit field exists
            range: param.referenceRanges?.[0]?.range ?? "", // optional
          };
        }),
    }));

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
            patientId: patient.id,
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
