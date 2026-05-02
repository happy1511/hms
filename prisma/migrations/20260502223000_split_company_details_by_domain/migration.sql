-- Extend Module.name enum with domain-specific company detail permissions.
ALTER TABLE `Module`
    MODIFY `name` ENUM(
        'USER',
        'DASHBOARD',
        'HOSPITAL_DASHBOARD',
        'LAB_DASHBOARD',
        'PHARMACY_DASHBOARD',
        'COMPANY_DETAILS',
        'HOSPITAL_COMPANY_DETAILS',
        'LAB_COMPANY_DETAILS',
        'PHARMACY_COMPANY_DETAILS',
        'DAY_CARE_IPD',
        'IPD_MLC',
        'DOCTOR_MASTER',
        'DEPARTMENT_MASTER',
        'ROOM_TYPE_MASTER',
        'ROOM_MASTER',
        'BED_MASTER',
        'APPOINTMENT',
        'PATIENT_MASTER',
        'BILLING_SECTION_MASTER',
        'SERVICE_MASTER',
        'PATHOLOGY_TEST_MASTER',
        'RADIOLOGY_TEMPLATE_MASTER',
        'RADIOLOGY_TEST_MASTER',
        'IPD_BILL',
        'DISCHARGE_PATIENT',
        'CANCEL_DISCHARGE_PATIENT',
        'OPD_BILL',
        'CONSULTATION_FILE',
        'OPD_QUEUE',
        'PATHOLOGY_ORDER',
        'RADIOLOGY_ORDER',
        'LOCATION_MASTER',
        'INVOICE',
        'FINANCE_BILLING',
        'FINANCE_PAYMENTS',
        'PHARMACY_SUPPLIER',
        'PHARMACY_DRUG_MASTER',
        'PHARMACY_HSN_SAC_MASTER',
        'PHARMACY_DRUG_CATEGORY_MASTER',
        'PHARMACY_PURCHASE_ORDER',
        'PHARMACY_GRN',
        'PHARMACY_CHALLAN',
        'PHARMACY_INVENTORY',
        'PHARMACY_SALE_BILL',
        'PHARMACY_SALE_RETURN',
        'PHARMACY_SUPPLIER_RETURN',
        'PHARMACY_SUPPLIER_PAYMENT',
        'PHARMACY_SUPPLIER_CREDIT_NOTE',
        'PHARMACY_SUPPLIER_LEDGER',
        'PHARMACY_CUSTOMER_LEDGER',
        'PHARMACY_STOCK_CORRECTION',
        'FINANCE_CATEGORY_MASTER',
        'INCOME',
        'EXPENSE'
    ) NOT NULL;

-- Add company details type and split the single existing row into typed rows.
ALTER TABLE `CompanyDetails`
    ADD COLUMN `type` ENUM('HOSPITAL', 'LAB', 'PHARMACY') NULL AFTER `id`;

UPDATE `CompanyDetails`
SET `type` = 'HOSPITAL'
WHERE `type` IS NULL;

INSERT INTO `CompanyDetails` (`type`, `name`, `address`, `mobile`, `createdAt`, `updatedAt`)
SELECT 'LAB', '', '', '', NOW(), NOW()
WHERE NOT EXISTS (
    SELECT 1 FROM `CompanyDetails` WHERE `type` = 'LAB'
);

INSERT INTO `CompanyDetails` (`type`, `name`, `address`, `mobile`, `createdAt`, `updatedAt`)
SELECT 'PHARMACY', '', '', '', NOW(), NOW()
WHERE NOT EXISTS (
    SELECT 1 FROM `CompanyDetails` WHERE `type` = 'PHARMACY'
);

ALTER TABLE `CompanyDetails`
    MODIFY `type` ENUM('HOSPITAL', 'LAB', 'PHARMACY') NOT NULL;

CREATE UNIQUE INDEX `CompanyDetails_type_key` ON `CompanyDetails`(`type`);
