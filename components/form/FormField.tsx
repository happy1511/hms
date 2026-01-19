import { FieldValues } from "react-hook-form";
import { FormInput } from "./FormInput";
import {
  FormCheckboxProps,
  FormInputProps,
  FormRadioGroupProps,
  FormSelectProps,
  FormTextareaProps,
} from "@/lib/type";
import { FormTextarea } from "./FormTextArea";
import { FormSelect } from "./FormSelect";
import { FormCheckbox } from "./FormCheckBox";
import { FormRadioGroup } from "./FormRadioGroup";

export type Props<T extends FieldValues> =
  | ({ type: "text" | "number" } & FormInputProps<T>)
  | ({ type: "password" } & FormInputProps<T>)
  | ({ type: "textarea" } & FormTextareaProps<T>)
  | ({ type: "select" } & FormSelectProps<T>)
  | ({ type: "checkbox" } & FormCheckboxProps<T>)
  | ({ type: "radio" } & FormRadioGroupProps<T>);

const FormField = <T extends FieldValues>({ type, ...props }: Props<T>) => {
  switch (type) {
    case "text":
    case "password":
    case "number":
      return <FormInput {...(props as FormInputProps<T>)} type={type} />;

    case "textarea":
      return <FormTextarea {...(props as FormTextareaProps<T>)} />;

    case "select":
      return <FormSelect {...(props as FormSelectProps<T>)} />;

    case "checkbox":
      return <FormCheckbox {...(props as FormCheckboxProps<T>)} />;

    case "radio":
      return <FormRadioGroup {...(props as FormRadioGroupProps<T>)} />;

    default:
      return <></>;
  }
};

export default FormField;
