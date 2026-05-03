import { ActionType, ModuleType } from "@/generated/prisma/enums";

const CERTIFICATES_MODULE = "CERTIFICATES" as ModuleType;
const PHARMACY_REPORTS_MODULE = "PHARMACY_REPORTS" as ModuleType;
const PHARMACY_REPORT_COUNTER_SALE_MODULE =
  "PHARMACY_REPORT_COUNTER_SALE" as ModuleType;
const PHARMACY_REPORT_IPD_SALE_MODULE =
  "PHARMACY_REPORT_IPD_SALE" as ModuleType;
const PHARMACY_REPORT_PO_MODULE = "PHARMACY_REPORT_PO" as ModuleType;
const PHARMACY_REPORT_GRN_MODULE = "PHARMACY_REPORT_GRN" as ModuleType;
const PHARMACY_REPORT_STOCK_MODULE = "PHARMACY_REPORT_STOCK" as ModuleType;
const PHARMACY_IPD_ISSUE_MODULE = "PHARMACY_IPD_ISSUE" as ModuleType;
const PHARMACY_IPD_RETURN_MODULE = "PHARMACY_IPD_RETURN" as ModuleType;
const PHARMACY_IPD_BILL_MODULE = "PHARMACY_IPD_BILL" as ModuleType;

