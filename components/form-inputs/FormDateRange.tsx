"use client";

import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { useState } from "react";
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

import {
  startOfToday,
  endOfToday,
  subDays,
  startOfMonth,
  endOfMonth,
  subMonths,
} from "date-fns";
import { isSameDay } from "date-fns";
import CustomButton from "../common/CustomButton";

const isSameRange = (a?: DateRange, b?: DateRange) => {
  if (!a?.from || !a?.to || !b?.from || !b?.to) return false;

  return isSameDay(a.from, b.from) && isSameDay(a.to, b.to);
};

export const DATE_PRESETS: { label: string; range: DateRange }[] = [
  {
    label: "Today",
    range: {
      from: startOfToday(),
      to: endOfToday(),
    },
  },
  {
    label: "Yesterday",
    range: {
      from: subDays(startOfToday(), 1),
      to: subDays(endOfToday(), 1),
    },
  },
  {
    label: "Last 7 Days",
    range: {
      from: subDays(startOfToday(), 6),
      to: endOfToday(),
    },
  },
  {
    label: "Last 30 Days",
    range: {
      from: subDays(startOfToday(), 29),
      to: endOfToday(),
    },
  },
  {
    label: "This Month",
    range: {
      from: startOfMonth(new Date()),
      to: endOfMonth(new Date()),
    },
  },
  {
    label: "Last Month",
    range: {
      from: startOfMonth(subMonths(new Date(), 1)),
      to: endOfMonth(subMonths(new Date(), 1)),
    },
  },
];

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
  const [open, setOpen] = useState(false);

  return (
    <FormField
      control={control}
      name={name}
      render={({ field, fieldState }) => {
        const value = field.value as DateRange | undefined;
        const isValidRange = Boolean(value?.from && value?.to);

        return (
          <FormItem
            className={cn(
              "relative",
              fieldState.error || !hideError ? "pb-4 gap-1" : "",
            )}
          >
            {label && (
              <FormLabel>
                {label}
                {required && <span className="text-[#FFA600]">*</span>}
              </FormLabel>
            )}

            <Popover open={open} onOpenChange={setOpen}>
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
                <div className="flex">
                  {/* Presets */}
                  <div className="flex w-[150px] flex-col gap-1 border-r p-2">
                    {DATE_PRESETS.map((preset) => {
                      const active = isSameRange(value, preset.range);

                      return (
                        <Button
                          key={preset.label}
                          variant={active ? "secondary" : "ghost"}
                          size="sm"
                          className="justify-start text-tiny h-auto py-1"
                          onClick={() => {
                            field.onChange(preset.range);
                            setOpen(false);
                          }}
                        >
                          {preset.label}
                        </Button>
                      );
                    })}
                  </div>

                  {/* Calendar */}
                  <Calendar
                    mode="range"
                    selected={value}
                    onSelect={field.onChange}
                    defaultMonth={value?.from}
                    numberOfMonths={numberOfMonths}
                    disabled={(date: Date) =>
                      (date > endOfToday() ||
                        (minDate && date < minDate) ||
                        (maxDate && date > maxDate)) as boolean
                    }
                    initialFocus
                    className="[--cell-size:--spacing(6)]"
                    classNames={{
                      day_button: "text-tiny",
                      month_grid: "text-tiny",
                      caption_label: "text-tiny",
                      weekday:
                        "text-muted-foreground flex-1 font-normal select-none text-tiny",
                    }}
                  />
                </div>
                <div className="flex items-center justify-end border-t p-2">
                  <CustomButton
                    type="button"
                    disabled={!isValidRange}
                    onClick={() => setOpen(false)}
                  >
                    Apply
                  </CustomButton>
                </div>
              </PopoverContent>
            </Popover>
            <FormMessage className="absolute bottom-1 left-1 text-tiny font-semibold" />
          </FormItem>
        );
      }}
    />
  );
}
