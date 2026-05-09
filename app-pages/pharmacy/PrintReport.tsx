"use client";

import PrintToolbar from "@/components/common/PrintToolbar";
import { usePharmacyReports } from "@/hooks/query/pharmacyReports";
import { ColumnDefWithClass, FilterValues } from "@/lib/type";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { LoaderIcon } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { pharmacyReportPrintRegistry } from "./reports/components/pharmacyReportPrintRegistry";

type PharmacyReportPrintGridProps<TData> = {
  columns: ColumnDefWithClass<TData>[];
  data: TData[];
  getRowId: (row: TData) => string;
};

const getPrintColumnWidth = (columnId: string) => {
  const normalizedId = columnId.toLowerCase();

  if (
    normalizedId.includes("customer") ||
    normalizedId.includes("supplier") ||
    normalizedId.includes("doctor") ||
    normalizedId.includes("item") ||
    normalizedId.includes("remarks")
  ) {
    return "1.5fr";
  }

  if (
    normalizedId.includes("bill") ||
    normalizedId.includes("invoice") ||
    normalizedId.includes("number") ||
    normalizedId.includes("date") ||
    normalizedId.includes("category") ||
    normalizedId.includes("batch") ||
    normalizedId.includes("expiry") ||
    normalizedId.includes("corporate") ||
    normalizedId.includes("sale") ||
    normalizedId.includes("return")
  ) {
    return "1.15fr";
  }

  if (
    normalizedId.includes("qty") ||
    normalizedId.includes("quantity") ||
    normalizedId.includes("tax") ||
    normalizedId.includes("gst") ||
    normalizedId.includes("amt") ||
    normalizedId.includes("amount") ||
    normalizedId.includes("total") ||
    normalizedId.includes("rate") ||
    normalizedId.includes("round")
  ) {
    return "0.8fr";
  }

  return "1fr";
};

const PharmacyReportPrintGrid = <TData,>({
  columns,
  data,
  getRowId,
}: PharmacyReportPrintGridProps<TData>) => {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getRowId,
  });

  const leafColumnCount = table.getVisibleLeafColumns().length || 1;
  const gridTemplateColumns = table
    .getVisibleLeafColumns()
    .map((column) => `minmax(0, ${getPrintColumnWidth(column.id)})`)
    .join(" ");
  const isDenseGrid = leafColumnCount >= 10;

  return (
    <div
      className={[
        "border border-black/30 text-[1em]",
        isDenseGrid ? "text-[0.82em] print:text-[0.72em]" : "",
      ].join(" ")}
    >
      {table.getHeaderGroups().map((headerGroup) => (
        <div
          key={headerGroup.id}
          className={[
            "grid border-b border-black/30 bg-white font-semibold",
            "[break-inside:avoid] print:[break-inside:avoid]",
            "[&_button]:pointer-events-none [&_button]:flex [&_button]:w-full [&_button]:flex-wrap [&_button]:justify-start [&_button]:gap-0 [&_button]:text-left [&_button]:whitespace-normal",
            "[&_button_svg]:hidden",
          ].join(" ")}
          style={{ gridTemplateColumns }}
        >
          {headerGroup.headers.map((header) => (
            <div
              key={header.id}
              className={[
                "min-w-0 border-r border-black/20 px-2 py-1 last:border-r-0",
                "whitespace-normal break-words [overflow-wrap:anywhere] leading-[1.2]",
                isDenseGrid ? "px-[3px] py-[2px] print:px-[3px] print:py-[2px]" : "print:px-[3px] print:py-[2px]",
              ].join(" ")}
            >
              {header.isPlaceholder
                ? null
                : flexRender(
                    header.column.columnDef.header,
                    header.getContext(),
                  )}
            </div>
          ))}
        </div>
      ))}

      {table.getRowModel().rows.length ? (
        <>
          {table.getRowModel().rows.map((row) => (
            <div
              key={row.id}
              className="grid border-b border-black/20 last:border-b-0 [break-inside:avoid] print:[break-inside:avoid]"
              style={{ gridTemplateColumns }}
            >
              {row.getVisibleCells().map((cell) => (
                <div
                  key={cell.id}
                  className={[
                    "min-w-0 border-r border-black/10 px-2 py-1 last:border-r-0",
                    "whitespace-normal break-words [overflow-wrap:anywhere] leading-[1.2]",
                    isDenseGrid ? "px-[3px] py-[2px] print:px-[3px] print:py-[2px]" : "print:px-[3px] print:py-[2px]",
                  ].join(" ")}
                >
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </div>
              ))}
            </div>
          ))}
          {table.getFooterGroups().some((group) =>
            group.headers.some((header) => header.column.columnDef.footer),
          )
            ? table.getFooterGroups().map((footerGroup) => (
                <div
                  key={footerGroup.id}
                  className="grid border-t border-black/30 bg-white font-semibold [break-inside:avoid] print:[break-inside:avoid]"
                  style={{ gridTemplateColumns }}
                >
                  {footerGroup.headers.map((header) => (
                    <div
                      key={header.id}
                      className={[
                        "min-w-0 border-r border-black/10 px-2 py-1 last:border-r-0",
                        "whitespace-normal break-words [overflow-wrap:anywhere] leading-[1.2]",
                        isDenseGrid ? "px-[3px] py-[2px] print:px-[3px] print:py-[2px]" : "print:px-[3px] print:py-[2px]",
                      ].join(" ")}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.footer,
                            header.getContext(),
                          )}
                    </div>
                  ))}
                </div>
              ))
            : null}
        </>
      ) : (
        <div className="px-3 py-6 text-center">No Data Found</div>
      )}
    </div>
  );
};

