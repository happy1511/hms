/*
  Warnings:

  - You are about to alter the column `gender` on the `doctor` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Enum(EnumId(18))`.
  - You are about to alter the column `status` on the `doctor` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Enum(EnumId(46))`.

*/
-- DropIndex
-- DROP INDEX `Doctor_userId_idx` ON `Doctor`;

-- AlterTable
ALTER TABLE `Doctor` ALTER COLUMN `firstName` DROP DEFAULT,
    MODIFY `gender` ENUM('Male', 'Female', 'Other') NULL,
    MODIFY `status` ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
    ALTER COLUMN `updatedAt` DROP DEFAULT;

-- AlterTable
ALTER TABLE `Service` ALTER COLUMN `billingSectionId` DROP DEFAULT;

-- CreateIndex
CREATE INDEX `Doctor_isDeleted_idx` ON `Doctor`(`isDeleted`);
