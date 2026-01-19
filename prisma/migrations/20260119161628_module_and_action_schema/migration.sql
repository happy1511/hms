/*
  Warnings:

  - You are about to alter the column `name` on the `action` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Enum(EnumId(0))`.
  - You are about to alter the column `name` on the `module` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Enum(EnumId(1))`.

*/
-- AlterTable
ALTER TABLE `action` MODIFY `name` ENUM('CREATE', 'UPDATE', 'DELETE', 'PRINT', 'VIEW') NOT NULL;

-- AlterTable
ALTER TABLE `module` MODIFY `name` ENUM('USER', 'DOCTOR_MASTER') NOT NULL;
