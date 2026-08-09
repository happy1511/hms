"use client";

import { Button } from "@/components/ui/button";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  ComboboxTrigger,
  ComboboxValue,
} from "@/components/ui/combobox";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { cn } from "@/lib/utils";
import { InfiniteData, UseInfiniteQueryResult } from "@tanstack/react-query";
import { ChevronDownIcon } from "lucide-react";
import { ReactNode, useEffect, useMemo, useRef, useState } from "react";
import { Control, FieldPath, FieldValues } from "react-hook-form";

type Primitive = string | number;

export interface FormInfiniteSelectProps<
  TItem,
  TPage,
  TValue extends Primitive,
  TFieldValues extends FieldValues,
> {
  name: FieldPath<TFieldValues>;
  control: Control<TFieldValues>;
  className?: string;
  label?: string;
  required?: boolean;
  placeholder?: string;
  multiple?: boolean;
  formItemClassName?: string;
  query: UseInfiniteQueryResult<InfiniteData<TPage>>;
  getItems: (page: TPage) => readonly TItem[];
  valueKey: (item: TItem) => TValue;
  labelKey: (item: TItem) => string;
  initialItems?: readonly TItem[];
  selectedItem?: TItem | readonly TItem[] | null;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  renderOption?: (item: TItem) => ReactNode;
  disabled?: boolean;
  readOnly?: boolean;
  hideError?: boolean;
  /** When true, stores the full item object in the form field instead of just the valueKey primitive */
  storeObject?: boolean;
}

export function FormInfiniteSelect<
  TItem,
  TPage,
  TValue extends Primitive,
  TFieldValues extends FieldValues,
