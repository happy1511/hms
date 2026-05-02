-- CreateTable
CREATE TABLE `SaleReturn` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `drugBillId` INTEGER NOT NULL,
    `refundAmount` DOUBLE NOT NULL DEFAULT 0,
    `refundMode` ENUM('PAYMENT_MODE_DEFAULT', 'CASH', 'CARD_PAYMENT', 'CHEQUE', 'DIGITAL_WALLET', 'INSURANCE', 'INTERNAL_ADJUSTMENTS', 'LOYALTY_CARD', 'NEFT', 'RTGS', 'TDS_AYUSHMAN_BHARAT', 'TDS_CHIRANJIVI_YOJNA', 'TDS_OTHERS', 'TDS', 'OTHER') NOT NULL DEFAULT 'CASH',
    `remarks` VARCHAR(191) NULL,
    `refundTransactionId` INTEGER NULL,
    `isDeleted` BOOLEAN NOT NULL DEFAULT false,
    `createdBy` INTEGER NULL,
    `updatedBy` INTEGER NULL,
    `deletedBy` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `SaleReturn_refundTransactionId_key`(`refundTransactionId`),
    INDEX `SaleReturn_drugBillId_idx`(`drugBillId`),
    INDEX `SaleReturn_isDeleted_idx`(`isDeleted`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `SaleReturnItem` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `saleReturnId` INTEGER NOT NULL,
    `drugSaleItemId` INTEGER NOT NULL,
    `inventoryItemId` INTEGER NOT NULL,
    `quantity` INTEGER NOT NULL,
    `isLooseQuantity` BOOLEAN NOT NULL DEFAULT false,
    `rate` DOUBLE NOT NULL,
    `discountType` ENUM('PERCENTAGE', 'VALUE') NOT NULL DEFAULT 'VALUE',
    `discountValue` DOUBLE NOT NULL DEFAULT 0,
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

    INDEX `SaleReturnItem_saleReturnId_idx`(`saleReturnId`),
    INDEX `SaleReturnItem_drugSaleItemId_idx`(`drugSaleItemId`),
    INDEX `SaleReturnItem_inventoryItemId_idx`(`inventoryItemId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `SaleReturn` ADD CONSTRAINT `SaleReturn_drugBillId_fkey` FOREIGN KEY (`drugBillId`) REFERENCES `DrugBill`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SaleReturn` ADD CONSTRAINT `SaleReturn_refundTransactionId_fkey` FOREIGN KEY (`refundTransactionId`) REFERENCES `Transaction`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SaleReturn` ADD CONSTRAINT `SaleReturn_createdBy_fkey` FOREIGN KEY (`createdBy`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SaleReturn` ADD CONSTRAINT `SaleReturn_updatedBy_fkey` FOREIGN KEY (`updatedBy`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SaleReturn` ADD CONSTRAINT `SaleReturn_deletedBy_fkey` FOREIGN KEY (`deletedBy`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SaleReturnItem` ADD CONSTRAINT `SaleReturnItem_saleReturnId_fkey` FOREIGN KEY (`saleReturnId`) REFERENCES `SaleReturn`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SaleReturnItem` ADD CONSTRAINT `SaleReturnItem_drugSaleItemId_fkey` FOREIGN KEY (`drugSaleItemId`) REFERENCES `DrugSaleItem`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SaleReturnItem` ADD CONSTRAINT `SaleReturnItem_inventoryItemId_fkey` FOREIGN KEY (`inventoryItemId`) REFERENCES `InventoryItems`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
