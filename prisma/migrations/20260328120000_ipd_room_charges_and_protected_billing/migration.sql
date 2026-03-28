ALTER TABLE `BillingSection`
    ADD COLUMN `systemKey` VARCHAR(191) NULL;

ALTER TABLE `Room`
    ADD COLUMN `price` DOUBLE NOT NULL DEFAULT 0;

ALTER TABLE `Service`
    ADD COLUMN `roomId` INTEGER NULL;

ALTER TABLE `InvoiceBillingItem`
    ADD COLUMN `isLocked` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `ipdBedAllocationId` INTEGER NULL;

CREATE TABLE `IpdBedAllocation` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `ipdId` INTEGER NOT NULL,
    `bedId` INTEGER NOT NULL,
    `roomId` INTEGER NOT NULL,
    `fromDateTime` DATETIME(3) NOT NULL,
    `toDateTime` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `IpdBedAllocation_ipdId_idx`(`ipdId`),
    INDEX `IpdBedAllocation_bedId_idx`(`bedId`),
    INDEX `IpdBedAllocation_roomId_idx`(`roomId`),
    INDEX `IpdBedAllocation_fromDateTime_idx`(`fromDateTime`),
    INDEX `IpdBedAllocation_toDateTime_idx`(`toDateTime`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE UNIQUE INDEX `BillingSection_systemKey_key` ON `BillingSection`(`systemKey`);
CREATE UNIQUE INDEX `Service_roomId_key` ON `Service`(`roomId`);
CREATE UNIQUE INDEX `InvoiceBillingItem_ipdBedAllocationId_key` ON `InvoiceBillingItem`(`ipdBedAllocationId`);
CREATE INDEX `InvoiceBillingItem_ipdBedAllocationId_idx` ON `InvoiceBillingItem`(`ipdBedAllocationId`);

ALTER TABLE `Service`
    ADD CONSTRAINT `Service_roomId_fkey`
        FOREIGN KEY (`roomId`) REFERENCES `Room`(`id`)
        ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE `InvoiceBillingItem`
    ADD CONSTRAINT `InvoiceBillingItem_ipdBedAllocationId_fkey`
        FOREIGN KEY (`ipdBedAllocationId`) REFERENCES `IpdBedAllocation`(`id`)
        ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE `IpdBedAllocation`
    ADD CONSTRAINT `IpdBedAllocation_ipdId_fkey`
        FOREIGN KEY (`ipdId`) REFERENCES `Ipd`(`id`)
        ON DELETE CASCADE ON UPDATE CASCADE,
    ADD CONSTRAINT `IpdBedAllocation_bedId_fkey`
        FOREIGN KEY (`bedId`) REFERENCES `Bed`(`id`)
        ON DELETE CASCADE ON UPDATE CASCADE,
    ADD CONSTRAINT `IpdBedAllocation_roomId_fkey`
        FOREIGN KEY (`roomId`) REFERENCES `Room`(`id`)
        ON DELETE CASCADE ON UPDATE CASCADE;

INSERT INTO `BillingSection` (`name`, `systemKey`, `description`, `status`, `isDeleted`, `createdAt`, `updatedAt`)
VALUES
    ('Consultation Charges', 'CONSULTATION_CHARGES', 'Consultation Charges system section', 'active', false, CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3)),
    ('Room Charges', 'ROOM_CHARGES', 'Room Charges system section', 'active', false, CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3))
ON DUPLICATE KEY UPDATE
    `name` = VALUES(`name`),
    `description` = VALUES(`description`),
    `status` = 'active',
    `isDeleted` = false,
    `updatedAt` = CURRENT_TIMESTAMP(3);
