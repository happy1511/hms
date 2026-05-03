"use client";

import { CustomTable } from "@/components/common/CustomTable";
import { ApiResponse, ColumnDefWithClass } from "@/lib/type";
import { AxiosError } from "axios";

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
}: ReportTableProps<TData>) => {
  return (
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
  );
};

export default ReportTable;
