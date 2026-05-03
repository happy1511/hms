"use client";

import CustomFilters from "@/components/common/CustomFilters";
import CustomLayout from "@/components/common/CustomLayout";
import CustomTabs from "@/components/common/CustomTabs";
import NoPermission from "@/components/common/NoPermission";
import { ActionType, ModuleType } from "@/generated/prisma/enums";
import { useProfile } from "@/hooks/query/auth";
import { usePharmacyReports } from "@/hooks/query/pharmacyReports";
import { FilterConfig, FilterValues } from "@/lib/type";
import { hasActionPermission } from "@/lib/utils";
import { useState } from "react";
import CounterSaleReportsTab from "./reports/components/CounterSaleReportsTab";
import GrnReportsTab from "./reports/components/GrnReportsTab";
import IpdSaleReportsTab from "./reports/components/IpdSaleReportsTab";
import PoReportsTab from "./reports/components/PoReportsTab";
import StockReportsTab from "./reports/components/StockReportsTab";

const PHARMACY_REPORT_COUNTER_SALE_MODULE =
  "PHARMACY_REPORT_COUNTER_SALE" as ModuleType;
const PHARMACY_REPORT_IPD_SALE_MODULE =
  "PHARMACY_REPORT_IPD_SALE" as ModuleType;
const PHARMACY_REPORT_PO_MODULE = "PHARMACY_REPORT_PO" as ModuleType;
const PHARMACY_REPORT_GRN_MODULE = "PHARMACY_REPORT_GRN" as ModuleType;
const PHARMACY_REPORT_STOCK_MODULE = "PHARMACY_REPORT_STOCK" as ModuleType;

const filtersConfig: FilterConfig<FilterValues>[] = [
  { label: "Date Range", valueKey: "createdAt", type: "dateRange" },
];

const Reports = () => {
  const [filters, setFilters] = useState<FilterValues>({});
  const { data: profile } = useProfile(false);
  const { data, isLoading, isFetching, refetch, isError, error } =
    usePharmacyReports(filters);

  if (!profile) {
    return <div />;
  }

  const canViewCounterSale = hasActionPermission(
    profile.data,
    PHARMACY_REPORT_COUNTER_SALE_MODULE,
    ActionType.VIEW,
  );
  const canViewIpdSale = hasActionPermission(
    profile.data,
    PHARMACY_REPORT_IPD_SALE_MODULE,
    ActionType.VIEW,
  );
  const canViewPo = hasActionPermission(
    profile.data,
    PHARMACY_REPORT_PO_MODULE,
    ActionType.VIEW,
  );
  const canViewGrn = hasActionPermission(
    profile.data,
    PHARMACY_REPORT_GRN_MODULE,
    ActionType.VIEW,
  );
  const canViewStock = hasActionPermission(
    profile.data,
    PHARMACY_REPORT_STOCK_MODULE,
    ActionType.VIEW,
  );

  const reportTableState = {
    isLoading,
    isError,
    error,
  };

  const topTabs: {
    value: string;
    name: string;
    content: React.ReactNode;
  }[] = [];

  if (canViewCounterSale) {
    topTabs.push({
      value: "counter-sale",
      name: "Counter Sale",
      content: (
        <CounterSaleReportsTab
          data={
            data?.counterSale ?? {
              bills: [],
              items: [],
              collections: [],
              hsnSummary: [],
            }
          }
          filters={filters}
          {...reportTableState}
        />
      ),
    });
  }

  if (canViewIpdSale) {
    topTabs.push({
      value: "ipd-sale",
      name: "IPD Sale",
      content: (
        <IpdSaleReportsTab
          data={data?.ipdSale ?? { items: [], hsnSummary: [] }}
          filters={filters}
          {...reportTableState}
        />
      ),
    });
  }

  if (canViewPo) {
    topTabs.push({
      value: "po",
      name: "PO",
      content: (
        <PoReportsTab
          data={data?.po ?? { purchaseOrders: [], purchaseOrderItems: [] }}
          filters={filters}
          {...reportTableState}
        />
      ),
    });
  }

  if (canViewGrn) {
    topTabs.push({
      value: "grn",
      name: "GRN",
      content: (
        <GrnReportsTab
          data={data?.grn ?? { grns: [], grnItems: [] }}
          filters={filters}
          {...reportTableState}
        />
      ),
    });
  }

  if (canViewStock) {
    topTabs.push({
      value: "stock",
      name: "Stock",
      content: (
        <StockReportsTab
          data={
            data?.stock ?? {
              purchaseUtilisation: [],
              itemMovements: [],
              topPerformingItems: [],
              expiringItems: [],
            }
          }
          filters={filters}
          {...reportTableState}
        />
      ),
    });
  }

  return (
    <CustomLayout title="Pharmacy Reports">
      {topTabs.length ? (
        <>
          <CustomFilters<FilterValues>
            filters={filtersConfig}
            onSubmit={setFilters}
            onRefresh={refetch}
            isLoading={isLoading || isFetching}
            isRefreshing={isFetching}
            filtersContainerClassName="grid-cols-1 md:grid-cols-1"
          />
          <CustomTabs
            classNames="p-0 border-none shadow-none"
            defaultValue={topTabs[0]?.value}
            tabs={topTabs}
          />
        </>
      ) : (
        <NoPermission />
      )}
    </CustomLayout>
  );
};

export default Reports;
