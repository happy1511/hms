-- AlterTable
ALTER TABLE `Ipd` ADD COLUMN `isDeleted` BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE `Opd` ADD COLUMN `isDeleted` BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE `PathologyTestOrder` ADD COLUMN `isDeleted` BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE `RadiologyTestOrder` ADD COLUMN `isDeleted` BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE `Transaction` ADD COLUMN `isDeleted` BOOLEAN NOT NULL DEFAULT false;

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
