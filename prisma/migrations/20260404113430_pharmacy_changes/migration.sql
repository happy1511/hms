/*
  Warnings:

  - Added the required column `invoiceDate` to the `GRN` table without a default value. This is not possible if the table is not empty.
  - Added the required column `invoiceNumber` to the `GRN` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `grn` ADD COLUMN `cGstAmount` DOUBLE NOT NULL DEFAULT 0,
    ADD COLUMN `cnAmount` DOUBLE NOT NULL DEFAULT 0,
    ADD COLUMN `cnRef` VARCHAR(191) NULL,
    ADD COLUMN `discountAmount` DOUBLE NOT NULL DEFAULT 0,
    ADD COLUMN `grandTotal` DOUBLE NOT NULL DEFAULT 0,
    ADD COLUMN `iGstAmount` DOUBLE NOT NULL DEFAULT 0,
    ADD COLUMN `invoiceDate` DATETIME(3) NOT NULL,
    ADD COLUMN `invoiceNumber` VARCHAR(191) NOT NULL,
    ADD COLUMN `packingForwarding` DOUBLE NOT NULL DEFAULT 0,
    ADD COLUMN `roundOffAmount` DOUBLE NOT NULL DEFAULT 0,
    ADD COLUMN `sGstAmount` DOUBLE NOT NULL DEFAULT 0,
    ADD COLUMN `taxableAmount` DOUBLE NOT NULL DEFAULT 0,
    ADD COLUMN `tcsAmount` DOUBLE NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE `purchaseitem` ADD COLUMN `hsnSacCode` INTEGER NULL,
    MODIFY `categoryId` INTEGER NULL;

-- AlterTable
ALTER TABLE `purchaseorder` ADD COLUMN `cGstAmount` DOUBLE NOT NULL DEFAULT 0,
    ADD COLUMN `discountAmount` DOUBLE NOT NULL DEFAULT 0,
    ADD COLUMN `grandTotal` DOUBLE NOT NULL DEFAULT 0,
    ADD COLUMN `iGstAmount` DOUBLE NOT NULL DEFAULT 0,
    ADD COLUMN `packingForwarding` DOUBLE NOT NULL DEFAULT 0,
    ADD COLUMN `roundOffAmount` DOUBLE NOT NULL DEFAULT 0,
    ADD COLUMN `sGstAmount` DOUBLE NOT NULL DEFAULT 0,
    ADD COLUMN `taxableAmount` DOUBLE NOT NULL DEFAULT 0,
    ADD COLUMN `tcsAmount` DOUBLE NOT NULL DEFAULT 0,
    ADD COLUMN `termsAndConditions` VARCHAR(191) NULL;
