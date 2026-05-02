"use client";

import CustomFilters from "@/components/common/CustomFilters";
import CustomLayout from "@/components/common/CustomLayout";
import CustomTabs from "@/components/common/CustomTabs";
import NoPermission from "@/components/common/NoPermission";
import { ActionType, ModuleType } from "@/generated/prisma/enums";
import { useProfile } from "@/hooks/query/auth";
import { useDashboard } from "@/hooks/query/dashboard";
import { DashboardType, FilterConfig, FilterValues } from "@/lib/type";
import { hasActionPermission } from "@/lib/utils";
import { endOfDay, format, startOfDay } from "date-fns";
import { Bed, LoaderIcon, NotebookPen, UserPlus } from "lucide-react";
import Link from "next/link";
import { ReactNode, useState } from "react";
import HospitalDashboard from "./components/HospitalDashboard";
import LabDashboard from "./components/LabDashboard";
import PharmacyDashboard from "./components/PharmacyDashboard";

const QuickLinks = ({
  canCreateOpd,
  canCreateIpd,
  canCreateDayCare,
  canViewQueue,
}: {
  canCreateOpd: boolean;
  canCreateIpd: boolean;
  canCreateDayCare: boolean;
  canViewQueue: boolean;
}) => (
  <div className="grid grid-cols-4 gap-2 md:grid-cols-1 md:content-start">
    {canCreateOpd && (
      <Link
        href="/patient/search?opdCreate=true"
        className="flex items-center gap-2 border bg-secondary px-2 py-1.5 text-xs font-medium text-white max-md:flex-col"
      >
        <NotebookPen className="size-3" />
        <span>New OPD</span>
      </Link>
    )}
    {canCreateIpd && (
      <Link
        href="/patient/search?ipdCreate=true"
        className="flex items-center gap-2 border bg-yellow-400 px-2 py-1.5 text-xs font-medium text-white max-md:flex-col"
      >
        <Bed className="size-3" />
        <span>New IPD</span>
      </Link>
    )}
    {canCreateDayCare && (
      <Link
        href="/patient/search?ipdCreate=true&dayCare=true"
        className="flex items-center gap-2 border bg-secondary px-2 py-1.5 text-xs font-medium text-white max-md:flex-col"
      >
        <Bed className="size-3" />
        <span>New Day Care</span>
      </Link>
    )}
    {canViewQueue && (
      <Link
        href="/opd/walk-in"
        className="flex items-center gap-2 border bg-primary px-2 py-1.5 text-xs font-medium text-white max-md:flex-col"
      >
        <UserPlus className="size-3" />
        <span>Walk-In Queue</span>
      </Link>
    )}
  </div>
);

