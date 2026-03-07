/*
  Warnings:

  - You are about to alter the column `category` on the `Expense` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Enum(EnumId(27))`.
  - You are about to alter the column `category` on the `Income` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Enum(EnumId(26))`.

*/
-- AlterTable
ALTER TABLE `Expense` MODIFY `category` ENUM('ACCOUNT_DEPOSIT', 'SALARY_PAYMENT', 'OTHER_EXPENSES') NOT NULL;

-- AlterTable
ALTER TABLE `Income` MODIFY `category` ENUM('OUT_PR_DRESSING', 'OUT_PT_ECG') NOT NULL;
