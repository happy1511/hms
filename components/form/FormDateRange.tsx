"use client";

import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { useId } from "react";
import { Control, FieldValues, Path } from "react-hook-form";

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

interface FormDateRangePickerProps<T extends FieldValues> {
  nameFrom: Path<T>;
  nameTo: Path<T>;
  control: Control<T>;
  label?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  minDate?: Date;
  maxDate?: Date;
  className?: string;
  formItemClassName?: string;
  hideError?: boolean;
}

export function FormDateRangePicker<T extends FieldValues>({
  nameFrom,
  nameTo,
  control,
  label,
  placeholder = "Pick a date range",
  required = false,
  disabled = false,
  minDate,
  maxDate,
  className = "",
  formItemClassName = "",
  hideError = false,
}: FormDateRangePickerProps<T>) {
  const id = useId();

  return (
    <FormField
      control={control}
      name={nameFrom}
      render={({ field, fieldState }) => (
        <FormItem
          className={cn(
            "gap-1 relative text-primary",
            hideError ? "" : "pb-4 gap-1",
            formItemClassName
          )}
        >
          {label && (
            <FormLabel className="text-tiny font-semibold font-quicksand">
              {label}
              {required && <span className="text-[#FFA600] text-tiny">*</span>}
            </FormLabel>
          )}

          <FormControl className="h-6 flex items-center">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id={id}
                  variant="outline"
                  disabled={disabled}
                  className={cn(
                    "w-full justify-start rounded-sm bg-primary text-left font-normal border border-border focus-visible:ring-0 text-tiny",
                    !field.value && "text-muted-foreground",
                    fieldState.invalid &&
                      "border-red-500 focus-visible:border-red-500",
                    className
                  )}
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
                  mode="range"
                  selected={{
                    from: field.value,
                  }}
                  onSelect={(range) => {
                    field.onChange(range?.from ?? undefined);
                    control._formValues[nameTo] = range?.to;
                  }}
                  disabled={(date) => {
                    if (minDate && date < minDate) return true;
                    if (maxDate && date > maxDate) return true;
                    return false;
                  }}
                  initialFocus
                  className="text-tiny"
                />
              </PopoverContent>
            </Popover>
          </FormControl>

          {!hideError && (
            <FormMessage className="absolute bottom-1 font-semibold text-tiny text-red-500 ms-1" />
          )}
        </FormItem>
      )}
    />
  );
}
