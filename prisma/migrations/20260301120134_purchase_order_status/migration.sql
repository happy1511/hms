-- AlterTable
ALTER TABLE `purchaseorder` ADD COLUMN `status` ENUM('draft', 'placed', 'received') NOT NULL DEFAULT 'draft';