const Dashboard = () => {
  const [filters, setFilters] = useState<FilterValues>({
    createdAt: {
      from: startOfDay(new Date()),
      to: endOfDay(new Date()),
    },
  });
  const { data: profile } = useProfile(false);
  const { data, isPending, isFetching, refetch } = useDashboard(filters);

  const neededFilters: FilterConfig<FilterValues>[] = [
    { label: "Date Range", valueKey: "createdAt", type: "dateRange" },
  ];

  if (!profile) {
    return <div />;
  }

  const canViewHospital = Boolean(
    hasActionPermission(
      profile.data,
      ModuleType.HOSPITAL_DASHBOARD,
      ActionType.VIEW,
    ),
  );
  const canViewPharmacy = Boolean(
    hasActionPermission(
      profile.data,
      ModuleType.PHARMACY_DASHBOARD,
      ActionType.VIEW,
    ),
  );
  const canViewLab = Boolean(
    hasActionPermission(
      profile.data,
      ModuleType.LAB_DASHBOARD,
      ActionType.VIEW,
    ),
  );
  const canViewPathologyOrders = Boolean(
    hasActionPermission(
      profile.data,
      ModuleType.PATHOLOGY_ORDER,
      ActionType.VIEW,
    ),
  );
  const canViewRadiologyOrders = Boolean(
    hasActionPermission(
      profile.data,
      ModuleType.RADIOLOGY_ORDER,
      ActionType.VIEW,
    ),
  );

  if (!canViewHospital && !canViewPharmacy && !canViewLab) {
    return (
      <CustomLayout title="Dashboard">
        <NoPermission />
      </CustomLayout>
    );
  }

  const canCreateOpd = Boolean(
    hasActionPermission(profile.data, ModuleType.OPD_BILL, ActionType.CREATE),
  );
  const canCreateIpd = Boolean(
    hasActionPermission(profile.data, ModuleType.IPD_BILL, ActionType.CREATE),
  );
  const canCreateDayCare = Boolean(
    hasActionPermission(profile.data, ModuleType.DAY_CARE_IPD, ActionType.CREATE),
  );
  const canViewQueue = Boolean(
    hasActionPermission(profile.data, ModuleType.OPD_QUEUE, ActionType.VIEW),
  );

  const tabs = [
    canViewHospital
      ? {
          value: "hospital",
          name: "Hospital",
          content: data ? <HospitalDashboard data={data} /> : null,
        }
      : null,
    canViewPharmacy
      ? {
          value: "pharmacy",
          name: "Pharmacy",
          content: data ? <PharmacyDashboard data={data.pharmacy} /> : null,
        }
      : null,
    canViewLab
      ? {
          value: "lab",
          name: "Lab",
          content: data ? (
            <LabDashboard
              data={data.lab}
              canViewPathologyOrders={canViewPathologyOrders}
              canViewRadiologyOrders={canViewRadiologyOrders}
            />
          ) : null,
        }
      : null,
  ].filter(Boolean) as Array<{
    value: string;
    name: string;
    content: ReactNode;
  }>;
  const selectedDateRange =
    filters.createdAt && typeof filters.createdAt !== "string"
      ? filters.createdAt
      : null;

  return (
    <CustomLayout
      title="Dashboard"
      contentClassName={
        canViewHospital
          ? "grid h-full grid-cols-1 md:grid-cols-[15%_85%] md:space-x-3 max-md:space-y-3"
          : undefined
      }
    >
      {canViewHospital && (
        <QuickLinks
          canCreateOpd={canCreateOpd}
          canCreateIpd={canCreateIpd}
          canCreateDayCare={canCreateDayCare}
          canViewQueue={canViewQueue}
        />
      )}

      <div className="space-y-3">
        <CustomFilters<FilterValues>
          filters={neededFilters}
          defaultValues={filters}
          onRefresh={refetch}
          isLoading={isPending || isFetching}
          isRefreshing={isFetching}
          filtersContainerClassName="grid-cols-1 md:grid-cols-2"
          onSubmit={setFilters}
        />

        {!data && isPending ? (
          <div className="flex h-40 items-center justify-center border bg-white">
            <LoaderIcon className="size-4 animate-spin" />
          </div>
        ) : data ? (
          <div className="space-y-3">
            <CustomTabs
              defaultValue={tabs[0]?.value}
              tabs={tabs}
              classNames="border-none"
              buttons={
                selectedDateRange?.from && selectedDateRange?.to ? (
                  <div className="px-2 pb-1 text-[11px] font-medium text-muted-foreground">
                    {format(new Date(selectedDateRange.from), "dd/MM/yyyy")} -{" "}
                    {format(new Date(selectedDateRange.to), "dd/MM/yyyy")}
                  </div>
                ) : null
              }
            />
          </div>
        ) : null}

        {isFetching && (
          <div className="flex justify-end">
            <div className="inline-flex items-center gap-2 text-xs text-gray-500">
              <LoaderIcon className="size-3 animate-spin" />
              Updating...
            </div>
          </div>
        )}
      </div>
    </CustomLayout>
  );
};

export default Dashboard;
