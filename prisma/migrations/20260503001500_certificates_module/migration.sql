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
        'EXPENSE',
        'CERTIFICATES'
    ) NOT NULL;

CREATE TABLE `CertificateTemplate` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `type` ENUM('MEDICAL', 'FITNESS') NOT NULL,
    `content` LONGTEXT NOT NULL,
    `createdBy` INTEGER NULL,
    `updatedBy` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `CertificateTemplate_type_key`(`type`),
    INDEX `CertificateTemplate_createdBy_idx`(`createdBy`),
    INDEX `CertificateTemplate_updatedBy_idx`(`updatedBy`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `OpdCertificate` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `opdId` INTEGER NOT NULL,
    `type` ENUM('MEDICAL', 'FITNESS') NOT NULL,
    `content` LONGTEXT NOT NULL,
    `createdBy` INTEGER NULL,
    `updatedBy` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `OpdCertificate_opdId_idx`(`opdId`),
    INDEX `OpdCertificate_type_idx`(`type`),
    INDEX `OpdCertificate_createdBy_idx`(`createdBy`),
    INDEX `OpdCertificate_updatedBy_idx`(`updatedBy`),
    INDEX `OpdCertificate_createdAt_idx`(`createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `CertificateTemplate`
    ADD CONSTRAINT `CertificateTemplate_createdBy_fkey` FOREIGN KEY (`createdBy`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE,
    ADD CONSTRAINT `CertificateTemplate_updatedBy_fkey` FOREIGN KEY (`updatedBy`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE `OpdCertificate`
    ADD CONSTRAINT `OpdCertificate_opdId_fkey` FOREIGN KEY (`opdId`) REFERENCES `Opd`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
    ADD CONSTRAINT `OpdCertificate_createdBy_fkey` FOREIGN KEY (`createdBy`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE,
    ADD CONSTRAINT `OpdCertificate_updatedBy_fkey` FOREIGN KEY (`updatedBy`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
