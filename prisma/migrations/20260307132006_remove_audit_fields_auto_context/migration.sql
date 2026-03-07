/*
  Warnings:

  - You are about to drop the column `createdBy` on the `drug` table. All the data in the column will be lost.
  - You are about to drop the column `deletedBy` on the `drug` table. All the data in the column will be lost.
  - You are about to drop the column `updatedBy` on the `drug` table. All the data in the column will be lost.
  - You are about to drop the column `createdBy` on the `drugbillingcategory` table. All the data in the column will be lost.
  - You are about to drop the column `deletedBy` on the `drugbillingcategory` table. All the data in the column will be lost.
  - You are about to drop the column `updatedBy` on the `drugbillingcategory` table. All the data in the column will be lost.
  - You are about to drop the column `createdBy` on the `drugsaleitem` table. All the data in the column will be lost.
  - You are about to drop the column `deletedBy` on the `drugsaleitem` table. All the data in the column will be lost.
  - You are about to drop the column `updatedBy` on the `drugsaleitem` table. All the data in the column will be lost.
  - You are about to drop the column `createdBy` on the `drugsupplier` table. All the data in the column will be lost.
  - You are about to drop the column `deletedBy` on the `drugsupplier` table. All the data in the column will be lost.
  - You are about to drop the column `updatedBy` on the `drugsupplier` table. All the data in the column will be lost.
  - You are about to drop the column `createdBy` on the `expense` table. All the data in the column will be lost.
  - You are about to drop the column `deletedBy` on the `expense` table. All the data in the column will be lost.
  - You are about to drop the column `updatedBy` on the `expense` table. All the data in the column will be lost.
  - You are about to drop the column `createdBy` on the `grn` table. All the data in the column will be lost.
  - You are about to drop the column `deletedBy` on the `grn` table. All the data in the column will be lost.
  - You are about to drop the column `updatedBy` on the `grn` table. All the data in the column will be lost.
  - You are about to drop the column `createdBy` on the `income` table. All the data in the column will be lost.
  - You are about to drop the column `deletedBy` on the `income` table. All the data in the column will be lost.
  - You are about to drop the column `updatedBy` on the `income` table. All the data in the column will be lost.
  - You are about to drop the column `createdBy` on the `invoice` table. All the data in the column will be lost.
  - You are about to drop the column `deletedBy` on the `invoice` table. All the data in the column will be lost.
  - You are about to drop the column `updatedBy` on the `invoice` table. All the data in the column will be lost.
  - You are about to drop the column `createdBy` on the `invoicebillingitem` table. All the data in the column will be lost.
  - You are about to drop the column `deletedBy` on the `invoicebillingitem` table. All the data in the column will be lost.
  - You are about to drop the column `updatedBy` on the `invoicebillingitem` table. All the data in the column will be lost.
  - You are about to drop the column `createdBy` on the `ipd` table. All the data in the column will be lost.
  - You are about to drop the column `deletedBy` on the `ipd` table. All the data in the column will be lost.
  - You are about to drop the column `updatedBy` on the `ipd` table. All the data in the column will be lost.
  - You are about to drop the column `createdBy` on the `opd` table. All the data in the column will be lost.
  - You are about to drop the column `deletedBy` on the `opd` table. All the data in the column will be lost.
  - You are about to drop the column `updatedBy` on the `opd` table. All the data in the column will be lost.
  - You are about to drop the column `createdBy` on the `pathologytestresult` table. All the data in the column will be lost.
  - You are about to drop the column `deletedBy` on the `pathologytestresult` table. All the data in the column will be lost.
  - You are about to drop the column `updatedBy` on the `pathologytestresult` table. All the data in the column will be lost.
  - You are about to drop the column `createdBy` on the `pathologytestservice` table. All the data in the column will be lost.
  - You are about to drop the column `deletedBy` on the `pathologytestservice` table. All the data in the column will be lost.
  - You are about to drop the column `updatedBy` on the `pathologytestservice` table. All the data in the column will be lost.
  - You are about to drop the column `createdBy` on the `patientidentification` table. All the data in the column will be lost.
  - You are about to drop the column `deletedBy` on the `patientidentification` table. All the data in the column will be lost.
  - You are about to drop the column `updatedBy` on the `patientidentification` table. All the data in the column will be lost.
  - You are about to drop the column `createdBy` on the `radiologytestresult` table. All the data in the column will be lost.
  - You are about to drop the column `deletedBy` on the `radiologytestresult` table. All the data in the column will be lost.
  - You are about to drop the column `updatedBy` on the `radiologytestresult` table. All the data in the column will be lost.
  - You are about to drop the column `createdBy` on the `radiologytestservice` table. All the data in the column will be lost.
  - You are about to drop the column `deletedBy` on the `radiologytestservice` table. All the data in the column will be lost.
  - You are about to drop the column `updatedBy` on the `radiologytestservice` table. All the data in the column will be lost.
  - You are about to drop the column `createdBy` on the `referencerange` table. All the data in the column will be lost.
  - You are about to drop the column `deletedBy` on the `referencerange` table. All the data in the column will be lost.
  - You are about to drop the column `updatedBy` on the `referencerange` table. All the data in the column will be lost.
  - You are about to drop the column `createdBy` on the `room` table. All the data in the column will be lost.
  - You are about to drop the column `deletedBy` on the `room` table. All the data in the column will be lost.
  - You are about to drop the column `updatedBy` on the `room` table. All the data in the column will be lost.
  - You are about to drop the column `createdBy` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `deletedBy` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `updatedBy` on the `user` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `drug` DROP COLUMN `createdBy`,
    DROP COLUMN `deletedBy`,
    DROP COLUMN `updatedBy`;

-- AlterTable
ALTER TABLE `drugbillingcategory` DROP COLUMN `createdBy`,
    DROP COLUMN `deletedBy`,
    DROP COLUMN `updatedBy`;

-- AlterTable
ALTER TABLE `drugsaleitem` DROP COLUMN `createdBy`,
    DROP COLUMN `deletedBy`,
    DROP COLUMN `updatedBy`;

-- AlterTable
ALTER TABLE `drugsupplier` DROP COLUMN `createdBy`,
    DROP COLUMN `deletedBy`,
    DROP COLUMN `updatedBy`;

-- AlterTable
ALTER TABLE `expense` DROP COLUMN `createdBy`,
    DROP COLUMN `deletedBy`,
    DROP COLUMN `updatedBy`;

-- AlterTable
ALTER TABLE `grn` DROP COLUMN `createdBy`,
    DROP COLUMN `deletedBy`,
    DROP COLUMN `updatedBy`;

-- AlterTable
ALTER TABLE `income` DROP COLUMN `createdBy`,
    DROP COLUMN `deletedBy`,
    DROP COLUMN `updatedBy`;

-- AlterTable
ALTER TABLE `invoice` DROP COLUMN `createdBy`,
    DROP COLUMN `deletedBy`,
    DROP COLUMN `updatedBy`;

-- AlterTable
ALTER TABLE `invoicebillingitem` DROP COLUMN `createdBy`,
    DROP COLUMN `deletedBy`,
    DROP COLUMN `updatedBy`;

-- AlterTable
ALTER TABLE `ipd` DROP COLUMN `createdBy`,
    DROP COLUMN `deletedBy`,
    DROP COLUMN `updatedBy`;

-- AlterTable
ALTER TABLE `opd` DROP COLUMN `createdBy`,
    DROP COLUMN `deletedBy`,
    DROP COLUMN `updatedBy`;

-- AlterTable
ALTER TABLE `pathologytestresult` DROP COLUMN `createdBy`,
    DROP COLUMN `deletedBy`,
    DROP COLUMN `updatedBy`;

-- AlterTable
ALTER TABLE `pathologytestservice` DROP COLUMN `createdBy`,
    DROP COLUMN `deletedBy`,
    DROP COLUMN `updatedBy`;

-- AlterTable
ALTER TABLE `patientidentification` DROP COLUMN `createdBy`,
    DROP COLUMN `deletedBy`,
    DROP COLUMN `updatedBy`;

-- AlterTable
ALTER TABLE `radiologytestresult` DROP COLUMN `createdBy`,
    DROP COLUMN `deletedBy`,
    DROP COLUMN `updatedBy`;

-- AlterTable
ALTER TABLE `radiologytestservice` DROP COLUMN `createdBy`,
    DROP COLUMN `deletedBy`,
    DROP COLUMN `updatedBy`;

-- AlterTable
ALTER TABLE `referencerange` DROP COLUMN `createdBy`,
    DROP COLUMN `deletedBy`,
    DROP COLUMN `updatedBy`;

-- AlterTable
ALTER TABLE `room` DROP COLUMN `createdBy`,
    DROP COLUMN `deletedBy`,
    DROP COLUMN `updatedBy`;

-- AlterTable
ALTER TABLE `user` DROP COLUMN `createdBy`,
    DROP COLUMN `deletedBy`,
    DROP COLUMN `updatedBy`;
