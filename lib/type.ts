"use client";

// ----------------------------------
// -----------RESPONSE TYPE----------

import {
  ActionType,
  AddressType,
  ContactType,
  DiscountType,
  DoctorType,
  Gender,
  IdentityType,
  MaritalStatus,
  ModuleType,
  NameTitle,
  PathologyOrderStatus,
  RoleType,
  Status,
  CertificateType,
  RadiologyOrderStatus,
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
  Location,
  Patient,
  PatientContact,
  PatientIdentification,
  PatientNotes,
  PatientRelations,
  Prisma,
} from "@/generated/prisma/client";
import { InfiniteData, UseInfiniteQueryResult } from "@tanstack/react-query";
import { consultantFileType } from "@/validators/api/opd/opd";

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

export type CashFlowSummaryType = {
  period: { from: Date | string; to: Date | string };
  total: number;
  income: {
    total: number;
    opd: number;
    ipd: number;
    dayCare: number;
    pharmacy: number;
    byCategory: Array<{ category: string; amount: number }>;
  };
  expense: {
    total: number;
    byCategory: Array<{ category: string; amount: number }>;
  };
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
  disabled?: boolean;
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

// export interface FormInfiniteSelectProps<
//   TItem,
//   TPage,
//   TValue,
//   TFieldValues extends FieldValues,
// > {
//   name: FieldPath<TFieldValues>;
//   control: Control<TFieldValues>;
//   className?: string;
//   label?: string;
//   required?: boolean;
//   placeholder?: string;
//   multiple?: boolean;
//   formItemClassName?: string;
//   query: UseInfiniteQueryResult<InfiniteData<TPage>>;
//   getItems: (page: TPage) => TItem[];
//   valueKey: (item: TItem) => TValue;
//   labelKey: (item: TItem) => string;
//   hideError?: boolean;
//   search: string;
//   onSearchChange: (val: string) => void;
//   compareKey?: (item: TItem) => unknown;
//   disabled?: boolean;
// }

export interface FormInfiniteSelectProps<
  TItem,
  TPage,
  TValue extends string | number,
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
  disabled?: boolean;
}

export type LocationFieldName =
  | "country"
  | "state"
  | "city"
  | "postcode"
  | "postName";

export type LocationOption = {
  [K in LocationFieldName]?: Location[K];
} & {
  id?: Location["id"];
};

export interface FormCheckboxProps<T extends FieldValues> {
  name: FieldPath<T>;
  control: Control<T>;
  label: string;
  required?: boolean;
  className?: string;
  formItemClassName?: string;
  rules?: Omit<
    RegisterOptions<T, Path<T>>,
    "disabled" | "valueAsNumber" | "valueAsDate" | "setValueAs"
  >;
  hideError?: boolean;
  hideLabel?: boolean;
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
  allowFutureDates?: boolean;
  formItemClassName?: string;
  rules?: Omit<
    RegisterOptions<T, Path<T>>,
    "disabled" | "valueAsNumber" | "valueAsDate" | "setValueAs"
  >;
  hideError?: boolean;
}

export interface FormMonthYearPickerProps<T extends FieldValues> {
  name: FieldPath<T>;
  control: Control<T>;
  label?: string;
  className?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  minDate?: Date;
  maxDate?: Date;
  allowFutureDates?: boolean;
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
  allowFutureDates?: boolean;
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
  isInvoiceOnly?: boolean;
  withoutGrn?: boolean;
  nonOccupied?: boolean;
  createdAt?: string | { from?: Date; to?: Date };
  mlcDeclarationDate?: string | { from?: Date; to?: Date };
  uhid?: string;
  contactNo?: string;
  doctorType?: DoctorType;
  doctorId?: number;
  roomTypeId?: string;
  departmentId?: string;
  isDischarged?: boolean;
  isDayCare?: boolean;
  isMlcPatient?: boolean;
  roomId?: string;
  documentType?: string;
  billingSectionId?: string;
  referringDoctorId?: string;
  cancelled?: boolean;
  outsourced?: boolean;
  consultantDoctor?: { id: string };
  defaultSelectedIds?: string[] | number[];
  radiologyStatus?: RadiologyOrderStatus[];
  testStatus?: PathologyOrderStatus[];
  opdId?: number;
  ipdId?: number;
  invoiceId?: number;
  supplierId?: number;
  drugId?: number;
  includeZeroStock?: boolean;
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
  roleType: RoleType;
  loginId: string;
  firstName: string;
  middleName?: string | null;
  lastName: string;
  preferredName: string;
  gender: Gender;
  dob?: string | Date | null;
  maritalStatus?: MaritalStatus | null;
  locationId?: number | null;
  location?: Location | null;
  contactNumber: string;
  email?: string | null;
  identityType?: IdentityType | null;
  identityNumber?: string | null;
  qualifications?: string | null;
  department?: string | null;
  password: string;
  userName: string;
  status: Status;
  permissions: UserPermissions[];
  updatedAt: Date;
  createdAt: Date;
}

