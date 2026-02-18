-- AlterTable
ALTER TABLE `pathologytestorder` ADD COLUMN `isCancelled` BOOLEAN NOT NULL DEFAULT false;

-- AddForeignKey
ALTER TABLE `PathologyTestOrder` ADD CONSTRAINT `PathologyTestOrder_patientId_fkey` FOREIGN KEY (`patientId`) REFERENCES `Patient`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
