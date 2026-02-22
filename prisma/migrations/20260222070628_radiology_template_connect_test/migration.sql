/*
  Warnings:

  - You are about to drop the column `radiologyTestId` on the `radiologytemplate` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `radiologytemplate` DROP FOREIGN KEY `RadiologyTemplate_radiologyTestId_fkey`;

-- DropIndex
DROP INDEX `RadiologyTemplate_radiologyTestId_fkey` ON `radiologytemplate`;

-- AlterTable
ALTER TABLE `radiologytemplate` DROP COLUMN `radiologyTestId`;

-- AlterTable
ALTER TABLE `radiologytest` ADD COLUMN `templateId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `RadiologyTest` ADD CONSTRAINT `RadiologyTest_templateId_fkey` FOREIGN KEY (`templateId`) REFERENCES `RadiologyTemplate`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
