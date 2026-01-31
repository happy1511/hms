import { FieldValues } from "react-hook-form";
import { FormInput } from "./FormInput";
import {
  FormCheckboxProps,
  FormDatePickerProps,
  FormDateRangePickerProps,
  FormInputProps,
  FormRadioGroupProps,
  FormSelectProps,
  FormTextareaProps,
} from "@/lib/type";
import { FormTextarea } from "./FormTextArea";
import { FormSelect } from "./FormSelect";
import { FormCheckbox } from "./FormCheckBox";
import { FormRadioGroup } from "./FormRadioGroup";
import { FormDatePicker } from "./FormDatePicker";
import { FormDateRangePicker } from "./FormDateRange";

export type Props<T extends FieldValues> =
  | ({ type: "text" | "number" | "email" | "time" } & FormInputProps<T>)
  | ({ type: "password" } & FormInputProps<T>)
  | ({ type: "textarea" } & FormTextareaProps<T>)
  | ({ type: "select" } & FormSelectProps<T>)
  | ({ type: "checkbox" } & FormCheckboxProps<T>)
  | ({ type: "radio" } & FormRadioGroupProps<T>)
  | ({ type: "date" } & FormDatePickerProps<T>)
  | ({ type: "dateRange" } & FormDateRangePickerProps<T>);

const FormField = <T extends FieldValues>({ type, ...props }: Props<T>) => {
  switch (type) {
    case "text":
    case "password":
    case "number":
    case "email":
    case "time":
      return <FormInput {...(props as FormInputProps<T>)} type={type} />;

    case "textarea":
      return <FormTextarea {...(props as FormTextareaProps<T>)} />;

    case "select":
      return <FormSelect {...(props as FormSelectProps<T>)} />;

    case "checkbox":
      return <FormCheckbox {...(props as FormCheckboxProps<T>)} />;

    case "radio":
      return <FormRadioGroup {...(props as FormRadioGroupProps<T>)} />;

    case "date":
      return <FormDatePicker {...(props as FormDatePickerProps<T>)} />;

    case "dateRange":
      return (
        <FormDateRangePicker {...(props as FormDateRangePickerProps<T>)} />
      );

    default:
      return <></>;
  }
};

export default FormField;