export const MODULE_ACTION_MATRIX = {
  [ModuleType.USER]: [
    ActionType.CREATE,
    ActionType.UPDATE,
    ActionType.VIEW,
    ActionType.DELETE,
  ],
  [ModuleType.DASHBOARD]: [ActionType.VIEW],
  [ModuleType.HOSPITAL_DASHBOARD]: [ActionType.VIEW],
  [ModuleType.LAB_DASHBOARD]: [ActionType.VIEW],
  [ModuleType.PHARMACY_DASHBOARD]: [ActionType.VIEW],
  [ModuleType.COMPANY_DETAILS]: [ActionType.VIEW, ActionType.UPDATE],
  [ModuleType.HOSPITAL_COMPANY_DETAILS]: [ActionType.UPDATE],
  [ModuleType.LAB_COMPANY_DETAILS]: [ActionType.UPDATE],
  [ModuleType.PHARMACY_COMPANY_DETAILS]: [ActionType.UPDATE],
  [ModuleType.DAY_CARE_IPD]: [
    ActionType.CREATE,
    ActionType.UPDATE,
    ActionType.VIEW,
    ActionType.DELETE,
    ActionType.PRINT,
  ],
  [ModuleType.IPD_MLC]: [ActionType.VIEW, ActionType.UPDATE],
  [ModuleType.DOCTOR_MASTER]: [
    ActionType.CREATE,
    ActionType.UPDATE,
    ActionType.VIEW,
    ActionType.DELETE,
  ],
  [ModuleType.DEPARTMENT_MASTER]: [
    ActionType.CREATE,
    ActionType.UPDATE,
    ActionType.VIEW,
    ActionType.DELETE,
  ],
  [ModuleType.ROOM_TYPE_MASTER]: [
    ActionType.CREATE,
    ActionType.UPDATE,
    ActionType.VIEW,
    ActionType.DELETE,
  ],
  [ModuleType.ROOM_MASTER]: [
    ActionType.CREATE,
    ActionType.UPDATE,
    ActionType.VIEW,
    ActionType.DELETE,
  ],
  [ModuleType.BED_MASTER]: [
    ActionType.CREATE,
    ActionType.UPDATE,
    ActionType.VIEW,
    ActionType.DELETE,
  ],
  [ModuleType.APPOINTMENT]: [ActionType.CREATE, ActionType.VIEW],
  [ModuleType.PATIENT_MASTER]: [
    ActionType.CREATE,
    ActionType.UPDATE,
    ActionType.VIEW,
  ],
  [ModuleType.BILLING_SECTION_MASTER]: [
    ActionType.CREATE,
    ActionType.UPDATE,
    ActionType.VIEW,
    ActionType.DELETE,
  ],
  [ModuleType.SERVICE_MASTER]: [
    ActionType.CREATE,
    ActionType.UPDATE,
    ActionType.VIEW,
    ActionType.DELETE,
  ],
  [ModuleType.PATHOLOGY_TEST_MASTER]: [
    ActionType.CREATE,
    ActionType.UPDATE,
    ActionType.VIEW,
    ActionType.DELETE,
  ],
  [ModuleType.RADIOLOGY_TEMPLATE_MASTER]: [
    ActionType.CREATE,
    ActionType.UPDATE,
    ActionType.VIEW,
    ActionType.DELETE,
  ],
  [ModuleType.RADIOLOGY_TEST_MASTER]: [
    ActionType.CREATE,
    ActionType.UPDATE,
    ActionType.VIEW,
    ActionType.DELETE,
  ],
  [ModuleType.IPD_BILL]: [
    ActionType.CREATE,
    ActionType.UPDATE,
    ActionType.VIEW,
    ActionType.DELETE,
    ActionType.PRINT,
  ],
  [ModuleType.DISCHARGE_PATIENT]: [
    ActionType.CREATE,
    ActionType.UPDATE,
    ActionType.VIEW,
    ActionType.PRINT,
  ],
  [ModuleType.CANCEL_DISCHARGE_PATIENT]: [ActionType.UPDATE],
  [ModuleType.OPD_BILL]: [
    ActionType.CREATE,
    ActionType.UPDATE,
    ActionType.VIEW,
    ActionType.DELETE,
    ActionType.PRINT,
  ],
  [ModuleType.CONSULTATION_FILE]: [
    ActionType.UPDATE,
    ActionType.VIEW,
    ActionType.PRINT,
  ],
  [ModuleType.OPD_QUEUE]: [ActionType.VIEW, ActionType.DELETE],
  [ModuleType.PATHOLOGY_ORDER]: [
    ActionType.UPDATE,
    ActionType.VIEW,
    ActionType.PRINT,
  ],
  [ModuleType.RADIOLOGY_ORDER]: [
    ActionType.UPDATE,
    ActionType.VIEW,
    ActionType.PRINT,
  ],
  [ModuleType.LOCATION_MASTER]: [
    ActionType.CREATE,
    ActionType.UPDATE,
    ActionType.VIEW,
    ActionType.DELETE,
  ],
  [ModuleType.INVOICE]: [],
  [ModuleType.FINANCE_BILLING]: [ActionType.VIEW],
  [ModuleType.FINANCE_PAYMENTS]: [ActionType.VIEW],
  [ModuleType.PHARMACY_SUPPLIER]: [
    ActionType.CREATE,
    ActionType.UPDATE,
    ActionType.VIEW,
    ActionType.DELETE,
  ],
  [ModuleType.PHARMACY_DRUG_MASTER]: [
    ActionType.CREATE,
    ActionType.UPDATE,
    ActionType.VIEW,
    ActionType.DELETE,
  ],
  [ModuleType.PHARMACY_HSN_SAC_MASTER]: [
    ActionType.CREATE,
    ActionType.UPDATE,
    ActionType.VIEW,
    ActionType.DELETE,
  ],
  [ModuleType.PHARMACY_DRUG_CATEGORY_MASTER]: [
    ActionType.CREATE,
    ActionType.UPDATE,
    ActionType.VIEW,
    ActionType.DELETE,
  ],
  [ModuleType.PHARMACY_PURCHASE_ORDER]: [
    ActionType.CREATE,
    ActionType.UPDATE,
    ActionType.VIEW,
    ActionType.DELETE,
  ],
  [ModuleType.PHARMACY_GRN]: [ActionType.CREATE, ActionType.VIEW],
  [ModuleType.PHARMACY_CHALLAN]: [ActionType.CREATE, ActionType.VIEW],
  [ModuleType.PHARMACY_INVENTORY]: [ActionType.VIEW],
  [ModuleType.PHARMACY_SALE_BILL]: [
    ActionType.CREATE,
    ActionType.UPDATE,
    ActionType.VIEW,
    ActionType.DELETE,
    ActionType.PRINT,
  ],
  [ModuleType.PHARMACY_SALE_RETURN]: [ActionType.CREATE, ActionType.VIEW],
  [ModuleType.PHARMACY_SUPPLIER_RETURN]: [
    ActionType.CREATE,
    ActionType.VIEW,
  ],
  [ModuleType.PHARMACY_SUPPLIER_PAYMENT]: [
    ActionType.CREATE,
    ActionType.VIEW,
  ],
  [ModuleType.PHARMACY_SUPPLIER_CREDIT_NOTE]: [
    ActionType.CREATE,
    ActionType.VIEW,
  ],
  [ModuleType.PHARMACY_SUPPLIER_LEDGER]: [ActionType.VIEW],
  [ModuleType.PHARMACY_CUSTOMER_LEDGER]: [ActionType.VIEW],
  [ModuleType.PHARMACY_STOCK_CORRECTION]: [
    ActionType.VIEW,
    ActionType.UPDATE,
  ],
  [PHARMACY_REPORTS_MODULE]: [ActionType.VIEW],
  [PHARMACY_REPORT_COUNTER_SALE_MODULE]: [ActionType.VIEW],
  [PHARMACY_REPORT_IPD_SALE_MODULE]: [ActionType.VIEW],
  [PHARMACY_REPORT_PO_MODULE]: [ActionType.VIEW],
  [PHARMACY_REPORT_GRN_MODULE]: [ActionType.VIEW],
  [PHARMACY_REPORT_STOCK_MODULE]: [ActionType.VIEW],
  [PHARMACY_IPD_ISSUE_MODULE]: [ActionType.CREATE, ActionType.VIEW],
  [PHARMACY_IPD_RETURN_MODULE]: [ActionType.CREATE, ActionType.VIEW],
  [PHARMACY_IPD_BILL_MODULE]: [ActionType.VIEW],
  [ModuleType.FINANCE_CATEGORY_MASTER]: [
    ActionType.CREATE,
    ActionType.UPDATE,
    ActionType.VIEW,
    ActionType.DELETE,
  ],
  [ModuleType.INCOME]: [
    ActionType.CREATE,
    ActionType.UPDATE,
    ActionType.VIEW,
    ActionType.DELETE,
  ],
  [ModuleType.EXPENSE]: [
    ActionType.CREATE,
    ActionType.UPDATE,
    ActionType.VIEW,
    ActionType.DELETE,
  ],
  [CERTIFICATES_MODULE]: [
    ActionType.CREATE,
    ActionType.UPDATE,
    ActionType.VIEW,
    ActionType.PRINT,
  ],
} as unknown as Record<ModuleType, ActionType[]>;
