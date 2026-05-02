"use client";

import { DashboardType } from "@/lib/type";
import { TableCard } from "./DashboardPrimitives";

const HospitalDashboard = ({ data }: { data: DashboardType }) => {
  const patientRows = [
    { label: "OPD", value: data.patients.opd },
    { label: "IPD", value: data.patients.ipd },
    { label: "DayCare", value: data.patients.dayCare },
    {
      label: "Total Patients",
      value: data.patients.dayCare + data.patients.ipd + data.patients.opd,
    },
  ];

  const collectionRows = [
    { label: "OPD", value: data.collections.opd },
    { label: "IPD", value: data.collections.ipd },
    { label: "Other Income", value: data.collections.otherIncome },
    { label: "Total Income", value: data.collections.totalIncome },
    { label: "Expenses", value: data.collections.expenses },
    { label: "Balance", value: data.collections.balance },
    { label: "Online Paid", value: data.paymentModes.digitalWallet },
    {
      label: "Cash Balance",
      value: data.collections.balance - data.paymentModes.digitalWallet,
    },
    { label: "IPD Due", value: data.collections.ipdDue },
    { label: "OPD Due", value: data.collections.opdDue },
  ];

  const totalBillingRows = [{ label: "OPD", value: data.billing.opd }];

  const paymentModeRows = [
    { label: "Cash", value: data.paymentModes.cash },
    { label: "Digital Wallet", value: data.paymentModes.digitalWallet },
  ];

  const careTypeRows = [
    { label: "Surgical", value: data.ipdCareType.surgical },
    { label: "Medical", value: data.ipdCareType.medical },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
      <TableCard title="Patients" rows={patientRows} valueHeader="Count" />
      <TableCard title="Collections" rows={collectionRows} />
      <TableCard title="Total Billing" rows={totalBillingRows} />
      <TableCard title="Payment Modes" rows={paymentModeRows} />
      <TableCard
        title="IPD Care Type"
        rows={careTypeRows}
        valueHeader="IPD Patients"
      />
    </div>
  );
};

export default HospitalDashboard;
