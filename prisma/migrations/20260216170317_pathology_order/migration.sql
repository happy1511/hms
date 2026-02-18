-- CreateTable
CREATE TABLE `PathologyTestOrder` (
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
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `status` ENUM('SAMPLE_PENDING', 'RESULT_PENDING', 'VERIFICATION_PENDING', 'VERIFIED') NOT NULL DEFAULT 'SAMPLE_PENDING',

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PathologyTestResult` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `orderId` INTEGER NOT NULL,
    `parameterId` INTEGER NOT NULL,
    `numericValue` DOUBLE NULL,
    `textValue` VARCHAR(191) NULL,
    `optionId` INTEGER NULL,
    `remark` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `PathologyTestOrder` ADD CONSTRAINT `PathologyTestOrder_verifiedById_fkey` FOREIGN KEY (`verifiedById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PathologyTestOrder` ADD CONSTRAINT `PathologyTestOrder_resultEnteredById_fkey` FOREIGN KEY (`resultEnteredById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PathologyTestOrder` ADD CONSTRAINT `PathologyTestOrder_sampleTakenById_fkey` FOREIGN KEY (`sampleTakenById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PathologyTestOrder` ADD CONSTRAINT `PathologyTestOrder_testId_fkey` FOREIGN KEY (`testId`) REFERENCES `PathologyTest`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PathologyTestResult` ADD CONSTRAINT `PathologyTestResult_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `PathologyTestOrder`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PathologyTestResult` ADD CONSTRAINT `PathologyTestResult_parameterId_fkey` FOREIGN KEY (`parameterId`) REFERENCES `PathologyTestParameter`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
