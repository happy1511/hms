import {
  DoctorType,
  Gender,
  ModuleType,
  NameTitle,
  ServiceApplicableOn,
  ServiceType,
  Status,
} from "@/generated/prisma/enums";

export type MasterImportKey =
  | "billing-section"
  | "doctor"
  | "drug"
  | "supplier"
  | "department"
  | "room-type"
  | "room"
  | "bed"
  | "service";

export type MasterImportMode = "append" | "replace";

type MasterImportColumn = {
  key: string;
  required?: boolean;
  example: string;
};

type MasterImportConfigItem = {
  title: string;
  module: ModuleType;
  queryKey: string;
  columns: MasterImportColumn[];
};

export const MASTER_IMPORT_CONFIG: Record<
  MasterImportKey,
  MasterImportConfigItem
> = {
  "billing-section": {
    title: "Billing Sections",
    module: ModuleType.BILLING_SECTION_MASTER,
    queryKey: "billing-sections",
    columns: [
      { key: "name", required: true, example: "Registration Charges" },
      { key: "systemKey", example: "" },
      { key: "isOtherCharges", example: "false" },
      { key: "isDoctorConsultationCharges", example: "false" },
      { key: "description", example: "General billing section" },
      { key: "status", example: Status.active },
    ],
  },
  doctor: {
    title: "Doctors",
    module: ModuleType.DOCTOR_MASTER,
    queryKey: "doctors",
    columns: [
      { key: "title", required: true, example: NameTitle.DR },
      { key: "firstName", required: true, example: "Amit" },
      { key: "middleName", example: "" },
      { key: "lastName", required: true, example: "Sharma" },
      { key: "preferredName", required: true, example: "Amit" },
      { key: "gender", required: true, example: Gender.Male },
      { key: "dob", example: "1988-05-10" },
      { key: "address", example: "123 Main Road" },
      { key: "city", example: "Pune" },
      { key: "country", example: "India" },
      { key: "state", example: "Maharashtra" },
      { key: "postcode", example: "411001" },
      { key: "contactNumber", required: true, example: "9876543210" },
      { key: "email", example: "doctor@example.com" },
      { key: "password", example: "Ref@1234" },
      { key: "status", example: Status.active },
      { key: "licenseNumber", example: "LIC-1001" },
      { key: "specialization", example: "General Medicine" },
      { key: "qualifications", example: "MBBS, MD" },
      { key: "department", example: "Medicine" },
      { key: "yearsExperience", example: "7" },
      { key: "designation", example: "Consultant" },
      { key: "doctorType", required: true, example: DoctorType.consulting },
      { key: "consultationCharges", example: "500" },
      { key: "emergencyContact", example: "9876543211" },
      { key: "availableDays", example: "MONDAY|TUESDAY|WEDNESDAY" },
      { key: "consultationStartingTime", example: "10:00" },
      { key: "consultationEndingTime", example: "17:00" },
    ],
  },
  drug: {
    title: "Drugs",
    module: ModuleType.PHARMACY_DRUG_MASTER,
    queryKey: "drugs",
    columns: [
      { key: "name", required: true, example: "Paracetamol 500 MG" },
      { key: "description", example: "Pain relief tablet" },
      { key: "hsnCode", required: true, example: "3004" },
      { key: "gstPercentage", required: true, example: "12" },
      { key: "cGstPercentage", required: true, example: "6" },
      { key: "sGstPercentage", required: true, example: "6" },
      { key: "iGstPercentage", required: true, example: "12" },
      { key: "manufacturer", required: true, example: "ABC Pharma" },
      { key: "unit", required: true, example: "Tablet" },
    ],
  },
  supplier: {
    title: "Suppliers",
    module: ModuleType.PHARMACY_SUPPLIER,
    queryKey: "drug-suppliers",
    columns: [
      { key: "name", required: true, example: "MediSupply Pvt Ltd" },
      { key: "gstIn", example: "271234567890123" },
      { key: "email", example: "supply@example.com" },
      { key: "phone", example: "9876543210" },
    ],
  },
  department: {
    title: "Departments",
    module: ModuleType.DEPARTMENT_MASTER,
    queryKey: "departments",
    columns: [
      { key: "name", required: true, example: "Medicine" },
      { key: "description", example: "General medicine department" },
      { key: "status", example: Status.active },
    ],
  },
  "room-type": {
    title: "Room Types",
    module: ModuleType.ROOM_TYPE_MASTER,
    queryKey: "room-types",
    columns: [
      { key: "name", required: true, example: "General Ward" },
      { key: "departmentName", required: true, example: "Medicine" },
      { key: "description", example: "Shared room type" },
      { key: "status", example: Status.active },
    ],
  },
  room: {
    title: "Rooms",
    module: ModuleType.ROOM_MASTER,
    queryKey: "rooms",
    columns: [
      { key: "name", required: true, example: "Ward 101" },
      { key: "roomTypeName", required: true, example: "General Ward" },
      { key: "price", required: true, example: "1500" },
      { key: "description", example: "First floor room" },
      { key: "status", example: Status.active },
    ],
  },
  bed: {
    title: "Beds",
    module: ModuleType.BED_MASTER,
    queryKey: "beds",
    columns: [
      { key: "roomName", required: true, example: "Ward 101" },
      { key: "bedNumber", required: true, example: "B1" },
      { key: "name", example: "Window Bed" },
      { key: "status", example: Status.active },
    ],
  },
  service: {
    title: "Services",
    module: ModuleType.SERVICE_MASTER,
    queryKey: "services",
    columns: [
      { key: "name", required: true, example: "X-Ray Chest" },
      { key: "description", required: true, example: "Chest x-ray service" },
      { key: "isInvoiceOnly", example: "false" },
      { key: "type", required: true, example: ServiceType.RADIOLOGY_TEST },
      { key: "price", required: true, example: "500" },
      { key: "discountAvailable", example: "true" },
      { key: "maxDiscount", example: "50" },
      {
        key: "applicableOn",
        example: ServiceApplicableOn.BOTH,
      },
      { key: "status", example: Status.active },
      { key: "connectedLabTests", example: "CBC|LFT" },
      { key: "connectedRadiologyTests", example: "Chest X-Ray" },
    ],
  },
};