export interface Doctor {
  id: number;
  title: NameTitle;
  firstName: string;
  middleName?: string;
  lastName: string;
  gender: Gender;
  userType: string;
  licenseNumber: string;
  specialization: string;
  yearsExperience: number;
  qualifications: string;
  department: string;
  email: string;
  contactNumber: string;
  phoneNumber: string;
  status: Status;
  designation: string;
  doctorType: DoctorType;
  consultationCharges?: number | null;
  emergencyContact: string;
  consultationStartingTime: string;
  consultationEndingTime: string;
  availableDays?: { day: string; available: boolean }[];
  createdAt: Date;
  updatedAt: Date;
}

type PatientAddress = Prisma.PatientAddressGetPayload<{
  include: {
    location: true;
  };
}>;

export interface PatientType extends Patient {
  uhid: string;
  appointment: Appointment[];
  contacts: PatientContact[];
  relations: PatientRelations[];
  addresses: PatientAddress[];
  identifications: PatientIdentification[];
  emergencyContacts: emergencyContact[];
  notes: PatientNotes[];
  activeIpd?: {
    id: number;
    ipdDateTime: Date | string;
    isDayCare: boolean;
  } | null;
}

export type PharmacyCustomerType = Prisma.PharmacyCustomerGetPayload<{
  include: {
    patient: true;
  };
}>;

export type HsnSacType = Prisma.HsnSacGetPayload<{
  include: {
    createdByUser: {
      select: {
        id: true;
        name: true;
      };
    };
    updatedByUser: {
      select: {
        id: true;
        name: true;
      };
    };
  };
}>;

export type PharmacyDrugType = Prisma.DrugGetPayload<{
  include: {
    _count: true;
  };
}>;

export type PharmacyInventoryItemType = Prisma.InventoryItemsGetPayload<{
  include: {
    drug: true;
    supplier: true;
    hsnSac: true;
  };
}>;

export type PharmacySupplierReturnType = Prisma.SupplierReturnGetPayload<{
  include: {
    supplier: true;
    items: {
      include: {
        inventoryItem: {
          include: {
            drug: true;
            supplier: true;
            hsnSac: true;
          };
        };
      };
    };
  };
}>;

export type PharmacySupplierPaymentType = Prisma.SupplierPaymentGetPayload<{
  include: {
    supplier: true;
    allocations: {
      include: {
        grn: {
          include: {
            order: {
              include: {
                supplier: true;
              };
            };
            challan: {
              include: {
                supplier: true;
              };
            };
          };
        };
      };
    };
  };
}>;

export type PharmacySupplierCreditNoteType = PharmacySupplierPaymentType;

export type PharmacySupplierDueGrnType = {
  id: number;
  invoiceNumber: string;
  invoiceDate: Date;
  total: number;
  paid: number;
  due: number;
  supplierId: number;
  supplierName: string;
};

export type PharmacyIpdIssueType = Prisma.IpdDirectIssueGetPayload<{
  include: {
    ipd: {
      include: {
        patient: {
          select: {
            id: true;
            title: true;
            firstName: true;
            middleName: true;
            lastName: true;
            gender: true;
          };
        };
      };
    };
    items: {
      include: {
        inventoryItem: {
          include: {
            drug: true;
            supplier: true;
            hsnSac: true;
          };
        };
        returnItems: true;
      };
    };
  };
}>;

