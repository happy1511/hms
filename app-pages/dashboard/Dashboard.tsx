"use client";

import CustomLayout from "@/components/common/CustomLayout";
import { useDashboard } from "@/hooks/query/dashboard";
import { Bed, NotebookPen, UserPlus } from "lucide-react";
import Link from "next/link";

const StatCard = ({
  title,
  opd,
  ipd,
}: {
  title: string;
  opd: number;
  ipd: number;
}) => (
  <div className="bg-white shadow rounded-2xl p-4 border">
    <h3 className="font-semibold text-gray-600 mb-2">{title}</h3>
    <div className="flex justify-between text-sm">
      <div>
        <p className="text-gray-500">OPD</p>
        <p className="text-lg font-bold">{opd}</p>
      </div>
      <div>
        <p className="text-gray-500">IPD</p>
        <p className="text-lg font-bold">{ipd}</p>
      </div>
    </div>
  </div>
);

const PaymentModeStats = ({
  data,
}: {
  data: { mode: string; amount: number }[];
}) => (
  <div className="bg-white shadow rounded-2xl p-4 border col-span-3">
    <h3 className="font-semibold text-gray-600 mb-3">Transactions by Mode</h3>

    <div className="grid grid-cols-3 gap-3 text-sm">
      {data.map((item) => (
        <div
          key={item.mode}
          className="flex justify-between border rounded-lg p-2"
        >
          <span className="text-gray-500">{item.mode}</span>
          <span className="font-bold">{item.amount}</span>
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
  <div className="bg-white shadow rounded-2xl p-4 border col-span-3">
    <h3 className="font-semibold text-gray-600 mb-3">Billing by Section</h3>

    <div className="grid grid-cols-3 gap-3 text-sm">
      {data.map((section) => (
        <div
          key={section.id}
          className="flex justify-between border rounded-lg p-2"
        >
          <span className="text-gray-500">{section.name}</span>
          <span className="font-bold">{section.total}</span>
        </div>
      ))}
    </div>
  </div>
);

const Dashboard = () => {
  const { data, isPending } = useDashboard();

  if (!data || isPending) {
    return <></>;
  }

  return (
    <CustomLayout
      contentClassName="grid grid-cols-[15%_85%] h-full space-x-3"
      title="Dashboard"
    >
      <div className="grid grid-cols-1 gap-3">
        <Link
          href="/patient/search?opdCreate=true"
          className="bg-secondary p-5 flex justify-center items-center text-white rounded-2xl border"
        >
          <NotebookPen />
        </Link>
        <Link
          href="/patient/search?ipdCreate=true"
          className="bg-yellow-400 p-5 flex justify-center items-center text-white rounded-2xl border"
        >
          <Bed />
        </Link>
        <Link
          href="/opd/walk-in"
          className="bg-primary p-5 flex justify-center items-center text-white rounded-2xl border"
        >
          <UserPlus />
        </Link>
      </div>
      <div className="grid grid-cols-3 gap-3">
        <StatCard
          title="Patients"
          opd={data?.patients.opd}
          ipd={data?.patients.ipd}
        />

        <StatCard
          title="Collections"
          opd={data?.collections.opd}
          ipd={data?.collections.ipd}
        />

        <StatCard
          title="Billing"
          opd={data?.billing.opd}
          ipd={data?.billing.ipd}
        />

        <PaymentModeStats data={data.transactions} />
        <SectionBillingStats data={data.sectionWiseBilling} />
      </div>
    </CustomLayout>
  );
};

export default Dashboard;
