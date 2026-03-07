/*
  Warnings:

  - You are about to drop the column `isPathologyTest` on the `BillingSection` table. All the data in the column will be lost.
  - You are about to drop the column `isRadiologyTest` on the `BillingSection` table. All the data in the column will be lost.
  - You are about to drop the `billingsectionservice` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `BillingSectionService` DROP FOREIGN KEY `BillingSectionService_billingSectionId_fkey`;

-- DropForeignKey
ALTER TABLE `BillingSectionService` DROP FOREIGN KEY `BillingSectionService_serviceId_fkey`;

-- AlterTable
ALTER TABLE `BillingSection` DROP COLUMN `isPathologyTest`,
    DROP COLUMN `isRadiologyTest`;

-- DropTable
DROP TABLE `BillingSectionService`;
