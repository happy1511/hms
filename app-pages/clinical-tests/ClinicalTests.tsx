"use client";

import CustomTabs from "@/components/common/CustomTabs";
import PathologyTests from "./pathology/PathologyTests";
import RadiologyTests from "./radiology/RadiologyTests";
import { useProfile } from "@/hooks/query/auth";
import { ActionType, ModuleType } from "@/generated/prisma/enums";
import { hasActionPermission } from "@/lib/utils";
import CreatePathologyTestModal from "./pathology/CreatePathologyTestModal";
import CustomButton from "@/components/common/CustomButton";
import RadiologyTestForm from "./radiology/RadiologyTestForm";

const Buttons = () => {
  const { data: profile } = useProfile(false);

  if (!profile) {
    return <></>;
  }
  const canCreate = hasActionPermission(
    profile?.data,
    ModuleType.PATHOLOGY_TEST_MASTER,
    ActionType.CREATE,
  );

  return (
    <div className="flex gap-2">
      {canCreate && (
        <CreatePathologyTestModal
          trigger={<CustomButton>Add Pathology Test</CustomButton>}
        />
      )}
      {canCreate && (
        <RadiologyTestForm
          trigger={<CustomButton>Add Radiology Test</CustomButton>}
        />
      )}
    </div>
  );
};

const tabs = [
  {
    value: "pathology-tests",
    name: "Pathology Tests",
    content: <PathologyTests />,
  },
  {
    value: "radiology-tests",
    name: "Radiology Tests",
    content: <RadiologyTests />,
  },
];

const ClinicalTests = () => {
  return (
    <CustomTabs
      tabs={tabs}
      buttons={<Buttons />}
      defaultValue="pathology-tests"
    />
  );
};

export default ClinicalTests;
