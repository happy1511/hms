"use client";

import CustomLayout from "@/components/common/CustomLayout";
import NoPermission from "@/components/common/NoPermission";
import PatientFormTabs from "@/components/patient/PatientFormTabs";
import { ActionType, ModuleType } from "@/generated/prisma/enums";
import { useProfile } from "@/hooks/query/auth";
import { useGetPatient } from "@/hooks/query/patient";
import { hasActionPermission } from "@/lib/utils";
import { LoaderIcon } from "lucide-react";
import { useParams } from "next/navigation";

const PatientForm = () => {
  const { patientId }: { patientId?: string } = useParams();
  const { data: profile } = useProfile(false);

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

  if (!profile) {
    return <div />;
  }

  const canCreate = hasActionPermission(
    profile.data,
    ModuleType.PATIENT_MASTER,
    ActionType.CREATE,
  );
  const canUpdate = hasActionPermission(
    profile.data,
    ModuleType.PATIENT_MASTER,
    ActionType.UPDATE,
  );

  if ((patientId && !canUpdate) || (!patientId && !canCreate)) {
    return (
      <CustomLayout title={patientId ? "Edit Patient" : "Create Patient"}>
        <NoPermission />
      </CustomLayout>
    );
  }

  return (
    <CustomLayout title={patientId ? "Edit Patient" : "Create Patient"}>
      {patientId ? <PatientFormTabs data={data} /> : <PatientFormTabs />}
    </CustomLayout>
  );
};

export default PatientForm;