export type PharmacyIpdReturnType = Prisma.IpdDirectReturnGetPayload<{
  include: {
    ipd: {
      include: {
        patient: {
          select: {
            id: true;
            title: true;
            firstName: true;
            middleName: true;
            lastName: true;
            gender: true;
          };
        };
      };
    };
    items: {
      include: {
        issueItem: {
          include: {
            inventoryItem: {
              include: {
                drug: true;
                supplier: true;
                hsnSac: true;
              };
            };
            ipdDirectIssue: true;
          };
        };
        inventoryItem: {
          include: {
            drug: true;
            supplier: true;
            hsnSac: true;
          };
        };
      };
    };
  };
}>;

export type PharmacyIpdBillRowType = {
  id: string;
  order: string;
  batch: string;
  patient: string;
  ipdNo: string;
  submission: Date;
  item: string;
  quantity: string;
};

export type SupplierLedgerTransactionType = {
  date: Date;
  reference: string;
  credit: number;
  debit: number;
  balance: number;
};

export type SupplierPendingInvoiceType = {
  invoiceNumber: string;
  date: Date;
  total: number;
  paid: number;
  due: number;
};

export type SupplierLedgerDetailType = {
  supplier: {
    id: number;
    name: string;
    phone: string;
    email?: string | null;
    gstIn?: string | null;
  };
  summary: {
    totalCredit: number;
    totalDebit: number;
    balance: number;
    pendingInvoiceCount: number;
  };
  transactions: SupplierLedgerTransactionType[];
  pendingInvoices: SupplierPendingInvoiceType[];
};

export type CustomerLedgerRowType = {
  id: string;
  billNumber: string;
  date: Date;
  customer: string;
  taxableAmount: number;
  cGstAmount: number;
  sGstAmount: number;
  iGstAmount: number;
  total: number;
  paid: number;
  due: number;
  type: "SALE" | "RETURN";
};

export type PharmacyPurchaseOrderType = Prisma.PurchaseOrderGetPayload<{
  include: {
    supplier: true;
    items: {
      include: {
        category: true;
        drug: true;
        hsnSac: true;
      };
    };
  };
}>;

export type PharmacySaleBillType = Prisma.DrugBillGetPayload<{
  include: {
    patient: true;
    customer: {
      include: {
        patient: true;
      };
    };
    doctor: true;
    invoice: {
      include: {
        transactions: {
          include: {
            receivedBy: {
              select: {
                name: true;
              };
            };
          };
        };
      };
    };
    saleItems: {
      include: {
        inventoryItem: {
          include: {
            drug: true;
            supplier: true;
            hsnSac: true;
          };
        };
      };
    };
    saleReturns: {
      where: {
        isDeleted: false;
      };
      include: {
        items: true;
        refundTransaction: true;
      };
    };
  };
}> & {
  isLooseBill: boolean;
  saleItems: Array<
    Prisma.DrugSaleItemGetPayload<{
      include: {
        inventoryItem: {
          include: {
            drug: true;
            supplier: true;
            hsnSac: true;
          };
        };
      };
    }> & {
      isLooseQuantity: boolean;
    }
  >;
  saleReturns: Array<
    Prisma.SaleReturnGetPayload<{
      include: {
        items: true;
        refundTransaction: true;
      };
    }>
  >;
};

export type PharmacySaleReturnType = Prisma.SaleReturnGetPayload<{
  include: {
    items: {
      include: {
        saleItem: {
          include: {
            inventoryItem: {
              include: {
                drug: true;
                supplier: true;
                hsnSac: true;
              };
            };
          };
        };
        inventoryItem: {
          include: {
            drug: true;
            supplier: true;
            hsnSac: true;
          };
        };
      };
    };
    refundTransaction: true;
    drugBill: {
      include: {
        invoice: {
          include: {
            transactions: {
              include: {
                receivedBy: {
                  select: {
                    name: true;
                  };
                };
              };
            };
          };
        };
        customer: {
          include: {
            patient: true;
          };
        };
        patient: true;
        doctor: true;
      };
    };
  };
}>;

export type PharmacyChallanType = Prisma.ChallanGetPayload<{
  include: {
    supplier: true;
    grn: {
      select: {
        id: true;
      };
    };
    createdByUser: {
      select: {
        id: true;
        name: true;
      };
    };
    items: {
      include: {
        drug: true;
        category: true;
        hsnSac: true;
        inventoryItem: {
          include: {
            drug: true;
            hsnSac: true;
          };
        };
      };
    };
  };
}>;

