"use client";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ApiResponse, ColumnDefWithClass } from "@/lib/type";
import {
  FetchNextPageOptions,
  InfiniteQueryObserverResult,
} from "@tanstack/react-query";
import {
  GroupingState,
  OnChangeFn,
  RowSelectionState,
  SortingState,
  flexRender,
  getCoreRowModel,
  getExpandedRowModel,
  getFilteredRowModel,
  getGroupedRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import clsx from "clsx";
import { useEffect, useRef, useState } from "react";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "../ui/pagination";
import {
  ChevronDown,
  ChevronRight,
  LoaderIcon,
  ShieldAlert,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { AxiosError } from "axios";
import { Input } from "../ui/input";

interface DataTableProps<TData, TValue> {
  columns: ColumnDefWithClass<TData, TValue>[];
  data: TData[];
  enableSorting?: boolean;

  /** selection */
  enableRowSelection?: boolean;
  rowSelection?: Record<string, boolean>;
  onRowSelectionChange?: OnChangeFn<RowSelectionState>;
  getRowId?: (row: TData) => string;

  /** grouping */
  enableGrouping?: boolean;
  grouping?: string[];

  /** infinite scroll */
  useInfiniteScroll?: boolean;
  hasNextPage?: boolean;
  isFetchingNextPage?: boolean;
  isLoading?: boolean;
  isError?: boolean;
  error?: AxiosError<ApiResponse<null>> | null;
  fetchNextPage?: (
    options?: FetchNextPageOptions | undefined,
  ) => Promise<InfiniteQueryObserverResult<TData[], Error>>;

  /** pagination */
  page?: number;
  handleChangePage?: (page: number) => void;
  handleChangeLimit?: (limit: number) => void;
  total?: number;
  limit?: number;
  hidePagination?: boolean;

  /** styling */
  striped?: boolean;
  headerBgClass?: string;
  rowBgClass?: string;
  rowAltBgClass?: string;

  /** local table search */
  enableTableSearch?: boolean;
  tableSearchPlaceholder?: string;
  searchableColumnIds?: string[];
}

function getPaginationRange({
  currentPage,
  totalPages,
  siblingCount = 1,
}: {
  currentPage: number;
  totalPages: number;
  siblingCount?: number;
}): (number | "...")[] {
  const totalPageNumbers = siblingCount * 2 + 5;

  if (totalPages <= totalPageNumbers) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const leftSiblingIndex = Math.max(currentPage - siblingCount, 2);
  const rightSiblingIndex = Math.min(
    currentPage + siblingCount,
    totalPages - 1,
  );

  const showLeftEllipsis = leftSiblingIndex > 2;
  const showRightEllipsis = rightSiblingIndex < totalPages - 1;

  const range: (number | "...")[] = [1];

  if (showLeftEllipsis) {
    range.push("...");
  }

  for (let i = leftSiblingIndex; i <= rightSiblingIndex; i++) {
    range.push(i);
  }

  if (showRightEllipsis) {
    range.push("...");
  }

  range.push(totalPages);

  return range;
}

export function CustomTable<TData, TValue>({
  columns,
  data,
  enableRowSelection = false,
  rowSelection,
  onRowSelectionChange,
  getRowId,
  hasNextPage,
  fetchNextPage,
  isFetchingNextPage,
  handleChangePage,
  handleChangeLimit,
  isError,
  error,
  enableGrouping = false,
  grouping = [],
  enableSorting = false,
  isLoading = false,
  striped = false,
  headerBgClass = "bg-primary",
  rowBgClass = "bg-white",
  rowAltBgClass = "bg-[#F6FAFE]",
  enableTableSearch = false,
  tableSearchPlaceholder = "Search table...",
  searchableColumnIds,
  useInfiniteScroll = false,
  page = 1,
  total = 0,
  limit = 10,
  hidePagination = false,
}: DataTableProps<TData, TValue>) {
  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [groupingState, setGroupingState] = useState<GroupingState>(
    grouping ?? [],
  );

  // inject checkbox column if row selection is enabled
  const finalColumns: ColumnDefWithClass<TData, TValue>[] = enableRowSelection
    ? [
        {
          id: "__select",
          header: ({ table }) => (
            <Checkbox
              className="cursor-pointer bg-white text-white"
              checked={table.getIsAllPageRowsSelected()}
              onCheckedChange={(value) =>
                table.toggleAllPageRowsSelected(!!value)
              }
            />
          ),
          cell: ({ row }) => (
            <Checkbox
              className="cursor-pointer bg-white"
              checked={row.getIsSelected()}
              onCheckedChange={row.getToggleSelectedHandler()}
            />
          ),
          headerClassName: "min-w-[50px]",
          cellClassName: "min-w-[50px]",
        } as ColumnDefWithClass<TData, TValue>,
        ...columns,
      ]
    : columns;

  const table = useReactTable<TData>({
    data,
    columns: finalColumns,
    getCoreRowModel: getCoreRowModel(),
    ...(enableTableSearch && {
      getFilteredRowModel: getFilteredRowModel(),
      onGlobalFilterChange: setGlobalFilter,
      globalFilterFn: (row, columnId, filterValue: string) =>
        String(row.getValue(columnId) ?? "")
          .toLowerCase()
          .includes(String(filterValue ?? "").toLowerCase()),
      getColumnCanGlobalFilter: (column) => {
        if (!enableTableSearch) return false;
        if (searchableColumnIds?.length) {
          return searchableColumnIds.includes(column.id);
        }
        return column.id !== "__select";
      },
    }),
    onSortingChange: setSorting,
    ...(enableGrouping && {
      onGroupingChange: setGroupingState,
    }),
    getSortedRowModel: getSortedRowModel(),
    state: {
      sorting,
      ...(enableTableSearch && { globalFilter }),
      ...(enableGrouping && { grouping: groupingState }),
      ...(enableRowSelection && { rowSelection }),
    },
    ...(enableRowSelection && {
      enableRowSelection,
      onRowSelectionChange,
      getRowId,
    }),

    ...(enableGrouping && {
      getGroupedRowModel: getGroupedRowModel(),
      getExpandedRowModel: getExpandedRowModel(),
    }),
    enableGrouping,
    enableSorting,
  });

  const getStatusRowClass = (row: any) => {
    const status = row.original?.status;

    switch (status) {
      case "SAMPLE_PENDING":
        return "bg-yellow-100";
      case "RESULT_PENDING":
        return "bg-blue-100";
      case "COMPLETED":
        return "bg-green-100";
      default:
        return rowBgClass;
    }
  };

  // Infinite scroll
  useEffect(() => {
    if (!useInfiniteScroll) return;
    if (!loadMoreRef.current || !hasNextPage) return;
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) fetchNextPage?.();
    });
    observer.observe(loadMoreRef.current);
    return () => {
      if (loadMoreRef.current) observer.unobserve(loadMoreRef.current);
    };
  }, [hasNextPage, fetchNextPage, useInfiniteScroll]);

  return (
    <>
      {enableTableSearch && (
        <div className="mb-3 flex justify-end">
          <Input
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            placeholder={tableSearchPlaceholder}
            className="h-6 w-full max-w-xs text-tiny placeholder:text-tiny"
          />
        </div>
      )}
      <Table className="relative text-tiny">
        <TableHeader className={`sticky top-0 ${headerBgClass}`}>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow
              key={headerGroup.id}
              className=" border-t border-b border-black/30 text-primary bg-white hover:bg-white"
            >
              {headerGroup.headers.map((header, i) => (
                <TableHead
                  key={i}
                  className={clsx(
                    "relative h-6 first:rounded-l-lg last:rounded-r-lg",
                    (
                      header.column.columnDef as ColumnDefWithClass<
                        TData,
                        TValue
                      >
                    ).headerClassName,
                  )}
                >
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={finalColumns.length} className="h-24">
                <div className="flex justify-center items-center">
                  <LoaderIcon
                    role="status"
                    aria-label="Loading"
                    className="size-4 animate-spin"
                  />
                </div>
              </TableCell>
            </TableRow>
          ) : isError && error ? (
            <TableRow>
              <TableCell colSpan={finalColumns.length} className="h-30">
                <div className="flex flex-col justify-center items-center">
                  <ShieldAlert className="size-10 bg-destructive text-white rounded-full p-2" />
                  <p className="text-sm font-semibold text-destructive capitalize">
                    {error.response?.data?.message ||
                      error.message ||
                      "Something went wrong"}
                  </p>
                </div>
              </TableCell>
            </TableRow>
          ) : table.getRowModel().rows.length ? (
            table.getRowModel().rows.map((row, i) => {
              // ✅ GROUP HEADER ROW
              if (enableGrouping && row.getIsGrouped()) {
                return (
                  <TableRow
                    key={row.id}
                    className={clsx(
                      "mb-2 h-7 border-t border-b border-primary/20",
                      getStatusRowClass(row),
                    )}
                  >
                    <TableCell colSpan={finalColumns.length}>
                      <button
                        onClick={row.getToggleExpandedHandler()}
                        className="flex items-center gap-2"
                        type="button"
                      >
                        {row.getIsExpanded() ? (
                          <ChevronDown size={16} />
                        ) : (
                          <ChevronRight size={16} />
                        )}

                        <span className="capitalize">
                          {row.groupingColumnId}: {row.groupingValue as string}
                        </span>

                        <span className="text-black/50">
                          ({row.subRows.length})
                        </span>
                      </button>
                    </TableCell>
                  </TableRow>
                );
              }

              return (
                <TableRow
                  key={row.id}
                  data-state={
                    enableRowSelection && row.getIsSelected()
                      ? "selected"
                      : undefined
                  }
                  className={clsx(
                    "mb-2 h-7 border-t border-b border-primary/20",
                    striped
                      ? row.index % 2 === 0
                        ? rowAltBgClass
                        : rowBgClass
                      : rowBgClass,
                  )}
                >
                  {row.getVisibleCells().map((cell) => {
                    // ⭐ Aggregated Cell Support
                    if (cell.getIsAggregated()) {
                      return (
                        <TableCell key={cell.id}>
                          {flexRender(
                            cell.column.columnDef.aggregatedCell ??
                              cell.column.columnDef.cell,
                            cell.getContext(),
                          )}
                        </TableCell>
                      );
                    }

                    return (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </TableCell>
                    );
                  })}
                </TableRow>
              );
            })
          ) : (
            <TableRow>
              <TableCell
                colSpan={finalColumns.length}
                className="h-24 text-center"
              >
                No Data Found
              </TableCell>
            </TableRow>
          )}
        </TableBody>
        {table.getFooterGroups().some((group) =>
          group.headers.some((header) => header.column.columnDef.footer),
        ) ? (
          <TableFooter>
            {table.getFooterGroups().map((footerGroup) => (
              <TableRow
                key={footerGroup.id}
                className="h-7 border-t border-b border-black/30 bg-muted/40 font-semibold"
              >
                {footerGroup.headers.map((header, i) => (
                  <TableCell
                    key={i}
                    className={clsx(
                      "h-7",
                      (
                        header.column.columnDef as ColumnDefWithClass<
                          TData,
                          TValue
                        >
                      ).cellClassName,
                    )}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.footer,
                          header.getContext(),
                        )}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableFooter>
        ) : null}
      </Table>

      {!hidePagination && useInfiniteScroll && fetchNextPage && (
        <div ref={loadMoreRef} className="p-4 text-center">
          {isFetchingNextPage
            ? "Loading more..."
            : hasNextPage
              ? "Scroll to load more"
              : "No more data"}
        </div>
      )}

      {!hidePagination &&
        handleChangePage &&
        handleChangeLimit &&
        !useInfiniteScroll &&
        total > 0 && (
          <div className="w-full flex flex-col-reverse md:flex-row gap-3 justify-between items-center mt-3">
            <div className="flex items-center gap-3">
              <p className="text-black/50 whitespace-nowrap text-tiny font-semibold">
                Result per page
              </p>
              <Select
                onValueChange={(value) => handleChangeLimit(Number(value))}
                value={limit.toString()}
              >
                <SelectTrigger className="rounded-sm h-4! focus:border-accent-blue text-tiny [&_svg]:size-2 capitalize w-fit shadow-none">
                  <SelectValue />
                </SelectTrigger>

                <SelectContent>
                  {["10", "20", "30", "50", "100"].map((option) => (
                    <SelectItem
                      key={option}
                      value={option}
                      className="text-tiny py-1 capitalize"
                    >
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Pagination>
                <PaginationContent>
                  {page > 1 && (
                    <PaginationItem>
                      <PaginationPrevious
                        className="h-6  text-tiny!"
                        onClick={() => handleChangePage(Math.max(1, page - 1))}
                      />
                    </PaginationItem>
                  )}

                  {getPaginationRange({
                    currentPage: page,
                    totalPages: Math.ceil(total / limit),
                  }).map((item, index) => (
                    <PaginationItem key={index}>
                      {item === "..." ? (
                        <PaginationEllipsis className="size-6 text-tiny! inline-flex" />
                      ) : (
                        <PaginationLink
                          className={clsx(
                            "size-6 text-tiny!",
                            item === page && "bg-primary text-white",
                          )}
                          isActive={item === page}
                          onClick={() => handleChangePage(item)}
                        >
                          {item}
                        </PaginationLink>
                      )}
                    </PaginationItem>
                  ))}

                  {page < Math.ceil(total / limit) && (
                    <PaginationItem>
                      <PaginationNext
                        className="h-6  text-tiny!"
                        onClick={() =>
                          handleChangePage(Math.min(total, page + 1))
                        }
                      />
                    </PaginationItem>
                  )}
                </PaginationContent>
              </Pagination>
            </div>
          </div>
        )}
    </>
  );
}
