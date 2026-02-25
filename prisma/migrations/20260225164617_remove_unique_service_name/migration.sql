/*
  Warnings:

  - You are about to drop the column `opdId` on the `invoice` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX `Invoice_opdId_key` ON `invoice`;

-- DropIndex
DROP INDEX `Service_name_key` ON `service`;

-- AlterTable
ALTER TABLE `invoice` DROP COLUMN `opdId`;
