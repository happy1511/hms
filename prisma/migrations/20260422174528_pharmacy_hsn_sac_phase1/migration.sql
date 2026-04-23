/*
  Warnings:

  - You are about to drop the column `cGstPercentage` on the `drug` table. All the data in the column will be lost.
  - You are about to drop the column `gstPercentage` on the `drug` table. All the data in the column will be lost.
  - You are about to drop the column `iGstPercentage` on the `drug` table. All the data in the column will be lost.
  - You are about to drop the column `sGstPercentage` on the `drug` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `Drug` DROP COLUMN `cGstPercentage`,
    DROP COLUMN `gstPercentage`,
    DROP COLUMN `iGstPercentage`,
    DROP COLUMN `sGstPercentage`,
    MODIFY `hsnCode` INTEGER NULL;

-- AlterTable
ALTER TABLE `InventoryItems` ADD COLUMN `hsnSacCode` INTEGER NULL,
    ADD COLUMN `itemsPerPack` INTEGER NOT NULL DEFAULT 1;

-- AlterTable
ALTER TABLE `Module` MODIFY `name` ENUM('USER', 'DASHBOARD', 'COMPANY_DETAILS', 'DAY_CARE_IPD', 'IPD_MLC', 'DOCTOR_MASTER', 'DEPARTMENT_MASTER', 'ROOM_TYPE_MASTER', 'ROOM_MASTER', 'BED_MASTER', 'APPOINTMENT', 'PATIENT_MASTER', 'BILLING_SECTION_MASTER', 'SERVICE_MASTER', 'PATHOLOGY_TEST_MASTER', 'RADIOLOGY_TEMPLATE_MASTER', 'RADIOLOGY_TEST_MASTER', 'IPD_BILL', 'DISCHARGE_PATIENT', 'CANCEL_DISCHARGE_PATIENT', 'OPD_BILL', 'CONSULTATION_FILE', 'OPD_QUEUE', 'PATHOLOGY_ORDER', 'RADIOLOGY_ORDER', 'LOCATION_MASTER', 'INVOICE', 'FINANCE_BILLING', 'FINANCE_PAYMENTS', 'PHARMACY_SUPPLIER', 'PHARMACY_DRUG_MASTER', 'PHARMACY_HSN_SAC_MASTER', 'PHARMACY_DRUG_CATEGORY_MASTER', 'PHARMACY_PURCHASE_ORDER', 'PHARMACY_GRN', 'PHARMACY_INVENTORY', 'PHARMACY_SALE_BILL', 'FINANCE_CATEGORY_MASTER', 'INCOME', 'EXPENSE') NOT NULL;

-- CreateTable
CREATE TABLE `HsnSac` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `code` INTEGER NOT NULL,
    `cGstPercentage` DOUBLE NOT NULL DEFAULT 0,
    `sGstPercentage` DOUBLE NOT NULL DEFAULT 0,
    `iGstPercentage` DOUBLE NOT NULL DEFAULT 0,
    `isDeleted` BOOLEAN NOT NULL DEFAULT false,
    `createdBy` INTEGER NULL,
    `updatedBy` INTEGER NULL,
    `deletedBy` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `HsnSac_code_key`(`code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `HsnSac` ADD CONSTRAINT `HsnSac_createdBy_fkey` FOREIGN KEY (`createdBy`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `HsnSac` ADD CONSTRAINT `HsnSac_updatedBy_fkey` FOREIGN KEY (`updatedBy`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `HsnSac` ADD CONSTRAINT `HsnSac_deletedBy_fkey` FOREIGN KEY (`deletedBy`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Drug` ADD CONSTRAINT `Drug_hsnCode_fkey` FOREIGN KEY (`hsnCode`) REFERENCES `HsnSac`(`code`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `InventoryItems` ADD CONSTRAINT `InventoryItems_hsnSacCode_fkey` FOREIGN KEY (`hsnSacCode`) REFERENCES `HsnSac`(`code`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PurchaseItem` ADD CONSTRAINT `PurchaseItem_hsnSacCode_fkey` FOREIGN KEY (`hsnSacCode`) REFERENCES `HsnSac`(`code`) ON DELETE SET NULL ON UPDATE CASCADE;
