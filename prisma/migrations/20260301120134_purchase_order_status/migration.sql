-- AlterTable
ALTER TABLE `PurchaseOrder` ADD COLUMN `status` ENUM('draft', 'placed', 'received') NOT NULL DEFAULT 'draft';
