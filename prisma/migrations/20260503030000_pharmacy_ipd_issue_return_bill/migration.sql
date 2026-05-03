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
        'PHARMACY_REPORTS',
        'PHARMACY_IPD_ISSUE',
        'PHARMACY_IPD_RETURN',
        'PHARMACY_IPD_BILL',
        'FINANCE_CATEGORY_MASTER',
        'INCOME',
        'EXPENSE',
        'CERTIFICATES'
    ) NOT NULL;

CREATE TABLE `IpdDirectIssue` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `ipdId` INTEGER NOT NULL,
    `discountAmount` DOUBLE NOT NULL DEFAULT 0,
    `roundOffAmount` DOUBLE NOT NULL DEFAULT 0,
    `total` DOUBLE NOT NULL DEFAULT 0,
    `isDeleted` BOOLEAN NOT NULL DEFAULT false,
    `createdBy` INTEGER NULL,
    `updatedBy` INTEGER NULL,
    `deletedBy` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `IpdDirectIssue_ipdId_idx`(`ipdId`),
    INDEX `IpdDirectIssue_isDeleted_idx`(`isDeleted`),
    INDEX `IpdDirectIssue_createdAt_idx`(`createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `IpdDirectIssueItem` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `ipdDirectIssueId` INTEGER NOT NULL,
    `inventoryItemId` INTEGER NOT NULL,
    `quantity` INTEGER NOT NULL,
    `isLooseQuantity` BOOLEAN NOT NULL DEFAULT false,
    `rate` DOUBLE NOT NULL,
    `taxableAmount` DOUBLE NOT NULL DEFAULT 0,
    `gstPercentage` DOUBLE NOT NULL DEFAULT 0,
    `cGstPercentage` DOUBLE NOT NULL DEFAULT 0,
    `sGstPercentage` DOUBLE NOT NULL DEFAULT 0,
    `iGstPercentage` DOUBLE NOT NULL DEFAULT 0,
    `gstAmount` DOUBLE NOT NULL DEFAULT 0,
    `cGstAmount` DOUBLE NOT NULL DEFAULT 0,
    `sGstAmount` DOUBLE NOT NULL DEFAULT 0,
    `iGstAmount` DOUBLE NOT NULL DEFAULT 0,
    `total` DOUBLE NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `IpdDirectIssueItem_ipdDirectIssueId_idx`(`ipdDirectIssueId`),
    INDEX `IpdDirectIssueItem_inventoryItemId_idx`(`inventoryItemId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `IpdDirectReturn` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `ipdId` INTEGER NOT NULL,
    `discountAmount` DOUBLE NOT NULL DEFAULT 0,
    `roundOffAmount` DOUBLE NOT NULL DEFAULT 0,
    `total` DOUBLE NOT NULL DEFAULT 0,
    `isDeleted` BOOLEAN NOT NULL DEFAULT false,
    `createdBy` INTEGER NULL,
    `updatedBy` INTEGER NULL,
    `deletedBy` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `IpdDirectReturn_ipdId_idx`(`ipdId`),
    INDEX `IpdDirectReturn_isDeleted_idx`(`isDeleted`),
    INDEX `IpdDirectReturn_createdAt_idx`(`createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `IpdDirectReturnItem` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `ipdDirectReturnId` INTEGER NOT NULL,
    `ipdDirectIssueItemId` INTEGER NOT NULL,
    `inventoryItemId` INTEGER NOT NULL,
    `quantity` INTEGER NOT NULL,
    `isLooseQuantity` BOOLEAN NOT NULL DEFAULT false,
    `rate` DOUBLE NOT NULL,
    `taxableAmount` DOUBLE NOT NULL DEFAULT 0,
    `gstPercentage` DOUBLE NOT NULL DEFAULT 0,
    `cGstPercentage` DOUBLE NOT NULL DEFAULT 0,
    `sGstPercentage` DOUBLE NOT NULL DEFAULT 0,
    `iGstPercentage` DOUBLE NOT NULL DEFAULT 0,
    `gstAmount` DOUBLE NOT NULL DEFAULT 0,
    `cGstAmount` DOUBLE NOT NULL DEFAULT 0,
    `sGstAmount` DOUBLE NOT NULL DEFAULT 0,
    `iGstAmount` DOUBLE NOT NULL DEFAULT 0,
    `total` DOUBLE NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `IpdDirectReturnItem_ipdDirectReturnId_idx`(`ipdDirectReturnId`),
    INDEX `IpdDirectReturnItem_ipdDirectIssueItemId_idx`(`ipdDirectIssueItemId`),
    INDEX `IpdDirectReturnItem_inventoryItemId_idx`(`inventoryItemId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `IpdDirectIssue`
    ADD CONSTRAINT `IpdDirectIssue_ipdId_fkey`
        FOREIGN KEY (`ipdId`) REFERENCES `Ipd`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
    ADD CONSTRAINT `IpdDirectIssue_createdBy_fkey`
        FOREIGN KEY (`createdBy`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE,
    ADD CONSTRAINT `IpdDirectIssue_updatedBy_fkey`
        FOREIGN KEY (`updatedBy`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE,
    ADD CONSTRAINT `IpdDirectIssue_deletedBy_fkey`
        FOREIGN KEY (`deletedBy`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE `IpdDirectIssueItem`
    ADD CONSTRAINT `IpdDirectIssueItem_ipdDirectIssueId_fkey`
        FOREIGN KEY (`ipdDirectIssueId`) REFERENCES `IpdDirectIssue`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
    ADD CONSTRAINT `IpdDirectIssueItem_inventoryItemId_fkey`
        FOREIGN KEY (`inventoryItemId`) REFERENCES `InventoryItems`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `IpdDirectReturn`
    ADD CONSTRAINT `IpdDirectReturn_ipdId_fkey`
        FOREIGN KEY (`ipdId`) REFERENCES `Ipd`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
    ADD CONSTRAINT `IpdDirectReturn_createdBy_fkey`
        FOREIGN KEY (`createdBy`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE,
    ADD CONSTRAINT `IpdDirectReturn_updatedBy_fkey`
        FOREIGN KEY (`updatedBy`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE,
    ADD CONSTRAINT `IpdDirectReturn_deletedBy_fkey`
        FOREIGN KEY (`deletedBy`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE `IpdDirectReturnItem`
    ADD CONSTRAINT `IpdDirectReturnItem_ipdDirectReturnId_fkey`
        FOREIGN KEY (`ipdDirectReturnId`) REFERENCES `IpdDirectReturn`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
    ADD CONSTRAINT `IpdDirectReturnItem_ipdDirectIssueItemId_fkey`
        FOREIGN KEY (`ipdDirectIssueItemId`) REFERENCES `IpdDirectIssueItem`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
    ADD CONSTRAINT `IpdDirectReturnItem_inventoryItemId_fkey`
        FOREIGN KEY (`inventoryItemId`) REFERENCES `InventoryItems`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
