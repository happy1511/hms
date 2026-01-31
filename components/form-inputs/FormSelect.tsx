"use client";

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FormSelectProps } from "@/lib/type";
import { cn } from "@/lib/utils";
import clsx from "clsx";
import { FieldValues } from "react-hook-form";

export function FormSelect<T extends FieldValues>({
  name,
  control,
  label,
  placeholder = "Select an option",
  required = false,
  className = "",
  options,
  rules,
  hideError = false,
}: FormSelectProps<T>) {
  return (
    <FormField
      control={control}
      name={name}
      rules={rules}
      render={({ field }) => (
        <FormItem
          className={cn(
            "gap-1 relative text-primary",
            hideError ? "" : "pb-4 gap-1",
          )}
        >
          {label && (
            <FormLabel className="text-tiny font-semibold font-quicksand">
              {label}
              {required && (
                <span className="text-[#FFA600] text-tiny ms-1">*</span>
              )}
            </FormLabel>
          )}

          <FormControl className="h-6 flex items-center">
            <Select onValueChange={field.onChange} value={field.value}>
              <SelectTrigger
                className={clsx(
                  "rounded-sm h-6! focus:border-accent-blue text-tiny [&_svg]:size-3 capitalize w-full shadow-none",
                  className,
                )}
              >
                <SelectValue placeholder={placeholder} />
              </SelectTrigger>

              <SelectContent>
                {options.map((option) => (
                  <SelectItem
                    key={option.value}
                    value={option.value}
                    className="text-tiny py-1 capitalize"
                  >
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormControl>

          {!hideError && (
            <FormMessage className="absolute bottom-1 left-1 text-tiny font-semibold" />
          )}
        </FormItem>
      )}
    />
  );
}
