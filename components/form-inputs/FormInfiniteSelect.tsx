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

interface FormInfiniteSelectProps<
  TItem,
  TPage,
  TValue extends Primitive,
  TFieldValues extends FieldValues,
> {
  name: FieldPath<TFieldValues>;
  control: Control<TFieldValues>;
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
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  renderOption?: (item: TItem) => ReactNode;
  disabled?: boolean;
  readOnly?: boolean;
  hideError?: boolean;
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
  query,
  getItems,
  valueKey,
  labelKey,
  placeholder,
  initialItems = [],
  searchValue,
  onSearchChange,
  renderOption,
  disabled = false,
  readOnly = false,
  hideError = false,
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
    for (const item of initialItems) {
      cachedItemsRef.current.set(valueKey(item), item);
    }
    for (const item of items) {
      cachedItemsRef.current.set(valueKey(item), item);
    }
  }, [items, valueKey, initialItems]);

  const resolveItem = (val: TValue | undefined | null) => {
    if (val === undefined || val === null) return undefined;

    const fromItems = items.find((i) => valueKey(i) === val);
    if (fromItems) return fromItems;

    const fromInitial = initialItems.find((i) => valueKey(i) === val);
    if (fromInitial) return fromInitial;

    return cachedItemsRef.current.get(val);
  };

  return (
    <FormField
      name={name}
      control={control}
      render={({ field, fieldState }) => {
        const value = field.value as TValue | TValue[] | undefined;
        const hasValue =
          value !== undefined &&
          value !== null &&
          (Array.isArray(value) ? value.length > 0 : value !== "");

        // Keep Combobox controlled for its entire lifecycle.
        const selectedItems = multiple
          ? Array.isArray(value)
            ? (value.map((val) => resolveItem(val)).filter(Boolean) as TItem[])
            : []
          : hasValue
            ? (resolveItem(value as TValue) ?? null)
            : null;

        const itemsWithSelection = (() => {
          const map = new Map<TValue, TItem>();

          for (const item of initialItems) {
            map.set(valueKey(item), item);
          }

          for (const item of items) {
            map.set(valueKey(item), item);
          }

          const selectedArray = Array.isArray(selectedItems)
            ? selectedItems
            : selectedItems
              ? [selectedItems]
              : [];

          for (const item of selectedArray) {
            map.set(valueKey(item), item);
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
              "relative gap-1",
              !hideError && "pb-5",
              formItemClassName,
            )}
          >
            {label && (
              <FormLabel className="text-foreground text-sm font-medium">
                {label}
                {required && <span className="text-sm! text-[#FFA600]">*</span>}
              </FormLabel>
            )}
            <FormControl>
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
                    field.onChange(
                      Array.isArray(selected)
                        ? selected.map((item) => valueKey(item))
                        : [],
                    );
                  } else {
                    field.onChange(
                      selected ? valueKey(selected as TItem) : undefined,
                    );
                  }
                }}
              >
                <ComboboxTrigger
                  className="bg-input"
                  render={
                    <Button
                      variant="outline"
                      disabled={disabled || readOnly}
                      className={cn(
                        "w-full justify-between gap-2 text-sm bg-input disabled:cursor-not-allowed disabled:opacity-50",
                        multiple && "h-auto min-h-10 py-2",
                        !hasValue
                          ? "text-muted-foreground font-normal"
                          : "text-foreground font-normal",
                        fieldState.invalid
                          ? "border-red-500 focus-visible:border-red-500"
                          : "",
                      )}
                    >
                      <ComboboxValue placeholder={placeholder}>
                        {(selected) => {
                          if (
                            !selected ||
                            (Array.isArray(selected) && selected.length === 0)
                          ) {
                            return placeholder;
                          }

                          if (Array.isArray(selected)) {
                            return (
                              <div className="flex flex-wrap gap-1">
                                {selected.map((item) => (
                                  <span
                                    key={String(valueKey(item))}
                                    className="bg-input border-border flex items-center gap-1 rounded-xs border px-1.5 py-0.5 text-xs"
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
                      <ChevronDownIcon className="text-foreground size-4 opacity-50" />
                    </Button>
                  }
                />

                <ComboboxContent className="z-50 min-w-(--anchor-width) w-(--anchor-width)">
                  <ComboboxInput
                    placeholder="Search…"
                    showTrigger={false}
                    value={search}
                    onChange={(e) => {
                      setInternalSearch(e.target.value);
                      onSearchChange?.(e.target.value);
                    }}
                  />

                  <ComboboxEmpty className="text-foreground">
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
                      <ComboboxItem key={valueKey(item)} value={item}>
                        {renderOption ? renderOption(item) : labelKey(item)}
                      </ComboboxItem>
                    ))}
                  </ComboboxList>
                </ComboboxContent>
              </Combobox>
            </FormControl>
            {!hideError && (
              <FormMessage className="absolute bottom-1 ms-1 text-xs font-semibold text-red-500" />
            )}
          </FormItem>
        );
      }}
    />
  );
}
