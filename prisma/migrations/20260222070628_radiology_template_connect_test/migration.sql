/*
  Warnings:

  - You are about to drop the column `radiologyTestId` on the `radiologytemplate` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `RadiologyTemplate` DROP COLUMN `radiologyTestId`;

ALTER TABLE `RadiologyTest` ADD COLUMN `templateId` INTEGER NULL;

ALTER TABLE `RadiologyTest`
ADD CONSTRAINT `RadiologyTest_templateId_fkey`
FOREIGN KEY (`templateId`) REFERENCES `RadiologyTemplate`(`id`)
ON DELETE SET NULL ON UPDATE CASCADE;