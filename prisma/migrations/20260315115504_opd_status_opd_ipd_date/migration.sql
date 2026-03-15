/*
  Warnings:

  - You are about to drop the column `isInQueue` on the `Opd` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX `Opd_isInQueue_idx` ON `Opd`;

-- AlterTable
ALTER TABLE `Ipd` ADD COLUMN `dischargedAt` DATETIME(3) NULL,
    ADD COLUMN `dischargedById` INTEGER NULL,
    ADD COLUMN `ipdDateTime` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3);

-- AlterTable
ALTER TABLE `Opd` DROP COLUMN `isInQueue`,
    ADD COLUMN `opdDateTime` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `status` ENUM('IN_QUEUE', 'IN_CONSULTATION', 'WAITING', 'COMPLETED') NOT NULL DEFAULT 'IN_QUEUE';

-- CreateIndex
CREATE INDEX `Ipd_ipdDateTime_idx` ON `Ipd`(`ipdDateTime`);

-- CreateIndex
CREATE INDEX `Ipd_dischargedAt_idx` ON `Ipd`(`dischargedAt`);

-- CreateIndex
CREATE INDEX `Opd_status_idx` ON `Opd`(`status`);

-- CreateIndex
CREATE INDEX `Opd_opdDateTime_idx` ON `Opd`(`opdDateTime`);

-- AddForeignKey
ALTER TABLE `Ipd` ADD CONSTRAINT `Ipd_dischargedById_fkey` FOREIGN KEY (`dischargedById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
