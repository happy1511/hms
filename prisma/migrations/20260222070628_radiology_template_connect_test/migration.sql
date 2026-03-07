/*
  Warnings:

  - You are about to drop the column `radiologyTestId` on the `RadiologyTemplate` table. All the data in the column will be lost.

*/
-- DropForeignKey
-- 1. Drop foreign key constraint
ALTER TABLE `RadiologyTemplate`
DROP FOREIGN KEY `RadiologyTemplate_radiologyTestId_fkey`;

-- 2. Then drop the column
ALTER TABLE `RadiologyTemplate`
DROP COLUMN `radiologyTestId`;

ALTER TABLE `RadiologyTest` ADD COLUMN `templateId` INTEGER NULL;

ALTER TABLE `RadiologyTest`
ADD CONSTRAINT `RadiologyTest_templateId_fkey`
FOREIGN KEY (`templateId`) REFERENCES `RadiologyTemplate`(`id`)
ON DELETE SET NULL ON UPDATE CASCADE;