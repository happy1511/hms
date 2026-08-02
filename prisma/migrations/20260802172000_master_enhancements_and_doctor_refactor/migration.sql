-- Alter ReferenceRange to Float
ALTER TABLE `ReferenceRange` MODIFY COLUMN `lowerRange` DOUBLE NULL, MODIFY COLUMN `upperRange` DOUBLE NULL;

-- Alter Service to add billingSectionId
ALTER TABLE `Service` ADD COLUMN `billingSectionId` INTEGER NOT NULL DEFAULT 1;
ALTER TABLE `Service` ADD CONSTRAINT `Service_billingSectionId_fkey` FOREIGN KEY (`billingSectionId`) REFERENCES `BillingSection`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- Drop foreign keys referencing Doctor.userId
ALTER TABLE `DoctorAvailableDay` DROP FOREIGN KEY `DoctorAvailableDay_doctorId_fkey`;
ALTER TABLE `Appointment` DROP FOREIGN KEY `Appointment_doctorId_fkey`;
ALTER TABLE `Service` DROP FOREIGN KEY `Service_consultingDoctorId_fkey`;
ALTER TABLE `Opd` DROP FOREIGN KEY `Opd_consultantDoctorId_fkey`;
ALTER TABLE `Opd` DROP FOREIGN KEY `Opd_referringDoctorId_fkey`;
ALTER TABLE `Ipd` DROP FOREIGN KEY `Ipd_consultantDoctorId_fkey`;
ALTER TABLE `Ipd` DROP FOREIGN KEY `Ipd_referringDoctorId_fkey`;
ALTER TABLE `DrugBill` DROP FOREIGN KEY `DrugBill_doctorId_fkey`;

-- Update Doctor table structure
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

-- Rename userId to id in Doctor table
ALTER TABLE `Doctor` DROP FOREIGN KEY `Doctor_userId_fkey`;
ALTER TABLE `Doctor` CHANGE COLUMN `userId` `id` INTEGER NOT NULL AUTO_INCREMENT;

-- Recreate foreign keys pointing to Doctor.id
ALTER TABLE `DoctorAvailableDay` ADD CONSTRAINT `DoctorAvailableDay_doctorId_fkey` FOREIGN KEY (`doctorId`) REFERENCES `Doctor`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `Appointment` ADD CONSTRAINT `Appointment_doctorId_fkey` FOREIGN KEY (`doctorId`) REFERENCES `Doctor`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `Service` ADD CONSTRAINT `Service_consultingDoctorId_fkey` FOREIGN KEY (`consultingDoctorId`) REFERENCES `Doctor`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE `Opd` ADD CONSTRAINT `Opd_consultantDoctorId_fkey` FOREIGN KEY (`consultantDoctorId`) REFERENCES `Doctor`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `Opd` ADD CONSTRAINT `Opd_referringDoctorId_fkey` FOREIGN KEY (`referringDoctorId`) REFERENCES `Doctor`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `Ipd` ADD CONSTRAINT `Ipd_consultantDoctorId_fkey` FOREIGN KEY (`consultantDoctorId`) REFERENCES `Doctor`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `Ipd` ADD CONSTRAINT `Ipd_referringDoctorId_fkey` FOREIGN KEY (`referringDoctorId`) REFERENCES `Doctor`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `DrugBill` ADD CONSTRAINT `DrugBill_doctorId_fkey` FOREIGN KEY (`doctorId`) REFERENCES `Doctor`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
