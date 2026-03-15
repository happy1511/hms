"use client";

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { FormMultiSelectProps } from "@/lib/type";
import { cn } from "@/lib/utils";
import clsx from "clsx";
import { FieldValues } from "react-hook-form";
import MultipleSelector from "../common/MultipleSelector";

export function FormMultiSelect<T extends FieldValues>({
  name,
  control,
  label,
  placeholder = "Select an option",
  required = false,
  className = "",
  options,
  rules,
  hideError = false,
}: FormMultiSelectProps<T>) {
  return (
    <FormField
      control={control}
      name={name}
      rules={rules}
      render={({ field }) => (
        <FormItem
          className={cn(
            "gap-1 relative text-primary",
            hideError ? "" : "pb-4 gap-1",
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
            <MultipleSelector
              {...field}
              placeholder={placeholder}
              options={options as { label: string; value: string }[]}
              className={clsx(
                "h-6! focus:border-accent-blue text-tiny [&_svg]:size-3 capitalize w-full shadow-none",
                className,
              )}
              emptyIndicator={
                <p className="text-center text-lg leading-10 text-gray-600 dark:text-gray-400">
                  no results found.
                </p>
              }
            />
          </FormControl>

          {!hideError && (
            <FormMessage className="absolute bottom-1 left-1 text-tiny font-semibold" />
          )}
        </FormItem>
      )}
    />
  );
}
