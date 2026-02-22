/*
  Warnings:

  - You are about to alter the column `type` on the `patientaddress` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Enum(EnumId(7))`.
  - The values [Passport,DriverLicense,NationalID] on the enum `PatientIdentification_type` will be removed. If these variants are still used in the database, this will fail.
  - A unique constraint covering the columns `[type,patientId]` on the table `PatientAddress` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[type,patientId]` on the table `PatientContact` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[type,patientId]` on the table `PatientIdentification` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `PatientAddress` MODIFY `type` ENUM('BILLING', 'CONTACT', 'BUSINESS', 'HOME', 'POSTAL', 'SHIPPING') NOT NULL DEFAULT 'HOME';

-- AlterTable
ALTER TABLE `PatientIdentification` MODIFY `type` ENUM('ADHAR_CARD', 'DRIVING_LICENSE', 'PAN_CARD', 'VOTER_CARD') NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `PatientAddress_type_patientId_key` ON `PatientAddress`(`type`, `patientId`);

-- CreateIndex
CREATE UNIQUE INDEX `PatientContact_type_patientId_key` ON `PatientContact`(`type`, `patientId`);

-- CreateIndex
CREATE UNIQUE INDEX `PatientIdentification_type_patientId_key` ON `PatientIdentification`(`type`, `patientId`);
