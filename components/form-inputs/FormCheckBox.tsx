"use client";

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import clsx from "clsx";
import { FieldValues } from "react-hook-form";
import { FormCheckboxProps } from "@/lib/type";

export function FormCheckbox<T extends FieldValues>({
  name,
  control,
  label,
  required = false,
  className = "",
  formItemClassName = "",
  hideError = false,
  hideLabel = false,
}: FormCheckboxProps<T>) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem
          className={clsx(
            "flex items-center gap-1 relative text-primary",
            hideError ? "" : "pb-4",
            formItemClassName,
          )}
        >
          <FormControl className="h-6 flex items-center">
            <Checkbox
              checked={field.value}
              onCheckedChange={field.onChange}
              className={clsx("mt-1 size-4 h-4", className)}
            />
          </FormControl>

          {!hideLabel && (
            <FormLabel className="text-tiny font-medium font-quicksand">
              {label}
              {required && (
                <span className="text-[#FFA600] text-tiny ms-1">*</span>
              )}
            </FormLabel>
          )}

          {!hideError && (
            <FormMessage className="absolute bottom-1 left-6 text-tiny font-semibold" />
          )}
        </FormItem>
      )}
    />
  );
}
