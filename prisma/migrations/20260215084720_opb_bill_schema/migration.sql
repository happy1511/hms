/*
  Warnings:

  - Added the required column `billingType` to the `Opd` table without a default value. This is not possible if the table is not empty.
  - Added the required column `consultantDoctorId` to the `Opd` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `opd` ADD COLUMN `billingType` ENUM('CASHLESS_INSURANCE', 'CORPORATE_AFFILIATION', 'AYUSHMAN_BHARAT', 'CGHS', 'RGHS', 'CHIRANJIVI_YOJNA', 'GOVERNMENT_BENEFITS', 'NOT_DETERMINED', 'SELF_PAY', 'DO_NOT_CONSIDER') NOT NULL,
    ADD COLUMN `consultantDoctorId` INTEGER NOT NULL,
    ADD COLUMN `referringDoctorId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `Opd` ADD CONSTRAINT `Opd_consultantDoctorId_fkey` FOREIGN KEY (`consultantDoctorId`) REFERENCES `Doctor`(`userId`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Opd` ADD CONSTRAINT `Opd_referringDoctorId_fkey` FOREIGN KEY (`referringDoctorId`) REFERENCES `Doctor`(`userId`) ON DELETE CASCADE ON UPDATE CASCADE;
