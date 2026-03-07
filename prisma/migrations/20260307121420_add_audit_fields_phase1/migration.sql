-- AlterTable
ALTER TABLE `drug` ADD COLUMN `createdBy` INTEGER NULL,
    ADD COLUMN `deletedBy` INTEGER NULL,
    ADD COLUMN `updatedBy` INTEGER NULL;

-- AlterTable
ALTER TABLE `drugbillingcategory` ADD COLUMN `createdBy` INTEGER NULL,
    ADD COLUMN `deletedBy` INTEGER NULL,
    ADD COLUMN `updatedBy` INTEGER NULL;

-- AlterTable
ALTER TABLE `drugsaleitem` ADD COLUMN `createdBy` INTEGER NULL,
    ADD COLUMN `deletedBy` INTEGER NULL,
    ADD COLUMN `updatedBy` INTEGER NULL;

-- AlterTable
ALTER TABLE `drugsupplier` ADD COLUMN `createdBy` INTEGER NULL,
    ADD COLUMN `deletedBy` INTEGER NULL,
    ADD COLUMN `updatedBy` INTEGER NULL;

-- AlterTable
ALTER TABLE `grn` ADD COLUMN `createdBy` INTEGER NULL,
    ADD COLUMN `deletedBy` INTEGER NULL,
    ADD COLUMN `updatedBy` INTEGER NULL;

-- AlterTable
ALTER TABLE `invoice` ADD COLUMN `createdBy` INTEGER NULL,
    ADD COLUMN `deletedBy` INTEGER NULL,
    ADD COLUMN `updatedBy` INTEGER NULL;

-- AlterTable
ALTER TABLE `invoicebillingitem` ADD COLUMN `createdBy` INTEGER NULL,
    ADD COLUMN `deletedBy` INTEGER NULL,
    ADD COLUMN `updatedBy` INTEGER NULL;

-- AlterTable
ALTER TABLE `ipd` ADD COLUMN `createdBy` INTEGER NULL,
    ADD COLUMN `deletedBy` INTEGER NULL,
    ADD COLUMN `updatedBy` INTEGER NULL;

-- AlterTable
ALTER TABLE `opd` ADD COLUMN `createdBy` INTEGER NULL,
    ADD COLUMN `deletedBy` INTEGER NULL,
    ADD COLUMN `updatedBy` INTEGER NULL;

-- AlterTable
ALTER TABLE `pathologytestresult` ADD COLUMN `createdBy` INTEGER NULL,
    ADD COLUMN `deletedBy` INTEGER NULL,
    ADD COLUMN `updatedBy` INTEGER NULL;

-- AlterTable
ALTER TABLE `pathologytestservice` ADD COLUMN `createdBy` INTEGER NULL,
    ADD COLUMN `deletedBy` INTEGER NULL,
    ADD COLUMN `updatedBy` INTEGER NULL;

-- AlterTable
ALTER TABLE `patientidentification` ADD COLUMN `createdBy` INTEGER NULL,
    ADD COLUMN `deletedBy` INTEGER NULL,
    ADD COLUMN `updatedBy` INTEGER NULL;

-- AlterTable
ALTER TABLE `radiologytestresult` ADD COLUMN `createdBy` INTEGER NULL,
    ADD COLUMN `deletedBy` INTEGER NULL,
    ADD COLUMN `updatedBy` INTEGER NULL;

-- AlterTable
ALTER TABLE `radiologytestservice` ADD COLUMN `createdBy` INTEGER NULL,
    ADD COLUMN `deletedBy` INTEGER NULL,
    ADD COLUMN `updatedBy` INTEGER NULL;

-- AlterTable
ALTER TABLE `referencerange` ADD COLUMN `createdBy` INTEGER NULL,
    ADD COLUMN `deletedBy` INTEGER NULL,
    ADD COLUMN `updatedBy` INTEGER NULL;

-- AlterTable
ALTER TABLE `room` ADD COLUMN `createdBy` INTEGER NULL,
    ADD COLUMN `deletedBy` INTEGER NULL,
    ADD COLUMN `updatedBy` INTEGER NULL;

-- AlterTable
ALTER TABLE `user` ADD COLUMN `createdBy` INTEGER NULL,
    ADD COLUMN `deletedBy` INTEGER NULL,
    ADD COLUMN `updatedBy` INTEGER NULL;
