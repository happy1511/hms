"use client";

import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { FieldValues } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
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
import { FormDateRangePickerProps } from "@/lib/type";
import { DateRange } from "react-day-picker";

export function FormDateRangePicker<T extends FieldValues>({
  name,
  control,
  label,
  placeholder = "Pick a date",
  required = false,
  disabled = false,
  numberOfMonths = 2,
  minDate,
  maxDate,
  className,
  hideError = false,
}: FormDateRangePickerProps<T>) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field, fieldState }) => {
        const value = field.value as DateRange | undefined;

        return (
          <FormItem className="relative">
            {label && (
              <FormLabel>
                {label}
                {required && <span className="text-[#FFA600]">*</span>}
              </FormLabel>
            )}

            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  disabled={disabled}
                  className={cn(
                    "justify-start px-2.5 font-normal w-full",
                    !value?.from && "text-muted-foreground",
                    fieldState.invalid && "border-destructive",
                    className,
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {value?.from ? (
                    value.to ? (
                      <>
                        {format(value.from, "LLL dd, y")} –{" "}
                        {format(value.to, "LLL dd, y")}
                      </>
                    ) : (
                      format(value.from, "LLL dd, y")
                    )
                  ) : (
                    <span>{placeholder}</span>
                  )}
                </Button>
              </PopoverTrigger>

              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="range"
                  selected={value}
                  onSelect={field.onChange}
                  defaultMonth={value?.from}
                  numberOfMonths={numberOfMonths}
                  // disabled={(date) =>
                  //   (minDate && date < minDate) || (maxDate && date > maxDate)
                  // }
                  initialFocus
                />
              </PopoverContent>
            </Popover>

            {!hideError && <FormMessage className="absolute bottom-[-18px]" />}
          </FormItem>
        );
      }}
    />
  );
}
