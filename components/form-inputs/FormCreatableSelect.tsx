"use client";

import * as React from "react";
import {
  Control,
  ControllerRenderProps,
  FieldValues,
  Path,
} from "react-hook-form";
import CreatableSelect from "react-select/creatable";
import { GroupBase } from "react-select";
import { cn } from "@/lib/utils";
import clsx from "clsx";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

type Option<TItem> = {
  label: string;
  value: string | number;
  item?: TItem;
  __isNew__?: boolean;
};

type InnerSelectProps<TItem, TFieldValues extends FieldValues> = {
  field: ControllerRenderProps<TFieldValues, Path<TFieldValues>>;
  items: readonly TItem[];
  valueKey: (item: TItem) => string | number;
  labelKey: (item: TItem) => string;
  placeholder?: string;
  className?: string;
  inputValue?: string;
  onInputChange?: (value: string) => void;
  onReachEnd?: () => void;
  createdLabel?: string | null;
  onCreatedLabelChange?: (value: string | null) => void;
  onSelectedItemChange?: (item: TItem | null) => void;
  isLoading?: boolean;
};

type FormCreatableSelectProps<TItem, TFieldValues extends FieldValues> = {
  name: Path<TFieldValues>;
  control: Control<TFieldValues>;
  label?: string;
  required?: boolean;
  placeholder?: string;
  className?: string;
  formItemClassName?: string;
  hideError?: boolean;
  items: readonly TItem[];
  valueKey: (item: TItem) => string | number;
  labelKey: (item: TItem) => string;
  inputValue?: string;
  onInputChange?: (value: string) => void;
  onReachEnd?: () => void;
  createdLabel?: string | null;
  onCreatedLabelChange?: (value: string | null) => void;
  onSelectedItemChange?: (item: TItem | null) => void;
  isLoading?: boolean;
};

function InnerSelect<TItem, TFieldValues extends FieldValues>({
  field,
  items,
  valueKey,
  labelKey,
  placeholder,
  className,
  inputValue,
  onInputChange,
  onReachEnd,
  createdLabel,
  onCreatedLabelChange,
  onSelectedItemChange,
  isLoading = false,
}: InnerSelectProps<TItem, TFieldValues>) {
  const mapToOption = React.useCallback(
    (item: TItem): Option<TItem> => ({
      label: labelKey(item),
      value: String(valueKey(item)),
      item,
    }),
    [labelKey, valueKey],
  );

  const options = React.useMemo(
    () => items.map(mapToOption),
    [items, mapToOption],
  );

  const selectedValue = React.useMemo<Option<TItem> | null>(() => {
    if (field.value) {
      return mapToOption(field.value as TItem);
    }

    if (createdLabel?.trim()) {
      return {
        label: createdLabel.trim(),
        value: createdLabel.trim(),
        __isNew__: true,
      };
    }

    return null;
  }, [createdLabel, field.value, mapToOption]);

  return (
    <CreatableSelect<Option<TItem>, false, GroupBase<Option<TItem>>>
      isClearable
      value={selectedValue}
      options={options}
      inputValue={inputValue}
      onInputChange={(value, meta) => {
        if (meta.action !== "input-change") {
          return value;
        }

        onInputChange?.(value);
        return value;
      }}
      onMenuScrollToBottom={onReachEnd}
      placeholder={placeholder}
      classNamePrefix="react-select"
      isLoading={isLoading}
      classNames={{
        control: () => clsx("w-full rounded!", className),
        valueContainer: () => "h-6 text-tiny",
        input: () => "m-0!",
        option: () => "text-tiny! py-1!",
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
      onChange={(selected) => {
        if (!selected) {
          field.onChange(null);
          onSelectedItemChange?.(null);
          onCreatedLabelChange?.(null);
          onInputChange?.("");
          return;
        }

        if (selected.__isNew__) {
          field.onChange(null);
          onSelectedItemChange?.(null);
          onCreatedLabelChange?.(selected.label);
          onInputChange?.("");
          return;
        }

        field.onChange(selected.item ?? null);
        onSelectedItemChange?.(selected.item ?? null);
        onCreatedLabelChange?.(null);
        onInputChange?.("");
      }}
      formatCreateLabel={(value) => `Create "${value}"`}
    />
  );
}

export function FormCreatableSelect<
  TItem,
  TFieldValues extends FieldValues,
>({
  name,
  control,
  label,
  required,
  placeholder,
  className,
  formItemClassName,
  hideError = false,
  items,
  valueKey,
  labelKey,
  inputValue,
  onInputChange,
  onReachEnd,
  createdLabel,
  onCreatedLabelChange,
  onSelectedItemChange,
  isLoading,
}: FormCreatableSelectProps<TItem, TFieldValues>) {
  return (
    <FormField
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <FormItem
          className={cn(
            "relative text-primary",
            hideError ? "" : "gap-1 pb-4",
            formItemClassName,
          )}
        >
          {label && (
            <FormLabel className="gap-0 font-quicksand font-semibold text-tiny">
              {label}
              {required && <span className="text-[#FFA600] text-tiny!">*</span>}
            </FormLabel>
          )}

          <FormControl className="flex h-6 items-center">
            <InnerSelect<TItem, TFieldValues>
              field={field}
              items={items}
              valueKey={valueKey}
              labelKey={labelKey}
              placeholder={placeholder}
              className={clsx(
                "w-full",
                fieldState.invalid
                  ? "border-destructive! focus-visible:border-destructive"
                  : "",
                className,
              )}
              inputValue={inputValue}
              onInputChange={onInputChange}
              onReachEnd={onReachEnd}
              createdLabel={createdLabel}
              onCreatedLabelChange={onCreatedLabelChange}
              onSelectedItemChange={onSelectedItemChange}
              isLoading={isLoading}
            />
          </FormControl>

          {!hideError && (
            <FormMessage className="absolute bottom-1 ms-1 font-semibold text-tiny!" />
          )}
        </FormItem>
      )}
    />
  );
}
