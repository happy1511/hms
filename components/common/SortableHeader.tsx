import { Column } from "@tanstack/react-table";
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";

type SortableHeaderProps<TData> = {
  column: Column<TData, unknown>;
  label: string;
};

export function SortableHeader<TData>({
  column,
  label,
}: SortableHeaderProps<TData>) {
  const handleSort = () => {
    const sorted = column.getIsSorted();
    if (sorted === "asc") {
      column.toggleSorting(true);
    } else if (sorted === "desc") {
      column.clearSorting();
    } else {
      column.toggleSorting(false);
    }
  };

  return (
    <button
      className={`flex items-center whitespace-nowrap ${
        column.getIsSorted() ? "text-muted" : ""
      }`}
      onClick={handleSort}
    >
      {label}
      {column.getIsSorted() === "asc" && (
        <ArrowUp className="ml-2 size-3 text-muted" />
      )}
      {column.getIsSorted() === "desc" && (
        <ArrowDown className="ml-2 size-3 text-muted" />
      )}
      {column.getIsSorted() === false && (
        <ArrowUpDown className="ml-2 size-3" />
      )}
    </button>
  );
}
