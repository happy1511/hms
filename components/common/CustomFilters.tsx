import { useForm, FieldValues } from "react-hook-form";
import { Form } from "@/components/ui/form";
import { FilterConfig } from "@/lib/type";
import { FormInput } from "../form/FormInput";
import { FormSelect } from "../form/FormSelect";
import { FormDatePicker } from "../form/FormDatePicker";
import { FormDateRangePicker } from "../form/FormDateRange";
import { Label } from "../ui/label";
import CustomButton from "./CustomButton";

interface CustomFiltersProps<T extends FieldValues> {
  filters: FilterConfig<T>[];
  onSubmit: (values: T) => void;
}

const CustomFilters = <T extends FieldValues>({
  filters,
  onSubmit,
}: CustomFiltersProps<T>) => {
  const form = useForm<T>({
    mode: "onSubmit",
  });

  const renderFilter = (filter: FilterConfig<T>) => {
    const { label, valueKey, type, options, required, placeholder } = filter;

    switch (type) {
      case "text":
        return (
          <div className="grid grid-cols-5 border border-secondary rounded-[4px] overflow-hidden">
            <Label className="text-tiny col-span-2 border-r border-pink-200 px-2 bg-pink-50">
              {label}
            </Label>
            <div className="col-span-3">
              <FormInput<T>
                name={valueKey}
                rules={{
                  required: required ? `${label} is required` : false,
                }}
                control={form.control}
                placeholder={placeholder || ""}
                hideError
                className="h-6! w-full bg-white shadow-none border-none text-tiny py-1 [&_svg:not([class*='size-'])]:size-3"
              />
            </div>
          </div>
        );

      case "select":
        return (
          <div className="grid grid-cols-5 border border-secondary rounded-[4px] overflow-hidden">
            <Label className="text-tiny col-span-2 border-r border-pink-200 px-2 bg-pink-50">
              {label}
            </Label>
            <div className="col-span-3">
              <FormSelect<T>
                name={valueKey}
                options={options || []}
                rules={{
                  required: required ? `${label} is required` : false,
                }}
                control={form.control}
                placeholder={placeholder || ""}
                className="h-6! w-full bg-white shadow-none border-none text-tiny py-1 [&_svg:not([class*='size-'])]:size-3"
                hideError
              />
            </div>
          </div>
        );

      case "date":
        return (
          <div className="grid grid-cols-5 border border-secondary rounded-[4px] overflow-hidden">
            <Label className="text-tiny col-span-2 border-r border-pink-200 px-2 bg-pink-50">
              {label}
            </Label>
            <div className="col-span-3">
              <FormDatePicker
                name={valueKey}
                rules={{
                  required: required ? `${label} is required` : false,
                }}
                control={form.control}
                placeholder={placeholder || ""}
                className="h-6! w-full bg-white shadow-none border-none text-tiny py-1 [&_svg:not([class*='size-'])]:size-3"
                hideError
              />
            </div>
          </div>
        );

      case "dateRange":
        return (
          <div className="grid grid-cols-5 border border-secondary rounded-[4px] overflow-hidden">
            <Label className="text-tiny col-span-2 border-r border-pink-200 px-2 bg-pink-50">
              {label}
            </Label>
            <div className="col-span-3">
              <FormDateRangePicker
                control={form.control}
                nameFrom={valueKey}
                nameTo={valueKey}
                label="Date Range"
                className="h-6! w-full bg-white shadow-none border-none text-tiny py-1 [&_svg:not([class*='size-'])]:size-3"
                hideError
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
      <form onSubmit={form.handleSubmit(onSubmit)} className="mb-3">
        <div className="grid gap-2 grid-cols-3 mb-2">
          {filters.map((filter) => (
            <div key={filter.valueKey}>{renderFilter(filter)}</div>
          ))}
        </div>
        <CustomButton type="submit">Apply Filters</CustomButton>
      </form>
    </Form>
  );
};

export default CustomFilters;
