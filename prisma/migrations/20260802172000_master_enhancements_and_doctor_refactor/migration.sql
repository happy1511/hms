-- Alter ReferenceRange to Float
ALTER TABLE `ReferenceRange` MODIFY COLUMN `lowerRange` DOUBLE NULL, MODIFY COLUMN `upperRange` DOUBLE NULL;

-- Alter Service to add billingSectionId
ALTER TABLE `Service` ADD COLUMN `billingSectionId` INTEGER NOT NULL DEFAULT 1;
ALTER TABLE `Service` ADD CONSTRAINT `Service_billingSectionId_fkey` FOREIGN KEY (`billingSectionId`) REFERENCES `BillingSection`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- Update Doctor table structure and copy data from User
ALTER TABLE `Doctor`
  ADD COLUMN `title` VARCHAR(191) NULL,
  ADD COLUMN `firstName` VARCHAR(191) NOT NULL DEFAULT '',
  ADD COLUMN `middleName` VARCHAR(191) NULL,
  ADD COLUMN `lastName` VARCHAR(191) NULL,
  ADD COLUMN `gender` VARCHAR(191) NULL,
  ADD COLUMN `userType` VARCHAR(191) NULL,
  ADD COLUMN `status` VARCHAR(191) NOT NULL DEFAULT 'active',
  ADD COLUMN `isDeleted` TINYINT(1) NOT NULL DEFAULT 0,
  ADD COLUMN `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  ADD COLUMN `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3);

-- Data Migration: Migrate existing Doctor names & attributes from User table
UPDATE `Doctor` d
JOIN `User` u ON d.`userId` = u.`id`
SET
  d.`title` = u.`title`,
  d.`firstName` = u.`firstName`,
  d.`middleName` = u.`middleName`,
  d.`lastName` = u.`lastName`,
  d.`gender` = u.`gender`,
  d.`status` = u.`status`,
  d.`isDeleted` = u.`isDeleted`;

-- Rename userId to id in Doctor table while keeping existing values
ALTER TABLE `Doctor` DROP FOREIGN KEY `Doctor_userId_fkey`;
ALTER TABLE `Doctor` CHANGE COLUMN `userId` `id` INTEGER NOT NULL AUTO_INCREMENT;
