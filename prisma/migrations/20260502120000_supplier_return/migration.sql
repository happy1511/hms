-- CreateTable
CREATE TABLE `SupplierReturn` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `supplierId` INTEGER NOT NULL,
    `returnDate` DATETIME(3) NOT NULL,
    `returnReason` LONGTEXT NULL,
    `taxableAmount` DOUBLE NOT NULL DEFAULT 0,
    `cGstAmount` DOUBLE NOT NULL DEFAULT 0,
    `sGstAmount` DOUBLE NOT NULL DEFAULT 0,
    `iGstAmount` DOUBLE NOT NULL DEFAULT 0,
    `total` DOUBLE NOT NULL DEFAULT 0,
    `isDeleted` BOOLEAN NOT NULL DEFAULT false,
    `createdBy` INTEGER NULL,
    `updatedBy` INTEGER NULL,
    `deletedBy` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `SupplierReturn_supplierId_idx`(`supplierId`),
    INDEX `SupplierReturn_returnDate_idx`(`returnDate`),
    INDEX `SupplierReturn_isDeleted_idx`(`isDeleted`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `SupplierReturnItem` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `supplierReturnId` INTEGER NOT NULL,
    `inventoryItemId` INTEGER NOT NULL,
    `quantity` INTEGER NOT NULL,
    `isLooseQuantity` BOOLEAN NOT NULL DEFAULT false,
    `rate` DOUBLE NOT NULL,
    `taxableAmount` DOUBLE NOT NULL DEFAULT 0,
    `gstPercentage` DOUBLE NOT NULL DEFAULT 0,
    `cGstPercentage` DOUBLE NOT NULL DEFAULT 0,
    `sGstPercentage` DOUBLE NOT NULL DEFAULT 0,
    `iGstPercentage` DOUBLE NOT NULL DEFAULT 0,
    `cGstAmount` DOUBLE NOT NULL DEFAULT 0,
    `sGstAmount` DOUBLE NOT NULL DEFAULT 0,
    `iGstAmount` DOUBLE NOT NULL DEFAULT 0,
    `total` DOUBLE NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `SupplierReturnItem_supplierReturnId_idx`(`supplierReturnId`),
    INDEX `SupplierReturnItem_inventoryItemId_idx`(`inventoryItemId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `SupplierReturn` ADD CONSTRAINT `SupplierReturn_supplierId_fkey` FOREIGN KEY (`supplierId`) REFERENCES `DrugSupplier`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `SupplierReturn` ADD CONSTRAINT `SupplierReturn_createdBy_fkey` FOREIGN KEY (`createdBy`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE `SupplierReturn` ADD CONSTRAINT `SupplierReturn_updatedBy_fkey` FOREIGN KEY (`updatedBy`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE `SupplierReturn` ADD CONSTRAINT `SupplierReturn_deletedBy_fkey` FOREIGN KEY (`deletedBy`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SupplierReturnItem` ADD CONSTRAINT `SupplierReturnItem_supplierReturnId_fkey` FOREIGN KEY (`supplierReturnId`) REFERENCES `SupplierReturn`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `SupplierReturnItem` ADD CONSTRAINT `SupplierReturnItem_inventoryItemId_fkey` FOREIGN KEY (`inventoryItemId`) REFERENCES `InventoryItems`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