export type AppointmentWithPatient = Prisma.AppointmentGetPayload<{
  include: {
    patient: true;
    doctor: true;
  };
}>;

export type PatientDocumentType = Prisma.DocumentStoreGetPayload<{
  select: {
    id: true;
    type: true;
    documentName: true;
    path: true;
    originalName: true;
    mimeType: true;
    size: true;
    createdAt: true;
    updatedAt: true;
    opd: {
      select: {
        id: true;
        opdDateTime: true;
        patient: {
          select: {
            id: true;
            title: true;
            firstName: true;
            middleName: true;
            lastName: true;
          };
        };
      };
    };
    ipd: {
      select: {
        id: true;
        ipdDateTime: true;
        isDayCare: true;
        patient: {
          select: {
            id: true;
            title: true;
            firstName: true;
            middleName: true;
            lastName: true;
          };
        };
      };
    };
  };
}>;

export type CertificateTemplateType = Prisma.CertificateTemplateGetPayload<{
  include: {
    createdByUser: true;
  };
}>;

export type OpdCertificateType = Prisma.OpdCertificateGetPayload<{
  include: {
    opd: {
      include: {
        consultantDoctor: true;
      };
      select: {
        id: true;
        opdDateTime: true;
        patient: {
          select: {
            id: true;
            uhid: true;
            title: true;
            firstName: true;
            middleName: true;
            lastName: true;
            gender: true;
            dob: true;
          };
        };
      };
    };
  };
}>;

export type CertificateTemplateMap = Record<CertificateType, string>;

export type SalesHsnSummaryRowType = {
  id: string;
  hsn: string;
  quantity: number;
  cGstPercentage: number;
  sGstPercentage: number;
  taxableAmount: number;
  cGstAmount: number;
  sGstAmount: number;
};

export type GstSummaryRowType = {
  id: string;
  hsnSacCode: string;
  gstRate: number;
  taxableAmount: number;
  sGstAmount: number;
  cGstAmount: number;
};

export type CounterSaleBillRowType = {
  id: string;
  billNumber: string;
  date: Date;
  customer: string;
  taxableAmount: number;
  cGstAmount: number;
  sGstAmount: number;
  iGstAmount: number;
  rounding: number;
  billTotal: number;
  paidTotal: number;
  saleOrReturn: "SALE" | "RETURN";
  wholesaleRetail: "WHOLESALE" | "RETAIL";
  corporate: string;
};

export type CounterSaleItemRowType = {
  id: string;
  date: Date;
  customer: string;
  billNumber: string;
  item: string;
  hsn: string;
  batch: string;
  expiry: Date;
  ptr: number;
  ptrWithGst: number;
  ptrTotal: number;
  ptrWithGstTotal: number;
  mrp: number;
  itemsPerPack: number;
  billedRate: number;
  quantity: number;
  discountPercentage: number;
  total: number;
  cGstPercentage: number;
  sGstPercentage: number;
  iGstPercentage: number;
  saleOrReturn: "SALE" | "RETURN";
  doctor: string;
  saleType: "WHOLESALE" | "RETAIL";
  profitLoss: number;
  supplier: string;
  purchaseDate: Date | null;
  purchaseBillNumber: string;
};

export type CounterSaleCollectionRowType = {
  id: string;
  customer: string;
  billNumber: string;
  paymentDate: Date;
  amount: number;
  paymentMode: string;
  receiptNumber: string;
  remarks: string;
};

export type IpdSaleItemRowType = {
  id: string;
  date: Date;
  invoiceNumber: string;
  billingType: string;
  customer: string;
  item: string;
  rate: number;
  quantity: number;
  itemTotal: number;
};

export type PurchaseOrderReportRowType = {
  id: number;
  supplier: string;
  poNumber: string;
  poDate: Date;
  items: number;
  taxableAmount: number;
  packingForwarding: number;
  cGstAmount: number;
  sGstAmount: number;
  iGstAmount: number;
  tcsAmount: number;
  discountAmount: number;
  roundOffAmount: number;
  grandTotal: number;
  linkedGrn: string;
};

