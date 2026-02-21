// import * as React from "react";
// import { ControllerRenderProps, FieldValues, Path } from "react-hook-form";
// import { cn } from "@/lib/utils";
// import clsx from "clsx";

// // your UI components
// import {
//   FormField,
//   FormItem,
//   FormLabel,
//   FormControl,
//   FormMessage,
// } from "@/components/ui/form";

// import {
//   Combobox,
//   ComboboxTrigger,
//   ComboboxValue,
//   ComboboxContent,
//   ComboboxInput,
//   ComboboxEmpty,
//   ComboboxList,
//   ComboboxItem,
// } from "@/components/ui/combobox";

// import { Button } from "@/components/ui/button";
// import { FormInfiniteSelectProps } from "@/lib/type";
// import { InfiniteData, UseInfiniteQueryResult } from "@tanstack/react-query";

// /* -------------------------------------------------------------------------------------------------
//  * Inner Component (safe place for hooks)
//  * -------------------------------------------------------------------------------------------------*/

// type InnerSelectProps<
//   TItem,
//   TPage,
//   TValue,
//   TFieldValues extends FieldValues,
// > = {
//   field: ControllerRenderProps<TFieldValues, Path<TFieldValues>>;
//   items: readonly TItem[];
//   multiple: boolean;
//   valueKey: (item: TItem) => TValue;
//   labelKey: (item: TItem) => string;
//   placeholder?: string;
//   className?: string;
//   query: UseInfiniteQueryResult<InfiniteData<TPage>>;
// };

// function InnerSelect<
//   TItem,
//   TPage,
//   TValue extends string | number,
//   TFieldValues extends FieldValues,
// >({
//   field,
//   items,
//   multiple,
//   valueKey,
//   labelKey,
//   placeholder,
//   className,
//   query,
// }: InnerSelectProps<TItem, TPage, TValue, TFieldValues>) {
//   const scrollRef = React.useRef<HTMLDivElement | null>(null);

//   const value = field.value as TValue | TValue[] | undefined;

//   /* ------------------ controlled value fix ------------------ */
//   const selectedItems = React.useMemo(() => {
//     if (multiple) {
//       return Array.isArray(value)
//         ? items.filter((item) => value.includes(valueKey(item)))
//         : []; // never undefined
//     }

//     return value !== undefined && value !== null && value !== ""
//       ? (items.find((item) => valueKey(item) === value) ?? null)
//       : null;
//   }, [value, items, multiple, valueKey]);

//   /* ------------------ infinite scroll ------------------ */
//   const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
//     const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;

//     const isBottom = scrollTop + clientHeight >= scrollHeight - 5;

//     if (isBottom && query.hasNextPage && !query.isFetchingNextPage) {
//       query.fetchNextPage();
//     }
//   };

//   return (
//     <Combobox
//       items={items}
//       multiple={multiple}
//       value={selectedItems}
//       onValueChange={(selected) => {
//         if (multiple) {
//           field.onChange(
//             Array.isArray(selected)
//               ? selected.map((item) => valueKey(item))
//               : [],
//           );
//         } else {
//           field.onChange(selected ? valueKey(selected as TItem) : null);
//         }
//       }}
//     >
//       {/* Trigger */}
//       <ComboboxTrigger
//         render={
//           <Button
//             variant="outline"
//             className={clsx(
//               "rounded-sm h-6! py-0 px-2 bg-white focus:border-accent-blue text-tiny [&_svg]:size-3 capitalize w-full shadow-none flex justify-start",
//               className,
//             )}
//           >
//             <ComboboxValue placeholder={placeholder}>
//               {(item) => (!item ? placeholder : labelKey(item))}
//             </ComboboxValue>
//           </Button>
//         }
//       />

//       {/* Dropdown */}
//       <ComboboxContent className="z-50 relative">
//         <ComboboxInput
//           placeholder="Search…"
//           className="sticky top-0 z-10 bg-background"
//           showTrigger={false}
//         />

//         <ComboboxEmpty>
//           {query.isLoading ? "Loading…" : "No results"}
//         </ComboboxEmpty>

//         <ComboboxList
//           className="max-h-60 overflow-y-auto"
//           onScroll={handleScroll}
//         >
//           {(item) => (
//             <ComboboxItem key={String(valueKey(item))} value={item}>
//               {labelKey(item)}
//             </ComboboxItem>
//           )}
//         </ComboboxList>

//         {query.isFetchingNextPage && (
//           <div className="p-2 text-center text-xs text-muted-foreground">
//             Loading more...
//           </div>
//         )}
//       </ComboboxContent>
//     </Combobox>
//   );
// }

// /* -------------------------------------------------------------------------------------------------
//  * Main FormInfiniteSelect
//  * -------------------------------------------------------------------------------------------------*/

// export function FormInfiniteSelect<
//   TItem,
//   TPage,
//   TValue extends string | number,
//   TFieldValues extends FieldValues,
// >({
//   name,
//   control,
//   label,
//   required,
//   multiple = false,
//   formItemClassName,
//   query,
//   getItems,
//   valueKey,
//   labelKey,
//   placeholder,
//   hideError = false,
//   className,
// }: FormInfiniteSelectProps<TItem, TPage, TValue, TFieldValues>) {
//   const items: readonly TItem[] = query.data?.pages.flatMap(getItems) ?? [];

