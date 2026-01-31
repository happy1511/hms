/*
  Warnings:

  - You are about to drop the column `address` on the `patient` table. All the data in the column will be lost.
  - You are about to drop the column `city` on the `patient` table. All the data in the column will be lost.
  - You are about to drop the column `country` on the `patient` table. All the data in the column will be lost.
  - You are about to drop the column `identityNumber` on the `patient` table. All the data in the column will be lost.
  - You are about to drop the column `identityType` on the `patient` table. All the data in the column will be lost.
  - You are about to drop the column `state` on the `patient` table. All the data in the column will be lost.
  - You are about to drop the column `zipCode` on the `patient` table. All the data in the column will be lost.
  - Added the required column `updatedAt` to the `Patient` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX `Patient_identityNumber_key` ON `patient`;

-- AlterTable
ALTER TABLE `patient` DROP COLUMN `address`,
    DROP COLUMN `city`,
    DROP COLUMN `country`,
    DROP COLUMN `identityNumber`,
    DROP COLUMN `identityType`,
    DROP COLUMN `state`,
    DROP COLUMN `zipCode`,
    ADD COLUMN `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `updatedAt` DATETIME(3) NOT NULL;
