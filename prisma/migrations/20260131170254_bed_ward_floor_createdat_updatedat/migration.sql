/*
  Warnings:

  - Added the required column `updatedAt` to the `Bed` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Floor` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Ward` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `bed` ADD COLUMN `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `updatedAt` DATETIME(3) NOT NULL;

-- AlterTable
ALTER TABLE `floor` ADD COLUMN `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `updatedAt` DATETIME(3) NOT NULL;

-- AlterTable
ALTER TABLE `ward` ADD COLUMN `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `updatedAt` DATETIME(3) NOT NULL;
