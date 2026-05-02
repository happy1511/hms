"use client";

export const formatDashboardAmount = (value: unknown) => {
  const amount = Number(value || 0);
  return amount.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

export const TableCard = ({
  title,
  rows,
  valueHeader = "Amount",
}: {
  title: string;
  rows: Array<{ label: string; value: number | string }>;
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
        {rows.length ? (
          rows.map((row, idx) => (
            <tr key={`${title}-${row.label}-${idx}`} className="border-t">
              <td className="px-2 py-1">{idx + 1}.</td>
              <td className="px-2 py-1">{row.label}</td>
              <td className="px-2 py-1 text-right">
                {typeof row.value === "number"
                  ? formatDashboardAmount(row.value)
                  : row.value}
              </td>
            </tr>
          ))
        ) : (
          <tr className="border-t">
            <td className="px-2 py-3 text-center text-muted-foreground" colSpan={3}>
              No data found
            </td>
          </tr>
        )}
      </tbody>
    </table>
  </div>
);

export const GridTable = ({
  title,
  columns,
  rows,
}: {
  title: string;
  columns: Array<{
    key: string;
    label: string;
    align?: "left" | "right" | "center";
  }>;
  rows: Array<Record<string, string | number>>;
}) => (
  <div className="border bg-white">
    <div className="border-b px-2 py-2 text-tiny font-semibold">{title}</div>
    <div className="overflow-x-auto">
      <table className="w-full min-w-[520px] text-tiny">
        <thead className="bg-muted">
          <tr>
            {columns.map((column) => (
              <th
                key={column.key}
                className={`px-2 py-1 ${
                  column.align === "right"
                    ? "text-right"
                    : column.align === "center"
                      ? "text-center"
                      : "text-left"
                }`}
              >
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length ? (
            rows.map((row, idx) => (
              <tr key={`${title}-${idx}`} className="border-t">
                {columns.map((column) => {
                  const value = row[column.key];
                  const className =
                    column.align === "right"
                      ? "text-right"
                      : column.align === "center"
                        ? "text-center"
                        : "text-left";

                  return (
                    <td key={column.key} className={`px-2 py-1 ${className}`}>
                      {typeof value === "number"
                        ? formatDashboardAmount(value)
                        : value}
                    </td>
                  );
                })}
              </tr>
            ))
          ) : (
            <tr className="border-t">
              <td
                className="px-2 py-3 text-center text-muted-foreground"
                colSpan={columns.length}
              >
                No data found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  </div>
);

export const SingleMetricCard = ({
  label,
  value,
}: {
  label: string;
  value: number | string;
}) => (
  <div className="border-2 border-green-700 bg-white px-4 py-6 text-center">
    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
      {label}
    </p>
    <p className="mt-3 text-4xl font-bold text-green-700">
      {typeof value === "number" ? formatDashboardAmount(value) : value}
    </p>
  </div>
);

export const StatGrid = ({
  title,
  rows,
}: {
  title: string;
  rows: Array<{ label: string; value: number }>;
}) => (
  <div className="border bg-white">
    <div className="border-b px-2 py-2 text-tiny font-semibold">{title}</div>
    <div className="grid gap-px bg-border sm:grid-cols-2 lg:grid-cols-5">
      {rows.map((row) => (
        <div key={row.label} className="bg-white px-3 py-4 text-center">
          <p className="text-xs font-semibold uppercase text-muted-foreground">
            {row.label}
          </p>
          <p className="mt-2 text-2xl font-bold text-primary">
            {formatDashboardAmount(row.value)}
          </p>
        </div>
      ))}
    </div>
  </div>
);
