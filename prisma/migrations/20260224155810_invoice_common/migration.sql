/*
  Warnings:

  - You are about to drop the column `billingType` on the `opd` table. All the data in the column will be lost.
  - You are about to drop the column `discountType` on the `opd` table. All the data in the column will be lost.
  - You are about to drop the column `discountValue` on the `opd` table. All the data in the column will be lost.
  - You are about to drop the column `isFree` on the `opd` table. All the data in the column will be lost.
  - You are about to drop the column `isPaid` on the `opd` table. All the data in the column will be lost.
  - You are about to drop the column `rate` on the `opd` table. All the data in the column will be lost.
  - You are about to drop the column `total` on the `opd` table. All the data in the column will be lost.
  - You are about to drop the `opdbillingitem` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[invoiceId]` on the table `Opd` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `invoiceId` to the `Opd` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `opdbillingitem` DROP FOREIGN KEY `OpdBillingItem_billingSectionId_fkey`;

-- DropForeignKey
ALTER TABLE `opdbillingitem` DROP FOREIGN KEY `OpdBillingItem_opdId_fkey`;

-- DropForeignKey
ALTER TABLE `opdbillingitem` DROP FOREIGN KEY `OpdBillingItem_serviceId_fkey`;

-- DropForeignKey
ALTER TABLE `transaction` DROP FOREIGN KEY `Transaction_opdId_fkey`;

-- DropIndex
DROP INDEX `Transaction_opdId_fkey` ON `transaction`;

-- AlterTable
ALTER TABLE `opd` DROP COLUMN `billingType`,
    DROP COLUMN `discountType`,
    DROP COLUMN `discountValue`,
    DROP COLUMN `isFree`,
    DROP COLUMN `isPaid`,
    DROP COLUMN `rate`,
    DROP COLUMN `total`,
    ADD COLUMN `invoiceId` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `transaction` ADD COLUMN `invoiceId` INTEGER NULL;

-- DropTable
DROP TABLE `opdbillingitem`;

-- CreateTable
CREATE TABLE `InvoiceBillingItem` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `opdId` INTEGER NULL,
    `billingSectionId` INTEGER NOT NULL,
    `serviceId` INTEGER NOT NULL,
    `quantity` INTEGER NOT NULL,
    `rate` DOUBLE NOT NULL,
    `discountType` ENUM('PERCENTAGE', 'VALUE') NOT NULL,
    `discountValue` DOUBLE NOT NULL,
    `total` DOUBLE NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `invoiceId` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Invoice` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `rate` DOUBLE NOT NULL,
    `discountType` ENUM('PERCENTAGE', 'VALUE') NOT NULL,
    `discountValue` DOUBLE NOT NULL,
    `total` DOUBLE NOT NULL,
    `isPaid` BOOLEAN NOT NULL DEFAULT false,
    `isFree` BOOLEAN NOT NULL DEFAULT false,
    `billingType` ENUM('CASHLESS_INSURANCE', 'CORPORATE_AFFILIATION', 'AYUSHMAN_BHARAT', 'CGHS', 'RGHS', 'CHIRANJIVI_YOJNA', 'GOVERNMENT_BENEFITS', 'NOT_DETERMINED', 'SELF_PAY', 'DO_NOT_CONSIDER') NOT NULL,
    `opdId` INTEGER NULL,

    UNIQUE INDEX `Invoice_opdId_key`(`opdId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE UNIQUE INDEX `Opd_invoiceId_key` ON `Opd`(`invoiceId`);

-- AddForeignKey
ALTER TABLE `Transaction` ADD CONSTRAINT `Transaction_invoiceId_fkey` FOREIGN KEY (`invoiceId`) REFERENCES `Invoice`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `InvoiceBillingItem` ADD CONSTRAINT `InvoiceBillingItem_billingSectionId_fkey` FOREIGN KEY (`billingSectionId`) REFERENCES `BillingSection`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `InvoiceBillingItem` ADD CONSTRAINT `InvoiceBillingItem_serviceId_fkey` FOREIGN KEY (`serviceId`) REFERENCES `Service`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `InvoiceBillingItem` ADD CONSTRAINT `InvoiceBillingItem_invoiceId_fkey` FOREIGN KEY (`invoiceId`) REFERENCES `Invoice`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Opd` ADD CONSTRAINT `Opd_invoiceId_fkey` FOREIGN KEY (`invoiceId`) REFERENCES `Invoice`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
