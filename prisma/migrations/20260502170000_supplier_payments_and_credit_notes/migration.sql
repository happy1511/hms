ALTER TABLE `Module`
    MODIFY `name` ENUM(
        'USER',
        'DASHBOARD',
        'COMPANY_DETAILS',
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
        'FINANCE_CATEGORY_MASTER',
        'INCOME',
        'EXPENSE'
    ) NOT NULL;

CREATE TABLE `SupplierPayment` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `supplierId` INTEGER NOT NULL,
    `type` ENUM('DEBIT', 'CREDIT') NOT NULL,
    `paymentDate` DATETIME(3) NOT NULL,
    `amount` DOUBLE NOT NULL DEFAULT 0,
    `reference` LONGTEXT NULL,
    `isDeleted` BOOLEAN NOT NULL DEFAULT false,
    `createdBy` INTEGER NULL,
    `updatedBy` INTEGER NULL,
    `deletedBy` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `SupplierPayment_supplierId_idx`(`supplierId`),
    INDEX `SupplierPayment_type_idx`(`type`),
    INDEX `SupplierPayment_paymentDate_idx`(`paymentDate`),
    INDEX `SupplierPayment_isDeleted_idx`(`isDeleted`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `SupplierPaymentAllocation` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `supplierPaymentId` INTEGER NOT NULL,
    `grnId` INTEGER NOT NULL,
    `amount` DOUBLE NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `SupplierPaymentAllocation_supplierPaymentId_grnId_key`(`supplierPaymentId`, `grnId`),
    INDEX `SupplierPaymentAllocation_supplierPaymentId_idx`(`supplierPaymentId`),
    INDEX `SupplierPaymentAllocation_grnId_idx`(`grnId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `SupplierPayment`
    ADD CONSTRAINT `SupplierPayment_supplierId_fkey`
        FOREIGN KEY (`supplierId`) REFERENCES `DrugSupplier`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
    ADD CONSTRAINT `SupplierPayment_createdBy_fkey`
        FOREIGN KEY (`createdBy`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE,
    ADD CONSTRAINT `SupplierPayment_updatedBy_fkey`
        FOREIGN KEY (`updatedBy`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE,
    ADD CONSTRAINT `SupplierPayment_deletedBy_fkey`
        FOREIGN KEY (`deletedBy`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE `SupplierPaymentAllocation`
    ADD CONSTRAINT `SupplierPaymentAllocation_supplierPaymentId_fkey`
        FOREIGN KEY (`supplierPaymentId`) REFERENCES `SupplierPayment`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
    ADD CONSTRAINT `SupplierPaymentAllocation_grnId_fkey`
        FOREIGN KEY (`grnId`) REFERENCES `GRN`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
