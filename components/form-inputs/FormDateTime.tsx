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
import { FormDateTimePickerProps } from "@/lib/type";
import { ScrollArea, ScrollBar } from "../ui/scroll-area";

export function FormDateTime<T extends FieldValues>({
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
}: FormDateTimePickerProps<T>) {
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
      render={({ field, fieldState }) => {
        function handleDateSelect(date: Date | undefined) {
          if (date) {
            field.onChange(date);
          }
        }

        function handleTimeChange(
          type: "hour" | "minute" | "ampm",
          value: string,
        ) {
          const currentDate = field.value || new Date();
          const newDate = new Date(currentDate);

          if (type === "hour") {
            const hour = parseInt(value, 10);
            newDate.setHours(newDate.getHours() >= 12 ? hour + 12 : hour);
          } else if (type === "minute") {
            newDate.setMinutes(parseInt(value, 10));
          } else if (type === "ampm") {
            const hours = newDate.getHours();
            if (value === "AM" && hours >= 12) {
              newDate.setHours(hours - 12);
            } else if (value === "PM" && hours < 12) {
              newDate.setHours(hours + 12);
            }
          }

          field.onChange(newDate);
        }
        return (
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
                    className={`selection:text-white selection:bg-gray-500 bg-white focus-visible:border-accent-blue h-auto text-tiny! focus-visible:ring-0 border shadow-none ring-0 border-border [&_svg:not([class*='size-'])]:size-3 py-1 px-3 flex justify-start ${
                      fieldState.invalid
                        ? "border-destructive focus-visible:border-destructive"
                        : ""
                    } ${className}`}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {field.value ? (
                      format(field.value, "MM/dd/yyyy hh:mm aa")
                    ) : (
                      <span>{placeholder}</span>
                    )}
                  </Button>
                </PopoverTrigger>

                <PopoverContent className="w-auto p-0" align="start">
                  <div className="sm:flex">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={handleDateSelect}
                      initialFocus
                      disabled={(date) => {
                        if (minDate && date < minDate) return true;
                        if (effectiveMaxDate && date > effectiveMaxDate) return true;
                        return false;
                      }}
                    />

                    <div className="flex flex-col sm:flex-row sm:h-75 divide-y sm:divide-y-0 sm:divide-x">
                      <ScrollArea className="w-64 sm:w-auto">
                        <div className="flex sm:flex-col p-2">
                          {Array.from({ length: 12 }, (_, i) => i + 1)
                            .reverse()
                            .map((hour) => (
                              <Button
                                key={hour}
                                size="icon"
                                variant={
                                  field.value &&
                                  field.value.getHours() % 12 === hour % 12
                                    ? "default"
                                    : "ghost"
                                }
                                className="sm:w-full shrink-0 aspect-square"
                                onClick={() =>
                                  handleTimeChange("hour", hour.toString())
                                }
                              >
                                {hour}
                              </Button>
                            ))}
                        </div>
                        <ScrollBar
                          orientation="horizontal"
                          className="sm:hidden"
                        />
                      </ScrollArea>
                      <ScrollArea className="w-64 sm:w-auto">
                        <div className="flex sm:flex-col p-2">
                          {Array.from({ length: 12 }, (_, i) => i * 5).map(
                            (minute) => (
                              <Button
                                key={minute}
                                size="icon"
                                variant={
                                  field.value &&
                                  field.value.getMinutes() === minute
                                    ? "default"
                                    : "ghost"
                                }
                                className="sm:w-full shrink-0 aspect-square"
                                onClick={() =>
                                  handleTimeChange("minute", minute.toString())
                                }
                              >
                                {minute.toString().padStart(2, "0")}
                              </Button>
                            ),
                          )}
                        </div>
                        <ScrollBar
                          orientation="horizontal"
                          className="sm:hidden"
                        />
                      </ScrollArea>
                      <ScrollArea className="">
                        <div className="flex sm:flex-col p-2">
                          {["AM", "PM"].map((ampm) => (
                            <Button
                              key={ampm}
                              size="icon"
                              variant={
                                field.value &&
                                ((ampm === "AM" &&
                                  field.value.getHours() < 12) ||
                                  (ampm === "PM" &&
                                    field.value.getHours() >= 12))
                                  ? "default"
                                  : "ghost"
                              }
                              className="sm:w-full shrink-0 aspect-square"
                              onClick={() => handleTimeChange("ampm", ampm)}
                            >
                              {ampm}
                            </Button>
                          ))}
                        </div>
                      </ScrollArea>
                    </div>
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
