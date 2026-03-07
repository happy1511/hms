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
    return <div />;
  }

  const canCreatePathology = hasActionPermission(
    profile?.data,
    ModuleType.PATHOLOGY_TEST_MASTER,
    ActionType.CREATE,
  );
  const canCreateRadiology = hasActionPermission(
    profile?.data,
    ModuleType.RADIOLOGY_TEST_MASTER,
    ActionType.CREATE,
  );

  console.log(canCreatePathology, canCreateRadiology);
  return (
    <div className="flex gap-2">
      {canCreatePathology && (
        <CreatePathologyTestModal
          trigger={<CustomButton>Add Pathology Test</CustomButton>}
        />
      )}
      {canCreateRadiology && (
        <RadiologyTestForm
          trigger={<CustomButton>Add Radiology Test</CustomButton>}
        />
      )}
    </div>
  );
};

const ClinicalTests = () => {
  const { data: profile } = useProfile(false);
  const tabs = [];

  if (!profile) {
    return <div />;
  }

  const canViewPathology = hasActionPermission(
    profile?.data,
    ModuleType.PATHOLOGY_TEST_MASTER,
    ActionType.VIEW,
  );

  const canViewRadiology = hasActionPermission(
    profile?.data,
    ModuleType.RADIOLOGY_TEST_MASTER,
    ActionType.VIEW,
  );

  if (canViewPathology) {
    tabs.push({
      value: "pathology-tests",
      name: "Pathology Tests",
      content: <PathologyTests />,
    });
  }
  if (canViewRadiology) {
    tabs.push({
      value: "radiology-tests",
      name: "Radiology Tests",
      content: <RadiologyTests />,
    });
  }

  return (
    <CustomTabs
      tabs={tabs}
      buttons={<Buttons />}
      defaultValue="pathology-tests"
    />
  );
};

export default ClinicalTests;
