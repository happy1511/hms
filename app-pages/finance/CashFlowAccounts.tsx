"use client";

import CustomFilters from "@/components/common/CustomFilters";
import CustomTabs from "@/components/common/CustomTabs";
import IncomeForm from "@/app-pages/finance/IncomeForm";
import ExpenseForm from "@/app-pages/finance/ExpenseForm";
import { useCashFlowSummary } from "@/hooks/query/cashFlow";
import { FilterConfig, FilterValues } from "@/lib/type";
import { endOfToday, format, startOfMonth } from "date-fns";
import { useMemo, useState } from "react";

const formatCurrency = (value: unknown) => {
  const amount = Number(value || 0);
  return amount.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

const toTitle = (value: string) =>
  value
    .toLowerCase()
    .split("_")
    .map((w) => (w ? w[0].toUpperCase() + w.slice(1) : w))
    .join(" ");

const summaryFiltersConfig: FilterConfig<FilterValues>[] = [
  { label: "Cash Flow Summary Period", valueKey: "createdAt", type: "dateRange" },
];

const CashFlowSummary = () => {
  const [filters, setFilters] = useState<Pick<FilterValues, "createdAt">>(() => ({
    createdAt: {
      from: startOfMonth(new Date()),
      to: endOfToday(),
    },
  }));

  const createdAt = filters.createdAt as { from?: Date; to?: Date } | undefined;
  const periodLabel = useMemo(() => {
    const from = createdAt?.from;
    const to = createdAt?.to;
    if (!from || !to) return "--";
    return `${format(from, "dd/MM/yyyy")} - ${format(to, "dd/MM/yyyy")}`;
  }, [createdAt?.from, createdAt?.to]);

  const summaryQuery = useCashFlowSummary(filters);
  const data = summaryQuery.data;

  const incomeRows = useMemo(() => {
    const rows: Array<{ title: string; amount: number }> = [];

    if (!data) return rows;
    rows.push(
      { title: "OPD Collections", amount: data.income.opd },
      { title: "Day Care Collections", amount: data.income.dayCare },
      { title: "IPD Collections", amount: data.income.ipd },
      { title: "Pharmacy", amount: data.income.pharmacy },
    );

    data.income.byCategory.forEach((r) => {
      rows.push({
        title: toTitle(String(r.category)),
        amount: Number(r.amount || 0),
      });
    });

    return rows;
  }, [data]);

  const expenseRows = useMemo(() => {
    const rows: Array<{ title: string; amount: number }> = [];
    if (!data) return rows;

    data.expense.byCategory.forEach((r) => {
      rows.push({
        title: toTitle(String(r.category)),
        amount: Number(r.amount || 0),
      });
    });

    return rows;
  }, [data]);

  return (
    <div className="space-y-3">
      <CustomFilters<FilterValues>
        filters={summaryFiltersConfig}
        defaultToday={false}
        defaultValues={filters as any}
        onSubmit={(values) => setFilters({ createdAt: values.createdAt })}
        filtersContainerClassName="grid-cols-1"
        actionsContainerClassName="w-fit"
      />

      <div className="text-tiny text-muted-foreground">
        Period: <span className="text-black">{periodLabel}</span>
      </div>

      <div className="flex justify-center">
        <div className="w-full max-w-md border-4 border-green-700 py-6 text-center bg-white">
          <div className="text-3xl font-semibold text-green-700">
            {formatCurrency(data?.total ?? 0)}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="border bg-white">
          <div className="px-2 py-2 text-tiny font-semibold border-b">
            Income
          </div>
          <table className="w-full text-tiny">
            <thead className="bg-muted">
              <tr>
                <th className="text-left px-2 py-1 w-12">No.</th>
                <th className="text-left px-2 py-1">Title</th>
                <th className="text-right px-2 py-1 w-32">Amount</th>
              </tr>
            </thead>
            <tbody>
              {incomeRows.map((row, idx) => (
                <tr key={`${row.title}-${idx}`} className="border-t">
                  <td className="px-2 py-1">{idx + 1}.</td>
                  <td className="px-2 py-1">{row.title}</td>
                  <td className="px-2 py-1 text-right">
                    {formatCurrency(row.amount)}
                  </td>
                </tr>
              ))}
              <tr className="border-t font-semibold">
                <td className="px-2 py-1" />
                <td className="px-2 py-1">Total Income:</td>
                <td className="px-2 py-1 text-right">
                  {formatCurrency(data?.income.total ?? 0)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="border bg-white">
          <div className="px-2 py-2 text-tiny font-semibold border-b">
            Expenses
          </div>
          <table className="w-full text-tiny">
            <thead className="bg-muted">
              <tr>
                <th className="text-left px-2 py-1 w-12">No.</th>
                <th className="text-left px-2 py-1">Title</th>
                <th className="text-right px-2 py-1 w-32">Amount</th>
              </tr>
            </thead>
            <tbody>
              {expenseRows.map((row, idx) => (
                <tr key={`${row.title}-${idx}`} className="border-t">
                  <td className="px-2 py-1">{idx + 1}.</td>
                  <td className="px-2 py-1">{row.title}</td>
                  <td className="px-2 py-1 text-right">
                    {formatCurrency(row.amount)}
                  </td>
                </tr>
              ))}
              <tr className="border-t font-semibold">
                <td className="px-2 py-1" />
                <td className="px-2 py-1">Total Expense:</td>
                <td className="px-2 py-1 text-right">
                  {formatCurrency(data?.expense.total ?? 0)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const CashFlowAccounts = () => {
  return (
    <CustomTabs
      defaultValue="summary"
      tabs={[
        { value: "summary", name: "Cash Flow Summary", content: <CashFlowSummary /> },
        { value: "income", name: "Income", content: <IncomeForm /> },
        { value: "expense", name: "Business Expenses", content: <ExpenseForm /> },
      ]}
      classNames="p-0 border-0 shadow-none"
    />
  );
};

export default CashFlowAccounts;

