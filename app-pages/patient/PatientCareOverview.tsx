"use client";

import IPDs from "@/app-pages/ipd/Ipds";
import OPDs from "@/app-pages/opd/Opds";
import CustomButton from "@/components/common/CustomButton";
import CustomLayout from "@/components/common/CustomLayout";
import CustomTabs from "@/components/common/CustomTabs";
import NoPermission from "@/components/common/NoPermission";
import PatientCareFilters from "@/components/patient/PatientCareFilters";
import { ActionType, ModuleType } from "@/generated/prisma/enums";
import { useProfile } from "@/hooks/query/auth";
import { FilterValues } from "@/lib/type";
import { hasActionPermission } from "@/lib/utils";
import { endOfDay, startOfDay } from "date-fns";
import { useRouter } from "next/navigation";
import { ReactNode, useState } from "react";

type PatientCareTab = "opd" | "ipd" | "daycare";

const PatientCareButtons = ({
  canCreateOpd,
  canCreateIpd,
  canCreateDayCare,
}: {
  canCreateOpd: boolean;
  canCreateIpd: boolean;
  canCreateDayCare: boolean;
}) => {
  const router = useRouter();

  if (!canCreateOpd && !canCreateIpd && !canCreateDayCare) {
    return null;
  }

  return (
    <div className="flex gap-2">
      {canCreateOpd && (
        <CustomButton
          onClick={() => router.push("/patient/search?opdCreate=true")}
        >
          New OPD
        </CustomButton>
      )}
      {canCreateIpd && (
        <CustomButton
          variant={canCreateOpd ? "secondary" : "default"}
          onClick={() => router.push("/patient/search?ipdCreate=true")}
        >
          New IPD
        </CustomButton>
      )}
      {canCreateDayCare && (
        <CustomButton
          variant={canCreateOpd || canCreateIpd ? "secondary" : "default"}
          onClick={() =>
            router.push("/patient/search?ipdCreate=true&dayCare=true")
          }
        >
          New Day Care
        </CustomButton>
      )}
    </div>
  );
};

const PatientCareOverview = () => {
  const [activeTab, setActiveTab] = useState<PatientCareTab>("opd");
  const [filters, setFilters] = useState<FilterValues>({
    createdAt: {
      from: startOfDay(new Date()),
      to: endOfDay(new Date()),
    },
  });
  const { data: profile } = useProfile(false);
  const filterKey = JSON.stringify(filters);

  const tabs = !profile?.data
    ? []
    : ([
        hasActionPermission(profile.data, ModuleType.OPD_BILL, ActionType.VIEW)
          ? {
              value: "opd",
              name: "OPD Patients",
              content: (
                <OPDs
                  key={`opd-${filterKey}`}
                  embedded
                  hideFilters
                  externalFilters={filters}
                />
              ),
            }
          : null,
        hasActionPermission(profile.data, ModuleType.IPD_BILL, ActionType.VIEW)
          ? {
              value: "ipd",
              name: "IPD Patients",
              content: (
                <IPDs
                  key={`ipd-${filterKey}`}
                  embedded
                  hideFilters
                  externalFilters={filters}
                />
              ),
            }
          : null,
        hasActionPermission(
          profile.data,
          ModuleType.DAY_CARE_IPD,
          ActionType.VIEW,
        )
          ? {
              value: "daycare",
              name: "Day Care Patients",
              content: (
                <IPDs
                  key={`daycare-${filterKey}`}
                  embedded
                  hideFilters
                  dayCare
                  externalFilters={filters}
                />
              ),
            }
          : null,
      ].filter(Boolean) as {
        value: PatientCareTab;
        name: string;
        content: ReactNode;
      }[]);

  if (!profile) {
    return <div />;
  }

  const selectedTab = tabs.some((tab) => tab.value === activeTab)
    ? activeTab
    : tabs[0]?.value;

  const canCreateOpd = hasActionPermission(
    profile.data,
    ModuleType.OPD_BILL,
    ActionType.CREATE,
  );
  const canCreateIpd = hasActionPermission(
    profile.data,
    ModuleType.IPD_BILL,
    ActionType.CREATE,
  );
  const canCreateDayCare = hasActionPermission(
    profile.data,
    ModuleType.DAY_CARE_IPD,
    ActionType.CREATE,
  );

  return (
    <CustomLayout
      title="Patient Care Overview"
      buttons={
        <PatientCareButtons
          canCreateOpd={Boolean(canCreateOpd)}
          canCreateIpd={Boolean(canCreateIpd)}
          canCreateDayCare={Boolean(canCreateDayCare)}
        />
      }
      contentClassName="space-y-3"
    >
      {tabs.length ? (
        <>
          <PatientCareFilters
            defaultValues={filters}
            onSubmit={(values) => setFilters(values)}
          />
          <CustomTabs
            value={selectedTab}
            onValueChange={(value) => setActiveTab(value as PatientCareTab)}
            tabs={tabs}
            classNames="shadow-none border-none p-0"
          />
        </>
      ) : (
        <NoPermission />
      )}
    </CustomLayout>
  );
};

export default PatientCareOverview;
