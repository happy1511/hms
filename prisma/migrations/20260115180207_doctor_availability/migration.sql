/*
  Warnings:

  - You are about to drop the column `availableDays` on the `doctor` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `doctor` DROP COLUMN `availableDays`;

-- CreateTable
CREATE TABLE `DoctorAvailableDay` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `doctorId` INTEGER NOT NULL,
    `day` ENUM('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday') NOT NULL,

    UNIQUE INDEX `DoctorAvailableDay_doctorId_day_key`(`doctorId`, `day`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `DoctorAvailableDay` ADD CONSTRAINT `DoctorAvailableDay_doctorId_fkey` FOREIGN KEY (`doctorId`) REFERENCES `Doctor`(`userId`) ON DELETE CASCADE ON UPDATE CASCADE;
