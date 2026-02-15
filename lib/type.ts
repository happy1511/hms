// ----------------------------------
// -----------RESPONSE TYPE----------

import {
  ActionType,
  DoctorType,
  ModuleType,
  Status,
} from "@/generated/prisma/enums";
import { ColumnDef } from "@tanstack/react-table";
import {
  Control,
  FieldPath,
  FieldValues,
  Path,
  RegisterOptions,
} from "react-hook-form";
import {
  Appointment,
  Bed,
  emergencyContact,
  Floor,
  Patient,
  PatientAddress,
  PatientContact,
  PatientIdentification,
  PatientNotes,
  PatientRelations,
  Prisma,
  Ward,
} from "@/generated/prisma/client";

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
export interface SelectOption {
  label: string;
  value: string | number;
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
  readonly?: boolean;
}

export interface FormMultiSelectProps<T extends FieldValues> {
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

export interface InfiniteSelectBaseProps {
  options: SelectOption[];
  fetchNextPage: () => void;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  onSearch?: (value: string) => void;
}

export interface FormInfiniteSelectProps<
  T extends FieldValues,
> extends InfiniteSelectBaseProps {
  name: Path<T>;
  control: Control<T>;
  rules?: Omit<
    RegisterOptions<T, Path<T>>,
    "disabled" | "valueAsNumber" | "valueAsDate" | "setValueAs"
  >;
  label?: string;
  required?: boolean;
  hideError?: boolean;
  className?: string;
  formItemClassName?: string;
  placeholder?: string;
  disabled?: boolean;
  multiple?: boolean;
  onSelectCallback?: (value: T) => void;
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
  readOnly?: boolean;
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

export interface FormDateTimePickerProps<T extends FieldValues> {
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
  name: Path<T>;
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
  numberOfMonths?: number;
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
// ---------FILTER VALUES TYPE----------
// ----------------------------------
export interface FilterValues {
  name?: string;
  status?: string;
  createdAt?: string;
  uhid?: string;
  contactNo?: string;
  doctorType?: DoctorType;
  wardId?: string;
  floorId?: string;
  documentType?: string;
  billingSectionId?: string;
  referringDoctorId?: string;
  consultantDoctorId?: string;
  defaultSelectedIds?: string[] | number[];
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

export type FilterType =
  | "select"
  | "text"
  | "date"
  | "dateRange"
  | "infiniteSelect";

export interface FilterConfig<T extends FieldValues> {
  label: string;
  valueKey: Path<T>;
  type: FilterType;
  options?: FilterOption[];
  required?: boolean;
  placeholder?: string;
  fetchNextPage?: () => void;
  hasNextPage?: boolean;
  isFetchingNextPage?: boolean;
  onSearch?: (value: string) => void;
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
    name: ActionType;
  }[];
}

export interface UserPermissions {
  module: {
    id: string;
    name: ModuleType;
  };
  actions: {
    id: string;
    name: ActionType;
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

export interface PatientType extends Patient {
  appointment: Appointment[];
  contacts: PatientContact[];
  relations: PatientRelations[];
  addresses: PatientAddress[];
  identifications: PatientIdentification[];
  emergencyContacts: emergencyContact[];
  notes: PatientNotes[];
}

export interface FloorType extends Floor {
  departments?: Ward[];
}

export interface WardType extends Ward {
  floor?: FloorType;
}

export interface BedType extends Bed {
  ward?: WardType;
}

export type AppointmentWithPatient = Prisma.AppointmentGetPayload<{
  include: {
    patient: true;
    doctor: {
      include: {
        user: true;
      };
    };
  };
}>;

export type PatientDocumentType = Prisma.PatientIdentificationGetPayload<{
  include: {
    patient: true;
  };
}>;

export type BillingSectionType = Prisma.BillingSectionGetPayload<{
  include: {
    services: {
      include: {
        service: true;
      };
    };
  };
}>;

export type ServiceDataType = Prisma.ServiceGetPayload<{
  include: {
    pathologyTests: {
      include: {
        test: true;
      };
    };
    radiologyTests: {
      include: {
        test: true;
      };
    };
    billingSections: {
      include: {
        billingSection: true;
      };
    };
  };
}>;

export type PathologyTestDataType = Prisma.PathologyTestGetPayload<{
  include: {
    testHeaders: {
      select: {
        id: true;
        name: true;
        note: true;
        displayOrder: true;
      };
    };
    parameters: {
      select: {
        id: true;
        name: true;
        isDescriptiveOnly: true;
        headerId: true;
        displayOrder: true;
        header: {
          select: {
            id: true;
            name: true;
            note: true;
          };
        };
        parameterOptions: {
          select: {
            id: true;
            testParameterId: true;
            value: true;
          };
        };
        referenceRanges: {
          select: {
            id: true;
            lowerDay: true;
            lowerMonth: true;
            lowerYear: true;
            lowerRange: true;
            upperDay: true;
            upperMonth: true;
            upperYear: true;
            upperRange: true;
            unit: true;
          };
        };
      };
    };
  };
}>;

export type PathologyTestParameterType =
  Prisma.PathologyTestParameterGetPayload<{
    include: {
      id: true;
      name: true;
      isDescriptiveOnly: true;
      headerId: true;
      displayOrder: true;
      header: {
        select: {
          id: true;
          name: true;
          note: true;
        };
      };
      parameterOptions: {
        select: { id: true; testParameterId: true; value: true };
      };
      referenceRanges: {
        select: {
          id: true;
          lowerDay: true;
          lowerMonth: true;
          lowerYear: true;
          lowerRange: true;
          upperDay: true;
          upperMonth: true;
          upperYear: true;
          upperRange: true;
          unit: true;
        };
      };
    };
  }>;

export type PathologyParameterOptionType = Prisma.ParameterOptionsGetPayload<{
  include: {
    id: true;
    value: true;
    testParameter: true;
  };
}>;

export type OPDType = Prisma.OpdGetPayload<{
  select: {
    id: true;
    arrivalState: true;
    total: true;
    discountType: true;
    discountValue: true;
    rate: true;
    transactions: true;
    isInQueue: true;
    consultantDoctor: {
      select: {
        user: {
          omit: {
            password: true;
          };
        };
      };
    };
    referringDoctor: {
      select: {
        user: {
          omit: {
            password: true;
          };
        };
      };
    };
    patient: {
      select: {
        id: true;
        uhid: true;
        lastName: true;
        firstName: true;
        middleName: true;
        dob: true;
        maritalStatus: true;
        relations: true;
        addresses: true;
        contacts: true;
        gender: true;
      };
    };
    vital: true;
    createdAt: true;
    updatedAt: true;
  };
}>;
