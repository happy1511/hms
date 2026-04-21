-- AlterEnum
ALTER TABLE `Module` MODIFY `name` ENUM(
  'USER',
  'DASHBOARD',
  'COMPANY_DETAILS',
  'DAY_CARE_IPD',
  'IPD_MLC',
  'DOCTOR_MASTER',
  'DEPARTMENT_MASTER',
  'ROOM_TYPE_MASTER',
  'ROOM_MASTER',
  'BED_MASTER',
  'APPOINTMENT',
  'PATIENT_MASTER',
  'BILLING_SECTION_MASTER',
  'SERVICE_MASTER',
  'PATHOLOGY_TEST_MASTER',
  'RADIOLOGY_TEMPLATE_MASTER',
  'RADIOLOGY_TEST_MASTER',
  'IPD_BILL',
  'DISCHARGE_PATIENT',
  'CANCEL_DISCHARGE_PATIENT',
  'OPD_BILL',
  'CONSULTATION_FILE',
  'OPD_QUEUE',
  'PATHOLOGY_ORDER',
  'RADIOLOGY_ORDER',
  'LOCATION_MASTER',
  'INVOICE',
  'FINANCE_BILLING',
  'FINANCE_PAYMENTS',
  'PHARMACY_SUPPLIER',
  'PHARMACY_DRUG_MASTER',
  'PHARMACY_DRUG_CATEGORY_MASTER',
  'PHARMACY_PURCHASE_ORDER',
  'PHARMACY_GRN',
  'PHARMACY_INVENTORY',
  'PHARMACY_SALE_BILL',
  'FINANCE_CATEGORY_MASTER',
  'INCOME',
  'EXPENSE'
) NOT NULL;

-- CreateTable
CREATE TABLE `FinanceCategory` (
  `id` INTEGER NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(191) NOT NULL,
  `type` ENUM('INCOME', 'EXPENSE') NOT NULL,
  `description` LONGTEXT NULL,
  `isDeleted` BOOLEAN NOT NULL DEFAULT false,
  `createdBy` INTEGER NULL,
  `updatedBy` INTEGER NULL,
  `deletedBy` INTEGER NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,

  INDEX `FinanceCategory_type_idx`(`type`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Seed default categories
INSERT INTO `FinanceCategory` (`name`, `type`, `description`, `isDeleted`, `createdAt`, `updatedAt`)
SELECT 'OUT pr dressing', 'INCOME', NULL, false, NOW(3), NOW(3)
WHERE NOT EXISTS (
  SELECT 1 FROM `FinanceCategory` WHERE `name` = 'OUT pr dressing' AND `type` = 'INCOME'
);

INSERT INTO `FinanceCategory` (`name`, `type`, `description`, `isDeleted`, `createdAt`, `updatedAt`)
SELECT 'OUT PT ECG', 'INCOME', NULL, false, NOW(3), NOW(3)
WHERE NOT EXISTS (
  SELECT 1 FROM `FinanceCategory` WHERE `name` = 'OUT PT ECG' AND `type` = 'INCOME'
);

INSERT INTO `FinanceCategory` (`name`, `type`, `description`, `isDeleted`, `createdAt`, `updatedAt`)
SELECT 'Account deposit', 'EXPENSE', NULL, false, NOW(3), NOW(3)
WHERE NOT EXISTS (
  SELECT 1 FROM `FinanceCategory` WHERE `name` = 'Account deposit' AND `type` = 'EXPENSE'
);

INSERT INTO `FinanceCategory` (`name`, `type`, `description`, `isDeleted`, `createdAt`, `updatedAt`)
SELECT 'Salary payment', 'EXPENSE', NULL, false, NOW(3), NOW(3)
WHERE NOT EXISTS (
  SELECT 1 FROM `FinanceCategory` WHERE `name` = 'Salary payment' AND `type` = 'EXPENSE'
);

INSERT INTO `FinanceCategory` (`name`, `type`, `description`, `isDeleted`, `createdAt`, `updatedAt`)
SELECT 'Other expenses', 'EXPENSE', NULL, false, NOW(3), NOW(3)
WHERE NOT EXISTS (
  SELECT 1 FROM `FinanceCategory` WHERE `name` = 'Other expenses' AND `type` = 'EXPENSE'
);

-- AlterTable
ALTER TABLE `Income` ADD COLUMN `categoryId` INTEGER NULL;

-- AlterTable
ALTER TABLE `Expense` ADD COLUMN `categoryId` INTEGER NULL;

-- Migrate existing category values
UPDATE `Income`
SET `categoryId` = (
  SELECT `id`
  FROM `FinanceCategory`
  WHERE `name` = CASE `Income`.`category`
    WHEN 'OUT_PR_DRESSING' THEN 'OUT pr dressing'
    WHEN 'OUT_PT_ECG' THEN 'OUT PT ECG'
    ELSE NULL
  END
    AND `type` = 'INCOME'
  LIMIT 1
)
WHERE `categoryId` IS NULL;

UPDATE `Expense`
SET `categoryId` = (
  SELECT `id`
  FROM `FinanceCategory`
  WHERE `name` = CASE `Expense`.`category`
    WHEN 'ACCOUNT_DEPOSIT' THEN 'Account deposit'
    WHEN 'SALARY_PAYMENT' THEN 'Salary payment'
    WHEN 'OTHER_EXPENSES' THEN 'Other expenses'
    ELSE NULL
  END
    AND `type` = 'EXPENSE'
  LIMIT 1
)
WHERE `categoryId` IS NULL;

-- Make categoryId required and drop old enum columns
ALTER TABLE `Income`
  MODIFY `categoryId` INTEGER NOT NULL,
  DROP COLUMN `category`;

ALTER TABLE `Expense`
  MODIFY `categoryId` INTEGER NOT NULL,
  DROP COLUMN `category`;

-- AddForeignKey
ALTER TABLE `FinanceCategory` ADD CONSTRAINT `FinanceCategory_createdBy_fkey`
FOREIGN KEY (`createdBy`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FinanceCategory` ADD CONSTRAINT `FinanceCategory_updatedBy_fkey`
FOREIGN KEY (`updatedBy`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FinanceCategory` ADD CONSTRAINT `FinanceCategory_deletedBy_fkey`
FOREIGN KEY (`deletedBy`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Income` ADD CONSTRAINT `Income_categoryId_fkey`
FOREIGN KEY (`categoryId`) REFERENCES `FinanceCategory`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Expense` ADD CONSTRAINT `Expense_categoryId_fkey`
FOREIGN KEY (`categoryId`) REFERENCES `FinanceCategory`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- CreateIndex
CREATE INDEX `Income_categoryId_idx` ON `Income`(`categoryId`);

-- CreateIndex
CREATE INDEX `Expense_categoryId_idx` ON `Expense`(`categoryId`);
