ALTER TABLE `DrugBill`
  ADD COLUMN `customerId` INTEGER NULL,
  ADD COLUMN `isWholesaleBill` BOOLEAN NOT NULL DEFAULT false;

CREATE TABLE `PharmacyCustomer` (
  `id` INTEGER NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(191) NOT NULL,
  `address` VARCHAR(191) NULL,
  `contact` VARCHAR(191) NULL,
  `isBusinessCustomer` BOOLEAN NOT NULL DEFAULT false,
  `dlNumber` VARCHAR(191) NULL,
  `gstNumber` VARCHAR(191) NULL,
  `patientId` INTEGER NULL,
  `isDeleted` BOOLEAN NOT NULL DEFAULT false,
  `createdBy` INTEGER NULL,
  `updatedBy` INTEGER NULL,
  `deletedBy` INTEGER NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  INDEX `PharmacyCustomer_name_idx`(`name`),
  INDEX `PharmacyCustomer_patientId_idx`(`patientId`),
  PRIMARY KEY (`id`)
);

ALTER TABLE `DrugBill`
  ADD INDEX `DrugBill_customerId_idx`(`customerId`);

ALTER TABLE `PharmacyCustomer`
  ADD CONSTRAINT `PharmacyCustomer_patientId_fkey`
  FOREIGN KEY (`patientId`) REFERENCES `Patient`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE `PharmacyCustomer`
  ADD CONSTRAINT `PharmacyCustomer_createdBy_fkey`
  FOREIGN KEY (`createdBy`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE `PharmacyCustomer`
  ADD CONSTRAINT `PharmacyCustomer_updatedBy_fkey`
  FOREIGN KEY (`updatedBy`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE `PharmacyCustomer`
  ADD CONSTRAINT `PharmacyCustomer_deletedBy_fkey`
  FOREIGN KEY (`deletedBy`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE `DrugBill`
  ADD CONSTRAINT `DrugBill_customerId_fkey`
  FOREIGN KEY (`customerId`) REFERENCES `PharmacyCustomer`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
