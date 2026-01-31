/*
  Warnings:

  - You are about to drop the column `email` on the `patient` table. All the data in the column will be lost.
  - You are about to drop the column `mobileNumber` on the `patient` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `patient` table. All the data in the column will be lost.
  - You are about to drop the column `relativeContact` on the `patient` table. All the data in the column will be lost.
  - You are about to drop the column `relativeName` on the `patient` table. All the data in the column will be lost.
  - You are about to drop the column `relativeRelation` on the `patient` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `patient` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[uhid]` on the table `Patient` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `bloodGroup` to the `Patient` table without a default value. This is not possible if the table is not empty.
  - Added the required column `firstName` to the `Patient` table without a default value. This is not possible if the table is not empty.
  - Added the required column `lastName` to the `Patient` table without a default value. This is not possible if the table is not empty.
  - Added the required column `preferredName` to the `Patient` table without a default value. This is not possible if the table is not empty.
  - The required column `uhid` was added to the `Patient` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.
  - Made the column `religion` on table `patient` required. This step will fail if there are existing NULL values in that column.

*/
-- DropIndex
DROP INDEX `Patient_email_key` ON `patient`;

-- DropIndex
DROP INDEX `Patient_mobileNumber_key` ON `patient`;

-- AlterTable
ALTER TABLE `patient` DROP COLUMN `email`,
    DROP COLUMN `mobileNumber`,
    DROP COLUMN `name`,
    DROP COLUMN `relativeContact`,
    DROP COLUMN `relativeName`,
    DROP COLUMN `relativeRelation`,
    DROP COLUMN `type`,
    ADD COLUMN `bloodGroup` ENUM('A_PLUS', 'A_NEGATIVE', 'B_PLUS', 'B_NEGATIVE', 'AB_PLUS', 'AB_NEGATIVE', 'O_PLUS', 'O_NEGATIVE') NOT NULL,
    ADD COLUMN `firstName` VARCHAR(191) NOT NULL,
    ADD COLUMN `identificationMark` VARCHAR(191) NULL,
    ADD COLUMN `lastName` VARCHAR(191) NOT NULL,
    ADD COLUMN `middleName` VARCHAR(191) NULL,
    ADD COLUMN `preferredName` VARCHAR(191) NOT NULL,
    ADD COLUMN `uhid` VARCHAR(191) NOT NULL,
    MODIFY `religion` VARCHAR(191) NOT NULL;

-- CreateTable
CREATE TABLE `PatientContact` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `type` ENUM('EMAIL', 'PHONE', 'MOBILE') NOT NULL,
    `value` VARCHAR(191) NOT NULL,
    `patientId` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `emergencyContact` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `contact` VARCHAR(191) NOT NULL,
    `relation` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NULL,
    `patientId` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PatientNotes` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `type` VARCHAR(191) NOT NULL,
    `note` VARCHAR(191) NOT NULL,
    `patientId` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PatientRelations` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `type` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `contact` VARCHAR(191) NULL,
    `patientId` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PatientAddress` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `type` VARCHAR(191) NOT NULL,
    `country` VARCHAR(191) NOT NULL,
    `addressLineOne` VARCHAR(191) NOT NULL,
    `addressLineTwo` VARCHAR(191) NULL,
    `addressLineThree` VARCHAR(191) NULL,
    `city` VARCHAR(191) NOT NULL,
    `state` VARCHAR(191) NOT NULL,
    `postalCode` VARCHAR(191) NOT NULL,
    `patientId` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PatientIdentification` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `type` VARCHAR(191) NOT NULL,
    `number` VARCHAR(191) NOT NULL,
    `active` ENUM('active', 'inactive') NOT NULL,
    `patientId` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE UNIQUE INDEX `Patient_uhid_key` ON `Patient`(`uhid`);

-- AddForeignKey
ALTER TABLE `PatientContact` ADD CONSTRAINT `PatientContact_patientId_fkey` FOREIGN KEY (`patientId`) REFERENCES `Patient`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `emergencyContact` ADD CONSTRAINT `emergencyContact_patientId_fkey` FOREIGN KEY (`patientId`) REFERENCES `Patient`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PatientNotes` ADD CONSTRAINT `PatientNotes_patientId_fkey` FOREIGN KEY (`patientId`) REFERENCES `Patient`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PatientRelations` ADD CONSTRAINT `PatientRelations_patientId_fkey` FOREIGN KEY (`patientId`) REFERENCES `Patient`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PatientAddress` ADD CONSTRAINT `PatientAddress_patientId_fkey` FOREIGN KEY (`patientId`) REFERENCES `Patient`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PatientIdentification` ADD CONSTRAINT `PatientIdentification_patientId_fkey` FOREIGN KEY (`patientId`) REFERENCES `Patient`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
