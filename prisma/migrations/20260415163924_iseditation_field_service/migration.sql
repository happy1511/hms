-- AlterTable
ALTER TABLE `pharmacycustomer` ALTER COLUMN `updatedAt` DROP DEFAULT;

-- AlterTable
ALTER TABLE `service` ADD COLUMN `isEditableRate` BOOLEAN NOT NULL DEFAULT false;
