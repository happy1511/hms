-- AlterTable
ALTER TABLE `ipd` ADD COLUMN `isDeleted` BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE `opd` ADD COLUMN `isDeleted` BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE `pathologytestorder` ADD COLUMN `isDeleted` BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE `radiologytestorder` ADD COLUMN `isDeleted` BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE `transaction` ADD COLUMN `isDeleted` BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX `Ipd_isDeleted_idx` ON `Ipd`(`isDeleted`);

-- CreateIndex
CREATE INDEX `Opd_isDeleted_idx` ON `Opd`(`isDeleted`);

-- CreateIndex
CREATE INDEX `PathologyTestOrder_isDeleted_idx` ON `PathologyTestOrder`(`isDeleted`);

-- CreateIndex
CREATE INDEX `RadiologyTestOrder_isDeleted_idx` ON `RadiologyTestOrder`(`isDeleted`);

-- CreateIndex
CREATE INDEX `Transaction_isDeleted_idx` ON `Transaction`(`isDeleted`);
