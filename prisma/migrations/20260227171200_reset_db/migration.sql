/*
  Warnings:

  - You are about to drop the column `occupied` on the `Bed` table. All the data in the column will be lost.
  - You are about to drop the column `wardId` on the `Bed` table. All the data in the column will be lost.
  - The values [FLOOR_MASTER,WARD_MASTER] on the enum `Module_name` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the `floor` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Ward` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `roomId` to the `Bed` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `Bed` DROP FOREIGN KEY `Bed_wardId_fkey`;

-- DropForeignKey
ALTER TABLE `Ward` DROP FOREIGN KEY `Ward_departmentId_fkey`;

-- DropIndex
DROP INDEX `Bed_wardId_fkey` ON `Bed`;

-- AlterTable
ALTER TABLE `Bed` DROP COLUMN `occupied`,
    DROP COLUMN `wardId`,
    ADD COLUMN `name` VARCHAR(191) NULL,
    ADD COLUMN `roomId` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `Module` MODIFY `name` ENUM('USER', 'DOCTOR_MASTER', 'DEPARTMENT_MASTER', 'ROOM_TYPE_MASTER', 'ROOM_MASTER', 'BED_MASTER', 'APPOINTMENT', 'PATIENT_MASTER', 'BILLING_SECTION_MASTER', 'SERVICE_MASTER', 'PATHOLOGY_TEST_MASTER', 'RADIOLOGY_TEST_MASTER', 'OPD_BILL', 'OPD_QUEUE', 'PATHOLOGY_ORDER', 'RADIOLOGY_ORDER', 'LOCATION_MASTER', 'INVOICE') NOT NULL;

-- DropTable
DROP TABLE `Floor`;

-- DropTable
DROP TABLE `Ward`;

-- CreateTable
CREATE TABLE `Department` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `status` ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Department_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `RoomType` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `departmentId` INTEGER NOT NULL,
    `status` ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `RoomType_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Room` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `roomTypeId` INTEGER NOT NULL,
    `status` ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Room_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `RoomType` ADD CONSTRAINT `RoomType_departmentId_fkey` FOREIGN KEY (`departmentId`) REFERENCES `Department`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Room` ADD CONSTRAINT `Room_roomTypeId_fkey` FOREIGN KEY (`roomTypeId`) REFERENCES `RoomType`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Bed` ADD CONSTRAINT `Bed_roomId_fkey` FOREIGN KEY (`roomId`) REFERENCES `Room`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
