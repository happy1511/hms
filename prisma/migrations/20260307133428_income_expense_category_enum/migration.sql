/*
  Warnings:

  - You are about to alter the column `category` on the `expense` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Enum(EnumId(27))`.
  - You are about to alter the column `category` on the `income` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Enum(EnumId(26))`.

*/
-- AlterTable
ALTER TABLE `expense` MODIFY `category` ENUM('ACCOUNT_DEPOSIT', 'SALARY_PAYMENT', 'OTHER_EXPENSES') NOT NULL;

-- AlterTable
ALTER TABLE `income` MODIFY `category` ENUM('OUT_PR_DRESSING', 'OUT_PT_ECG') NOT NULL;
