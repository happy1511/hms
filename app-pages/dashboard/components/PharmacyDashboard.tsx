"use client";

import CustomTabs from "@/components/common/CustomTabs";
import { DashboardType } from "@/lib/type";
import {
  GridTable,
  SingleMetricCard,
  StatGrid,
  TableCard,
} from "./DashboardPrimitives";

const PharmacyDashboard = ({ data }: { data: DashboardType["pharmacy"] }) => {
  const financeRows = [
    {
      label: "Opening Balance",
      value: data.finance.counterSales.openingBalance,
    },
    { label: "Cash Sales", value: data.finance.counterSales.cashSales },
    { label: "Other Sales", value: data.finance.counterSales.otherSales },
    { label: "Total Sales", value: data.finance.counterSales.totalSales },
    { label: "Cash Returns", value: data.finance.counterSales.cashReturns },
    { label: "Other Returns", value: data.finance.counterSales.otherReturns },
    { label: "Total Returns", value: data.finance.counterSales.totalReturns },
    { label: "Cash Expenses", value: data.finance.counterSales.cashExpenses },
    { label: "Other Expenses", value: data.finance.counterSales.otherExpenses },
    { label: "Total Expenses", value: data.finance.counterSales.totalExpenses },
    { label: "Balance", value: data.finance.counterSales.balance },
    { label: "Cash Balance", value: data.finance.counterSales.cashBalance },
    { label: "Closing Balance", value: data.finance.counterSales.closingBalance },
  ];

  return (
    <CustomTabs
      classNames="border-none bg-transparent p-0 shadow-none"
      defaultValue="finance"
      tabs={[
        {
          value: "finance",
          name: "Finance",
          content: (
            <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1.6fr_1fr]">
              <TableCard title="Counter Sales" rows={financeRows} />
              <div className="space-y-4">
                <SingleMetricCard
                  label="Purchase"
                  value={data.finance.purchaseTotal}
                />
                <SingleMetricCard
                  label="Total Stock Value"
                  value={data.finance.totalStockValue}
                />
                <TableCard
                  title="Expenses"
                  rows={data.finance.expensesByCategory.map((item) => ({
                    label: item.category,
                    value: item.amount,
                  }))}
                />
              </div>
            </div>
          ),
        },
        {
          value: "stock",
          name: "Stock",
          content: (
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <SingleMetricCard
                  label="Total Items In Inventory"
                  value={data.stock.totalItemsInInventory}
                />
                <SingleMetricCard
                  label="Near Expiry Items"
                  value={data.stock.nearExpiry.length}
                />
              </div>
              <GridTable
                title="Top 50 Performing Items"
                columns={[
                  { key: "item", label: "Item" },
                  { key: "qtySold", label: "Qty Sold", align: "right" },
                ]}
                rows={data.stock.topPerformingItems.map((item) => ({
                  item: item.item,
                  qtySold: `${item.qtySold} pcs`,
                }))}
              />
              <GridTable
                title="Near Expiry (90 Days)"
                columns={[
                  { key: "item", label: "Item" },
                  { key: "batch", label: "Batch" },
                  { key: "stock", label: "Stock", align: "right" },
                  { key: "expiringInDays", label: "Expiring In Days", align: "right" },
                  { key: "stockValue", label: "Stock Value", align: "right" },
                ]}
                rows={data.stock.nearExpiry.map((item) => ({
                  item: item.item,
                  batch: item.batch,
                  stock: item.stock,
                  expiringInDays: item.expiringInDays,
                  stockValue: item.stockValue,
                }))}
              />
            </div>
          ),
        },
        {
          value: "corporate",
          name: "Corporate Dashboard",
          content: (
            <StatGrid
              title="Corporate Dashboard"
              rows={[
                { label: "Sales", value: data.corporate.sales },
                { label: "Returns", value: data.corporate.returns },
                { label: "Net Sales", value: data.corporate.netSales },
                { label: "Expenses", value: data.corporate.expenses },
                { label: "Purchases", value: data.corporate.purchases },
                { label: "Purchase Returns", value: data.corporate.purchaseReturns },
                { label: "Sales GST", value: data.corporate.salesGst },
                { label: "Purchase GST", value: data.corporate.purchaseGst },
              ]}
            />
          ),
        },
      ]}
    />
  );
};

export default PharmacyDashboard;
