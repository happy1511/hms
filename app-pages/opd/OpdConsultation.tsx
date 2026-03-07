"use client";

import CustomLayout from "@/components/common/CustomLayout";
import AdvisedPathologyTestResults from "../clinical-tests/pathology/AdvisedPathologyTestResults";
import CustomTabs from "@/components/common/CustomTabs";
import OpdConsultationForm from "./OpdConsultationForm";
import AdvisedRadiologyTestResults from "../clinical-tests/radiology/AdvisedPathologyTestResults";
import CustomButton from "@/components/common/CustomButton";
import { ActionType, ModuleType } from "@/generated/prisma/enums";
import { useProfile } from "@/hooks/query/auth";
import { hasActionPermission } from "@/lib/utils";
import { useParams } from "next/navigation";
import OpdConsultationHistory from "./OpdConsultationHistory";

const OpdConsultation = () => {
  const { opdId }: { opdId?: string } = useParams();
  const { data: profile } = useProfile(false);

  const canPrint = profile
    ? hasActionPermission(
        profile.data,
        "CONSULTATION_FILE" as ModuleType,
        ActionType.PRINT,
      )
    : false;

  const tabs = [
    {
      value: "current-consultation",
      name: "Current Consultation",
      content: <OpdConsultationForm />,
    },
    {
      value: "pathology-tests",
      name: "Pathology Tests",
      content: <AdvisedPathologyTestResults />,
    },
    {
      value: "radiology-tests",
      name: "Radiology Tests",
      content: <AdvisedRadiologyTestResults />,
    },
    {
      value: "previous-history",
      name: "Previous History",
      content: <OpdConsultationHistory />,
    },
  ];

  return (
    <CustomLayout
      title="Consultation File"
      buttons={
        canPrint && opdId ? (
          <CustomButton
            type="button"
            onClick={() => window.open(`/opd/consultation-print/${opdId}`, "_blank")}
          >
            Print Consultation
          </CustomButton>
        ) : null
      }
    >
      <CustomTabs
        tabs={tabs}
        classNames="border-none shadow-none p-0"
        defaultValue="current-consultation"
      />
    </CustomLayout>
  );
};

export default OpdConsultation;
