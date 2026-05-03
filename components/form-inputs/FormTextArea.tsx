"use client";

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import clsx from "clsx";
import { useId } from "react";
import { FieldValues, useWatch } from "react-hook-form";
import { Textarea } from "../ui/textarea";
import { FormTextareaProps } from "@/lib/type";
import { cn } from "@/lib/utils";

export function FormTextarea<T extends FieldValues>({
  name,
  control,
  label,
  className = "",
  placeholder,
  required = false,
  rows = 4,
  showCount = false,
  maxChar,
  hideError,
}: FormTextareaProps<T>) {
  const id = useId();
  const value = useWatch({ control, name }) ?? "";

  const charCount = value?.length || 0;
  const hasExceeded = maxChar !== undefined && charCount > maxChar;

  return (
    <FormField
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <FormItem
          className={cn(
            "text-primary relative",
            fieldState.error || !hideError ? "pb-4 gap-1" : "",
          )}
        >
          {label && (
            <FormLabel className="text-tiny gap-0 font-semibold font-quicksand">
              {label}
              {required && (
                <span className="text-[#FFA600] text-tiny! ms-1">*</span>
              )}
            </FormLabel>
          )}

          <FormControl>
            <Textarea
              id={id}
              placeholder={placeholder}
              rows={rows}
              maxLength={maxChar}
              className={`selection:text-white selection:bg-gray-500 focus-visible:border-accent-blue h-auto text-tiny! focus-visible:ring-0 border shadow-none ring-0 border-border ${
                fieldState.invalid
                  ? "border-destructive focus-visible:border-destructive"
                  : ""
              } ${className}`}
              {...field}
            />
          </FormControl>

          {showCount && maxChar && (
            <div
              className={clsx(
                "absolute bottom-1 right-1 text-tiny font-medium",
                hasExceeded ? "text-destructive" : "text-gray-500",
              )}
            >
              {charCount}/{maxChar}
            </div>
          )}
          <FormMessage className="absolute bottom-1 left-1 text-tiny font-semibold" />
        </FormItem>
      )}
    />
  );
}
