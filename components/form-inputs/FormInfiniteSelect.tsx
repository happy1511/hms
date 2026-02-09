"use client";

import { FormInfiniteSelectProps } from "@/lib/type";
import { FieldValues } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";
import clsx from "clsx";
import { useState } from "react";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "../ui/command";
import { ScrollArea } from "../ui/scroll-area";
import { Check } from "lucide-react";
import InfiniteScroll from "../common/CustomInfiniteScroll";

export function FormInfiniteSelect<T extends FieldValues>({
  name,
  control,
  label,
  options,
  onSearch,
  hasNextPage,
  fetchNextPage,
  isFetchingNextPage,
  className = "",
  placeholder,
  required = false,
  disabled = false,
  formItemClassName = "",
  rules,
  hideError = false,
  multiple = false,
}: FormInfiniteSelectProps<T>) {
  const [open, setOpen] = useState(false);

  return (
    <FormField
      control={control}
      name={name}
      rules={rules}
      render={({ field, fieldState }) => {
        const isSelected = (value: string | number) =>
          multiple
            ? Array.isArray(field.value) && field.value.includes(value)
            : field.value === value;

        const toggleSelect = (value: string | number) => {
          if (!multiple) {
            field.onChange(value);
            setOpen(false);
            return;
          }

          const current = Array.isArray(field.value) ? field.value : [];

          if (current.includes(value as never)) {
            field.onChange(current.filter((v) => v !== value));
          } else {
            field.onChange([...current, value]);
          }
        };

        const buttonLabel = multiple
          ? Array.isArray(field.value) && field.value.length
            ? `${field.value.length} selected`
            : placeholder
          : field.value
            ? options.find((o) => o.value === field.value)?.label
            : placeholder;

        return (
          <div className="flex flex-col">
            <FormItem
              className={cn(
                "text-primary relative",
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
              <FormControl className="h-6 flex items-center">
                <>
                  <Button
                    type="button"
                    onClick={() => setOpen(true)}
                    className={clsx(
                      "rounded-sm h-6! bg-white border hover:bg-white focus:border-accent-blue text-tiny [&_svg]:size-3 capitalize w-full shadow-none",
                      fieldState.invalid
                        ? "border-destructive focus-visible:border-destructive"
                        : "",
                      className,
                    )}
                  >
                    {buttonLabel}
                  </Button>
                  <CommandDialog open={open} onOpenChange={setOpen}>
                    <Command>
                      <CommandInput
                        onValueChange={onSearch}
                        placeholder={placeholder}
                      />
                      <CommandList>
                        <CommandEmpty>No results found.</CommandEmpty>
                        <CommandGroup>
                          <ScrollArea className="h-24">
                            <InfiniteScroll
                              isLoading={isFetchingNextPage}
                              hasMore={!!hasNextPage}
                              next={fetchNextPage}
                            >
                              {options?.map((item) => {
                                const selected = isSelected(item.value);

                                return (
                                  <CommandItem
                                    key={item.value}
                                    value={item.label || ""}
                                    onSelect={() => toggleSelect(item.value)}
                                  >
                                    <Check
                                      className={cn(
                                        "mr-2 h-4 w-4 transition-opacity",
                                        selected ? "opacity-100" : "opacity-0",
                                      )}
                                    />
                                    {item.label}
                                  </CommandItem>
                                );
                              })}

                              {/* Optional loading indicator */}
                              {isFetchingNextPage && (
                                <CommandItem
                                  disabled
                                  className="text-xs opacity-60"
                                >
                                  Loading more...
                                </CommandItem>
                              )}
                            </InfiniteScroll>
                          </ScrollArea>
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </CommandDialog>
                </>
              </FormControl>
              {!hideError && (
                <FormMessage className="absolute bottom-1 font-semibold text-tiny! ms-1" />
              )}
            </FormItem>
          </div>
        );
      }}
    />
  );
}
