"use client";

import dynamic from "next/dynamic";
import "suneditor/dist/css/suneditor.min.css";

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { FormInputProps } from "@/lib/type";
import { cn } from "@/lib/utils";
import { FieldValues } from "react-hook-form";

const SunEditor = dynamic(() => import("suneditor-react"), {
  ssr: false,
});

export function FormRichTextEditor<T extends FieldValues>({
  name,
  control,
  label,
  required = false,
  disabled = false,
  formItemClassName = "",
  rules,
  hideError = false,
}: FormInputProps<T>) {
  return (
    <FormField
      control={control}
      name={name}
      rules={rules}
      render={({ field, fieldState }) => (
        <FormItem
          className={cn(
            "text-primary relative",
            hideError ? "" : "pb-4 gap-1",
            formItemClassName,
          )}
        >
          {label && (
            <FormLabel className="font-semibold font-quicksand text-tiny">
              {label}
              {required && <span className="text-[#FFA600] text-tiny!">*</span>}
            </FormLabel>
          )}

          <FormControl>
            <SunEditor
              setContents={field.value || ""}
              onChange={field.onChange}
              disable={disabled}
              // setOptions={{
              //   buttonList: [
              //     ["bold", "italic", "underline", "strike"],
              //     ["list", "align"],
              //     ["link", "image"],
              //     ["removeFormat"],
              //   ],
              // }}
            />
          </FormControl>

          {!hideError && (
            <FormMessage className="absolute bottom-1 font-semibold text-tiny! ms-1" />
          )}
        </FormItem>
      )}
    />
  );
}
