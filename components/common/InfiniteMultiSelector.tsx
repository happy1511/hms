"use client";

import { Command as CommandPrimitive, useCommandState } from "cmdk";
import { X, ChevronDownIcon } from "lucide-react";
import * as React from "react";
import { forwardRef } from "react";

import { Badge } from "@/components/ui/badge";
import {
  Command,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";

/* =======================
 Types
======================= */

export interface Option {
  value: string;
  label: string;
  disable?: boolean;
  fixed?: boolean;
  [key: string]: string | boolean | undefined;
}

interface GroupOption {
  [key: string]: Option[];
}

export interface InfiniteMultipleSelectorProps {
  value?: Option[];
  options: Option[];

  placeholder?: string;
  onChange?: (options: Option[]) => void;

  maxSelected?: number;
  onMaxSelected?: (maxLimit: number) => void;

  disabled?: boolean;
  hidePlaceholderWhenSelected?: boolean;
  hideClearAllButton?: boolean;

  groupBy?: string;
  className?: string;
  badgeClassName?: string;

  creatable?: boolean;
  selectFirstItem?: boolean;

  /** Infinite query props */
  hasNextPage?: boolean;
  isFetchingNextPage?: boolean;
  onLoadMore?: () => void;

  commandProps?: React.ComponentPropsWithoutRef<typeof Command>;
  inputProps?: Omit<
    React.ComponentPropsWithoutRef<typeof CommandPrimitive.Input>,
    "value" | "placeholder" | "disabled"
  >;
}

export interface InfiniteMultipleSelectorRef {
  selectedValue: Option[];
  input: HTMLInputElement;
  focus: () => void;
  reset: () => void;
}

/* =======================
 Helpers
======================= */

function transToGroupOption(options: Option[], groupBy?: string): GroupOption {
  if (!groupBy) return { "": options };

  return options.reduce<GroupOption>((acc, option) => {
    const key = (option[groupBy] as string) || "";
    acc[key] ??= [];
    acc[key].push(option);
    return acc;
  }, {});
}

function removePickedOption(groupOption: GroupOption, picked: Option[]) {
  const pickedValues = new Set(picked.map((p) => p.value));
  return Object.fromEntries(
    Object.entries(groupOption).map(([key, values]) => [
      key,
      values.filter((v) => !pickedValues.has(v.value)),
    ]),
  );
}

/* =======================
 Empty Fix (cmdk)
======================= */

const CommandEmpty = forwardRef<
  HTMLDivElement,
  React.ComponentProps<typeof CommandPrimitive.Empty>
>((props, ref) => {
  const render = useCommandState((s) => s.filtered.count === 0);
  if (!render) return null;
  return <div ref={ref} className="py-6 text-center text-sm" {...props} />;
});
CommandEmpty.displayName = "CommandEmpty";

/* =======================
 Component
======================= */

const InfiniteMultipleSelector = forwardRef<
  InfiniteMultipleSelectorRef,
  InfiniteMultipleSelectorProps
>(
  (
    {
      value,
      options,
      onChange,
      placeholder,
      maxSelected = Number.MAX_SAFE_INTEGER,
      onMaxSelected,
      disabled,
      hidePlaceholderWhenSelected,
      hideClearAllButton,
      groupBy,
      className,
      badgeClassName,
      creatable = false,
      selectFirstItem = true,
      hasNextPage,
      isFetchingNextPage,
      onLoadMore,
      commandProps,
      inputProps,
    },
    ref,
  ) => {
    const inputRef = React.useRef<HTMLInputElement>(null);
    const listRef = React.useRef<HTMLDivElement>(null);

    const [open, setOpen] = React.useState(false);
    const [inputValue, setInputValue] = React.useState("");
    const [selected, setSelected] = React.useState<Option[]>(value ?? []);

    React.useEffect(() => {
      if (value) setSelected(value);
    }, [value]);

    React.useImperativeHandle(ref, () => ({
      selectedValue: selected,
      input: inputRef.current!,
      focus: () => inputRef.current?.focus(),
      reset: () => setSelected([]),
    }));

    const groupedOptions = React.useMemo(
      () => transToGroupOption(options, groupBy),
      [options, groupBy],
    );

    const selectables = React.useMemo(
      () => removePickedOption(groupedOptions, selected),
      [groupedOptions, selected],
    );

    const handleUnselect = (option: Option) => {
      if (option.fixed) return;
      const next = selected.filter((s) => s.value !== option.value);
      setSelected(next);
      onChange?.(next);
    };

    /* =======================
       Creatable
    ======================= */

    const creatableItem =
      creatable &&
      inputValue &&
      !selected.some((s) => s.value === inputValue) ? (
        <CommandItem
          value={inputValue}
          onSelect={() => {
            if (selected.length >= maxSelected) {
              onMaxSelected?.(maxSelected);
              return;
            }
            const next = [
              ...selected,
              { value: inputValue, label: inputValue },
            ];
            setSelected(next);
            onChange?.(next);
            setInputValue("");
          }}
        >
          Create &quot;{inputValue}&quot;
        </CommandItem>
      ) : null;

    return (
      <Command
        {...commandProps}
        className={cn("h-auto overflow-visible bg-transparent", className)}
      >
        {/* Input */}
        <div
          className="flex flex-wrap items-center gap-1 rounded-md border px-3 py-2"
          onClick={() => inputRef.current?.focus()}
        >
          {selected.map((option) => (
            <Badge
              key={option.value}
              className={cn("flex items-center gap-1", badgeClassName)}
            >
              {option.label}
              {!option.fixed && (
                <button onClick={() => handleUnselect(option)}>
                  <X className="h-3 w-3" />
                </button>
              )}
            </Badge>
          ))}

          <CommandPrimitive.Input
            ref={inputRef}
            value={inputValue}
            disabled={disabled}
            onValueChange={setInputValue}
            onFocus={() => setOpen(true)}
            onBlur={() => setOpen(false)}
            placeholder={
              hidePlaceholderWhenSelected && selected.length ? "" : placeholder
            }
            className="flex-1 bg-transparent outline-none"
            {...inputProps}
          />

          {!hideClearAllButton && selected.length > 0 && (
            <button
              onClick={() => {
                const fixed = selected.filter((s) => s.fixed);
                setSelected(fixed);
                onChange?.(fixed);
              }}
            >
              <X className="h-4 w-4" />
            </button>
          )}

          <ChevronDownIcon className="h-4 w-4 opacity-50" />
        </div>

        {/* Dropdown */}
        {open && (
          <CommandList
            ref={listRef}
            onScroll={(e) => {
              const el = e.currentTarget;
              if (
                el.scrollTop + el.clientHeight >= el.scrollHeight - 20 &&
                hasNextPage &&
                !isFetchingNextPage
              ) {
                onLoadMore?.();
              }
            }}
            className="absolute z-10 mt-1 max-h-64 w-full overflow-auto rounded-md border bg-popover shadow-md"
          >
            <CommandEmpty>No results found.</CommandEmpty>

            {creatableItem}

            {!selectFirstItem && <CommandItem value="-" className="hidden" />}

            {Object.entries(selectables).map(([group, items]) => (
              <CommandGroup key={group} heading={group}>
                {items.map((option) => (
                  <CommandItem
                    key={option.value}
                    value={option.label}
                    disabled={option.disable}
                    onSelect={() => {
                      if (selected.length >= maxSelected) {
                        onMaxSelected?.(maxSelected);
                        return;
                      }
                      const next = [...selected, option];
                      setSelected(next);
                      onChange?.(next);
                      setInputValue("");
                    }}
                  >
                    {option.label}
                  </CommandItem>
                ))}
              </CommandGroup>
            ))}

            {isFetchingNextPage && (
              <CommandItem disabled className="justify-center">
                Loading more…
              </CommandItem>
            )}

            {!hasNextPage && options.length > 0 && (
              <CommandItem disabled className="justify-center text-xs">
                No more results
              </CommandItem>
            )}
          </CommandList>
        )}
      </Command>
    );
  },
);

InfiniteMultipleSelector.displayName = "InfiniteMultipleSelector";
export default InfiniteMultipleSelector;