export type PurchaseOrderItemReportRowType = {
  id: string;
  poNumber: string;
  supplier: string;
  poDate: Date;
  item: string;
  category: string;
  hsn: string;
  quantity: number;
  rate: number;
  cGstPercentage: number;
  sGstPercentage: number;
  iGstPercentage: number;
  total: number;
};

export type GrnReportRowType = {
  id: number;
  supplier: string;
  gstIn: string;
  invoiceNumber: string;
  invoiceDate: Date;
  totalItems: number;
  taxableAmount: number;
  discountAmount: number;
  cGstAmount: number;
  sGstAmount: number;
  iGstAmount: number;
  tcsAmount: number;
  packingForwarding: number;
  roundOffAmount: number;
  grandTotal: number;
  grnNumber: string;
  linkedPo: string;
};

export type GrnItemReportRowType = {
  id: string;
  grn: string;
  po: string;
  supplier: string;
  invoiceNumber: string;
  grnDate: Date;
  item: string;
  category: string;
  batch: string;
  expiry: Date;
  hsn: string;
  quantity: number;
  freeQuantity: number;
  rate: number;
  cGstPercentage: number;
  sGstPercentage: number;
  iGstPercentage: number;
  mrp: number;
};

export type PurchaseUtilisationRowType = {
  id: number;
  item: string;
  batch: string;
  expiry: Date;
  purchasedQuantity: number;
  ptr: number;
  cGstPercentage: number;
  sGstPercentage: number;
  purchaseAmount: number;
  soldQuantity: number;
  soldAmount: number;
  utilisationPercentage: number;
};

export type StockItemMovementRowType = {
  id: string;
  item: string;
  counterSalesQuantity: number;
  counterSalesPurchaseValue: number;
  counterSalesMrpValue: number;
  counterReturnsQuantity: number;
  counterReturnsPurchaseValue: number;
  counterReturnsMrpValue: number;
  ipdSalesQuantity: number;
  ipdSalesPurchaseValue: number;
  ipdSalesMrpValue: number;
  ipdReturnsQuantity: number;
  ipdReturnsPurchaseValue: number;
  ipdReturnsMrpValue: number;
  purchaseOrdersQuantity: number;
  purchaseOrdersPurchaseValue: number;
  purchaseOrdersMrpValue: number;
  purchaseReturnsQuantity: number;
  purchaseReturnsPurchaseValue: number;
  purchaseReturnsMrpValue: number;
};

export type TopPerformingItemRowType = {
  id: string;
  item: string;
  quantity: number;
};

export type ExpiringItemRowType = {
  id: string;
  item: string;
  batch: string;
  expiringInDays: number;
  ptr: number;
  stockValuePtr: number;
  mrp: number;
  stockValueMrp: number;
};

