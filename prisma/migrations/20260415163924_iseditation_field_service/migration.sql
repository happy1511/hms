-- AlterTable
ALTER TABLE `PharmacyCustomer` ALTER COLUMN `updatedAt` DROP DEFAULT;

-- AlterTable
ALTER TABLE `Service` ADD COLUMN `isEditableRate` BOOLEAN NOT NULL DEFAULT false;
