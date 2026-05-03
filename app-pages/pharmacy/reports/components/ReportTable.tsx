"use client";

import { CustomTable } from "@/components/common/CustomTable";
import { ApiResponse, ColumnDefWithClass } from "@/lib/type";
import { AxiosError } from "axios";
import PharmacyReportPrintDialog, {
  PharmacyReportPrintConfig,
} from "./PharmacyReportPrintDialog";

export type ReportTableStateProps = {
  isLoading: boolean;
  isError: boolean;
  error: AxiosError<ApiResponse<null>> | null;
};

type ReportTableProps<TData> = ReportTableStateProps & {
  data: TData[];
  columns: ColumnDefWithClass<TData>[];
  rowId: (row: TData) => string;
  searchPlaceholder?: string;
  searchableColumnIds?: string[];
  printConfig?: PharmacyReportPrintConfig;
};

const ReportTable = <TData,>({
  data,
  columns,
  rowId,
  isLoading,
  isError,
  error,
  searchPlaceholder,
  searchableColumnIds,
  printConfig,
}: ReportTableProps<TData>) => {
  return (
    <div className="space-y-3">
      {printConfig ? (
        <div className="flex justify-end">
          <PharmacyReportPrintDialog config={printConfig} />
        </div>
      ) : null}
      <CustomTable
        columns={columns}
        data={data}
        hidePagination
        enableSorting
        enableTableSearch
        tableSearchPlaceholder={searchPlaceholder}
        searchableColumnIds={searchableColumnIds}
        isLoading={isLoading}
        isError={isError}
        error={error}
        getRowId={rowId}
      />
    </div>
  );
};

export default ReportTable;
