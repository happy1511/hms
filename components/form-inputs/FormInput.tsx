"use client";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { FormInputProps } from "@/lib/type";
import { cn } from "@/lib/utils";
import { Eye, EyeOff } from "lucide-react";
import { useId, useState } from "react";
import { FieldValues } from "react-hook-form";

export function FormInput<T extends FieldValues>({
  name,
  control,
  label,
  type = "text",
  className = "",
  placeholder,
  required = false,
  disabled = false,
  formItemClassName = "",
  rules,
  hideError = false,
  readOnly = false,
}: FormInputProps<T>) {
  const id = useId();
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password";

  return (
    <FormField
      control={control}
      name={name}
      rules={rules}
      render={({ field, fieldState }) => {
        return (
          <FormItem
            className={cn(
              "text-primary relative",
              hideError ? "" : "pb-4 gap-1",
              formItemClassName,
            )}
          >
            {label && (
              <FormLabel className="gap-0 text-tiny font-semibold font-quicksand text-tiny">
                {label}
                {required && (
                  <span className="text-[#FFA600] text-tiny!">*</span>
                )}
              </FormLabel>
            )}
            <FormControl className="h-6 flex items-center">
              <div className="relative">
                <Input
                  disabled={disabled}
                  id={id}
                  type={showPassword ? "text" : type}
                  className={`rounded-sm selection:text-white selection:bg-gray-500 focus-visible:border-accent-blue h-auto text-tiny! focus-visible:ring-0 border shadow-none ring-0 border-border ${
                    fieldState.invalid
                      ? "border-destructive focus-visible:border-destructive"
                      : ""
                  } ${className}`}
                  placeholder={placeholder}
                  value={field.value ?? ""}
                  onChange={(e) =>
                    type === "number"
                      ? field.onChange(
                          e.target.value === ""
                            ? undefined
                            : Number(e.target.value),
                        )
                      : field.onChange(e.target.value)
                  }
                  aria-describedby={
                    isPassword ? `${id}-description` : undefined
                  }
                  readOnly={readOnly}
                />

                {isPassword && (
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5 text-text-secondary" />
                    ) : (
                      <Eye className="w-5 h-5 text-text-secondary" />
                    )}
                  </button>
                )}
              </div>
            </FormControl>

            {!hideError && (
              <FormMessage className="absolute bottom-1 font-semibold text-tiny! ms-1" />
            )}
          </FormItem>
        );
      }}
    />
  );
}
