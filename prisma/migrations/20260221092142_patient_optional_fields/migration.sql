/*
  Warnings:

  - You are about to drop the column `city` on the `patientaddress` table. All the data in the column will be lost.
  - You are about to drop the column `country` on the `patientaddress` table. All the data in the column will be lost.
  - You are about to drop the column `postalCode` on the `patientaddress` table. All the data in the column will be lost.
  - You are about to drop the column `state` on the `patientaddress` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `Patient` MODIFY `preferredName` VARCHAR(191) NULL,
    MODIFY `maritalStatus` ENUM('Single', 'Married', 'Divorced', 'Widowed') NULL,
    MODIFY `religion` VARCHAR(191) NULL,
    MODIFY `bloodGroup` ENUM('A_PLUS', 'A_NEGATIVE', 'B_PLUS', 'B_NEGATIVE', 'AB_PLUS', 'AB_NEGATIVE', 'O_PLUS', 'O_NEGATIVE') NULL;

-- AlterTable
ALTER TABLE `PatientAddress` DROP COLUMN `city`,
    DROP COLUMN `country`,
    DROP COLUMN `postalCode`,
    DROP COLUMN `state`,
    ADD COLUMN `locationId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `PatientAddress` ADD CONSTRAINT `PatientAddress_locationId_fkey` FOREIGN KEY (`locationId`) REFERENCES `Location`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
