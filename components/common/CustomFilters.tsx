import { useEffect, useMemo, useRef, useState } from "react";
import { useForm, FieldValues, Path, DefaultValues } from "react-hook-form";
import { Form } from "@/components/ui/form";
import { FilterConfig } from "@/lib/type";
import { FormInput } from "../form-inputs/FormInput";
import { FormSelect } from "../form-inputs/FormSelect";
import { FormDatePicker } from "../form-inputs/FormDatePicker";
import { FormDateRangePicker } from "../form-inputs/FormDateRange";
import { Label } from "../ui/label";
import CustomButton from "./CustomButton";
import { FormInfiniteSelect } from "../form-inputs/FormInfiniteSelect";
import { cn } from "@/lib/utils";
import { endOfToday, startOfToday } from "date-fns";
import { DateRange } from "react-day-picker";
import { useIsFetching } from "@tanstack/react-query";

interface CustomFiltersProps<T extends FieldValues> {
  filters: FilterConfig<T>[];
  onSubmit: (values: T) => void;
  onRefresh?: () => Promise<unknown> | unknown;
  defaultValues?: DefaultValues<T>;
  className?: string;
  filtersContainerClassName?: string;
  actionsContainerClassName?: string;
  defaultToday?: boolean;
  autoSubmitDefaultToday?: boolean;
  isLoading?: boolean;
  isRefreshing?: boolean;
}