const PrintReport = () => {
  const searchParams = useSearchParams();
  const [fontSize, setFontSize] = useState(10);
  const [scale, setScale] = useState(1);
  const [scaledHeight, setScaledHeight] = useState<number | null>(null);
  const pageRef = useRef<HTMLDivElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);

  const reportKey = searchParams.get("reportKey") || "";
  const tableKey = searchParams.get("tableKey") || "";
  const includeAll = searchParams.get("includeAll") === "true";
  const limit = Number(searchParams.get("limit") || 0);
  const createdAtFrom = searchParams.get("createdAt[from]");
  const createdAtTo = searchParams.get("createdAt[to]");

  const filters = useMemo<FilterValues>(() => {
    if (!createdAtFrom && !createdAtTo) {
      return {};
    }

    return {
      createdAt: {
        ...(createdAtFrom ? { from: new Date(createdAtFrom) } : {}),
        ...(createdAtTo ? { to: new Date(createdAtTo) } : {}),
      },
    };
  }, [createdAtFrom, createdAtTo]);

  const { data, isLoading } = usePharmacyReports(filters);
  const registryEntry = pharmacyReportPrintRegistry[reportKey]?.[tableKey];

  const rows = useMemo(() => {
    if (!data || !registryEntry) {
      return [];
    }

    const resolvedRows = registryEntry.getRows(data);
    if (includeAll || limit < 1) {
      return resolvedRows;
    }

    return resolvedRows.slice(0, limit);
  }, [data, includeAll, limit, registryEntry]);

  useEffect(() => {
    const pageElement = pageRef.current;
    const contentElement = contentRef.current;

    if (!pageElement || !contentElement || !registryEntry) {
      return;
    }

    const updateScale = () => {
      const availableWidth = pageElement.clientWidth;
      const contentWidth = contentElement.scrollWidth;
      const contentHeight = contentElement.scrollHeight;

      if (!availableWidth || !contentWidth || !contentHeight) {
        setScale(1);
        setScaledHeight(null);
        return;
      }

      const nextScale = Math.min(1, availableWidth / contentWidth);
      setScale(nextScale);
      setScaledHeight(contentHeight * nextScale);
    };

    updateScale();

    const resizeObserver = new ResizeObserver(() => {
      updateScale();
    });

    resizeObserver.observe(pageElement);
    resizeObserver.observe(contentElement);
    window.addEventListener("resize", updateScale);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", updateScale);
    };
  }, [fontSize, rows, registryEntry]);

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <LoaderIcon className="size-4 animate-spin" />
      </div>
    );
  }

  if (!registryEntry) {
    return (
      <div className="p-4 text-sm text-destructive">
        Report configuration not found.
      </div>
    );
  }

  return (
    <>
      <PrintToolbar fontSize={fontSize} onFontSizeChange={setFontSize} />
      <div className="bg-[#e8e8e8] px-4 py-4 print:bg-white print:px-0 print:py-0">
        <div
          ref={pageRef}
          className="mx-auto box-border w-full max-w-[281mm] overflow-visible bg-white p-4 text-black shadow print:w-[281mm] print:max-w-[281mm] print:overflow-visible print:p-0 print:shadow-none"
        >
          <div
            className="relative inline-block overflow-visible align-top"
            style={{ height: scaledHeight ? `${scaledHeight}px` : "auto" }}
          >
            <div
              ref={contentRef}
              className="w-max origin-top-left overflow-visible"
              style={{
                fontSize,
                transform: `scale(${scale})`,
              }}
            >
              <PharmacyReportPrintGrid
                columns={registryEntry.columns}
                data={rows}
                getRowId={registryEntry.rowId}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default PrintReport;
