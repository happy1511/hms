/*
  Warnings:

  - You are about to drop the column `createdBy` on the `Drug` table. All the data in the column will be lost.
  - You are about to drop the column `deletedBy` on the `Drug` table. All the data in the column will be lost.
  - You are about to drop the column `updatedBy` on the `Drug` table. All the data in the column will be lost.
  - You are about to drop the column `createdBy` on the `DrugBillingCategory` table. All the data in the column will be lost.
  - You are about to drop the column `deletedBy` on the `DrugBillingCategory` table. All the data in the column will be lost.
  - You are about to drop the column `updatedBy` on the `DrugBillingCategory` table. All the data in the column will be lost.
  - You are about to drop the column `createdBy` on the `DrugSaleItem` table. All the data in the column will be lost.
  - You are about to drop the column `deletedBy` on the `DrugSaleItem` table. All the data in the column will be lost.
  - You are about to drop the column `updatedBy` on the `DrugSaleItem` table. All the data in the column will be lost.
  - You are about to drop the column `createdBy` on the `DrugSupplier` table. All the data in the column will be lost.
  - You are about to drop the column `deletedBy` on the `DrugSupplier` table. All the data in the column will be lost.
  - You are about to drop the column `updatedBy` on the `DrugSupplier` table. All the data in the column will be lost.
  - You are about to drop the column `createdBy` on the `Expense` table. All the data in the column will be lost.
  - You are about to drop the column `deletedBy` on the `Expense` table. All the data in the column will be lost.
  - You are about to drop the column `updatedBy` on the `Expense` table. All the data in the column will be lost.
  - You are about to drop the column `createdBy` on the `GRN` table. All the data in the column will be lost.
  - You are about to drop the column `deletedBy` on the `GRN` table. All the data in the column will be lost.
  - You are about to drop the column `updatedBy` on the `GRN` table. All the data in the column will be lost.
  - You are about to drop the column `createdBy` on the `Income` table. All the data in the column will be lost.
  - You are about to drop the column `deletedBy` on the `Income` table. All the data in the column will be lost.
  - You are about to drop the column `updatedBy` on the `Income` table. All the data in the column will be lost.
  - You are about to drop the column `createdBy` on the `Invoice` table. All the data in the column will be lost.
  - You are about to drop the column `deletedBy` on the `Invoice` table. All the data in the column will be lost.
  - You are about to drop the column `updatedBy` on the `Invoice` table. All the data in the column will be lost.
  - You are about to drop the column `createdBy` on the `InvoiceBillingItem` table. All the data in the column will be lost.
  - You are about to drop the column `deletedBy` on the `InvoiceBillingItem` table. All the data in the column will be lost.
  - You are about to drop the column `updatedBy` on the `InvoiceBillingItem` table. All the data in the column will be lost.
  - You are about to drop the column `createdBy` on the `Ipd` table. All the data in the column will be lost.
  - You are about to drop the column `deletedBy` on the `Ipd` table. All the data in the column will be lost.
  - You are about to drop the column `updatedBy` on the `Ipd` table. All the data in the column will be lost.
  - You are about to drop the column `createdBy` on the `Opd` table. All the data in the column will be lost.
  - You are about to drop the column `deletedBy` on the `Opd` table. All the data in the column will be lost.
  - You are about to drop the column `updatedBy` on the `Opd` table. All the data in the column will be lost.
  - You are about to drop the column `createdBy` on the `PathologyTestResult` table. All the data in the column will be lost.
  - You are about to drop the column `deletedBy` on the `PathologyTestResult` table. All the data in the column will be lost.
  - You are about to drop the column `updatedBy` on the `PathologyTestResult` table. All the data in the column will be lost.
  - You are about to drop the column `createdBy` on the `PathologyTestService` table. All the data in the column will be lost.
  - You are about to drop the column `deletedBy` on the `PathologyTestService` table. All the data in the column will be lost.
  - You are about to drop the column `updatedBy` on the `PathologyTestService` table. All the data in the column will be lost.
  - You are about to drop the column `createdBy` on the `PatientIdentification` table. All the data in the column will be lost.
  - You are about to drop the column `deletedBy` on the `PatientIdentification` table. All the data in the column will be lost.
  - You are about to drop the column `updatedBy` on the `PatientIdentification` table. All the data in the column will be lost.
  - You are about to drop the column `createdBy` on the `RadiologyTestResult` table. All the data in the column will be lost.
  - You are about to drop the column `deletedBy` on the `RadiologyTestResult` table. All the data in the column will be lost.
  - You are about to drop the column `updatedBy` on the `RadiologyTestResult` table. All the data in the column will be lost.
  - You are about to drop the column `createdBy` on the `RadiologyTestService` table. All the data in the column will be lost.
  - You are about to drop the column `deletedBy` on the `RadiologyTestService` table. All the data in the column will be lost.
  - You are about to drop the column `updatedBy` on the `RadiologyTestService` table. All the data in the column will be lost.
  - You are about to drop the column `createdBy` on the `ReferenceRange` table. All the data in the column will be lost.
  - You are about to drop the column `deletedBy` on the `ReferenceRange` table. All the data in the column will be lost.
  - You are about to drop the column `updatedBy` on the `ReferenceRange` table. All the data in the column will be lost.
  - You are about to drop the column `createdBy` on the `Room` table. All the data in the column will be lost.
  - You are about to drop the column `deletedBy` on the `Room` table. All the data in the column will be lost.
  - You are about to drop the column `updatedBy` on the `Room` table. All the data in the column will be lost.
  - You are about to drop the column `createdBy` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `deletedBy` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `updatedBy` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `Drug` DROP COLUMN `createdBy`,
    DROP COLUMN `deletedBy`,
    DROP COLUMN `updatedBy`;

-- AlterTable
ALTER TABLE `DrugBillingCategory` DROP COLUMN `createdBy`,
    DROP COLUMN `deletedBy`,
    DROP COLUMN `updatedBy`;

-- AlterTable
ALTER TABLE `DrugSaleItem` DROP COLUMN `createdBy`,
    DROP COLUMN `deletedBy`,
    DROP COLUMN `updatedBy`;

-- AlterTable
ALTER TABLE `DrugSupplier` DROP COLUMN `createdBy`,
    DROP COLUMN `deletedBy`,
    DROP COLUMN `updatedBy`;

-- AlterTable
ALTER TABLE `Expense` DROP COLUMN `createdBy`,
    DROP COLUMN `deletedBy`,
    DROP COLUMN `updatedBy`;

-- AlterTable
ALTER TABLE `GRN` DROP COLUMN `createdBy`,
    DROP COLUMN `deletedBy`,
    DROP COLUMN `updatedBy`;

-- AlterTable
ALTER TABLE `Income` DROP COLUMN `createdBy`,
    DROP COLUMN `deletedBy`,
    DROP COLUMN `updatedBy`;

-- AlterTable
ALTER TABLE `Invoice` DROP COLUMN `createdBy`,
    DROP COLUMN `deletedBy`,
    DROP COLUMN `updatedBy`;

-- AlterTable
ALTER TABLE `InvoiceBillingItem` DROP COLUMN `createdBy`,
    DROP COLUMN `deletedBy`,
    DROP COLUMN `updatedBy`;

-- AlterTable
ALTER TABLE `Ipd` DROP COLUMN `createdBy`,
    DROP COLUMN `deletedBy`,
    DROP COLUMN `updatedBy`;

-- AlterTable
ALTER TABLE `Opd` DROP COLUMN `createdBy`,
    DROP COLUMN `deletedBy`,
    DROP COLUMN `updatedBy`;

-- AlterTable
ALTER TABLE `PathologyTestResult` DROP COLUMN `createdBy`,
    DROP COLUMN `deletedBy`,
    DROP COLUMN `updatedBy`;

-- AlterTable
ALTER TABLE `PathologyTestService` DROP COLUMN `createdBy`,
    DROP COLUMN `deletedBy`,
    DROP COLUMN `updatedBy`;

-- AlterTable
ALTER TABLE `PatientIdentification` DROP COLUMN `createdBy`,
    DROP COLUMN `deletedBy`,
    DROP COLUMN `updatedBy`;

-- AlterTable
ALTER TABLE `RadiologyTestResult` DROP COLUMN `createdBy`,
    DROP COLUMN `deletedBy`,
    DROP COLUMN `updatedBy`;

-- AlterTable
ALTER TABLE `RadiologyTestService` DROP COLUMN `createdBy`,
    DROP COLUMN `deletedBy`,
    DROP COLUMN `updatedBy`;

-- AlterTable
ALTER TABLE `ReferenceRange` DROP COLUMN `createdBy`,
    DROP COLUMN `deletedBy`,
    DROP COLUMN `updatedBy`;

-- AlterTable
ALTER TABLE `Room` DROP COLUMN `createdBy`,
    DROP COLUMN `deletedBy`,
    DROP COLUMN `updatedBy`;

-- AlterTable
ALTER TABLE `User` DROP COLUMN `createdBy`,
    DROP COLUMN `deletedBy`,
    DROP COLUMN `updatedBy`;
