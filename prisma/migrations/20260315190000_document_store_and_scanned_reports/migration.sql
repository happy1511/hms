-- CreateTable
CREATE TABLE `DocumentStore` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `type` ENUM('LAB_REPORT_PATHOLOGY', 'LAB_REPORT_RADIOLOGY', 'PATIENT_DOCUMENT', 'OTHER') NOT NULL DEFAULT 'OTHER',
    `path` VARCHAR(191) NOT NULL,
    `originalName` VARCHAR(191) NOT NULL,
    `mimeType` VARCHAR(191) NULL,
    `size` INTEGER NOT NULL,
    `createdBy` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AlterTable
ALTER TABLE `PathologyTestOrder` ADD COLUMN `scannedReportDocumentId` INTEGER NULL;

-- AlterTable
ALTER TABLE `RadiologyTestOrder` ADD COLUMN `scannedReportDocumentId` INTEGER NULL;

-- CreateIndex
CREATE INDEX `DocumentStore_type_idx` ON `DocumentStore`(`type`);

-- CreateIndex
CREATE INDEX `DocumentStore_createdBy_idx` ON `DocumentStore`(`createdBy`);

-- CreateIndex
CREATE INDEX `DocumentStore_createdAt_idx` ON `DocumentStore`(`createdAt`);

-- CreateIndex
CREATE INDEX `PathologyTestOrder_scannedReportDocumentId_idx` ON `PathologyTestOrder`(`scannedReportDocumentId`);

-- CreateIndex
CREATE INDEX `RadiologyTestOrder_scannedReportDocumentId_idx` ON `RadiologyTestOrder`(`scannedReportDocumentId`);

-- AddForeignKey
ALTER TABLE `DocumentStore` ADD CONSTRAINT `DocumentStore_createdBy_fkey` FOREIGN KEY (`createdBy`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PathologyTestOrder` ADD CONSTRAINT `PathologyTestOrder_scannedReportDocumentId_fkey` FOREIGN KEY (`scannedReportDocumentId`) REFERENCES `DocumentStore`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RadiologyTestOrder` ADD CONSTRAINT `RadiologyTestOrder_scannedReportDocumentId_fkey` FOREIGN KEY (`scannedReportDocumentId`) REFERENCES `DocumentStore`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

