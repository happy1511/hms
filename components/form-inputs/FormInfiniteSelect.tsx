"use client";

import * as React from "react";
import { ControllerRenderProps, FieldValues, Path } from "react-hook-form";
import { cn } from "@/lib/utils";
import clsx from "clsx";

import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";

import { AsyncPaginate, LoadOptions } from "react-select-async-paginate";
import { FormInfiniteSelectProps } from "@/lib/type";
import { InfiniteData, UseInfiniteQueryResult } from "@tanstack/react-query";
import { GroupBase } from "react-select";

type Option<TItem> = {
  label: string;
  value: string | number; // comparison key
  item: TItem; // full object
};

type InnerSelectProps<TItem, TPage, TFieldValues extends FieldValues> = {
  field: ControllerRenderProps<TFieldValues, Path<TFieldValues>>;
  items: readonly TItem[];
  multiple: boolean;
  valueKey: (item: TItem) => string | number;
  labelKey: (item: TItem) => string;
  placeholder?: string;
  className?: string;
  query: UseInfiniteQueryResult<InfiniteData<TPage>>;
  getItems: (page: TPage) => TItem[];
  search: string;
  onSearchChange: (val: string) => void;
};

type Additional = { page: number };

function InnerSelect<TItem, TPage, TFieldValues extends FieldValues>({
  field,
  multiple,
  valueKey,
  labelKey,
  placeholder,
  className,
  query,
  getItems,
  search,
  onSearchChange,
}: InnerSelectProps<TItem, TPage, TFieldValues>) {
  const value = field.value as TItem | TItem[] | null | undefined;

  const mapToOption = React.useCallback(
    (item: TItem): Option<TItem> => ({
      label: labelKey(item),
      value: String(valueKey(item)),
      item,
    }),
    [labelKey, valueKey],
  );

  const loadOptions: LoadOptions<
    Option<TItem>,
    GroupBase<Option<TItem>>,
    Additional
  > = async (_inputValue, _loadedOptions, additional) => {
    const { page } = additional as Additional;
    const res =
      page === 1 ? await query.refetch() : await query.fetchNextPage();
    const lastPage = res.data?.pages[res.data.pages.length - 1];
    const newItems = lastPage ? getItems(lastPage) : [];

    return {
      options: newItems.map(mapToOption),
      hasMore: query.hasNextPage ?? false,
      additional: { page: page + 1 },
    };
  };

  const selectedValue = React.useMemo<
    Option<TItem> | Option<TItem>[] | null
  >(() => {
    if (multiple) {
      if (!Array.isArray(value)) return [];
      return value.map((v) => mapToOption(v));
    }

    if (!value) return null;
    return mapToOption(value as TItem);
  }, [value, mapToOption, multiple]);

  return (
    <AsyncPaginate<Option<TItem>, GroupBase<Option<TItem>>, Additional>
      isMulti={multiple as any}
      value={selectedValue}
      loadOptions={loadOptions}
      additional={{ page: 1 }}
      inputValue={search}
      onInputChange={(val) => {
        onSearchChange(val);
        return val;
      }}
      debounceTimeout={300}
      placeholder={placeholder}
      classNamePrefix="react-select"
      classNames={{
        control: () => clsx("w-full rounded-none!", className),
        valueContainer: () => "h-6 text-tiny",
        input: () => "m-0!",
        option: () => "text-tiny! py-1!",
      }}
      onChange={(selected) => {
        if (multiple) {
          const items =
            (selected as Option<TItem>[] | null)?.map((o) => o.item) ?? [];
          field.onChange(items);
        } else {
          const item = (selected as Option<TItem> | null)?.item ?? null;
          field.onChange(item);
        }
      }}
      styles={{
        control: (base) => ({
          ...base,
          minHeight: 24,
          height: 24,
          fontSize: 12,
          borderRadius: 4,
        }),
        valueContainer: (base) => ({ ...base, padding: "0 6px" }),
        indicatorsContainer: (base) => ({ ...base, height: 24 }),
        dropdownIndicator: (base) => ({ ...base, padding: 4 }),
        clearIndicator: (base) => ({ ...base, padding: 4 }),
        menu: (base) => ({ ...base, zIndex: 50 }),
      }}
    />
  );
}

export function FormInfiniteSelect<
  TItem,
  TPage,
  TValue extends string | number,
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
  hideError = false,
  className,
  search,
  onSearchChange,
}: FormInfiniteSelectProps<TItem, TPage, TValue, TFieldValues>) {
  const items: readonly TItem[] = query.data?.pages.flatMap(getItems) ?? [];

  return (
    <FormField
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <FormItem
          className={cn(
            "text-primary relative",
            hideError ? "" : "pb-4 gap-1",
            formItemClassName,
          )}
        >
          {label && (
            <FormLabel className="gap-0 font-semibold font-quicksand text-tiny">
              {label}
              {required && <span className="text-[#FFA600] text-tiny!">*</span>}
            </FormLabel>
          )}

          <FormControl className="h-6 flex items-center">
            <InnerSelect<TItem, TPage, TFieldValues>
              field={field}
              items={items}
              multiple={multiple}
              valueKey={valueKey}
              labelKey={labelKey}
              placeholder={placeholder}
              className={clsx(
                "w-full",
                fieldState.invalid
                  ? "border-destructive! focus-visible:border-destructive"
                  : "",
              )}
              query={query}
              getItems={getItems}
              search={search}
              onSearchChange={onSearchChange}
            />
          </FormControl>

          {!hideError && (
            <FormMessage className="absolute bottom-1 font-semibold text-tiny! ms-1" />
          )}
        </FormItem>
      )}
    />
  );
}
