"use client";

import CustomLayout from "@/components/common/CustomLayout";
import PatientFormTabs from "@/components/patient/PatientFormTabs";
import { useGetPatient } from "@/hooks/query/patient";
import { LoaderIcon } from "lucide-react";
import { useParams } from "next/navigation";

const PatientForm = () => {
  const { patientId }: { patientId?: string } = useParams();

  const { data, isLoading: fetchingPatient } = useGetPatient(patientId);

  if (fetchingPatient) {
    return (
      <div className="flex justify-center items-center h-full">
        <LoaderIcon
          role="status"
          aria-label="Loading"
          className="size-4 animate-spin"
        />
      </div>
    );
  }

  return (
    <CustomLayout title={patientId ? "Edit Patient" : "Create Patient"}>
      {patientId ? <PatientFormTabs data={data} /> : <PatientFormTabs />}
    </CustomLayout>
  );
};

export default PatientForm;
