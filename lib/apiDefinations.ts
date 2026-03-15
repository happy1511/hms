// ----------------------------------
// ----------AUTH ENDPOINTS----------
// ----------------------------------
export const LOGIN = "/auth/login";
export const LOGOUT = "/auth/logout";
export const PROFILE = "/auth/profile";
export const CHANGE_PASSWORD = "/auth/change-password";

// ----------------------------------
// ---PERMISSIONS ENDPOINTS----------
// ----------------------------------
export const PERMISSION = "/permission";

// ----------------------------------
// ---DASHBOARD ENDPOINTS----------
// ----------------------------------
export const DASHBOARD = "/dashboard";

// ----------------------------------
// ---------LOCATION ENDPOINTS--------
// ----------------------------------
export const LOCATIONS = "/locations";

// ----------------------------------
// ---------USERS ENDPOINTS----------
// ----------------------------------
export const USERS = "/user";

// ----------------------------------
// ---------DOCTORS ENDPOINTS--------
// ----------------------------------
export const DOCTORS = "/doctor";

// ----------------------------------
// ---------PATIENT ENDPOINTS--------
// ----------------------------------
export const PATIENT = "/patient";
export const PATIENT_DOCUMENTS = "/patient/documents";

// ----------------------------------
// ---------DEPARTMENTS ENDPOINTS--------
// ----------------------------------
export const DEPARTMENTS = "/department";

// ----------------------------------
// ---------SUPPLIER ENDPOINTS--------
// ----------------------------------
export const DRUG_SUPPLIER = "/supplier";

// ----------------------------------
// ---------DRUG CATEGORY ENDPOINTS--------
// ----------------------------------
export const DRUG_CATEGORY = "/drug-category";

// ----------------------------------
// ---------DRUG ENDPOINTS--------
// ----------------------------------
export const PHARMACY_DRUG = "/drug";

// ----------------------------------
// ---------PHARMACY ORDER ENDPOINTS--------
// ----------------------------------
export const PHARMACY_PURCHASE_ORDER = "/pharmacy/purchase-order";
export const PHARMACY_GRN = "/pharmacy/grn";
export const PHARMACY_SALE_BILL = "/pharmacy/sale-bill";
export const PHARMACY_INVENTORY = "/pharmacy/inventory";

// ----------------------------------
// ---------ROOM TYPE ENDPOINTS--------
// ----------------------------------
export const ROOM_TYPE = "/room-type";

// ----------------------------------
// ---------ROOM ENDPOINTS--------
// ----------------------------------
export const ROOMS = "/room";

// ----------------------------------
// ---------BED ENDPOINTS--------
// ----------------------------------
export const BEDS = "/bed";
export const BEDS_AVAILABILITY = "/bed/availability";

// ----------------------------------
// ---------APPOINTMENT ENDPOINTS--------
// ----------------------------------
export const APPOINTMENTS = "/appointment";

// ----------------------------------
// ---------BILLING SECTION ENDPOINTS--------
// ----------------------------------
export const BILLING_SECTIONS = "/billing-section";

// ----------------------------------
// ---------SERVICES ENDPOINTS--------
// ----------------------------------
export const SERVICES = "/service";

// ----------------------------------
// ---------PATHOLOGY ENDPOINTS--------
// ----------------------------------
export const PATHOLOGY = "/pathology";
export const PATHOLOGY_TEST_PARAMETER = "/pathology/parameter";
export const PATHOLOGY_TEST_REFERENCE_RANGE = "/pathology/reference-range";
export const PATHOLOGY_TEST_OPTION = "/pathology/parameter-option";
export const PATHOLOGY_TEST_PARAMETER_HEADER = "/pathology/parameter-header";
export const PATHOLOGY_ORDERS = "/pathology/orders";
export const CANCEL_PATHOLOGY_ORDERS = "/pathology/orders/cancel";
export const OUTSOURCE_PATHOLOGY_ORDERS = "/pathology/orders/outsource";
export const SAMPLE_PATHOLOGY_ORDERS = "/pathology/orders/mark-sample";
export const PATHOLOGY_ORDER_PARAMETERS = "/pathology/orders/get-parameters";
export const PATHOLOGY_COMPLETED_ORDERS_WITH_RESULTS =
  "/pathology/orders/completed-results";

// ----------------------------------
// ---------RADIOLOGY ENDPOINTS--------
// ----------------------------------
export const RADIOLOGY = "/radiology";
export const RADIOLOGY_TEMPLATE = "/radiology/template";
export const RADIOLOGY_ORDERS = "/radiology/orders";
export const CANCEL_RADIOLOGY_ORDERS = "/radiology/orders/cancel";
export const OUTSOURCE_RADIOLOGY_ORDERS = "/radiology/orders/outsource";
export const SAMPLE_RADIOLOGY_ORDERS = "/radiology/orders/mark-sample";
export const RADIOLOGY_ORDER_TEMPLATE = "/radiology/orders/get-template";
export const RADIOLOGY_COMPLETED_ORDERS_WITH_RESULTS =
  "/radiology/orders/completed-results";

// ----------------------------------
// ---------OPD ENDPOINTS--------
// ----------------------------------
export const OPD = "/opd";
export const OPD_QUEUE = "/opd/queue";
export const OPD_CONSULTATION = "/opd/consultation";
export const OPD_DOCTORS = "/opd/doctors";
export const OPD_VITALS = "/opd/vitals";

// ----------------------------------
// ---------IPD ENDPOINTS--------
// ----------------------------------
export const IPD = "/ipd";
export const IPD_DISCHARGE = "/ipd/discharge-patient";

// ----------------------------------
// ---------INVOICE ENDPOINTS--------
// ----------------------------------
export const INVOICE_TRANSACTION = "/invoice/transaction";
export const INVOICE = "/invoice";
export const INVOICE_BILLING_ITEM = "/invoice/billing-item";
export const INCOME = "/income";
export const EXPENSE = "/expense";
