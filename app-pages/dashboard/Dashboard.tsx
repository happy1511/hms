"use client";

import CustomFilters from "@/components/common/CustomFilters";
import CustomLayout from "@/components/common/CustomLayout";
import NoPermission from "@/components/common/NoPermission";
import { ActionType, ModuleType } from "@/generated/prisma/enums";
import { useProfile } from "@/hooks/query/auth";
import { useDashboard } from "@/hooks/query/dashboard";
import { DashboardType, FilterConfig, FilterValues } from "@/lib/type";
import { hasActionPermission } from "@/lib/utils";
import { endOfDay, startOfDay } from "date-fns";
import { Bed, LoaderIcon, NotebookPen, UserPlus } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

const formatAmount = (value: unknown) => {
  const amount = Number(value || 0);
  return amount.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

const TableCard = ({
  title,
  rows,
  totalLabel,
  totalValue,
  valueHeader = "Amount",
}: {
  title: string;
  rows: Array<{ type: string; value: number }>;
  totalLabel: string;
  totalValue: number;
  valueHeader?: string;
}) => (
  <div className="border bg-white">
    <div className="border-b px-2 py-2 text-tiny font-semibold">{title}</div>
    <table className="w-full text-tiny">
      <thead className="bg-muted">
        <tr>
          <th className="w-12 px-2 py-1 text-left">No.</th>
          <th className="px-2 py-1 text-left">Type</th>
          <th className="w-40 px-2 py-1 text-right">{valueHeader}</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row, idx) => (
          <tr key={`${title}-${row.type}-${idx}`} className="border-t">
            <td className="px-2 py-1">{idx + 1}.</td>
            <td className="px-2 py-1">{row.type}</td>
            <td className="px-2 py-1 text-right">{formatAmount(row.value)}</td>
          </tr>
        ))}
        <tr className="border-t font-semibold">
          <td className="px-2 py-1" />
          <td className="px-2 py-1">{totalLabel}</td>
          <td className="px-2 py-1 text-right">{formatAmount(totalValue)}</td>
        </tr>
      </tbody>
    </table>
  </div>
);

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

const DashboardTables = ({ data }: { data: DashboardType }) => {
  const patientRows = [
    { type: "OPD", value: data.patients.opd },
    { type: "IPD", value: data.patients.ipd },
    { type: "DayCare", value: data.patients.dayCare },
  ];

  const collectionRows = [
    { type: "OPD", value: data.collections.opd },
    { type: "IPD", value: data.collections.ipd },
    { type: "Other Income", value: data.collections.otherIncome },
    {
      type: "Total Income",
      value: data.collections.totalIncome,
    },
    { type: "Expenses", value: data.collections.expenses },
    { type: "Balance", value: data.collections.balance },
    { type: "Online Paid", value: data.paymentModes.digitalWallet },
    {
      type: "Cash Balance",
      value: data.collections.balance - data.paymentModes.digitalWallet,
    },
    { type: "IPD Due", value: data.collections.ipdDue },
    { type: "OPD Due", value: data.collections.opdDue },
   
  ];

  const totalBillingRows = [{ type: "OPD", value: data.billing.opd }];

  const paymentModeRows = [
    { type: "Cash", value: data.paymentModes.cash },
    { type: "Digital Wallet", value: data.paymentModes.digitalWallet },
  ];

  const careTypeRows = [
    { type: "Surgical", value: data.ipdCareType.surgical },
    { type: "Medical", value: data.ipdCareType.medical },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
      <TableCard
        title="Patients"
        rows={patientRows}
        totalLabel="Total Patients"
        totalValue={patientRows.reduce((sum, row) => sum + row.value, 0)}
        valueHeader="Count"
      />
      <TableCard
        title="Collections"
        rows={collectionRows}
        totalLabel="Net"
        totalValue={data.collections.balance -
        data.paymentModes.digitalWallet -
        (data.collections.ipdDue + data.collections.opdDue)}
      />
      <TableCard
        title="Total Billing"
        rows={totalBillingRows}
        totalLabel="Total"
        totalValue={data.billing.opd}
      />
      <TableCard
        title="Payment Modes"
        rows={paymentModeRows}
        totalLabel="Total"
        totalValue={data.paymentModes.total}
      />
      <TableCard
        title="IPD Care Type"
        rows={careTypeRows}
        totalLabel="Total Patients"
        totalValue={data.ipdCareType.total}
        valueHeader="IPD Patients"
      />
    </div>
  );
};

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

  const canViewDashboard = hasActionPermission(
    profile.data,
    ModuleType.DASHBOARD,
    ActionType.VIEW,
  );

  if (!canViewDashboard) {
    return (
      <CustomLayout title="Dashboard">
        <NoPermission />
      </CustomLayout>
    );
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
  const canCreateDayCare = hasActionPermission(
    profile.data,
    ModuleType.DAY_CARE_IPD,
    ActionType.CREATE,
  );
  const canViewQueue = hasActionPermission(
    profile.data,
    ModuleType.OPD_QUEUE,
    ActionType.VIEW,
  );

  return (
    <CustomLayout
      contentClassName="grid h-full grid-cols-1 md:grid-cols-[15%_85%] md:space-x-3 max-md:space-y-3"
      title="Dashboard"
    >
      <QuickLinks
        canCreateOpd={Boolean(canCreateOpd)}
        canCreateIpd={Boolean(canCreateIpd)}
        canCreateDayCare={Boolean(canCreateDayCare)}
        canViewQueue={Boolean(canViewQueue)}
      />

      <div className="space-y-3">
        <CustomFilters<FilterValues>
          filters={neededFilters}
          defaultValues={filters}
          filtersContainerClassName="grid-cols-1 md:grid-cols-2"
          onSubmit={setFilters}
        />

        {!data && isPending ? (
          <div className="flex h-40 items-center justify-center border bg-white">
            <LoaderIcon className="size-4 animate-spin" />
          </div>
        ) : data ? (
          <DashboardTables data={data} />
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
