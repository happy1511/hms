-- CreateTable
CREATE TABLE `PrescribedDrugs` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `frequency` INTEGER NOT NULL,
    `days` INTEGER NOT NULL,
    `remarks` VARCHAR(191) NULL,
    `prescriptionId` INTEGER NOT NULL,
    `opdId` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Prescription` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `opdId` INTEGER NOT NULL,
    `followUpAfterDays` INTEGER NULL,
    `followUpDate` DATETIME(3) NULL,
    `followUpAdvice` VARCHAR(191) NULL,
    `otherAdvice` VARCHAR(191) NULL,

    UNIQUE INDEX `Prescription_opdId_key`(`opdId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Vital` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `opdId` INTEGER NOT NULL,
    `height` INTEGER NULL,
    `weight` INTEGER NULL,
    `bpMm` INTEGER NULL,
    `bpHg` INTEGER NULL,
    `pulse` INTEGER NULL,
    `rbs` INTEGER NULL,
    `rr` INTEGER NULL,
    `spo2` INTEGER NULL,
    `temp` INTEGER NULL,

    UNIQUE INDEX `Vital_opdId_key`(`opdId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AdvisedPathologyTests` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `testId` INTEGER NOT NULL,
    `consultationId` INTEGER NOT NULL,
    `opdId` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AdvisedRadiologyTests` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `testId` INTEGER NOT NULL,
    `consultationId` INTEGER NOT NULL,
    `opdId` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `OpdConsultation` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `opdId` INTEGER NOT NULL,
    `vitalsId` INTEGER NOT NULL,
    `notes` VARCHAR(191) NULL,
    `generalExaminations` VARCHAR(191) NULL,
    `systemicExaminations` VARCHAR(191) NULL,
    `diagnosis` VARCHAR(191) NULL,
    `chronicIllness` VARCHAR(191) NULL,

    UNIQUE INDEX `OpdConsultation_opdId_key`(`opdId`),
    UNIQUE INDEX `OpdConsultation_vitalsId_key`(`vitalsId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `PrescribedDrugs` ADD CONSTRAINT `PrescribedDrugs_prescriptionId_fkey` FOREIGN KEY (`prescriptionId`) REFERENCES `Prescription`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PrescribedDrugs` ADD CONSTRAINT `PrescribedDrugs_opdId_fkey` FOREIGN KEY (`opdId`) REFERENCES `Opd`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Prescription` ADD CONSTRAINT `Prescription_opdId_fkey` FOREIGN KEY (`opdId`) REFERENCES `Opd`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Vital` ADD CONSTRAINT `Vital_opdId_fkey` FOREIGN KEY (`opdId`) REFERENCES `Opd`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AdvisedPathologyTests` ADD CONSTRAINT `AdvisedPathologyTests_testId_fkey` FOREIGN KEY (`testId`) REFERENCES `PathologyTest`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AdvisedPathologyTests` ADD CONSTRAINT `AdvisedPathologyTests_consultationId_fkey` FOREIGN KEY (`consultationId`) REFERENCES `OpdConsultation`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AdvisedPathologyTests` ADD CONSTRAINT `AdvisedPathologyTests_opdId_fkey` FOREIGN KEY (`opdId`) REFERENCES `Opd`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AdvisedRadiologyTests` ADD CONSTRAINT `AdvisedRadiologyTests_testId_fkey` FOREIGN KEY (`testId`) REFERENCES `RadiologyTest`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AdvisedRadiologyTests` ADD CONSTRAINT `AdvisedRadiologyTests_consultationId_fkey` FOREIGN KEY (`consultationId`) REFERENCES `OpdConsultation`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AdvisedRadiologyTests` ADD CONSTRAINT `AdvisedRadiologyTests_opdId_fkey` FOREIGN KEY (`opdId`) REFERENCES `Opd`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OpdConsultation` ADD CONSTRAINT `OpdConsultation_opdId_fkey` FOREIGN KEY (`opdId`) REFERENCES `Opd`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OpdConsultation` ADD CONSTRAINT `OpdConsultation_vitalsId_fkey` FOREIGN KEY (`vitalsId`) REFERENCES `Vital`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
