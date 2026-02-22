-- AlterTable
ALTER TABLE `module` MODIFY `name` ENUM('USER', 'DOCTOR_MASTER', 'FLOOR_MASTER', 'WARD_MASTER', 'BED_MASTER', 'APPOINTMENT', 'PATIENT_MASTER', 'BILLING_SECTION_MASTER', 'SERVICE_MASTER', 'PATHOLOGY_TEST_MASTER', 'RADIOLOGY_TEST_MASTER', 'OPD_BILL', 'OPD_QUEUE', 'PATHOLOGY_ORDER', 'RADIOLOGY_ORDER', 'LOCATION_MASTER') NOT NULL;

-- CreateTable
CREATE TABLE `RadiologyTestOrder` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `opdId` INTEGER NOT NULL,
    `patientId` INTEGER NOT NULL,
    `testId` INTEGER NOT NULL,
    `sampleTakenAt` DATETIME(3) NULL,
    `resultEnteredAt` DATETIME(3) NULL,
    `verifiedAt` DATETIME(3) NULL,
    `sampleTakenById` INTEGER NULL,
    `resultEnteredById` INTEGER NULL,
    `verifiedById` INTEGER NULL,
    `cancelledById` INTEGER NULL,
    `isOutSourced` BOOLEAN NOT NULL DEFAULT false,
    `isCancelled` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `status` ENUM('RESULT_PENDING', 'COMPLETED') NOT NULL DEFAULT 'RESULT_PENDING',

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `RadiologyTestResult` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `orderId` INTEGER NOT NULL,
    `templateId` INTEGER NOT NULL,
    `value` VARCHAR(191) NULL,
    `remark` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `RadiologyTestOrder` ADD CONSTRAINT `RadiologyTestOrder_verifiedById_fkey` FOREIGN KEY (`verifiedById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RadiologyTestOrder` ADD CONSTRAINT `RadiologyTestOrder_resultEnteredById_fkey` FOREIGN KEY (`resultEnteredById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RadiologyTestOrder` ADD CONSTRAINT `RadiologyTestOrder_sampleTakenById_fkey` FOREIGN KEY (`sampleTakenById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RadiologyTestOrder` ADD CONSTRAINT `RadiologyTestOrder_cancelledById_fkey` FOREIGN KEY (`cancelledById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RadiologyTestOrder` ADD CONSTRAINT `RadiologyTestOrder_patientId_fkey` FOREIGN KEY (`patientId`) REFERENCES `Patient`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RadiologyTestOrder` ADD CONSTRAINT `RadiologyTestOrder_testId_fkey` FOREIGN KEY (`testId`) REFERENCES `RadiologyTest`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RadiologyTestOrder` ADD CONSTRAINT `RadiologyTestOrder_opdId_fkey` FOREIGN KEY (`opdId`) REFERENCES `Opd`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RadiologyTestResult` ADD CONSTRAINT `RadiologyTestResult_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `RadiologyTestOrder`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RadiologyTestResult` ADD CONSTRAINT `RadiologyTestResult_templateId_fkey` FOREIGN KEY (`templateId`) REFERENCES `RadiologyTemplate`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
