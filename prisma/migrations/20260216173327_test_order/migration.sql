/*
  Warnings:

  - The values [VERIFICATION_PENDING,VERIFIED] on the enum `PathologyTestOrder_status` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterTable
ALTER TABLE `module` MODIFY `name` ENUM('USER', 'DOCTOR_MASTER', 'FLOOR_MASTER', 'WARD_MASTER', 'BED_MASTER', 'APPOINTMENT', 'PATIENT_MASTER', 'BILLING_SECTION_MASTER', 'SERVICE_MASTER', 'PATHOLOGY_TEST_MASTER', 'RADIOLOGY_TEST_MASTER', 'OPD_BILL', 'OPD_QUEUE', 'PATHOLOGY_ORDER') NOT NULL;

-- AlterTable
ALTER TABLE `pathologytestorder` ADD COLUMN `isOutSourced` BOOLEAN NOT NULL DEFAULT false,
    MODIFY `status` ENUM('SAMPLE_PENDING', 'RESULT_PENDING', 'COMPLETED') NOT NULL DEFAULT 'SAMPLE_PENDING';

-- AddForeignKey
ALTER TABLE `PathologyTestOrder` ADD CONSTRAINT `PathologyTestOrder_opdId_fkey` FOREIGN KEY (`opdId`) REFERENCES `Opd`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
