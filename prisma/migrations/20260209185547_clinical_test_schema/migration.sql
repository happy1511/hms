/*
  Warnings:

  - You are about to drop the column `description` on the `radiologytest` table. All the data in the column will be lost.
  - You are about to drop the column `radiologyTestId` on the `radiologytestservice` table. All the data in the column will be lost.
  - You are about to drop the column `ageFrom` on the `referencerange` table. All the data in the column will be lost.
  - You are about to drop the column `ageTo` on the `referencerange` table. All the data in the column will be lost.
  - You are about to drop the column `criticalHigh` on the `referencerange` table. All the data in the column will be lost.
  - You are about to drop the column `criticalLow` on the `referencerange` table. All the data in the column will be lost.
  - You are about to drop the column `gender` on the `referencerange` table. All the data in the column will be lost.
  - You are about to drop the column `labTestParameterId` on the `referencerange` table. All the data in the column will be lost.
  - You are about to drop the column `notes` on the `referencerange` table. All the data in the column will be lost.
  - You are about to drop the column `rangeMax` on the `referencerange` table. All the data in the column will be lost.
  - You are about to drop the column `rangeMin` on the `referencerange` table. All the data in the column will be lost.
  - The values [IMAGING,PHARMACY,CONSULTATION,SURGERY,THERAPY] on the enum `Service_type` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the `labtest` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `labtestparameter` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `labtestservice` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[testId,serviceId]` on the table `RadiologyTestService` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `name` to the `RadiologyTemplate` table without a default value. This is not possible if the table is not empty.
  - Added the required column `type` to the `RadiologyTemplate` table without a default value. This is not possible if the table is not empty.
  - Added the required column `alias` to the `RadiologyTest` table without a default value. This is not possible if the table is not empty.
  - Added the required column `section` to the `RadiologyTest` table without a default value. This is not possible if the table is not empty.
  - Added the required column `testId` to the `RadiologyTestService` table without a default value. This is not possible if the table is not empty.
  - Added the required column `applicableGender` to the `ReferenceRange` table without a default value. This is not possible if the table is not empty.
  - Added the required column `testParameterId` to the `ReferenceRange` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `labtestparameter` DROP FOREIGN KEY `LabTestParameter_id_fkey`;

-- DropForeignKey
ALTER TABLE `labtestservice` DROP FOREIGN KEY `LabTestService_labTestId_fkey`;

-- DropForeignKey
ALTER TABLE `labtestservice` DROP FOREIGN KEY `LabTestService_serviceId_fkey`;

-- DropForeignKey
ALTER TABLE `radiologytemplate` DROP FOREIGN KEY `RadiologyTemplate_radiologyTestId_fkey`;

-- DropForeignKey
ALTER TABLE `radiologytestservice` DROP FOREIGN KEY `RadiologyTestService_radiologyTestId_fkey`;

-- DropForeignKey
ALTER TABLE `referencerange` DROP FOREIGN KEY `ReferenceRange_labTestParameterId_fkey`;

-- DropIndex
DROP INDEX `RadiologyTemplate_radiologyTestId_fkey` ON `radiologytemplate`;

-- DropIndex
DROP INDEX `RadiologyTestService_radiologyTestId_serviceId_key` ON `radiologytestservice`;

-- DropIndex
DROP INDEX `ReferenceRange_labTestParameterId_fkey` ON `referencerange`;

-- AlterTable
ALTER TABLE `billingsection` ADD COLUMN `isPathologyTest` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `isRadiologyTest` BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE `module` MODIFY `name` ENUM('USER', 'DOCTOR_MASTER', 'FLOOR_MASTER', 'WARD_MASTER', 'BED_MASTER', 'APPOINTMENT', 'PATIENT_MASTER', 'BILLING_SECTION_MASTER', 'SERVICE_MASTER', 'PATHOLOGY_TEST_MASTER', 'RADIOLOGY_TEST_MASTER') NOT NULL;

-- AlterTable
ALTER TABLE `radiologytemplate` ADD COLUMN `name` VARCHAR(191) NOT NULL,
    ADD COLUMN `type` ENUM('COAGULATION', 'CT_SCAN', 'CYTOGENETICS', 'CYTOPATHOLOGY', 'HISTOPATHOLOGY', 'IMMUNOASSAY', 'IMMUNOFLUORESCENCE', 'MICROBIOLOGY', 'MOLECULAR_BIOLOGY', 'MRI', 'NEPHELOMETRY', 'SONOGRAPHY_ULTRASOUND', 'TRANSFUSION_MEDICINE', 'X_RAY') NOT NULL,
    MODIFY `radiologyTestId` INTEGER NULL;

-- AlterTable
ALTER TABLE `radiologytest` DROP COLUMN `description`,
    ADD COLUMN `alias` VARCHAR(191) NOT NULL,
    ADD COLUMN `section` ENUM('COAGULATION', 'CT_SCAN', 'CYTOGENETICS', 'CYTOPATHOLOGY', 'HISTOPATHOLOGY', 'IMMUNOASSAY', 'IMMUNOFLUORESCENCE', 'MICROBIOLOGY', 'MOLECULAR_BIOLOGY', 'MRI', 'NEPHELOMETRY', 'SONOGRAPHY_ULTRASOUND', 'TRANSFUSION_MEDICINE', 'X_RAY') NOT NULL;

-- AlterTable
ALTER TABLE `radiologytestservice` DROP COLUMN `radiologyTestId`,
    ADD COLUMN `testId` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `referencerange` DROP COLUMN `ageFrom`,
    DROP COLUMN `ageTo`,
    DROP COLUMN `criticalHigh`,
    DROP COLUMN `criticalLow`,
    DROP COLUMN `gender`,
    DROP COLUMN `labTestParameterId`,
    DROP COLUMN `notes`,
    DROP COLUMN `rangeMax`,
    DROP COLUMN `rangeMin`,
    ADD COLUMN `applicableGender` ENUM('MALE', 'FEMALE', 'Both') NOT NULL,
    ADD COLUMN `lowerDay` VARCHAR(191) NULL,
    ADD COLUMN `lowerMonth` VARCHAR(191) NULL,
    ADD COLUMN `lowerRange` VARCHAR(191) NULL,
    ADD COLUMN `lowerYear` VARCHAR(191) NULL,
    ADD COLUMN `testParameterId` INTEGER NOT NULL,
    ADD COLUMN `unit` VARCHAR(191) NULL,
    ADD COLUMN `upperDay` VARCHAR(191) NULL,
    ADD COLUMN `upperMonth` VARCHAR(191) NULL,
    ADD COLUMN `upperRange` VARCHAR(191) NULL,
    ADD COLUMN `upperYear` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `service` MODIFY `type` ENUM('LAB_TEST', 'RADIOLOGY_TEST', 'OTHER') NOT NULL,
    MODIFY `applicableOn` ENUM('INPATIENT', 'OUTPATIENT', 'CONSULTATION', 'BOTH') NOT NULL DEFAULT 'BOTH';

-- DropTable
DROP TABLE `labtest`;

-- DropTable
DROP TABLE `labtestparameter`;

-- DropTable
DROP TABLE `labtestservice`;

-- CreateTable
CREATE TABLE `PathologyTest` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `alias` VARCHAR(191) NOT NULL,
    `price` DOUBLE NOT NULL,
    `status` ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
    `section` ENUM('BIOCHEMISTRY', 'CLINICAL_PATHOLOGY', 'COAGULATION', 'CYTOGENETICS', 'CYTOPATHOLOGY', 'HAEMATOLOGY', 'HISTOPATHOLOGY', 'HORMONES_IMMUNOLOGY', 'IMMUNOASSAY', 'IMMUNOFLUORESCENCE', 'MICROBIOLOGY', 'MOLECULAR_BIOLOGY', 'NEPHELOMETRY', 'SEROLOGY', 'TRANSFUSION_MEDICINE') NOT NULL,
    `container` ENUM('CLOT_ACTIVATOR', 'EDTA', 'EDTA_CLOT_ACTIVATOR', 'EDTA_CITRATE_ACTIVATOR', 'SODIUM_CITRATE_3_2', 'OTHER') NOT NULL,
    `sampleType` ENUM('CSF', 'ASCITIC_FLUID', 'OTHER', 'PERICARDIAL_FLUID', 'PERITONEAL_FLUID', 'PLASMA', 'PLEURAL_FLUID', 'PUS', 'SEMEN', 'SERUM', 'SPUTUM', 'STOOL', 'SYNOVIAL_FLUID', 'URINE', 'WHOLE_BLOOD', 'WHOLE_BLOOD_SERUM') NOT NULL,
    `footerNotes` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `PathologyTest_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PathologyTestHeader` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `note` VARCHAR(191) NULL,
    `displayOrder` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `testId` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PathologyTestParameter` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `headerId` INTEGER NULL,
    `name` VARCHAR(191) NOT NULL,
    `displayOrder` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `testId` INTEGER NULL,
    `isDescriptiveOnly` BOOLEAN NOT NULL DEFAULT false,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ParameterOptions` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `testParameterId` INTEGER NOT NULL,
    `value` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PathologyTestService` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `testId` INTEGER NOT NULL,
    `serviceId` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `PathologyTestService_testId_serviceId_key`(`testId`, `serviceId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE UNIQUE INDEX `RadiologyTestService_testId_serviceId_key` ON `RadiologyTestService`(`testId`, `serviceId`);

-- AddForeignKey
ALTER TABLE `PathologyTestHeader` ADD CONSTRAINT `PathologyTestHeader_testId_fkey` FOREIGN KEY (`testId`) REFERENCES `PathologyTest`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PathologyTestParameter` ADD CONSTRAINT `PathologyTestParameter_headerId_fkey` FOREIGN KEY (`headerId`) REFERENCES `PathologyTestHeader`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PathologyTestParameter` ADD CONSTRAINT `PathologyTestParameter_testId_fkey` FOREIGN KEY (`testId`) REFERENCES `PathologyTest`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ParameterOptions` ADD CONSTRAINT `ParameterOptions_testParameterId_fkey` FOREIGN KEY (`testParameterId`) REFERENCES `PathologyTestParameter`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ReferenceRange` ADD CONSTRAINT `ReferenceRange_testParameterId_fkey` FOREIGN KEY (`testParameterId`) REFERENCES `PathologyTestParameter`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RadiologyTemplate` ADD CONSTRAINT `RadiologyTemplate_radiologyTestId_fkey` FOREIGN KEY (`radiologyTestId`) REFERENCES `RadiologyTest`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PathologyTestService` ADD CONSTRAINT `PathologyTestService_testId_fkey` FOREIGN KEY (`testId`) REFERENCES `PathologyTest`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PathologyTestService` ADD CONSTRAINT `PathologyTestService_serviceId_fkey` FOREIGN KEY (`serviceId`) REFERENCES `Service`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RadiologyTestService` ADD CONSTRAINT `RadiologyTestService_testId_fkey` FOREIGN KEY (`testId`) REFERENCES `RadiologyTest`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
