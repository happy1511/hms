-- AlterTable
ALTER TABLE `pathologytestorder` ADD COLUMN `cancelledById` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `PathologyTestOrder` ADD CONSTRAINT `PathologyTestOrder_cancelledById_fkey` FOREIGN KEY (`cancelledById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
