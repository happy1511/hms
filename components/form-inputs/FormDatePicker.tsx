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
  formItemClassName = "",
  rules,
  hideError = false,
}: FormDatePickerProps<T>) {
  const id = useId();

  return (
    <FormField
      control={control}
      name={name}
      rules={rules}
      render={({ field, fieldState }) => (
        <FormItem
          className={cn(
            "gap-1 relative text-primary",
            hideError ? "" : "pb-4 gap-1",
            formItemClassName,
          )}
        >
          {label && (
            <FormLabel className="gap-0 text-tiny font-semibold font-quicksand">
              {label}
              {required && <span className="text-[#FFA600] text-xl!">*</span>}
            </FormLabel>
          )}

          <FormControl>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id={id}
                  variant="outline"
                  disabled={disabled}
                  className={`rounded-sm selection:text-white selection:bg-gray-500 focus-visible:border-accent-blue h-auto text-tiny! focus-visible:ring-0 border shadow-none ring-0 border-border [&_svg:not([class*='size-'])]:size-3 py-1 px-3 flex justify-start ${
                    fieldState.invalid
                      ? "border-destructive focus-visible:border-destructive"
                      : ""
                  } ${className}`}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
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
                  selected={field.value}
                  onSelect={field.onChange}
                  initialFocus
                  disabled={(date) => {
                    if (minDate && date < minDate) return true;
                    if (maxDate && date > maxDate) return true;
                    return false;
                  }}
                />
              </PopoverContent>
            </Popover>
          </FormControl>

          {!hideError && (
            <FormMessage className="absolute bottom-1 font-semibold text-tiny text-destructive ms-1" />
          )}
        </FormItem>
      )}
    />
  );
}
