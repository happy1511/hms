-- AlterTable
ALTER TABLE `Doctor` ADD COLUMN `consultationCharges` DOUBLE NULL;

-- AlterTable
ALTER TABLE `Service` ADD COLUMN `consultingDoctorId` INTEGER NULL;

-- CreateIndex
CREATE UNIQUE INDEX `Service_consultingDoctorId_key` ON `Service`(`consultingDoctorId`);

-- AddForeignKey
ALTER TABLE `Service` ADD CONSTRAINT `Service_consultingDoctorId_fkey` FOREIGN KEY (`consultingDoctorId`) REFERENCES `Doctor`(`userId`) ON DELETE SET NULL ON UPDATE CASCADE;