//   return (
//     <FormField
//       name={name}
//       control={control}
//       render={({ field }) => (
//         <FormItem
//           className={cn(
//             "text-primary relative",
//             hideError ? "" : "pb-4 gap-1",
//             formItemClassName,
//           )}
//         >
//           {label && (
//             <FormLabel className="gap-0 font-semibold font-quicksand text-tiny">
//               {label}
//               {required && <span className="text-[#FFA600] text-tiny!">*</span>}
//             </FormLabel>
//           )}

//           <FormControl className="h-6 flex items-center">
//             <InnerSelect<TItem, TPage, TValue, TFieldValues>
//               field={field}
//               items={items}
//               multiple={multiple}
//               valueKey={valueKey}
//               labelKey={labelKey}
//               placeholder={placeholder}
//               className={className}
//               query={query}
//             />
//           </FormControl>

//           {!hideError && (
//             <FormMessage className="absolute bottom-1 font-semibold text-tiny! ms-1" />
//           )}
//         </FormItem>
//       )}
//     />
//   );
// }

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

/* -------------------------------------------------------------------------------------------------
 * Types
 * -------------------------------------------------------------------------------------------------*/

type Option<TItem, TValue> = {
  label: string;
  value: TValue;
  item: TItem;
};

type InnerSelectProps<
  TItem,
  TPage,
  TValue,
  TFieldValues extends FieldValues,
> = {
  field: ControllerRenderProps<TFieldValues, Path<TFieldValues>>;
  items: readonly TItem[];
  multiple: boolean;
  valueKey: (item: TItem) => TValue;
  labelKey: (item: TItem) => string;
  placeholder?: string;
  className?: string;
  query: UseInfiniteQueryResult<InfiniteData<TPage>>;
  getItems: (page: TPage) => TItem[];
  search: string;
  onSearchChange: (val: string) => void;
};

type Additional = {
  page: number;
};

function InnerSelect<
  TItem,
  TPage,
  TValue extends string | number,
  TFieldValues extends FieldValues,
>({
  field,
  items,
  multiple,
  valueKey,
  labelKey,
  placeholder,
  className,
  query,
  getItems,
  search,
  onSearchChange,
}: InnerSelectProps<TItem, TPage, TValue, TFieldValues>) {
  const value = field.value as TValue | TValue[] | null | undefined;

  const mapToOption = React.useCallback(
    (item: TItem): Option<TItem, TValue> => ({
      label: labelKey(item),
      value: valueKey(item),
      item,
    }),
    [labelKey, valueKey],
  );

  const loadOptions: LoadOptions<
    Option<TItem, TValue>,
    GroupBase<Option<TItem, TValue>>,
    Additional
  > = async (_inputValue, _loadedOptions, additional) => {
    const { page } = additional as Additional;
    const res =
      page === 1 ? await query.refetch() : await query.fetchNextPage();

    const lastPage = res.data?.pages?.[res.data.pages.length - 1];
    const newItems = lastPage ? getItems(lastPage) : [];

    return {
      options: newItems.map(mapToOption),
      hasMore: query.hasNextPage ?? false,
      additional: { page: page + 1 },
    };
  };

  const selectedValue = React.useMemo<
    Option<TItem, TValue> | Option<TItem, TValue>[] | null
  >(() => {
    if (multiple) {
      if (!Array.isArray(value)) return [];
      return items
        .filter((item) => value.includes(valueKey(item)))
        .map(mapToOption);
    }

    if (value === null || value === undefined || value === "") return null;

    const found = items.find((item) => valueKey(item) === value);
    return found ? mapToOption(found) : null;
  }, [value, items, multiple, valueKey, mapToOption]);

  return (
    <AsyncPaginate<
      Option<TItem, TValue>,
      GroupBase<Option<TItem, TValue>>,
      Additional
    >
      isMulti={multiple ? false : undefined}
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
          const vals =
            (selected as Option<TItem, TValue>[] | null)?.map((o) => o.value) ??
            [];
          field.onChange(vals);
        } else {
          const val = (selected as Option<TItem, TValue> | null)?.value ?? null;
          field.onChange(val);
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
        valueContainer: (base) => ({
          ...base,
          padding: "0 6px",
        }),
        indicatorsContainer: (base) => ({
          ...base,
          height: 24,
        }),
        dropdownIndicator: (base) => ({
          ...base,
          padding: 4,
        }),
        clearIndicator: (base) => ({
          ...base,
          padding: 4,
        }),
        menu: (base) => ({
          ...base,
          zIndex: 50,
        }),
      }}
    />
  );
}

/* -------------------------------------------------------------------------------------------------
 * Main FormInfiniteSelect
 * -------------------------------------------------------------------------------------------------*/

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
      render={({ field }) => (
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
            <InnerSelect<TItem, TPage, TValue, TFieldValues>
              field={field}
              items={items}
              multiple={multiple}
              valueKey={valueKey}
              labelKey={labelKey}
              placeholder={placeholder}
              className={clsx("w-full", className)}
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
