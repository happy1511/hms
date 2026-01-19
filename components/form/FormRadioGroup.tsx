"use client";

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { FormRadioGroupProps } from "@/lib/type";
import clsx from "clsx";
import { FieldValues } from "react-hook-form";

export function FormRadioGroup<T extends FieldValues>({
  name,
  control,
  label,
  required = false,
  options,
  className = "",
  orientation = "vertical",
}: FormRadioGroupProps<T>) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className="gap-1 relative pb-6 text-primary">
          {label && (
            <FormLabel className="text-tiny font-semibold font-quicksand">
              {label}
              {required && (
                <span className="text-[#FFA600] !text-xl ms-1">*</span>
              )}
            </FormLabel>
          )}

          <FormControl>
            <RadioGroup
              onValueChange={field.onChange}
              value={field.value}
              className={clsx(
                orientation === "horizontal"
                  ? "flex gap-6"
                  : "flex flex-col gap-2",
                className
              )}
            >
              {options.map((option) => (
                <FormItem
                  key={option.value}
                  className="flex items-center gap-2"
                >
                  <FormControl>
                    <RadioGroupItem value={option.value} />
                  </FormControl>

                  <FormLabel className="text-sm font-medium text-text-black cursor-pointer">
                    {option.label}
                  </FormLabel>
                </FormItem>
              ))}
            </RadioGroup>
          </FormControl>

          <FormMessage className="absolute bottom-1 left-1 text-tiny font-semibold" />
        </FormItem>
      )}
    />
  );
}
