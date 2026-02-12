/*
  Warnings:

  - You are about to drop the column `type` on the `radiologytemplate` table. All the data in the column will be lost.
  - Added the required column `section` to the `RadiologyTemplate` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `radiologytemplate` DROP COLUMN `type`,
    ADD COLUMN `section` ENUM('COAGULATION', 'CT_SCAN', 'CYTOGENETICS', 'CYTOPATHOLOGY', 'HISTOPATHOLOGY', 'IMMUNOASSAY', 'IMMUNOFLUORESCENCE', 'MICROBIOLOGY', 'MOLECULAR_BIOLOGY', 'MRI', 'NEPHELOMETRY', 'SONOGRAPHY_ULTRASOUND', 'TRANSFUSION_MEDICINE', 'X_RAY') NOT NULL;
