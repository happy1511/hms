ALTER TABLE `DocumentStore`
    MODIFY `type` ENUM('LAB_REPORT_PATHOLOGY', 'LAB_REPORT_RADIOLOGY', 'PATIENT_DOCUMENT', 'OPD_DOCUMENT', 'IPD_DOCUMENT', 'OTHER') NOT NULL DEFAULT 'OTHER',
    ADD COLUMN `documentName` VARCHAR(191) NULL,
    ADD COLUMN `opdId` INTEGER NULL,
    ADD COLUMN `ipdId` INTEGER NULL,
    ADD INDEX `DocumentStore_documentName_idx`(`documentName`),
    ADD INDEX `DocumentStore_opdId_idx`(`opdId`),
    ADD INDEX `DocumentStore_ipdId_idx`(`ipdId`),
    ADD CONSTRAINT `DocumentStore_opdId_fkey` FOREIGN KEY (`opdId`) REFERENCES `Opd`(`id`) ON DELETE SET NULL ON UPDATE CASCADE,
    ADD CONSTRAINT `DocumentStore_ipdId_fkey` FOREIGN KEY (`ipdId`) REFERENCES `Ipd`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
