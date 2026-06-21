"use client";

import * as React from "react";

import { Check, ChevronDown, Loader2, X } from "lucide-react";

import { cn } from "@/lib/utils";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import { Button } from "@/components/ui/button";

import { Input } from "@/components/ui/input";

import { Badge } from "@/components/ui/badge";

import { Skeleton } from "@/components/ui/skeleton";

import { InfiniteData, UseInfiniteQueryResult } from "@tanstack/react-query";

type Props<TItem, TPage, TValue extends string | number> = {
  value: TItem | TItem[] | null;

  onChange: (value: TItem | TItem[] | null) => void;

  query: UseInfiniteQueryResult<InfiniteData<TPage>>;

  getItems: (page: TPage) => TItem[];

  valueKey: (item: TItem) => TValue;

  labelKey: (item: TItem) => string;

  compareKey?: (item: TItem) => unknown;

  search: string;

  onSearchChange: (value: string) => void;

  multiple?: boolean;

  placeholder?: string;

  disabled?: boolean;

  className?: string;
};

export function InfiniteSelect<TItem, TPage, TValue extends string | number>({
  value,
  onChange,
  query,
  getItems,
  valueKey,
  labelKey,
  compareKey,
  search,
  onSearchChange,
  multiple,
  placeholder,
  disabled,
  className,
}: Props<TItem, TPage, TValue>) {
  const NEXT_PAGE_TRIGGER_THRESHOLD = 10;
  const ROW_HEIGHT_PX = 32;
  const SEARCH_DEBOUNCE_MS = 300;

  const [open, setOpen] = React.useState(false);
  const [inputValue, setInputValue] = React.useState(search);

  const scrollRef = React.useRef<HTMLDivElement>(null);

  const items = React.useMemo(
    () => query.data?.pages.flatMap(getItems) ?? [],
    [query.data, getItems],
  );

  React.useEffect(() => {
    setInputValue(search);
  }, [search]);

  React.useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      if (inputValue !== search) {
        onSearchChange(inputValue);
      }
    }, SEARCH_DEBOUNCE_MS);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [inputValue, onSearchChange, search]);

  React.useEffect(() => {
    if (disabled) return;

    const hasLoadedAtLeastOnePage = Boolean(query.data?.pages.length);

    if (hasLoadedAtLeastOnePage || query.isPending || query.isFetching) {
      return;
    }

    query.refetch();
  }, [disabled, query, search]);

  const selectedSet = React.useMemo(() => {
    if (!multiple) return new Set();

    return new Set(
      ((value as TItem[]) ?? []).map((v) =>
        String(compareKey ? compareKey(v) : valueKey(v)),
      ),
    );
  }, [value, multiple, valueKey, compareKey]);

  React.useEffect(() => {
    if (!open) return;

    scrollRef.current?.scrollTo({
      top: 0,
    });
  }, [open, search]);

  const handleScroll = React.useCallback(() => {
    const container = scrollRef.current;

    if (!container || !query.hasNextPage || query.isFetchingNextPage) return;

    const remainingScroll =
      container.scrollHeight - container.scrollTop - container.clientHeight;

    const preloadThreshold = NEXT_PAGE_TRIGGER_THRESHOLD * ROW_HEIGHT_PX;

    if (remainingScroll <= preloadThreshold) {
      query.fetchNextPage();
    }
  }, [query]);

  const toggleItem = (item: TItem) => {
    if (!multiple) {
      onChange(item);
      setOpen(false);
      return;
    }

    const current = (value as TItem[]) ?? [];

    const key = String(compareKey ? compareKey(item) : valueKey(item));

    const exists = selectedSet.has(key);

    if (exists) {
      onChange(
        current.filter(
          (v) => String(compareKey ? compareKey(v) : valueKey(v)) !== key,
        ),
      );
    } else {
      onChange([...current, item]);
    }
  };

  const selectedLabel = React.useMemo(() => {
    if (multiple) {
      const vals = (value as TItem[]) ?? [];

      if (!vals.length) return placeholder ?? "Select...";

      return `${vals.length} selected`;
    }

    if (!value) return placeholder ?? "Select...";

    return labelKey(value as TItem);
  }, [value, multiple, placeholder, labelKey]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          disabled={disabled}
          className={cn("w-full justify-between", className)}
        >
          <span className="truncate">{selectedLabel}</span>

          <ChevronDown className="h-4 w-4" />
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-[500px] p-0" align="start">
        <div className="p-1 border-b">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Search..."
            className={`selection:text-white h-6 bg-white selection:bg-gray-500 focus-visible:border-accent-blue text-tiny! focus-visible:ring-0 border shadow-none ring-0 border-border`}
          />
        </div>

        {multiple && Array.isArray(value) && value.length > 0 && (
          <div className="flex flex-wrap gap-1 p-2 border-b max-h-24 overflow-auto">
            {value.map((item) => (
              <Badge key={String(valueKey(item))}>
                {labelKey(item)}

                <button type="button" onClick={() => toggleItem(item)}>
                  <X className="h-3 w-3 ml-1" />
                </button>
              </Badge>
            ))}
          </div>
        )}

        {query.isPending ? (
          <div className="p-2 space-y-2">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
          </div>
        ) : (
          <div
            ref={scrollRef}
            className="h-64 overflow-auto"
            onScroll={handleScroll}
          >
            {items.map((item) => {
              const key = String(
                compareKey ? compareKey(item) : valueKey(item),
              );

              const selected = multiple
                ? selectedSet.has(key)
                : value &&
                  String(
                    compareKey
                      ? compareKey(value as TItem)
                      : valueKey(value as TItem),
                  ) === key;

              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => toggleItem(item)}
                  className={cn(
                    "flex h-8 w-full items-center gap-2 bg-white px-2 text-left hover:bg-accent",
                  )}
                >
                  <Check
                    className={cn(
                      "size-3",
                      selected ? "opacity-100" : "opacity-0",
                    )}
                  />

                  <span className="text-xs">{labelKey(item)}</span>
                </button>
              );
            })}

            {query.isFetchingNextPage && (
              <div className="p-2">
                <Loader2 className="h-4 w-4 animate-spin mx-auto" />
              </div>
            )}

            {!items.length && (
              <div className="p-4 text-center text-sm text-muted-foreground">
                No results found
              </div>
            )}
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
