-- AlterTable
ALTER TABLE `Ipd` ADD COLUMN `isMlcPatient` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `mlcDeclarationDate` DATETIME(3) NULL,
    ADD COLUMN `mlcDeclaredById` INTEGER NULL;

-- CreateIndex
CREATE INDEX `Ipd_isMlcPatient_idx` ON `Ipd`(`isMlcPatient`);

-- CreateIndex
CREATE INDEX `Ipd_mlcDeclarationDate_idx` ON `Ipd`(`mlcDeclarationDate`);

-- AddForeignKey
ALTER TABLE `Ipd` ADD CONSTRAINT `Ipd_mlcDeclaredById_fkey` FOREIGN KEY (`mlcDeclaredById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
