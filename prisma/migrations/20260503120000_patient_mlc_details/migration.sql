ALTER TABLE `Patient`
    ADD COLUMN `isMlcPatient` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `mlcInsuranceType` ENUM('SELF', 'AYUSHYAMAN', 'CORPORATE', 'INSURANCE') NULL,
    ADD COLUMN `mlcPolicyOrCardNumber` VARCHAR(191) NULL;

CREATE INDEX `Patient_isMlcPatient_idx` ON `Patient`(`isMlcPatient`);
