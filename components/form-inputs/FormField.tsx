import { FieldValues } from "react-hook-form";
import { FormInput } from "./FormInput";
import {
  FormCheckboxProps,
  FormDatePickerProps,
  FormDateRangePickerProps,
  FormDateTimePickerProps,
  FormInfiniteSelectProps,
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
import { FormInfiniteSelect } from "./FormInfiniteSelect";
import { FormDateTime } from "./FormDateTime";
import { FormMultiSelect } from "./FormMultiSelect";

export type Props<T extends FieldValues> =
  | ({ type: "text" | "number" | "email" | "time" } & FormInputProps<T>)
  | ({ type: "password" } & FormInputProps<T>)
  | ({ type: "textarea" } & FormTextareaProps<T>)
  | ({ type: "select" } & FormSelectProps<T>)
  | ({ type: "checkbox" } & FormCheckboxProps<T>)
  | ({ type: "radio" } & FormRadioGroupProps<T>)
  | ({ type: "date" } & FormDatePickerProps<T>)
  | ({ type: "dateTime" } & FormDateTimePickerProps<T>)
  | ({ type: "dateRange" } & FormDateRangePickerProps<T>)
  | ({ type: "infiniteSelect" } & FormInfiniteSelectProps<T>)
  | ({ type: "multiSelect" } & FormSelectProps<T>);

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

    case "multiSelect":
      return <FormMultiSelect {...(props as FormSelectProps<T>)} />;

    case "infiniteSelect":
      return <FormInfiniteSelect {...(props as FormInfiniteSelectProps<T>)} />;

    case "checkbox":
      return <FormCheckbox {...(props as FormCheckboxProps<T>)} />;

    case "radio":
      return <FormRadioGroup {...(props as FormRadioGroupProps<T>)} />;

    case "date":
      return <FormDatePicker {...(props as FormDatePickerProps<T>)} />;

    case "dateTime":
      return <FormDateTime {...(props as FormDateTimePickerProps<T>)} />;

    case "dateRange":
      return (
        <FormDateRangePicker {...(props as FormDateRangePickerProps<T>)} />
      );

    default:
      return <></>;
  }
};

export default FormField;
