-- AlterTable
ALTER TABLE `expense` ADD COLUMN `createdBy` INTEGER NULL,
    ADD COLUMN `deletedBy` INTEGER NULL,
    ADD COLUMN `updatedBy` INTEGER NULL;

-- AlterTable
ALTER TABLE `income` ADD COLUMN `createdBy` INTEGER NULL,
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
