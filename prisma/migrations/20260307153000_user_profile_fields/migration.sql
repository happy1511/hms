-- AlterTable
ALTER TABLE `User`
  ADD COLUMN `firstName` VARCHAR(191) NULL,
  ADD COLUMN `middleName` VARCHAR(191) NULL,
  ADD COLUMN `lastName` VARCHAR(191) NULL,
  ADD COLUMN `preferredName` VARCHAR(191) NULL,
  ADD COLUMN `gender` ENUM('Male', 'Female', 'Other') NOT NULL DEFAULT 'Other',
  ADD COLUMN `dob` DATETIME(3) NULL,
  ADD COLUMN `maritalStatus` ENUM('Single', 'Married', 'Divorced', 'Widowed') NULL,
  ADD COLUMN `address` VARCHAR(191) NULL,
  ADD COLUMN `city` VARCHAR(191) NULL,
  ADD COLUMN `country` VARCHAR(191) NULL,
  ADD COLUMN `state` VARCHAR(191) NULL,
  ADD COLUMN `postcode` VARCHAR(191) NULL,
  ADD COLUMN `contactNumber` VARCHAR(191) NULL,
  ADD COLUMN `email` VARCHAR(191) NULL,
  ADD COLUMN `identityType` ENUM('ADHAR_CARD', 'DRIVING_LICENSE', 'PAN_CARD', 'VOTER_CARD') NULL,
  ADD COLUMN `identityNumber` VARCHAR(191) NULL,
  ADD COLUMN `education` VARCHAR(191) NULL,
  ADD COLUMN `qualifications` VARCHAR(191) NULL,
  ADD COLUMN `department` VARCHAR(191) NULL;

UPDATE `User`
SET
  `firstName` = COALESCE(NULLIF(TRIM(`name`), ''), `loginId`),
  `lastName` = COALESCE(`lastName`, ''),
  `preferredName` = COALESCE(NULLIF(TRIM(`name`), ''), `loginId`),
  `contactNumber` = `loginId`
WHERE `firstName` IS NULL
   OR `lastName` IS NULL
   OR `preferredName` IS NULL
   OR `contactNumber` IS NULL;

-- AlterTable
ALTER TABLE `User`
  MODIFY `firstName` VARCHAR(191) NOT NULL DEFAULT '',
  MODIFY `lastName` VARCHAR(191) NOT NULL DEFAULT '',
  MODIFY `preferredName` VARCHAR(191) NOT NULL DEFAULT '',
  MODIFY `contactNumber` VARCHAR(191) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `User_contactNumber_key` ON `User`(`contactNumber`);
