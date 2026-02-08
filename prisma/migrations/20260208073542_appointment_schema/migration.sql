/*
  Warnings:

  - You are about to drop the column `reason` on the `appointment` table. All the data in the column will be lost.
  - You are about to alter the column `status` on the `appointment` table. The data in that column could be lost. The data in that column will be cast from `Enum(EnumId(20))` to `Enum(EnumId(14))`.
  - Added the required column `updatedAt` to the `Appointment` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `appointment` DROP COLUMN `reason`,
    ADD COLUMN `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `remarks` VARCHAR(191) NULL,
    ADD COLUMN `updatedAt` DATETIME(3) NOT NULL,
    MODIFY `status` ENUM('SCHEDULED', 'COMPLETED', 'CANCELLED', 'NO_SHOW', 'RESCHEDULED') NOT NULL DEFAULT 'SCHEDULED';

-- AlterTable
ALTER TABLE `module` MODIFY `name` ENUM('USER', 'DOCTOR_MASTER', 'FLOOR_MASTER', 'WARD_MASTER', 'BED_MASTER', 'APPOINTMENT') NOT NULL;
