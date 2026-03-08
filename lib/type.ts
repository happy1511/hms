"use client";

// ----------------------------------
// -----------RESPONSE TYPE----------

import {
  ActionType,
  DiscountType,
  DoctorType,
  Gender,
  IdentityType,
  MaritalStatus,
  ModuleType,
  NameTitle,
  PathologyOrderStatus,
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
  emergencyContact,
  Patient,
  PatientContact,
  PatientIdentification,
  PatientNotes,
  PatientRelations,
  Prisma,
} from "@/generated/prisma/client";
import { InfiniteData, UseInfiniteQueryResult } from "@tanstack/react-query";

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

export type Primitive = string | number;

export interface FormInfiniteSelectProps<
  TItem,
  TPage,
  TValue,
  TFieldValues extends FieldValues,
> {
  name: FieldPath<TFieldValues>;
  control: Control<TFieldValues>;
  className?: string;
  label?: string;
  required?: boolean;
  placeholder?: string;
  multiple?: boolean;
  formItemClassName?: string;
  query: UseInfiniteQueryResult<InfiniteData<TPage>>;
  getItems: (page: TPage) => TItem[];
  valueKey: (item: TItem) => TValue;
  labelKey: (item: TItem) => string;
  hideError?: boolean;
  search: string;
  onSearchChange: (val: string) => void;
  compareKey?: (item: TItem) => unknown;
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
  nonOccupied?: boolean;
  createdAt?: string | { from?: Date; to?: Date };
  uhid?: string;
  contactNo?: string;
  doctorType?: DoctorType;
  roomTypeId?: string;
  departmentId?: string;
  isDischarged?: boolean;
  roomId?: string;
  documentType?: string;
  billingSectionId?: string;
  referringDoctorId?: string;
  cancelled?: boolean;
  outsourced?: boolean;
  consultantDoctor?: { userId: string };
  defaultSelectedIds?: string[] | number[];
  testStatus?: PathologyOrderStatus[];
  opdId?: number;
  invoiceId?: number;
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
  | "text"
  | "select"
  | "infiniteSelect"
  | "date"
  | "dateRange";

export interface BaseFilterConfig<T extends FieldValues> {
  label: string;
  valueKey: Path<T>;
  type: FilterType;
  required?: boolean;
  placeholder?: string;
}

// ---------------- TEXT ----------------
export interface TextFilterConfig<
  T extends FieldValues,
> extends BaseFilterConfig<T> {
  type: "text";
}

// ---------------- SELECT ----------------
export interface SelectFilterConfig<
  T extends FieldValues,
> extends BaseFilterConfig<T> {
  type: "select";
  options: { label: string; value: Primitive }[];
}

// ---------------- INFINITE SELECT ----------------
export interface InfiniteSelectFilterConfig<
  T extends FieldValues,
  TItem = unknown,
  TPage = unknown,
  TValue extends Primitive = Primitive,
> extends BaseFilterConfig<T> {
  type: "infiniteSelect";

  // 👇 must match FormInfiniteSelect props
  query: UseInfiniteQueryResult<InfiniteData<TPage>>;
  getItems: (page: TPage) => TItem[];
  valueKeyExtractor: (item: TItem) => TValue;
  labelKey: (item: TItem) => string;
  search: string;
  onSearchChange: (value: string) => void;
}

// ---------------- DATE ----------------
export interface DateFilterConfig<
  T extends FieldValues,
> extends BaseFilterConfig<T> {
  type: "date";
}

// ---------------- DATE RANGE ----------------
export interface DateRangeFilterConfig<
  T extends FieldValues,
> extends BaseFilterConfig<T> {
  type: "dateRange";
}

// ---------------- FINAL UNION ----------------
export type FilterConfig<T extends FieldValues> =
  | TextFilterConfig<T>
  | SelectFilterConfig<T>
  | InfiniteSelectFilterConfig<T>
  | DateFilterConfig<T>
  | DateRangeFilterConfig<T>;

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
  title: NameTitle;
  loginId: string;
  firstName: string;
  middleName?: string | null;
  lastName: string;
  preferredName: string;
  gender: Gender;
  dob?: string | Date | null;
  maritalStatus?: MaritalStatus | null;
  address?: string | null;
  city?: string | null;
  country?: string | null;
  state?: string | null;
  postcode?: string | null;
  contactNumber: string;
  email?: string | null;
  identityType?: IdentityType | null;
  identityNumber?: string | null;
  education?: string | null;
  qualifications?: string | null;
  department?: string | null;
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
  | "title"
  | "createdAt"
  | "updatedAt"
  | "name"
  | "firstName"
  | "middleName"
  | "lastName"
  | "preferredName"
  | "gender"
  | "dob"
  | "maritalStatus"
  | "address"
  | "city"
  | "country"
  | "state"
  | "postcode"
  | "contactNumber"
  | "email"
  | "identityType"
  | "identityNumber"
  | "education"
  | "qualifications"
  | "department"
  | "password"
> {
  user: User;
  userId: string;
  licenseNumber: string;
  specialization: string;
  yearsExperience: number;
  designation: string;
  doctorType: DoctorType;
  emergencyContact: string;
  consultationStartingTime: string;
  consultationEndingTime: string;
  availableDays?: { day: string; available: boolean }[];
}

type PatientAddress = Prisma.PatientAddressGetPayload<{
  include: {
    location: true;
  };
}>;

export interface PatientType extends Patient {
  appointment: Appointment[];
  contacts: PatientContact[];
  relations: PatientRelations[];
  addresses: PatientAddress[];
  identifications: PatientIdentification[];
  emergencyContacts: emergencyContact[];
  notes: PatientNotes[];
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
            lowerRange: true;
            upperRange: true;
            lowerAgeInDays: true;
            upperAgeInDays: true;
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
          lowerRange: true;
          upperRange: true;
          lowerAgeInDays: true;
          upperAgeInDays: true;
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
    invoice: { include: { transactions: true } };
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

export type IPDType = Prisma.IpdGetPayload<{
  include: {
    invoice: { include: { transactions: true } };
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
  };
}>;

export type InvoiceType = Prisma.InvoiceGetPayload<{
  include: {
    transactions: { include: { receivedBy: { select: { name: true } } } };
    billingItems: true;
    opd: {
      include: {
        consultantDoctor: {
          select: {
            user: {
              select: {
                name: true;
              };
            };
          };
        };
        referringDoctor: {
          select: {
            user: {
              select: {
                name: true;
              };
            };
          };
        };
        patient: {
          include: {
            addresses: { include: { location: true } };
            contacts: true;
            relations: true;
          };
        };
      };
    };
    ipd: {
      include: {
        consultantDoctor: {
          select: {
            user: {
              select: {
                name: true;
              };
            };
          };
        };
        referringDoctor: {
          select: {
            user: {
              select: {
                name: true;
              };
            };
          };
        };
        patient: {
          include: {
            addresses: { include: { location: true } };
            contacts: true;
            relations: true;
          };
        };
      };
    };
  };
}>;

export type BillingSections = Prisma.BillingSectionGetPayload<{
}> & {
  invoiceBillingSectionId?: number | null;
  discountType: DiscountType;
  discountValue: number;
  invoiceBillingItems: Prisma.InvoiceBillingItemGetPayload<{
    include: {
      service: true;
    };
  }>[];
};

export type InvoiceGroupedBySection = InvoiceType & {
  sections: BillingSections[];
};

export type PathologyOrderByPatientsType = Prisma.PatientGetPayload<{
  include: {
    pathologyTestOrders: {
      select: {
        id: true;
        opdId: true;
        status: true;
        createdAt: true;
        updatedAt: true;
        sampleTakenAt: true;
        resultEnteredAt: true;
        verifiedAt: true;
        isCancelled: true;
        isOutSourced: true;

        test: {
          select: {
            id: true;
            name: true;
            section: true;
            container: true;
            sampleType: true;
          };
        };

        opd: {
          select: {
            consultantDoctor: {
              select: {
                user: {
                  select: {
                    id: true;
                    name: true;
                  };
                };
              };
            };
          };
        };

        resultEnteredBy: {
          select: {
            id: true;
            name: true;
          };
        };

        verifiedBy: {
          select: {
            id: true;
            name: true;
          };
        };

        sampleTakenBy: {
          select: {
            id: true;
            name: true;
          };
        };
      };
    };
  };
}>;

export type PathologyOrderType = Prisma.PathologyTestOrderGetPayload<{
  select: {
    id: true;
    opdId: true;
    status: true;
    createdAt: true;
    updatedAt: true;
    sampleTakenAt: true;
    resultEnteredAt: true;
    verifiedAt: true;
    isCancelled: true;
    isOutSourced: true;

    test: {
      select: {
        id: true;
        name: true;
        section: true;
        container: true;
        sampleType: true;
      };
    };

    opd: {
      select: {
        consultantDoctor: {
          select: {
            user: {
              select: {
                id: true;
                name: true;
              };
            };
          };
        };
      };
    };

    resultEnteredBy: {
      select: {
        id: true;
        name: true;
      };
    };

    verifiedBy: {
      select: {
        id: true;
        name: true;
      };
    };

    sampleTakenBy: {
      select: {
        id: true;
        name: true;
      };
    };
  };
}>;

export type PathologyTestResultType = Prisma.PathologyTestOrderGetPayload<{
  include: {
    patient: true;
    test: {
      include: {
        testHeaders: {
          include: {
            testParameters: {
              include: {
                parameterOptions: true;
                referenceRanges: true;
              };
            };
          };
        };
      };
    };
  };
}>;

export type RadiologyOrderByPatientsType = Prisma.PatientGetPayload<{
  include: {
    radiologyTestOrders: {
      select: {
        id: true;
        opdId: true;
        status: true;
        createdAt: true;
        updatedAt: true;
        sampleTakenAt: true;
        resultEnteredAt: true;
        verifiedAt: true;
        isCancelled: true;
        isOutSourced: true;

        test: {
          select: {
            id: true;
            name: true;
            section: true;
          };
        };

        opd: {
          select: {
            consultantDoctor: {
              select: {
                user: {
                  select: {
                    id: true;
                    name: true;
                  };
                };
              };
            };
          };
        };

        resultEnteredBy: {
          select: {
            id: true;
            name: true;
          };
        };

        verifiedBy: {
          select: {
            id: true;
            name: true;
          };
        };

        sampleTakenBy: {
          select: {
            id: true;
            name: true;
          };
        };
      };
    };
  };
}>;

export type RadiologyOrderType = Prisma.RadiologyTestOrderGetPayload<{
  select: {
    id: true;
    opdId: true;
    status: true;
    createdAt: true;
    updatedAt: true;
    sampleTakenAt: true;
    resultEnteredAt: true;
    verifiedAt: true;
    isCancelled: true;
    isOutSourced: true;

    test: {
      select: {
        id: true;
        name: true;
        section: true;
      };
    };

    opd: {
      select: {
        consultantDoctor: {
          select: {
            user: {
              select: {
                id: true;
                name: true;
              };
            };
          };
        };
      };
    };

    resultEnteredBy: {
      select: {
        id: true;
        name: true;
      };
    };

    verifiedBy: {
      select: {
        id: true;
        name: true;
      };
    };

    sampleTakenBy: {
      select: {
        id: true;
        name: true;
      };
    };
  };
}>;

export type RadiologyTestResultType = Prisma.RadiologyTestOrderGetPayload<{
  include: {
    patient: true;
    test: {
      include: {
        template: true;
      };
    };
  };
}>;

export interface RadiologyTestOrderWithResults {
  id: number;
  test: {
    id: number;
    name: string;
    section: string;
    template?: {
      id: number;
      name: string;
      section: string;
      content: string;
    } | null;
  };
  results: Array<{
    id: number;
    value?: string | null;
    remark?: string | null;
    template: {
      id: number;
      name: string;
      content: string;
      section: string;
    };
  }>;
  patient: {
    id: number;
    uhid: string;
    firstName: string;
    lastName: string;
    dob: string;
    gender: string;
  };
  verifiedBy?: { id: number; name: string } | null;
  resultEnteredBy?: { id: number; name: string } | null;
  createdAt: string;
}

export interface PathologyTestOrderWithResults {
  id: number;
  test: {
    id: number;
    name: string;
    section: string;
    container: string;
    sampleType: string;
  };
  results: Array<{
    id: number;
    parameterId: number;
    numericValue?: number | null;
    textValue?: string | null;
    optionId?: number | null;
    remark?: string | null;
    parameter: {
      id: number;
      name: string;
      isDescriptiveOnly: boolean;
      parameterOptions: Array<{
        id: number;
        value: string;
      }>;
    };
    applicableReferenceRanges: Array<{
      id: number;
      lowerRange?: number | null;
      upperRange?: number | null;
      unit?: string | null;
    }>;
  }>;
  patient: {
    id: number;
    uhid: string;
    firstName: string;
    lastName: string;
    dob: string;
    gender: string;
  };
  verifiedBy?: { id: number; name: string } | null;
  resultEnteredBy?: { id: number; name: string } | null;
  createdAt: string;
}

export type InvoiceBillingItem = Prisma.BillingSectionGetPayload<{
  select: {
    id: true;
    name: true;
    invoiceBillingItems: {
      select: {
        quantity: true;
        total: true;
        discountType: true;
        discountValue: true;
        rate: true;
        service: {
          select: {
            id: true;
            name: true;
            maxDiscount: true;
          };
        };
      };
    };
  };
}>;

export interface OpdInvoiceDetails extends OPDType {
  billingItems: InvoiceBillingItem[];
}

export interface DashboardType {
  patients: {
    opd: number;
    ipd: number;
  };
  collections: {
    opd: number;
    ipd: number;
  };
  billing: {
    opd: number;
    ipd: number;
  };
  transactions: {
    mode: string;
    amount: number;
  }[];
  sectionWiseBilling: {
    id: number;
    name: string;
    total: number;
  }[];
  expense: number;
}

// ----------------------------------
// BED AVAILABILITY TYPES
// ----------------------------------
export type BedAvailability = Prisma.RoomGetPayload<{
  where: { isDeleted: false };
  select: {
    id: true;
    name: true;
    beds: {
      where: { isDeleted: false };
      select: {
        id: true;
        bedNumber: true;
        name: true;
        isOccupied: true;
        currentIpdId: true;
        currentIpd: {
          select: {
            createdAt: true;
            patient: {
              select: {
                uhid: true;
                firstName: true;
                middleName: true;
                lastName: true;
                dob: true;
                maritalStatus: true;
                contacts: true;
                relations: true;
                addresses: true;
                emergencyContacts: true;
              };
            };
          };
        };
      };
      orderBy: { bedNumber: "asc" };
    };
  };
  orderBy: { name: "asc" };
}>;

export type AvailableBed = Prisma.BedGetPayload<{
  select: {
    id: true;
    bedNumber: true;
    name: true;
    isOccupied: true;
    currentIpdId: true;
    currentIpd: {
      select: {
        createdAt: true;
        patient: {
          select: {
            uhid: true;
            firstName: true;
            middleName: true;
            lastName: true;
            dob: true;
            maritalStatus: true;
            contacts: true;
            relations: true;
            addresses: true;
            emergencyContacts: true;
          };
        };
      };
    };
  };
}>;
