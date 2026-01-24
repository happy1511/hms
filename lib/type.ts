// ----------------------------------
// -----------RESPONSE TYPE----------

import { DoctorType, Status } from "@/generated/prisma/enums";
import { ColumnDef } from "@tanstack/react-table";
import {
  Control,
  FieldPath,
  FieldValues,
  Path,
  RegisterOptions,
} from "react-hook-form";
import { Actions } from "./enums";

// ----------------------------------
export type ApiResponse<T> = {
  data: T;
  status: boolean;
  message: string;
};

export type PaginatedResponse<T> = {
  data: T[];
  total: number;
  status: boolean;
  message: string;
};

// ----------------------------------
// ---------FORM FIELD TYPE----------
// ----------------------------------
interface SelectOption {
  label: string;
  value: string;
}

export interface FormSelectProps<T extends FieldValues> {
  name: FieldPath<T>;
  control: Control<T>;
  label?: string;
  placeholder?: string;
  required?: boolean;
  className?: string;
  options: SelectOption[];
  rules?: Omit<
    RegisterOptions<T, Path<T>>,
    "disabled" | "valueAsNumber" | "valueAsDate" | "setValueAs"
  >;
  hideError?: boolean;
}

export interface FormCheckboxProps<T extends FieldValues> {
  name: FieldPath<T>;
  control: Control<T>;
  label: string;
  required?: boolean;
  className?: string;
  rules?: Omit<
    RegisterOptions<T, Path<T>>,
    "disabled" | "valueAsNumber" | "valueAsDate" | "setValueAs"
  >;
  hideError?: boolean;
}

export interface FormTextareaProps<T extends FieldValues> {
  name: FieldPath<T>;
  control: Control<T>;
  label?: string;
  className?: string;
  placeholder?: string;
  required?: boolean;
  rows?: number;
  showCount?: boolean;
  maxChar?: number;
  rules?: Omit<
    RegisterOptions<T, Path<T>>,
    "disabled" | "valueAsNumber" | "valueAsDate" | "setValueAs"
  >;
  hideError?: boolean;
}

export interface FormInputProps<T extends FieldValues> {
  name: FieldPath<T>;
  control: Control<T>;
  label?: string;
  type?: string;
  className?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  formItemClassName?: string;
  rules?: Omit<
    RegisterOptions<T, Path<T>>,
    "disabled" | "valueAsNumber" | "valueAsDate" | "setValueAs"
  >;
  hideError?: boolean;
}

export interface FormDatePickerProps<T extends FieldValues> {
  name: FieldPath<T>;
  control: Control<T>;
  label?: string;
  className?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  minDate?: Date;
  maxDate?: Date;
  formItemClassName?: string;
  rules?: Omit<
    RegisterOptions<T, Path<T>>,
    "disabled" | "valueAsNumber" | "valueAsDate" | "setValueAs"
  >;
  hideError?: boolean;
}
export interface FormDateRangePickerProps<T extends FieldValues> {
  nameFrom: Path<T>;
  nameTo: Path<T>;
  control: Control<T>;
  label?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  minDate?: Date;
  maxDate?: Date;
  className?: string;
  formItemClassName?: string;
  hideError?: boolean;
}

export interface FormRadioGroupProps<T extends FieldValues> {
  name: FieldPath<T>;
  control: Control<T>;
  label?: string;
  required?: boolean;
  options: SelectOption[];
  className?: string;
  orientation?: "horizontal" | "vertical";
  rules?: Omit<
    RegisterOptions<T, Path<T>>,
    "disabled" | "valueAsNumber" | "valueAsDate" | "setValueAs"
  >;
  hideError?: boolean;
}

// ----------------------------------
// ---------TABLE COLUMN TYPE----------
// ----------------------------------
export type ColumnDefWithClass<TData, TValue = unknown> = ColumnDef<
  TData,
  TValue
> & {
  cellClassName?: string;
  headerClassName?: string;
};

// ----------------------------------
// ---------FILTER TYPE--------------
// ----------------------------------
export interface FilterOption {
  label: string;
  value: string;
}

export type FilterType = "select" | "text" | "date" | "dateRange";

export interface FilterConfig<T extends FieldValues> {
  label: string;
  valueKey: Path<T>;
  type: FilterType;
  options?: FilterOption[];
  required?: boolean;
  placeholder?: string;
}

// ----------------------------------
// ---------USER TYPE----------------
// ----------------------------------
export interface Permissions {
  module: {
    id: number;
    name: string;
  };
  actions: {
    id: number;
    name: Actions;
  }[];
}

export interface UserPermissions {
  module: {
    id: string;
    name: string;
  };
  actions: {
    id: string;
    name: string;
    assigned: boolean;
  }[];
}

export interface User {
  id: number;
  name: string;
  loginId: string;
  password: string;
  userName: string;
  status: Status;
  permissions: UserPermissions[];
  updatedAt: Date;
  createdAt: Date;
}

export interface UserFilterValues {
  name?: string;
  status?: string;
  createdAt?: string;
}

export interface Doctor extends Pick<
  User,
  | "permissions"
  | "status"
  | "loginId"
  | "createdAt"
  | "updatedAt"
  | "name"
  | "password"
> {
  user: User;
  userId: string;
  licenseNumber: string;
  specialization: string;
  qualifications: string;
  yearsExperience: number;
  department: string;
  designation: string;
  doctorType: DoctorType;
  email: string;
  phoneNumber: string;
  emergencyContact: string;
  consultationStartingTime: string;
  consultationEndingTime: string;
}

export interface DoctorFilterValues {
  name?: string;
  status?: string;
  doctorType?: DoctorType;
  createdAt?: string;
}
