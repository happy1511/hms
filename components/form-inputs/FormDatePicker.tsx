"use client";

import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { useId } from "react";
import { FieldValues } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { FormDatePickerProps } from "@/lib/type";

export function FormDatePicker<T extends FieldValues>({
  name,
  control,
  label,
  className = "",
  placeholder = "Pick a date",
  required = false,
  disabled = false,
  minDate,
  maxDate,
  allowFutureDates = false,
  formItemClassName = "",
  rules,
  hideError = false,
}: FormDatePickerProps<T>) {
  const id = useId();
  const effectiveMaxDate =
    allowFutureDates
      ? maxDate
      : maxDate && maxDate < new Date()
        ? maxDate
        : new Date();

  return (
    <FormField
      control={control}
      name={name}
      rules={rules}
      render={({ field, fieldState }) => (
        <FormItem
          className={cn(
            "relative text-primary",
            fieldState.error || !hideError ? "pb-4 gap-1" : "",
            formItemClassName,
          )}
        >
          {label && (
            <FormLabel className="gap-0 font-semibold font-quicksand text-tiny">
              {label}
              {required && <span className="text-[#FFA600] text-tiny!">*</span>}
            </FormLabel>
          )}

          <FormControl className="flex items-center">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id={id}
                  variant="outline"
                  disabled={disabled}
                  className={`rounded-sm m-0 py-1 px-3 flex justify-start items-center selection:text-white bg-white selection:bg-gray-500 focus-visible:border-accent-blue h-auto text-tiny! focus-visible:ring-0 border shadow-none ring-0 border-border ${
                    fieldState.invalid
                      ? "border-destructive focus-visible:border-destructive"
                      : ""
                  } ${className}`}
                >
                  <CalendarIcon className="mr-2 size-3" />
                  {field.value ? (
                    format(field.value, "PPP")
                  ) : (
                    <span>{placeholder}</span>
                  )}
                </Button>
              </PopoverTrigger>

              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  captionLayout="dropdown"
                  startMonth={minDate}
                  endMonth={effectiveMaxDate}
                  selected={field.value}
                  onSelect={field.onChange}
                  initialFocus
                  disabled={(date) => {
                    if (minDate && date < minDate) return true;
                    if (effectiveMaxDate && date > effectiveMaxDate) return true;
                    return false;
                  }}
                />
              </PopoverContent>
            </Popover>
          </FormControl>
          <FormMessage className="absolute bottom-1 font-semibold text-tiny text-destructive ms-1" />
        </FormItem>
      )}
    />
  );
}
