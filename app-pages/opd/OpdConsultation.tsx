"use client";

import CustomLayout from "@/components/common/CustomLayout";
import AdvisedPathologyTestResults from "../clinical-tests/pathology/AdvisedPathologyTestResults";
import CustomTabs from "@/components/common/CustomTabs";
import OpdConsultationForm from "./OpdConsultationForm";
import AdvisedRadiologyTestResults from "../clinical-tests/radiology/AdvisedPathologyTestResults";

const OpdConsultation = () => {
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
  ];

  return (
    <CustomLayout title="Consultation File">
      <CustomTabs
        tabs={tabs}
        classNames="border-none shadow-none p-0"
        defaultValue="current-consultation"
      />
    </CustomLayout>
  );
};

export default OpdConsultation;