>({
  name,
  control,
  label,
  required,
  multiple = false,
  formItemClassName,
  className,
  query,
  getItems,
  valueKey,
  labelKey,
  placeholder,
  initialItems = [],
  selectedItem,
  searchValue,
  onSearchChange,
  renderOption,
  disabled = false,
  readOnly = false,
  hideError = false,
  storeObject = false,
}: FormInfiniteSelectProps<TItem, TPage, TValue, TFieldValues>) {
  const items = useMemo<readonly TItem[]>(() => {
    const uniqueItems = new Map<TValue, TItem>();

    for (const item of (query.data?.pages ?? []).flatMap(getItems)) {
      const itemValue = valueKey(item);
      if (!uniqueItems.has(itemValue)) {
        uniqueItems.set(itemValue, item);
      }
    }

    return Array.from(uniqueItems.values());
  }, [query.data?.pages, getItems, valueKey]);
  const cachedItemsRef = useRef<Map<TValue, TItem>>(new Map());
  const [internalSearch, setInternalSearch] = useState("");
  const search = searchValue ?? internalSearch;

  useEffect(() => {
    if (selectedItem) {
      const selectedArray = Array.isArray(selectedItem)
        ? selectedItem
        : [selectedItem];
      for (const item of selectedArray) {
        if (item) cachedItemsRef.current.set(valueKey(item), item);
      }
    }
    for (const item of initialItems) {
      if (item) cachedItemsRef.current.set(valueKey(item), item);
    }
    for (const item of items) {
      if (item) cachedItemsRef.current.set(valueKey(item), item);
    }
  }, [items, valueKey, initialItems, selectedItem]);

  const resolveItem = (val: TValue | undefined | null) => {
    if (val === undefined || val === null || val === "") return undefined;

    const fromItems = items.find((i) => valueKey(i) === val);
    if (fromItems) return fromItems;

    if (selectedItem) {
      const selectedPropArray = Array.isArray(selectedItem)
        ? selectedItem
        : [selectedItem];
      const fromSelectedProp = selectedPropArray.find(
        (i) => i && valueKey(i) === val,
      );
      if (fromSelectedProp) return fromSelectedProp;
    }

    const fromInitial = initialItems.find((i) => valueKey(i) === val);
    if (fromInitial) return fromInitial;

    return cachedItemsRef.current.get(val);
  };

  return (
    <FormField
      name={name}
      control={control}
      render={({ field, fieldState }) => {
        const value = storeObject
          ? (field.value as TItem | TItem[] | undefined)
          : (field.value as TValue | TValue[] | undefined);
        const hasValue =
          value !== undefined &&
          value !== null &&
          (Array.isArray(value) ? value.length > 0 : value !== "");

        // Keep Combobox controlled for its entire lifecycle.
        const resolveStoredItem = (stored: TItem): TItem => {
          const key = valueKey(stored);
          return (
            items.find((i) => valueKey(i) === key) ??
            cachedItemsRef.current.get(key) ??
            stored
          );
        };

        const selectedItems = storeObject
          ? multiple
            ? Array.isArray(value)
              ? (value as TItem[]).map(resolveStoredItem)
              : []
            : hasValue
              ? resolveStoredItem(value as TItem)
              : null
          : multiple
            ? Array.isArray(value)
              ? ((value as TValue[]).map((val) => resolveItem(val)).filter(Boolean) as TItem[])
              : []
            : hasValue
              ? (resolveItem(value as TValue) ?? null)
              : null;

        const itemsWithSelection = (() => {
          const map = new Map<TValue, TItem>();

          if (selectedItem) {
            const selectedPropArray = Array.isArray(selectedItem)
              ? selectedItem
              : [selectedItem];
            for (const item of selectedPropArray) {
              if (item) map.set(valueKey(item), item);
            }
          }

          for (const item of initialItems) {
            if (item) map.set(valueKey(item), item);
          }

          for (const item of items) {
            if (item) map.set(valueKey(item), item);
          }

          const selectedArray = Array.isArray(selectedItems)
            ? selectedItems
            : selectedItems
              ? [selectedItems]
              : [];

          for (const item of selectedArray) {
            if (item) map.set(valueKey(item), item);
          }

          return Array.from(map.values());
        })();

        const filteredItems = (() => {
          const term = search.trim().toLowerCase();
          if (!term) return itemsWithSelection;
          return itemsWithSelection.filter((item) =>
            String(labelKey(item) ?? "")
              .toLowerCase()
              .includes(term),
          );
        })();

        return (
          <FormItem
            className={cn(
              "text-primary relative gap-1",
              fieldState.error || !hideError ? "pb-4 gap-1" : "",
              formItemClassName,
            )}
          >
            {label && (
              <FormLabel className="text-tiny gap-0 font-semibold font-quicksand">
                {label}
                {required && (
                  <span className="text-[#FFA600] text-tiny ms-1">*</span>
                )}
              </FormLabel>
            )}
            <FormControl className="h-6 flex items-center">
              <Combobox
                items={itemsWithSelection}
                multiple={multiple}
                value={selectedItems}
                itemToStringLabel={labelKey}
                onOpenChange={(open) => {
                  if (!open) {
                    setInternalSearch("");
                    onSearchChange?.("");
                  }
                }}
                onValueChange={(selected) => {
                  if (multiple) {
                    if (storeObject) {
                      const arr = Array.isArray(selected) ? (selected as TItem[]) : [];
                      // Deduplicate by valueKey to prevent duplicate entries
                      const seen = new Map<TValue, TItem>();
                      for (const item of arr) {
                        seen.set(valueKey(item), item);
                      }
                      field.onChange(Array.from(seen.values()));
                    } else {
                      field.onChange(
                        Array.isArray(selected)
                          ? selected.map((item) => valueKey(item))
                          : [],
                      );
                    }
                  } else {
                    field.onChange(
                      storeObject
                        ? (selected as TItem) ?? undefined
                        : selected ? valueKey(selected as TItem) : undefined,
                    );
                  }
                }}
              >
                <ComboboxTrigger
                  className="w-full"
                  render={
                    <Button
                      variant="outline"
                      disabled={disabled || readOnly}
                      className={cn(
                        "h-6! w-full justify-between gap-2 text-tiny! font-normal bg-white border border-border shadow-none focus-visible:border-accent-blue focus-visible:ring-0 selection:bg-gray-500 selection:text-white disabled:cursor-not-allowed disabled:opacity-50 px-2 py-0",
                        multiple && "h-auto min-h-6 py-0.5",
                        !hasValue
                          ? "text-muted-foreground font-normal"
                          : "text-foreground font-normal",
                        fieldState.invalid
                          ? "border-destructive focus-visible:border-destructive"
                          : "",
                        className,
                      )}
                    >
                      <ComboboxValue placeholder={placeholder}>
                        {(selected) => {
                          if (
                            !selected ||
                            (Array.isArray(selected) && selected.length === 0)
                          ) {
                            if (hasValue) {
                              return (
                                <span className="text-foreground">
                                  {Array.isArray(value)
                                    ? value.join(", ")
                                    : String(value)}
                                </span>
                              );
                            }
                            return (
                              <span className="text-muted-foreground">
                                {placeholder}
                              </span>
                            );
                          }

                          if (Array.isArray(selected)) {
                            return (
                              <div className="flex flex-wrap gap-1">
                                {selected.map((item) => (
                                  <span
                                    key={String(valueKey(item))}
                                    className="bg-gray-100 border-border flex items-center gap-1 rounded-xs border px-1.5 py-0.25 text-tiny"
                                  >
                                    {labelKey(item)}
                                  </span>
                                ))}
                              </div>
                            );
                          }

                          return labelKey(selected as TItem);
                        }}
                      </ComboboxValue>
                      <ChevronDownIcon className="text-muted-foreground size-3 shrink-0 opacity-50" />
                    </Button>
                  }
                />

                <ComboboxContent className="z-50 min-w-(--anchor-width) w-(--anchor-width) p-1">
                  <div className="p-1 border-b border-border bg-white mb-1">
                    <ComboboxInput
                      placeholder="Search…"
                      showTrigger={false}
                      value={search}
                      className="h-6 bg-white selection:bg-gray-500 selection:text-white focus-within:border-accent-blue focus-within:ring-0 focus-visible:border-accent-blue focus-visible:ring-0 border shadow-none ring-0 border-border rounded-xs px-2 py-0 text-tiny! w-full"
                      onChange={(e) => {
                        setInternalSearch(e.target.value);
                        onSearchChange?.(e.target.value);
                      }}
                    />
                  </div>

                  <ComboboxEmpty className="text-muted-foreground text-tiny py-2">
                    {query.isLoading || query.isFetchingNextPage
                      ? "Loading…"
                      : "No results"}
                  </ComboboxEmpty>
                  <ComboboxList
                    ref={(node: HTMLDivElement | null) => {
                      if (!node) return;
                      node.onscroll = (event) => {
                        const target = event.currentTarget as HTMLDivElement;
                        const isNearBottom =
                          target.scrollTop + target.clientHeight >=
                          target.scrollHeight - 50;
                        if (
                          isNearBottom &&
                          query.hasNextPage &&
                          !query.isFetchingNextPage
                        ) {
                          query.fetchNextPage();
                        }
                      };
                    }}
                  >
                    {filteredItems.map((item) => (
                      <ComboboxItem
                        key={valueKey(item)}
                        value={item}
                        className="text-tiny py-1 capitalize"
                      >
                        {renderOption ? renderOption(item) : labelKey(item)}
                      </ComboboxItem>
                    ))}
                  </ComboboxList>
                </ComboboxContent>
              </Combobox>
            </FormControl>
            {!hideError && (
              <FormMessage className="absolute bottom-1 left-1 text-tiny font-semibold text-destructive" />
            )}
          </FormItem>
        );
      }}
    />
  );
}
