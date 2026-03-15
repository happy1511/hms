"use client";

import { cn } from "@/lib/utils";
import Cell from "./Cell";

export type Column<T> = {
  key: string;
  title: string;
  className?: string;
  render?: (row: T, index: number) => React.ReactNode;
};

interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  footer?: React.ReactNode;
  className?: string;
  headerClassName?: string;
  emptyMessage?: string;
}

function InvoiceTable<T>({
  columns,
  data,
  footer,
  className,
  headerClassName,
  emptyMessage = "No data found",
}: TableProps<T>) {
  return (
    <div className={cn("overflow-hidden", className)}>
      <table className="w-full text-inherit">
        <thead>
          <tr className={cn("bg-[#dedede]", headerClassName)}>
            {columns.map((col) => (
              <Cell
                key={col.key}
                as="th"
                className={cn("w-11 text-left", col.className)}
              >
                {col.title}
              </Cell>
            ))}
          </tr>
        </thead>

        <tbody>
          {data.length ? (
            data.map((row, index) => (
              <tr key={index}>
                {columns.map((col) => (
                  <Cell
                    key={col.key}
                    as="th"
                    className={cn("text-left", col.className)}
                  >
                    {col.render
                      ? col.render(row, index)
                      : (row as any)[col.key]}
                  </Cell>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td
                colSpan={columns.length}
                className="border border-black py-3 text-center"
              >
                {emptyMessage}
              </td>
            </tr>
          )}
        </tbody>

        {footer && <tfoot>{footer}</tfoot>}
      </table>
    </div>
  );
}

export default InvoiceTable;
