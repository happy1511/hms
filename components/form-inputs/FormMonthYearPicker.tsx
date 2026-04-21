"use client";

import { format, startOfMonth } from "date-fns";
import { CalendarIcon } from "lucide-react";
import type { ChangeEvent, ChangeEventHandler } from "react";
import { useId, useState } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { FormMonthYearPickerProps } from "@/lib/type";
import CustomButton from "../common/CustomButton";

export function FormMonthYearPicker<T extends FieldValues>({
  name,
  control,
  label,
  className = "",
  placeholder = "Pick month and year",
  required = false,
  disabled = false,
  minDate,
  maxDate,
  allowFutureDates = false,
  formItemClassName = "",
  rules,
  hideError = false,
}: FormMonthYearPickerProps<T>) {
  const id = useId();
  const [open, setOpen] = useState(false);
  const [displayMonth, setDisplayMonth] = useState(new Date());
  const effectiveMaxDate =
    allowFutureDates
      ? maxDate
      : maxDate && maxDate < new Date()
        ? maxDate
        : new Date();

  const handleCalendarChange = (
    value: string | number,
    event: ChangeEventHandler<HTMLSelectElement>,
  ) => {
    const nextEvent = {
      target: {
        value: String(value),
      },
    } as ChangeEvent<HTMLSelectElement>;

    event(nextEvent);
  };

  return (
    <FormField
      control={control}
      name={name}
      rules={rules}
      render={({ field, fieldState }) => {
        const selectedDate = field.value ? new Date(field.value) : undefined;

        return (
          <FormItem
            className={cn(
              "relative text-primary",
              hideError ? "" : "pb-4 gap-1",
              formItemClassName,
            )}
          >
            {label && (
              <FormLabel className="gap-0 font-semibold font-quicksand text-tiny">
                {label}
                {required && (
                  <span className="text-[#FFA600] text-tiny!">*</span>
                )}
              </FormLabel>
            )}

            <FormControl className="flex items-center">
              <Popover
                open={open}
                onOpenChange={(nextOpen) => {
                  setOpen(nextOpen);
                  if (nextOpen) {
                    setDisplayMonth(selectedDate ?? new Date());
                  }
                }}
              >
                <PopoverTrigger asChild>
                  <Button
                    id={id}
                    variant="outline"
                    disabled={disabled}
                    className={cn(
                      "rounded-sm m-0 py-1 px-3 flex justify-start items-center selection:text-white bg-white selection:bg-gray-500 focus-visible:border-accent-blue h-auto text-tiny! focus-visible:ring-0 border shadow-none ring-0 border-border",
                      fieldState.invalid
                        ? "border-destructive focus-visible:border-destructive"
                        : "",
                      className,
                    )}
                  >
                    <CalendarIcon className="mr-2 size-3" />
                    {selectedDate ? (
                      format(selectedDate, "MMM yyyy")
                    ) : (
                      <span>{placeholder}</span>
                    )}
                  </Button>
                </PopoverTrigger>

                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    captionLayout="dropdown"
                    components={{
                      MonthCaption: (props) => <>{props.children}</>,
                      DropdownNav: (props) => (
                        <div className="flex w-full items-center gap-2 px-3 pt-3">
                          {props.children}
                        </div>
                      ),
                      Dropdown: (props) => (
                        <Select
                          onValueChange={(value) => {
                            if (props.onChange) {
                              handleCalendarChange(value, props.onChange);
                            }
                          }}
                          value={String(props.value)}
                        >
                          <SelectTrigger className="h-8 text-tiny first:flex-1 last:shrink-0">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {props.options?.map((option) => (
                              <SelectItem
                                disabled={option.disabled}
                                key={option.value}
                                value={String(option.value)}
                                className="text-tiny"
                              >
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ),
                    }}
                    hideNavigation
                    month={displayMonth}
                    onMonthChange={setDisplayMonth}
                    startMonth={minDate}
                    endMonth={effectiveMaxDate}
                    className="[&_.rdp-month_grid]:hidden [&_.rdp-weekdays]:hidden [&_.rdp-weeks]:hidden"
                  />
                  <div className="flex items-center justify-between border-t p-2">
                    <CustomButton
                      type="button"
                      variant="ghost"
                      onClick={() => setDisplayMonth(new Date())}
                    >
                      Today
                    </CustomButton>
                    <CustomButton
                      type="button"
                      onClick={() => {
                        field.onChange(startOfMonth(displayMonth));
                        setOpen(false);
                      }}
                    >
                      Apply
                    </CustomButton>
                  </div>
                </PopoverContent>
              </Popover>
            </FormControl>

            {!hideError && (
              <FormMessage className="absolute bottom-1 font-semibold text-tiny text-destructive ms-1" />
            )}
          </FormItem>
        );
      }}
    />
  );
}