const CustomFilters = <T extends FieldValues>({
  filters,
  onSubmit,
  onRefresh,
  defaultValues,
  className,
  filtersContainerClassName,
  actionsContainerClassName,
  defaultToday = true,
  autoSubmitDefaultToday = true,
  isLoading,
  isRefreshing,
}: CustomFiltersProps<T>) => {
  const hasAutoSubmitted = useRef(false);
  const [filterTriggered, setFilterTriggered] = useState(false);
  const [refreshTriggered, setRefreshTriggered] = useState(false);
  const fetchingCount = useIsFetching();

  const todayRange = useMemo<DateRange>(
    () => ({
      from: startOfToday(),
      to: endOfToday(),
    }),
    [],
  );

  const effectiveDefaultValues = useMemo(() => {
    if (!defaultToday) return defaultValues;

    const dateRangeKeys = filters
      .filter((f) => f.type === "dateRange")
      .map((f) => String(f.valueKey));

    if (dateRangeKeys.length === 0) return defaultValues;

    const merged = { ...(defaultValues || {}) } as Record<string, unknown>;

    for (const key of dateRangeKeys) {
      if (merged[key] === undefined) {
        merged[key] = todayRange;
      }
    }

    return merged as DefaultValues<T>;
  }, [defaultToday, defaultValues, filters, todayRange]);

  const form = useForm<T>({
    mode: "onSubmit",
    defaultValues: effectiveDefaultValues,
  });

  const applyButtonLoading = filterTriggered && (isLoading ?? fetchingCount > 0);
  const refreshButtonLoading =
    refreshTriggered && (isRefreshing ?? isLoading ?? fetchingCount > 0);

  useEffect(() => {
    if (effectiveDefaultValues) {
      form.reset(effectiveDefaultValues);
    }
  }, [effectiveDefaultValues, form]);

  useEffect(() => {
    if (!defaultToday || !autoSubmitDefaultToday) return;
    if (!effectiveDefaultValues) return;
    if (hasAutoSubmitted.current) return;

    const hasDateRangeFilter = filters.some((f) => f.type === "dateRange");
    if (!hasDateRangeFilter) return;

    hasAutoSubmitted.current = true;
    onSubmit(effectiveDefaultValues as T);
  }, [
    autoSubmitDefaultToday,
    defaultToday,
    effectiveDefaultValues,
    filters,
    onSubmit,
  ]);

  useEffect(() => {
    if (!applyButtonLoading && filterTriggered) {
      setFilterTriggered(false);
    }
  }, [applyButtonLoading, filterTriggered]);

  useEffect(() => {
    if (!refreshButtonLoading && refreshTriggered) {
      setRefreshTriggered(false);
    }
  }, [refreshButtonLoading, refreshTriggered]);

  const handleReset = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFilterTriggered(true);
    const clearedValues = {} as DefaultValues<T>;
    form.reset(clearedValues);
    onSubmit(clearedValues as T);
  };

  const handleRefresh = async () => {
    if (!onRefresh) return;
    setRefreshTriggered(true);
    await onRefresh();
  };

  const renderFilter = (filter: FilterConfig<T>) => {
    const { label, valueKey, type, required, placeholder } = filter;

    switch (type) {
      // ---------------- TEXT ----------------
      case "text":
        return (
          <div className="grid grid-cols-5 border border-black/15 rounded-lg">
            <Label className="text-tiny col-span-2 border-r border-black/15 px-2 bg-pink-50">
              {label}
            </Label>
            <div className="col-span-3">
              <FormInput<T>
                name={valueKey}
                control={form.control}
                rules={{
                  required: required ? `${label} is required` : false,
                }}
                placeholder={placeholder || ""}
                hideError
                className="h-6! w-full bg-white shadow-none border-none text-tiny py-1"
              />
            </div>
          </div>
        );

      // ---------------- SELECT ----------------
      case "select":
        return (
          <div className="grid grid-cols-5 border border-black/15 rounded-[4px]">
            <Label className="text-tiny col-span-2 border-r border-black/15 px-2 bg-pink-50">
              {label}
            </Label>
            <div className="col-span-3">
              <FormSelect<T>
                name={valueKey}
                options={filter.options || []}
                control={form.control}
                rules={{
                  required: required ? `${label} is required` : false,
                }}
                placeholder={placeholder || ""}
                hideError
                className="h-6! w-full bg-white shadow-none border-none text-tiny py-1"
              />
            </div>
          </div>
        );

      // ---------------- INFINITE SELECT ----------------
      case "infiniteSelect":
        return (
          <div className="grid grid-cols-5 border border-black/15 rounded-[4px]">
            <Label className="text-tiny col-span-2 border-r border-black/15 px-2 bg-pink-50">
              {label}
            </Label>
            <div className="col-span-3">
              <FormInfiniteSelect
                name={valueKey as Path<T>}
                control={form.control}
                label={undefined}
                required={required}
                placeholder={placeholder || ""}
                query={filter.query}
                getItems={filter.getItems}
                valueKey={filter.valueKeyExtractor}
                labelKey={filter.labelKey}
                hideError
                className="border-none!"
                searchValue={filter.searchValue}
                onSearchChange={filter.onSearchChange}
              />
            </div>
          </div>
        );

      // ---------------- DATE ----------------
      case "date":
        return (
          <div className="grid grid-cols-5 border border-black/15 rounded-[4px]">
            <Label className="text-tiny col-span-2 border-r border-black/15 px-2 bg-pink-50">
              {label}
            </Label>
            <div className="col-span-3">
              <FormDatePicker
                name={valueKey}
                control={form.control}
                rules={{
                  required: required ? `${label} is required` : false,
                }}
                placeholder={placeholder || ""}
                hideError
                className="h-6! w-full bg-white shadow-none border-none text-tiny py-1"
              />
            </div>
          </div>
        );

      // ---------------- DATE RANGE ----------------
      case "dateRange":
        return (
          <div className="grid grid-cols-5 border border-black/15 rounded-[4px]">
            <Label className="text-tiny col-span-2 border-r border-black/15 px-2 bg-pink-50">
              {label}
            </Label>
            <div className="col-span-3">
              <FormDateRangePicker
                control={form.control}
                name={valueKey}
                hideError
                className="h-6! w-full bg-white shadow-none border-none text-tiny py-1"
              />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Form {...form}>
      <form
        onReset={handleReset}
        onSubmit={form.handleSubmit((values) => {
          setFilterTriggered(true);
          onSubmit(values);
        })}
        className={cn("mb-3", className)}
      >
        <div
          className={cn(
            "grid gap-2 grid-cols-3 mb-2",
            filtersContainerClassName,
          )}
        >
          {filters.map((filter) => (
            <div key={String(filter.valueKey)}>{renderFilter(filter)}</div>
          ))}
        </div>

        <div className={cn("w-fit", actionsContainerClassName)}>
          <div
            className={cn(
              "grid gap-2",
              onRefresh ? "grid-cols-3" : "grid-cols-2",
            )}
          >
            <CustomButton type="submit" isLoading={applyButtonLoading}>
              Apply Filters
            </CustomButton>

            <CustomButton
              type="reset"
              variant="outline"
              className="bg-white text-primary shadow-none"
            >
              Clear Filters
            </CustomButton>

            {onRefresh ? (
              <CustomButton
                type="button"
                variant="outline"
                className="bg-white text-primary shadow-none"
                onClick={handleRefresh}
                isLoading={refreshButtonLoading}
              >
                Refresh
              </CustomButton>
            ) : null}
          </div>
        </div>
      </form>
    </Form>
  );
};

export default CustomFilters;
