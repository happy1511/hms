/*
  Warnings:

  - A unique constraint covering the columns `[grnId]` on the table `PurchaseOrder` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `purchaseorder` ADD COLUMN `grnId` INTEGER NULL;

-- CreateTable
CREATE TABLE `GRNItems` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `purchaseItemId` INTEGER NOT NULL,
    `inventoryItemId` INTEGER NOT NULL,
    `grnId` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `GRN` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `orderId` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `GRN_orderId_key`(`orderId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE UNIQUE INDEX `PurchaseOrder_grnId_key` ON `PurchaseOrder`(`grnId`);

-- AddForeignKey
ALTER TABLE `GRNItems` ADD CONSTRAINT `GRNItems_grnId_fkey` FOREIGN KEY (`grnId`) REFERENCES `GRN`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `GRNItems` ADD CONSTRAINT `GRNItems_inventoryItemId_fkey` FOREIGN KEY (`inventoryItemId`) REFERENCES `InventoryItems`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `GRNItems` ADD CONSTRAINT `GRNItems_purchaseItemId_fkey` FOREIGN KEY (`purchaseItemId`) REFERENCES `PurchaseItem`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `GRN` ADD CONSTRAINT `GRN_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `PurchaseOrder`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
