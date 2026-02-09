/*
  Warnings:

  - The values [BIRTH_CERTIFICATE,CONSENT_FORM,DEATH_CERTIFICATE,EMPLOYMENT_CODE_OF_CONDUCT_DOCUMENT,EMPLOYMENT_EXPERIENCE_LETTER,EMPLOYMENT_LEGAL_DOCUMENT,EMPLOYMENT_OFFER_LETTER,EMPLOYMENT_OTHER_DOCUMENT,EMPLOYMENT_PAY_SLIP_PAY_ADVICE,EMPLOYMENT_RECOMMENDATION_LETTER,EMPLOYMENT_ROLES_AND_RESPONSIBILITIES,EMPLOYMENT_TERMINATION_LETTER,EMPLOYMENT_TERMS_AND_CONDITIONS_DOCUMENT,IDENTIFICATION_DOCUMENT,INSURANCE_DOCUMENT,INVOICE_DOCUMENT,LAB_REPORT,LEGAL_DOCUMENT,MEDICAL_CERTIFICATE,MEDICO_LEGAL_DOCUMENT,OTHER_CERTIFICATE_OR_CORRESPONDENCE,OTHER_DOCUMENT,PATIENT_TRANSFER_DOCUMENT,PAYMENT_RECEIPT,PHOTOS,PRESCRIPTION,PROFILE_PICTURE,REPORT,TRAVEL_DOCUMENT] on the enum `PatientIdentification_type` will be removed. If these variants are still used in the database, this will fail.
  - Added the required column `updatedAt` to the `BillingSection` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `LabTest` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `LabTestParameter` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `RadiologyTemplate` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `RadiologyTest` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `ReferenceRange` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Service` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `billingsection` ADD COLUMN `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `updatedAt` DATETIME(3) NOT NULL;

-- AlterTable
ALTER TABLE `labtest` ADD COLUMN `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `updatedAt` DATETIME(3) NOT NULL;

-- AlterTable
ALTER TABLE `labtestparameter` ADD COLUMN `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `updatedAt` DATETIME(3) NOT NULL;

-- AlterTable
ALTER TABLE `module` MODIFY `name` ENUM('USER', 'DOCTOR_MASTER', 'FLOOR_MASTER', 'WARD_MASTER', 'BED_MASTER', 'APPOINTMENT', 'PATIENT_MASTER', 'BILLING_SECTION_MASTER', 'SERVICE_MASTER') NOT NULL;

-- AlterTable
ALTER TABLE `patientidentification` MODIFY `type` ENUM('Passport', 'DriverLicense', 'NationalID') NOT NULL;

-- AlterTable
ALTER TABLE `radiologytemplate` ADD COLUMN `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `updatedAt` DATETIME(3) NOT NULL;

-- AlterTable
ALTER TABLE `radiologytest` ADD COLUMN `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `updatedAt` DATETIME(3) NOT NULL;

-- AlterTable
ALTER TABLE `referencerange` ADD COLUMN `updatedAt` DATETIME(3) NOT NULL;

-- AlterTable
ALTER TABLE `service` ADD COLUMN `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `updatedAt` DATETIME(3) NOT NULL;

-- CreateTable
CREATE TABLE `BillingSectionService` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `billingSectionId` INTEGER NOT NULL,
    `serviceId` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `BillingSectionService_billingSectionId_serviceId_key`(`billingSectionId`, `serviceId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `LabTestService` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `labTestId` INTEGER NOT NULL,
    `serviceId` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `LabTestService_labTestId_serviceId_key`(`labTestId`, `serviceId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `RadiologyTestService` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `radiologyTestId` INTEGER NOT NULL,
    `serviceId` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `RadiologyTestService_radiologyTestId_serviceId_key`(`radiologyTestId`, `serviceId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `BillingSectionService` ADD CONSTRAINT `BillingSectionService_billingSectionId_fkey` FOREIGN KEY (`billingSectionId`) REFERENCES `BillingSection`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `BillingSectionService` ADD CONSTRAINT `BillingSectionService_serviceId_fkey` FOREIGN KEY (`serviceId`) REFERENCES `Service`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `LabTestService` ADD CONSTRAINT `LabTestService_labTestId_fkey` FOREIGN KEY (`labTestId`) REFERENCES `LabTest`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `LabTestService` ADD CONSTRAINT `LabTestService_serviceId_fkey` FOREIGN KEY (`serviceId`) REFERENCES `Service`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RadiologyTestService` ADD CONSTRAINT `RadiologyTestService_radiologyTestId_fkey` FOREIGN KEY (`radiologyTestId`) REFERENCES `RadiologyTest`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RadiologyTestService` ADD CONSTRAINT `RadiologyTestService_serviceId_fkey` FOREIGN KEY (`serviceId`) REFERENCES `Service`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
