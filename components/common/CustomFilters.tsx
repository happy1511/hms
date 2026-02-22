import { useForm, FieldValues, Path } from "react-hook-form";
import { Form } from "@/components/ui/form";
import { FilterConfig } from "@/lib/type";
import { FormInput } from "../form-inputs/FormInput";
import { FormSelect } from "../form-inputs/FormSelect";
import { FormDatePicker } from "../form-inputs/FormDatePicker";
import { FormDateRangePicker } from "../form-inputs/FormDateRange";
import { Label } from "../ui/label";
import CustomButton from "./CustomButton";
import { FormInfiniteSelect } from "../form-inputs/FormInfiniteSelect";

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

  const handleReset = () => {
    const defaultValues = {} as T;
    form.reset(defaultValues);
    onSubmit(defaultValues);
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
        className="mb-3"
      >
        <div className="grid gap-2 grid-cols-3 mb-2">
          {filters.map((filter) => (
            <div key={String(filter.valueKey)}>{renderFilter(filter)}</div>
          ))}
        </div>

        <div className="w-fit">
          <div className="grid grid-cols-2 space-x-2">
            <CustomButton type="submit">Apply Filters</CustomButton>

            <CustomButton
              type="reset"
              variant="outline"
              className="bg-white text-primary shadow-none"
            >
              Reset Filters
            </CustomButton>
          </div>
        </div>
      </form>
    </Form>
  );
};

export default CustomFilters;
