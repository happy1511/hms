/*
  Warnings:

  - Added the required column `title` to the `Patient` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `patient` ADD COLUMN `title` ENUM('DR', 'MR', 'MS', 'MRS', 'BABY', 'MASTER') NOT NULL;

-- AlterTable
ALTER TABLE `user` ADD COLUMN `title` ENUM('DR', 'MR', 'MS', 'MRS', 'BABY', 'MASTER') NOT NULL DEFAULT 'MR';
