"use client";

import CustomFilters from "@/components/common/CustomFilters";
import CustomLayout from "@/components/common/CustomLayout";
import { ActionType, ModuleType } from "@/generated/prisma/enums";
import { useProfile } from "@/hooks/query/auth";
import { useDashboard } from "@/hooks/query/dashboard";
import { FilterConfig, FilterValues } from "@/lib/type";
import { hasActionPermission } from "@/lib/utils";
import { endOfDay, startOfDay } from "date-fns";
import { Bed, LoaderIcon, NotebookPen, UserPlus } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

const StatCard = ({
  title,
  opd,
  ipd,
}: {
  title: string;
  opd: number;
  ipd: number;
}) => (
  <div className="bg-white p-2 border">
    <h3 className="font-semibold text-gray-600 text-sm mb-2">{title}</h3>
    <div className="flex justify-between text-tiny">
      <div>
        <p className="text-gray-500">OPD</p>
        <p className="font-bold text-sm">{opd}</p>
      </div>
      <div>
        <p className="text-gray-500">IPD</p>
        <p className="text-sm font-bold text-sm">{ipd}</p>
      </div>
    </div>
  </div>
);

const PaymentModeStats = ({
  data,
}: {
  data: { mode: string; amount: number }[];
}) => (
  <div className="bg-white p-2 border col-span-3">
    <h3 className="font-semibold text-gray-600 mb-3 text-sm">
      Transactions by Mode
    </h3>

    <div className="grid grid-cols-3 gap-3 text-tiny">
      {data.map((item) => (
        <div
          key={item.mode}
          className="flex justify-between border rounded-lg p-1"
        >
          <span className="text-gray-500">{item.mode}</span>
          <span className="font-bold text-sm">{item.amount}</span>
        </div>
      ))}
    </div>
  </div>
);

const SectionBillingStats = ({
  data,
}: {
  data: { id: number; name: string; total: number }[];
}) => (
  <div className="bg-white p-2 border col-span-3">
    <h3 className="font-semibold text-gray-600 mb-3 text-sm">
      Billing by Section
    </h3>

    <div className="grid grid-cols-3 gap-3 text-tiny">
      {data.map((section) => (
        <div
          key={section.id}
          className="flex justify-between border rounded-lg p-1"
        >
          <span className="text-gray-500 ">{section.name}</span>
          <span className="font-bold text-sm">{section.total}</span>
        </div>
      ))}
    </div>
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
  const { data, isPending, isFetching } = useDashboard(filters);

  const neededFilters: FilterConfig<FilterValues>[] = [
    { label: "Date Range", valueKey: "createdAt", type: "dateRange" },
  ];

  if (!profile) {
    return <div />;
  }

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
  const canViewQueue = hasActionPermission(
    profile.data,
    ModuleType.OPD_QUEUE,
    ActionType.VIEW,
  );

  return (
    <CustomLayout
      contentClassName="grid grid-cols-[15%_85%] h-full space-x-3"
      title="Dashboard"
    >
      <div className="grid grid-cols-1 gap-2 content-start">
        {canCreateOpd && (
          <Link
            href="/patient/search?opdCreate=true"
            className="bg-secondary px-2 py-1.5 flex items-center gap-2 text-white border text-xs font-medium"
          >
            <NotebookPen className="size-3" />
            <span>New OPD</span>
          </Link>
        )}
        {canCreateIpd && (
          <Link
            href="/patient/search?ipdCreate=true"
            className="bg-yellow-400 px-2 py-1.5 flex items-center gap-2 text-white border text-xs font-medium"
          >
            <Bed className="size-3" />
            <span>New IPD</span>
          </Link>
        )}
        {canViewQueue && (
          <Link
            href="/opd/walk-in"
            className="bg-primary px-2 py-1.5 flex items-center gap-2 text-white border text-xs font-medium"
          >
            <UserPlus className="size-3" />
            <span>Walk-In Queue</span>
          </Link>
        )}
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div className="col-span-3">
          <CustomFilters<FilterValues>
            filters={neededFilters}
            defaultValues={filters}
            filtersContainerClassName="grid-cols-1"
            onSubmit={setFilters}
          />
        </div>
        {!data && isPending ? (
          <div className="col-span-3 flex items-center justify-center h-40 border bg-white">
            <LoaderIcon className="size-4 animate-spin" />
          </div>
        ) : (
          <>
            <StatCard
              title="Patients"
              opd={data?.patients.opd || 0}
              ipd={data?.patients.ipd || 0}
            />

            <StatCard
              title="Collections"
              opd={data?.collections.opd || 0}
              ipd={data?.collections.ipd || 0}
            />

            <StatCard
              title="Billing"
              opd={data?.billing.opd || 0}
              ipd={data?.billing.ipd || 0}
            />

            <div className="bg-white p-2 border">
              <h3 className="font-semibold text-gray-600 mb-2 text-sm">
                Expense
              </h3>
              <p className="text-sm font-bold">{data?.expense || 0}</p>
            </div>

            <PaymentModeStats data={data?.transactions || []} />
            <SectionBillingStats data={data?.sectionWiseBilling || []} />
          </>
        )}
        {isFetching && (
          <div className="col-span-3 flex justify-end">
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
