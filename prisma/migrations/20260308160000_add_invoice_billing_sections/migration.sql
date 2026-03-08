CREATE TABLE `InvoiceBillingSection` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `invoiceId` INTEGER NOT NULL,
    `billingSectionId` INTEGER NOT NULL,
    `discountValue` DOUBLE NOT NULL DEFAULT 0,
    `discountType` ENUM('PERCENTAGE', 'VALUE') NOT NULL DEFAULT 'VALUE',
    `createdBy` INTEGER NULL,
    `updatedBy` INTEGER NULL,
    `deletedBy` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `InvoiceBillingSection_invoiceId_billingSectionId_key`(`invoiceId`, `billingSectionId`),
    INDEX `InvoiceBillingSection_invoiceId_idx`(`invoiceId`),
    INDEX `InvoiceBillingSection_billingSectionId_idx`(`billingSectionId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

INSERT INTO `InvoiceBillingSection` (
    `invoiceId`,
    `billingSectionId`,
    `discountValue`,
    `discountType`,
    `createdBy`,
    `updatedBy`,
    `deletedBy`,
    `createdAt`,
    `updatedAt`
)
SELECT
    `invoiceId`,
    `billingSectionId`,
    0,
    'VALUE',
    MIN(`createdBy`),
    MAX(`updatedBy`),
    NULL,
    MIN(`createdAt`),
    MAX(`updatedAt`)
FROM `InvoiceBillingItem`
WHERE `invoiceId` IS NOT NULL
GROUP BY `invoiceId`, `billingSectionId`;

ALTER TABLE `InvoiceBillingItem`
    ADD COLUMN `invoiceBillingSectionId` INTEGER NULL,
    ADD COLUMN `updateReason` LONGTEXT NULL;

UPDATE `InvoiceBillingItem` AS `item`
INNER JOIN `InvoiceBillingSection` AS `section`
    ON `section`.`invoiceId` = `item`.`invoiceId`
   AND `section`.`billingSectionId` = `item`.`billingSectionId`
SET `item`.`invoiceBillingSectionId` = `section`.`id`;

ALTER TABLE `InvoiceBillingItem`
    MODIFY `invoiceBillingSectionId` INTEGER NOT NULL;

ALTER TABLE `InvoiceBillingItem`
    ADD INDEX `InvoiceBillingItem_invoiceBillingSectionId_idx`(`invoiceBillingSectionId`);

ALTER TABLE `InvoiceBillingSection`
    ADD CONSTRAINT `InvoiceBillingSection_invoiceId_fkey`
        FOREIGN KEY (`invoiceId`) REFERENCES `Invoice`(`id`)
        ON DELETE CASCADE ON UPDATE CASCADE,
    ADD CONSTRAINT `InvoiceBillingSection_billingSectionId_fkey`
        FOREIGN KEY (`billingSectionId`) REFERENCES `BillingSection`(`id`)
        ON DELETE CASCADE ON UPDATE CASCADE,
    ADD CONSTRAINT `InvoiceBillingSection_createdBy_fkey`
        FOREIGN KEY (`createdBy`) REFERENCES `User`(`id`)
        ON DELETE SET NULL ON UPDATE CASCADE,
    ADD CONSTRAINT `InvoiceBillingSection_updatedBy_fkey`
        FOREIGN KEY (`updatedBy`) REFERENCES `User`(`id`)
        ON DELETE SET NULL ON UPDATE CASCADE,
    ADD CONSTRAINT `InvoiceBillingSection_deletedBy_fkey`
        FOREIGN KEY (`deletedBy`) REFERENCES `User`(`id`)
        ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE `InvoiceBillingItem`
    ADD CONSTRAINT `InvoiceBillingItem_invoiceBillingSectionId_fkey`
        FOREIGN KEY (`invoiceBillingSectionId`) REFERENCES `InvoiceBillingSection`(`id`)
        ON DELETE CASCADE ON UPDATE CASCADE;
