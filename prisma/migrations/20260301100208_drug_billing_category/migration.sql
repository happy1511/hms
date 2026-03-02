/*
  Warnings:

  - You are about to drop the column `categoryId` on the `Drug` table. All the data in the column will be lost.
  - You are about to drop the `DrugCategory` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `Drug` DROP FOREIGN KEY `Drug_categoryId_fkey`;

-- DropForeignKey
ALTER TABLE `PurchaseItem` DROP FOREIGN KEY `PurchaseItem_categoryId_fkey`;

-- DropIndex
DROP INDEX `Drug_categoryId_fkey` ON `Drug`;

-- DropIndex
DROP INDEX `PurchaseItem_categoryId_fkey` ON `PurchaseItem`;

-- AlterTable
ALTER TABLE `Drug` DROP COLUMN `categoryId`;

-- DropTable
DROP TABLE `DrugCategory`;

-- CreateTable
CREATE TABLE `DrugBillingCategory` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `PurchaseItem` ADD CONSTRAINT `PurchaseItem_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `DrugBillingCategory`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
