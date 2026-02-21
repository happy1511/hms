/*
  Warnings:

  - You are about to drop the column `lowerDay` on the `referencerange` table. All the data in the column will be lost.
  - You are about to drop the column `lowerMonth` on the `referencerange` table. All the data in the column will be lost.
  - You are about to drop the column `lowerYear` on the `referencerange` table. All the data in the column will be lost.
  - You are about to drop the column `upperDay` on the `referencerange` table. All the data in the column will be lost.
  - You are about to drop the column `upperMonth` on the `referencerange` table. All the data in the column will be lost.
  - You are about to drop the column `upperYear` on the `referencerange` table. All the data in the column will be lost.
  - You are about to alter the column `lowerRange` on the `referencerange` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Int`.
  - You are about to alter the column `upperRange` on the `referencerange` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Int`.

*/
-- AlterTable
ALTER TABLE `referencerange` DROP COLUMN `lowerDay`,
    DROP COLUMN `lowerMonth`,
    DROP COLUMN `lowerYear`,
    DROP COLUMN `upperDay`,
    DROP COLUMN `upperMonth`,
    DROP COLUMN `upperYear`,
    ADD COLUMN `lowerAgeInDays` INTEGER NULL,
    ADD COLUMN `upperAgeInDays` INTEGER NULL,
    MODIFY `lowerRange` INTEGER NULL,
    MODIFY `upperRange` INTEGER NULL;
