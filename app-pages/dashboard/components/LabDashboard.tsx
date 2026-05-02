"use client";

import CustomTabs from "@/components/common/CustomTabs";
import { DashboardType } from "@/lib/type";
import { GridTable, StatGrid } from "./DashboardPrimitives";

const LabSection = ({
  title,
  data,
}: {
  title: string;
  data: DashboardType["lab"]["pathology"];
}) => (
  <div className="space-y-4">
    <StatGrid
      title={`${title} Requisitions`}
      rows={[
        { label: "Pending", value: data.requisitions.pending },
        { label: "In Progress", value: data.requisitions.inProgress },
        { label: "Completed", value: data.requisitions.completed },
        { label: "Outsourced", value: data.requisitions.outsourced },
        { label: "Cancelled", value: data.requisitions.cancelled },
      ]}
    />
    <div className="grid grid-cols-1 gap-4">
      <GridTable
        title="Tests"
        columns={[
          { key: "name", label: "Test Name" },
          { key: "revenue", label: "Revenue", align: "right" },
          { key: "totalOrders", label: "Total Tests", align: "right" },
        ]}
        rows={data.tests.map((item) => ({
          name: item.name,
          revenue: item.revenue,
          totalOrders: item.totalOrders,
        }))}
      />
      <GridTable
        title="Tests By Sections"
        columns={[
          { key: "name", label: "Section Name" },
          { key: "revenue", label: "Revenue", align: "right" },
          { key: "totalOrders", label: "Total Tests", align: "right" },
        ]}
        rows={data.sections.map((item) => ({
          name: item.name,
          revenue: item.revenue,
          totalOrders: item.totalOrders,
        }))}
      />
      <GridTable
        title="Referred By"
        columns={[
          { key: "name", label: "Referred By" },
          { key: "totalOrders", label: "Total Orders", align: "right" },
        ]}
        rows={data.referredBy.map((item) => ({
          name: item.name,
          totalOrders: item.totalOrders,
        }))}
      />
    </div>
  </div>
);

const LabDashboard = ({
  data,
  canViewPathologyOrders,
  canViewRadiologyOrders,
}: {
  data: DashboardType["lab"];
  canViewPathologyOrders: boolean;
  canViewRadiologyOrders: boolean;
}) => (
  <CustomTabs
    classNames="border-none bg-transparent p-0 shadow-none"
    defaultValue={canViewPathologyOrders ? "pathology" : "radiology"}
    tabs={[
      ...(canViewPathologyOrders
        ? [
            {
              value: "pathology",
              name: "Pathology",
              content: <LabSection title="Pathology" data={data.pathology} />,
            },
          ]
        : []),
      ...(canViewRadiologyOrders
        ? [
            {
              value: "radiology",
              name: "Radiology",
              content: <LabSection title="Radiology" data={data.radiology} />,
            },
          ]
        : []),
    ]}
  />
);

export default LabDashboard;
