-- CreateTable
CREATE TABLE `IpdDischargeSummary` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `ipdId` INTEGER NOT NULL,
    `ipdDateTime` DATETIME(3) NULL,
    `isUnfitForFurtherManagement` BOOLEAN NOT NULL DEFAULT false,
    `diagnosis` LONGTEXT NULL,
    `procedureDate` DATETIME(3) NULL,
    `procedure` LONGTEXT NULL,
    `courseInHospital` LONGTEXT NULL,
    `investigationResults` LONGTEXT NULL,
    `allergies` VARCHAR(191) NULL,
    `diet` VARCHAR(191) NULL,
    `physicalActivity` VARCHAR(191) NULL,
    `followUpDate` DATETIME(3) NULL,
    `otherAdvice` LONGTEXT NULL,
    `urgentCareWhen` VARCHAR(191) NULL,
    `isTransferred` BOOLEAN NOT NULL DEFAULT false,
    `remarks` LONGTEXT NULL,
    `followUpAfterDays` INTEGER NULL,
    `followUpAdvice` LONGTEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `IpdDischargeSummary_ipdId_key`(`ipdId`),
    INDEX `IpdDischargeSummary_ipdId_idx`(`ipdId`),
    INDEX `IpdDischargeSummary_followUpDate_idx`(`followUpDate`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `IpdDischargeDrug` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `dischargeSummaryId` INTEGER NOT NULL,
    `drugId` INTEGER NOT NULL,
    `frequency` INTEGER NOT NULL,
    `days` INTEGER NOT NULL,
    `unit` VARCHAR(191) NULL,
    `route` VARCHAR(191) NOT NULL,
    `remarks` VARCHAR(191) NULL,

    INDEX `IpdDischargeDrug_dischargeSummaryId_idx`(`dischargeSummaryId`),
    INDEX `IpdDischargeDrug_drugId_idx`(`drugId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `IpdDischargeSummary` ADD CONSTRAINT `IpdDischargeSummary_ipdId_fkey` FOREIGN KEY (`ipdId`) REFERENCES `Ipd`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `IpdDischargeDrug` ADD CONSTRAINT `IpdDischargeDrug_dischargeSummaryId_fkey` FOREIGN KEY (`dischargeSummaryId`) REFERENCES `IpdDischargeSummary`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `IpdDischargeDrug` ADD CONSTRAINT `IpdDischargeDrug_drugId_fkey` FOREIGN KEY (`drugId`) REFERENCES `Drug`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
