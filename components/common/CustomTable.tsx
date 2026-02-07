"use client";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
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
  OnChangeFn,
  RowSelectionState,
  SortingState,
  flexRender,
  getCoreRowModel,
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
import { LoaderIcon, ShieldAlert } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { AxiosError } from "axios";

interface DataTableProps<TData, TValue> {
  columns: ColumnDefWithClass<TData, TValue>[];
  data: TData[];
  enableSorting?: boolean;

  /** selection */
  enableRowSelection?: boolean;
  rowSelection?: Record<string, boolean>;
  onRowSelectionChange?: OnChangeFn<RowSelectionState>;
  getRowId?: (row: TData) => string;

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
  handleChangePage: (page: number) => void;
  handleChangeLimit: (limit: number) => void;
  total?: number;
  limit?: number;

  /** styling */
  striped?: boolean;
  headerBgClass?: string;
  rowBgClass?: string;
  rowAltBgClass?: string;
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
  enableSorting = false,
  isLoading = false,
  striped = false,
  headerBgClass = "bg-primary",
  rowBgClass = "bg-white",
  rowAltBgClass = "bg-[#F6FAFE]",
  useInfiniteScroll = false,
  page = 1,
  total = 0,
  limit = 10,
}: DataTableProps<TData, TValue>) {
  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const [sorting, setSorting] = useState<SortingState>([]);

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
        },
        ...columns,
      ]
    : columns;

  const table = useReactTable({
    data,
    columns: finalColumns,
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    state: {
      sorting,
      ...(enableRowSelection && { rowSelection }),
    },
    ...(enableRowSelection && {
      enableRowSelection,
      onRowSelectionChange,
      getRowId,
    }),
    enableSorting,
  });

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
            table.getRowModel().rows.map((row, i) => (
              <TableRow
                key={i}
                data-state={
                  enableRowSelection && row.getIsSelected()
                    ? "selected"
                    : undefined
                }
                className={clsx(
                  "mb-2 h-7 border-t border-b border-primary/20 bg-pink-50!",
                  striped
                    ? row.index % 2 === 0
                      ? rowAltBgClass
                      : rowBgClass
                    : rowBgClass,
                )}
              >
                {row.getVisibleCells().map((cell, i) => (
                  <TableCell
                    key={i}
                    className={clsx(
                      "relative first:rounded-l-lg last:rounded-r-lg",
                      (
                        cell.column.columnDef as ColumnDefWithClass<
                          TData,
                          TValue
                        >
                      ).cellClassName,
                    )}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
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
      </Table>

      {useInfiniteScroll && fetchNextPage && (
        <div ref={loadMoreRef} className="p-4 text-center">
          {isFetchingNextPage
            ? "Loading more..."
            : hasNextPage
              ? "Scroll to load more"
              : "No more data"}
        </div>
      )}

      {!useInfiniteScroll && total > 0 && (
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
