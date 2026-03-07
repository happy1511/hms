import { useEffect } from "react";
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

interface CustomFiltersProps<T extends FieldValues> {
  filters: FilterConfig<T>[];
  onSubmit: (values: T) => void;
  defaultValues?: DefaultValues<T>;
  className?: string;
  filtersContainerClassName?: string;
  actionsContainerClassName?: string;
}

const CustomFilters = <T extends FieldValues>({
  filters,
  onSubmit,
  defaultValues,
  className,
  filtersContainerClassName,
  actionsContainerClassName,
}: CustomFiltersProps<T>) => {
  const form = useForm<T>({
    mode: "onSubmit",
    defaultValues,
  });

  useEffect(() => {
    if (defaultValues) {
      form.reset(defaultValues);
    }
  }, [defaultValues, form]);

  const handleReset = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const clearedValues = {} as DefaultValues<T>;
    form.reset(clearedValues);
    onSubmit(clearedValues as T);
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
                search={filter.search}
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
        onSubmit={form.handleSubmit(onSubmit)}
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
          <div className="grid grid-cols-2 space-x-2">
            <CustomButton type="submit">Apply Filters</CustomButton>

            <CustomButton
              type="reset"
              variant="outline"
              className="bg-white text-primary shadow-none"
            >
              Clear Filters
            </CustomButton>
          </div>
        </div>
      </form>
    </Form>
  );
};

export default CustomFilters;
