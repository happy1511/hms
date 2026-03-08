-- AlterTable
ALTER TABLE `PathologyTestOrder`
    ADD COLUMN `invoiceBillingItemId` INTEGER NULL;

-- AlterTable
ALTER TABLE `RadiologyTestOrder`
    ADD COLUMN `invoiceBillingItemId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `PathologyTestOrder`
    ADD CONSTRAINT `PathologyTestOrder_invoiceBillingItemId_fkey`
    FOREIGN KEY (`invoiceBillingItemId`) REFERENCES `InvoiceBillingItem`(`id`)
    ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RadiologyTestOrder`
    ADD CONSTRAINT `RadiologyTestOrder_invoiceBillingItemId_fkey`
    FOREIGN KEY (`invoiceBillingItemId`) REFERENCES `InvoiceBillingItem`(`id`)
    ON DELETE SET NULL ON UPDATE CASCADE;