export type PharmacyReportsType = {
  counterSale: {
    bills: CounterSaleBillRowType[];
    items: CounterSaleItemRowType[];
    collections: CounterSaleCollectionRowType[];
    hsnSummary: SalesHsnSummaryRowType[];
    gstSummary: GstSummaryRowType[];
  };
  ipdSale: {
    items: IpdSaleItemRowType[];
    hsnSummary: SalesHsnSummaryRowType[];
  };
  po: {
    purchaseOrders: PurchaseOrderReportRowType[];
    purchaseOrderItems: PurchaseOrderItemReportRowType[];
    gstSummary: GstSummaryRowType[];
  };
  grn: {
    grns: GrnReportRowType[];
    grnItems: GrnItemReportRowType[];
  };
  stock: {
    purchaseUtilisation: PurchaseUtilisationRowType[];
    itemMovements: StockItemMovementRowType[];
    topPerformingItems: TopPerformingItemRowType[];
    expiringItems: ExpiringItemRowType[];
  };
};

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
  include: {
    consultantDoctor: true;
    referringDoctor: true;
  };
  select: {
    id: true;
    arrivalState: true;
    status: true;
    opdDateTime: true;
    invoice: {
      include: {
        transactions: { include: { receivedBy: { select: { name: true } } } };
      };
    };
    patient: {
      select: {
        id: true;
        title: true;
        lastName: true;
        firstName: true;
        middleName: true;
        uhid: true;
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

export type opdConsultationDetailsType = consultantFileType & {
  patient?: {
    id?: number;
    firstName?: string;
    lastName?: string;
    uhid?: string;
    gender?: string;
    contacts?: { type: ContactType; value: string }[];
    addresses?: {
      type?: AddressType;
      addressLineOne?: string | null;
      addressLineTwo?: string | null;
      addressLineThree?: string | null;
      location?: {
        city?: string | null;
        state?: string | null;
        country?: string | null;
        postcode?: string | null;
        postName?: string | null;
      } | null;
    }[];
  };
  consultantDoctorName?: string | null;
  referringDoctorName?: string | null;
  createdAt?: Date | string;
  previousOpdHistory?: {
    opdId: number;
    createdAt: Date | string;
    investigations: string[];
  }[];
};

export type IPDType = Prisma.IpdGetPayload<{
  include: {
    invoice: { include: { transactions: true } };
    mlcDeclaredByUser: { select: { id: true; name: true } };
    bed: {
      include: {
        room: { include: { roomType: { include: { department: true } } } };
      };
    };
    consultantDoctor: true;
    referringDoctor: true;
    patient: {
      select: {
        id: true;
        lastName: true;
        firstName: true;
        uhid: true;
        middleName: true;
        dob: true;
        maritalStatus: true;
        relations: true;
        addresses: true;
        contacts: true;
        gender: true;
        isMlcPatient: true;
        mlcInsuranceType: true;
        mlcPolicyOrCardNumber: true;
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
        consultantDoctor: true;
        referringDoctor: true;
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
        consultantDoctor: true;
        referringDoctor: true;
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

export type InvoiceListRowType = {
  id: number;
  ipdId?: number | null;
  createdAt: Date | string;
  invoiceFor: "OPD" | "IPD" | "UNKNOWN";
  rate: number;
  discountType: DiscountType;
  discountValue: number;
  discountAmount: number;
  total: number;
  isPaid: boolean;
  isFree: boolean;
  isDischarged?: boolean | null;
  paidAmount: number;
  patient: PatientType | null;
  consultantDoctorName: string | null;
  referredByName: string | null;
};

export type BillingSections = Prisma.BillingSectionGetPayload<{
  include: { createdByUser: true };
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
        scannedReportDocument: {
          select: {
            id: true;
            type: true;
            path: true;
            originalName: true;
            mimeType: true;
            size: true;
            createdAt: true;
          };
        };

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
          include: {
            consultantDoctor: true;
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
    scannedReportDocument: {
      select: {
        id: true;
        type: true;
        path: true;
        originalName: true;
        mimeType: true;
        size: true;
        createdAt: true;
      };
    };

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
      include: {
        consultantDoctor: true;
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
    opd: {
      include: {
        consultantDoctor: true;
        referringDoctor: true;
      };
    };
    ipd: {
      include: {
        consultantDoctor: true;
        referringDoctor: true;
      };
    };
    patient: {
      include: {
        relations: true;
        addresses: { include: { location: true } };
        contacts: true;
      };
    };
    test: {
      include: {
        testHeaders: {
          include: {
            testParameters: {
              include: {
                parameterOptions: true;
                pathologyTestResults: true;
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
        scannedReportDocument: {
          select: {
            id: true;
            type: true;
            path: true;
            originalName: true;
            mimeType: true;
            size: true;
            createdAt: true;
          };
        };

        test: {
          select: {
            id: true;
            name: true;
            section: true;
          };
        };

        opd: {
          include: {
            consultantDoctor: true;
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
    scannedReportDocument: {
      select: {
        id: true;
        type: true;
        path: true;
        originalName: true;
        mimeType: true;
        size: true;
        createdAt: true;
      };
    };

    test: {
      select: {
        id: true;
        name: true;
        section: true;
      };
    };

    opd: {
      include: {
        consultantDoctor: true;
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
    uhid?: string | null;
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
    uhid?: string | null;
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
    isOtherCharges: true;
    isDoctorConsultationCharges: true;
    invoiceBillingItems: {
      select: {
        isLocked: true;
        quantity: true;
        total: true;
        discountType: true;
        discountValue: true;
        rate: true;
        ipdBedAllocationId: true;
        service: {
          select: {
            id: true;
            name: true;
            maxDiscount: true;
            consultingDoctorId: true;
            roomId: true;
          };
        };
      };
    };
  };
}>;

export interface OpdInvoiceDetails extends OPDType {
  billingItems: InvoiceBillingItem[];
}

export type PharmacyGrnType = Prisma.GRNGetPayload<{
  include: {
    order: {
      include: {
        supplier: true;
      };
    };
    challan: {
      include: {
        supplier: true;
      };
    };
    createdByUser: {
      select: {
        id: true;
        name: true;
      };
    };
    grnItems: {
      include: {
        purchaseItem: {
          include: {
            drug: true;
            category: true;
            hsnSac: true;
          };
        };
        challanItem: {
          include: {
            drug: true;
            category: true;
            hsnSac: true;
          };
        };
        inventoryItem: {
          include: {
            drug: true;
            hsnSac: true;
          };
        };
      };
    };
  };
}>;

export interface DashboardType {
  patients: {
    opd: number;
    ipd: number;
    dayCare: number;
    ipdCensus: number;
  };
  collections: {
    opd: number;
    ipd: number;
    totalClinical: number;
    otherIncome: number;
    totalIncome: number;
    expenses: number;
    balance: number;
    ipdDue: number;
    opdDue: number;
  };
  billing: {
    opd: number;
    ipd: number;
    dayCare: number;
  };
  transactions: {
    mode: string;
    amount: number;
  }[];
  paymentModes: {
    cash: number;
    digitalWallet: number;
    total: number;
  };
  ipdCareType: {
    surgical: number;
    medical: number;
    total: number;
  };
  pharmacy: {
    finance: {
      counterSales: {
        openingBalance: number;
        cashSales: number;
        otherSales: number;
        totalSales: number;
        cashReturns: number;
        otherReturns: number;
        totalReturns: number;
        cashExpenses: number;
        otherExpenses: number;
        totalExpenses: number;
        balance: number;
        cashBalance: number;
        closingBalance: number;
      };
      expensesByCategory: Array<{
        category: string;
        amount: number;
      }>;
      purchaseTotal: number;
      totalStockValue: number;
    };
    stock: {
      topPerformingItems: Array<{
        item: string;
        qtySold: number;
      }>;
      totalItemsInInventory: number;
      nearExpiry: Array<{
        item: string;
        batch: string;
        stock: number;
        expiringInDays: number;
        stockValue: number;
      }>;
    };
    corporate: {
      sales: number;
      returns: number;
      netSales: number;
      expenses: number;
      purchases: number;
      purchaseReturns: number;
      salesGst: number;
      purchaseGst: number;
    };
  };
  lab: {
    pathology: {
      requisitions: {
        pending: number;
        inProgress: number;
        completed: number;
        outsourced: number;
        cancelled: number;
      };
      tests: Array<{
        name: string;
        revenue: number;
        totalOrders: number;
      }>;
      sections: Array<{
        name: string;
        revenue: number;
        totalOrders: number;
      }>;
      referredBy: Array<{
        name: string;
        totalOrders: number;
      }>;
    };
    radiology: {
      requisitions: {
        pending: number;
        inProgress: number;
        completed: number;
        outsourced: number;
        cancelled: number;
      };
      tests: Array<{
        name: string;
        revenue: number;
        totalOrders: number;
      }>;
      sections: Array<{
        name: string;
        revenue: number;
        totalOrders: number;
      }>;
      referredBy: Array<{
        name: string;
        totalOrders: number;
      }>;
    };
  };
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
                id: true;
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
            id: true;
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

export type InvoiceItem = {
  description: string;
  qty: number;
  price: number;
  discount: number;
  discountLabel?: string;
  date?: string;
};

export type sectionsWithTotals = {
  total: number;
  subtotal: number;
  discount: number;
  name: string;
  items: InvoiceItem[];
  sectionDiscount?: number;
}[];

export type BillingItem = {
  name: string;
  items: InvoiceItem[];
  sectionDiscount?: number;
};

export type Transaction = {
  date: string;
  mode: string;
  transactionType?: string;
  amount: number;
  remarks?: string;
  receivedBy?: string;
};

export type PaymentTransaction = Prisma.TransactionGetPayload<{
  include: {
    receivedBy: {
      select: {
        name: true;
      };
    };
  };
}>;
