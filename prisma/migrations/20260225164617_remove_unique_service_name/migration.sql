/*
  Warnings:

  - You are about to drop the column `opdId` on the `Invoice` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX `Invoice_opdId_key` ON `Invoice`;

-- DropIndex
DROP INDEX `Service_name_key` ON `Service`;

-- AlterTable
ALTER TABLE `Invoice` DROP COLUMN `opdId`;
