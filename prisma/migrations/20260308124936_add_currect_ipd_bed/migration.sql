/*
  Warnings:

  - You are about to drop the column `Department` on the `Doctor` table. All the data in the column will be lost.
  - You are about to drop the column `Department` on the `User` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[currentIpdId]` on the table `Bed` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `Bed` ADD COLUMN `currentIpdId` INTEGER NULL;

-- AlterTable
ALTER TABLE `Doctor` DROP COLUMN `Department`,
    ADD COLUMN `department` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `Location` ALTER COLUMN `updatedAt` DROP DEFAULT;

-- AlterTable
ALTER TABLE `User` DROP COLUMN `Department`,
    ADD COLUMN `department` VARCHAR(191) NULL;

-- CreateIndex
CREATE INDEX `Appointment_appointmentDate_idx` ON `Appointment`(`appointmentDate`);

-- CreateIndex
CREATE INDEX `Appointment_status_idx` ON `Appointment`(`status`);

-- CreateIndex
CREATE UNIQUE INDEX `Bed_currentIpdId_key` ON `Bed`(`currentIpdId`);

-- CreateIndex
CREATE INDEX `Bed_currentIpdId_idx` ON `Bed`(`currentIpdId`);

-- CreateIndex
CREATE INDEX `Doctor_userId_idx` ON `Doctor`(`userId`);

-- CreateIndex
CREATE INDEX `DoctorAvailableDay_doctorId_idx` ON `DoctorAvailableDay`(`doctorId`);

-- CreateIndex
CREATE INDEX `DrugBill_invoiceId_idx` ON `DrugBill`(`invoiceId`);

-- CreateIndex
CREATE INDEX `InventoryItems_expiryDate_idx` ON `InventoryItems`(`expiryDate`);

-- CreateIndex
CREATE INDEX `Invoice_createdAt_idx` ON `Invoice`(`createdAt`);

-- CreateIndex
CREATE INDEX `Invoice_isPaid_idx` ON `Invoice`(`isPaid`);

-- CreateIndex
CREATE INDEX `Ipd_invoiceId_idx` ON `Ipd`(`invoiceId`);

-- CreateIndex
CREATE INDEX `Ipd_isDischarged_idx` ON `Ipd`(`isDischarged`);

-- CreateIndex
CREATE INDEX `Ipd_createdAt_idx` ON `Ipd`(`createdAt`);

-- CreateIndex
CREATE INDEX `Opd_invoiceId_idx` ON `Opd`(`invoiceId`);

-- CreateIndex
CREATE INDEX `Opd_isInQueue_idx` ON `Opd`(`isInQueue`);

-- CreateIndex
CREATE INDEX `Opd_createdAt_idx` ON `Opd`(`createdAt`);

-- CreateIndex
CREATE INDEX `PathologyTestOrder_status_idx` ON `PathologyTestOrder`(`status`);

-- CreateIndex
CREATE INDEX `PathologyTestOrder_createdAt_idx` ON `PathologyTestOrder`(`createdAt`);

-- CreateIndex
CREATE INDEX `PathologyTestResult_optionId_idx` ON `PathologyTestResult`(`optionId`);

-- CreateIndex
CREATE INDEX `PathologyTestService_testId_idx` ON `PathologyTestService`(`testId`);

-- CreateIndex
CREATE INDEX `Patient_createdAt_idx` ON `Patient`(`createdAt`);

-- CreateIndex
CREATE INDEX `Patient_uhid_idx` ON `Patient`(`uhid`);

-- CreateIndex
CREATE INDEX `PatientRelations_patientId_idx` ON `PatientRelations`(`patientId`);

-- CreateIndex
CREATE INDEX `Permission_moduleId_idx` ON `Permission`(`moduleId`);

-- CreateIndex
CREATE INDEX `RadiologyTestOrder_status_idx` ON `RadiologyTestOrder`(`status`);

-- CreateIndex
CREATE INDEX `RadiologyTestOrder_createdAt_idx` ON `RadiologyTestOrder`(`createdAt`);

-- CreateIndex
CREATE INDEX `RadiologyTestService_testId_idx` ON `RadiologyTestService`(`testId`);

-- CreateIndex
CREATE INDEX `User_isDeleted_idx` ON `User`(`isDeleted`);

-- CreateIndex
CREATE INDEX `User_createdAt_idx` ON `User`(`createdAt`);

-- CreateIndex
CREATE INDEX `UserPermission_permissionId_idx` ON `UserPermission`(`permissionId`);

-- AddForeignKey
ALTER TABLE `Bed` ADD CONSTRAINT `Bed_currentIpdId_fkey` FOREIGN KEY (`currentIpdId`) REFERENCES `Ipd`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- RenameIndex
ALTER TABLE `AdvisedPathologyTests` RENAME INDEX `AdvisedPathologyTests_consultationId_fkey` TO `AdvisedPathologyTests_consultationId_idx`;

-- RenameIndex
ALTER TABLE `AdvisedPathologyTests` RENAME INDEX `AdvisedPathologyTests_testId_fkey` TO `AdvisedPathologyTests_testId_idx`;

-- RenameIndex
ALTER TABLE `AdvisedRadiologyTests` RENAME INDEX `AdvisedRadiologyTests_consultationId_fkey` TO `AdvisedRadiologyTests_consultationId_idx`;

-- RenameIndex
ALTER TABLE `AdvisedRadiologyTests` RENAME INDEX `AdvisedRadiologyTests_testId_fkey` TO `AdvisedRadiologyTests_testId_idx`;

-- RenameIndex
ALTER TABLE `Appointment` RENAME INDEX `Appointment_doctorId_fkey` TO `Appointment_doctorId_idx`;

-- RenameIndex
ALTER TABLE `Appointment` RENAME INDEX `Appointment_patientId_fkey` TO `Appointment_patientId_idx`;

-- RenameIndex
ALTER TABLE `Bed` RENAME INDEX `Bed_roomId_fkey` TO `Bed_roomId_idx`;

-- RenameIndex
ALTER TABLE `Doctor` RENAME INDEX `Doctor_createdBy_fkey` TO `Doctor_createdBy_idx`;

-- RenameIndex
ALTER TABLE `Doctor` RENAME INDEX `Doctor_updatedBy_fkey` TO `Doctor_updatedBy_idx`;

-- RenameIndex
ALTER TABLE `DrugBill` RENAME INDEX `DrugBill_doctorId_fkey` TO `DrugBill_doctorId_idx`;

-- RenameIndex
ALTER TABLE `DrugBill` RENAME INDEX `DrugBill_patientId_fkey` TO `DrugBill_patientId_idx`;

-- RenameIndex
ALTER TABLE `emergencyContact` RENAME INDEX `emergencyContact_patientId_fkey` TO `emergencyContact_patientId_idx`;

-- RenameIndex
ALTER TABLE `InventoryItems` RENAME INDEX `InventoryItems_drugId_fkey` TO `InventoryItems_drugId_idx`;

-- RenameIndex
ALTER TABLE `InventoryItems` RENAME INDEX `InventoryItems_supplierId_fkey` TO `InventoryItems_supplierId_idx`;

-- RenameIndex
ALTER TABLE `Invoice` RENAME INDEX `Invoice_createdBy_fkey` TO `Invoice_createdBy_idx`;

-- RenameIndex
ALTER TABLE `InvoiceBillingItem` RENAME INDEX `InvoiceBillingItem_billingSectionId_fkey` TO `InvoiceBillingItem_billingSectionId_idx`;

-- RenameIndex
ALTER TABLE `InvoiceBillingItem` RENAME INDEX `InvoiceBillingItem_invoiceId_fkey` TO `InvoiceBillingItem_invoiceId_idx`;

-- RenameIndex
ALTER TABLE `InvoiceBillingItem` RENAME INDEX `InvoiceBillingItem_serviceId_fkey` TO `InvoiceBillingItem_serviceId_idx`;

-- RenameIndex
ALTER TABLE `Ipd` RENAME INDEX `Ipd_bedId_fkey` TO `Ipd_bedId_idx`;

-- RenameIndex
ALTER TABLE `Ipd` RENAME INDEX `Ipd_consultantDoctorId_fkey` TO `Ipd_consultantDoctorId_idx`;

-- RenameIndex
ALTER TABLE `Ipd` RENAME INDEX `Ipd_patientId_fkey` TO `Ipd_patientId_idx`;

-- RenameIndex
ALTER TABLE `Ipd` RENAME INDEX `Ipd_referringDoctorId_fkey` TO `Ipd_referringDoctorId_idx`;

-- RenameIndex
ALTER TABLE `Opd` RENAME INDEX `Opd_consultantDoctorId_fkey` TO `Opd_consultantDoctorId_idx`;

-- RenameIndex
ALTER TABLE `Opd` RENAME INDEX `Opd_patientId_fkey` TO `Opd_patientId_idx`;

-- RenameIndex
ALTER TABLE `Opd` RENAME INDEX `Opd_referringDoctorId_fkey` TO `Opd_referringDoctorId_idx`;

-- RenameIndex
ALTER TABLE `ParameterOptions` RENAME INDEX `ParameterOptions_testParameterId_fkey` TO `ParameterOptions_testParameterId_idx`;

-- RenameIndex
ALTER TABLE `PathologyTestOrder` RENAME INDEX `PathologyTestOrder_ipdId_fkey` TO `PathologyTestOrder_ipdId_idx`;

-- RenameIndex
ALTER TABLE `PathologyTestOrder` RENAME INDEX `PathologyTestOrder_opdId_fkey` TO `PathologyTestOrder_opdId_idx`;

-- RenameIndex
ALTER TABLE `PathologyTestOrder` RENAME INDEX `PathologyTestOrder_patientId_fkey` TO `PathologyTestOrder_patientId_idx`;

-- RenameIndex
ALTER TABLE `PathologyTestOrder` RENAME INDEX `PathologyTestOrder_resultEnteredById_fkey` TO `PathologyTestOrder_resultEnteredById_idx`;

-- RenameIndex
ALTER TABLE `PathologyTestOrder` RENAME INDEX `PathologyTestOrder_testId_fkey` TO `PathologyTestOrder_testId_idx`;

-- RenameIndex
ALTER TABLE `PathologyTestOrder` RENAME INDEX `PathologyTestOrder_verifiedById_fkey` TO `PathologyTestOrder_verifiedById_idx`;

-- RenameIndex
ALTER TABLE `PathologyTestParameter` RENAME INDEX `PathologyTestParameter_testId_fkey` TO `PathologyTestParameter_testId_idx`;

-- RenameIndex
ALTER TABLE `PathologyTestResult` RENAME INDEX `PathologyTestResult_orderId_fkey` TO `PathologyTestResult_orderId_idx`;

-- RenameIndex
ALTER TABLE `PathologyTestResult` RENAME INDEX `PathologyTestResult_parameterId_fkey` TO `PathologyTestResult_parameterId_idx`;

-- RenameIndex
ALTER TABLE `PathologyTestService` RENAME INDEX `PathologyTestService_serviceId_fkey` TO `PathologyTestService_serviceId_idx`;

-- RenameIndex
ALTER TABLE `Patient` RENAME INDEX `Patient_createdBy_fkey` TO `Patient_createdBy_idx`;

-- RenameIndex
ALTER TABLE `PatientAddress` RENAME INDEX `PatientAddress_locationId_fkey` TO `PatientAddress_locationId_idx`;

-- RenameIndex
ALTER TABLE `PatientAddress` RENAME INDEX `PatientAddress_patientId_fkey` TO `PatientAddress_patientId_idx`;

-- RenameIndex
ALTER TABLE `PatientContact` RENAME INDEX `PatientContact_patientId_fkey` TO `PatientContact_patientId_idx`;

-- RenameIndex
ALTER TABLE `PatientIdentification` RENAME INDEX `PatientIdentification_patientId_fkey` TO `PatientIdentification_patientId_idx`;

-- RenameIndex
ALTER TABLE `PatientNotes` RENAME INDEX `PatientNotes_patientId_fkey` TO `PatientNotes_patientId_idx`;

-- RenameIndex
ALTER TABLE `Permission` RENAME INDEX `Permission_actionId_fkey` TO `Permission_actionId_idx`;

-- RenameIndex
ALTER TABLE `RadiologyTestOrder` RENAME INDEX `RadiologyTestOrder_ipdId_fkey` TO `RadiologyTestOrder_ipdId_idx`;

-- RenameIndex
ALTER TABLE `RadiologyTestOrder` RENAME INDEX `RadiologyTestOrder_opdId_fkey` TO `RadiologyTestOrder_opdId_idx`;

-- RenameIndex
ALTER TABLE `RadiologyTestOrder` RENAME INDEX `RadiologyTestOrder_patientId_fkey` TO `RadiologyTestOrder_patientId_idx`;

-- RenameIndex
ALTER TABLE `RadiologyTestOrder` RENAME INDEX `RadiologyTestOrder_resultEnteredById_fkey` TO `RadiologyTestOrder_resultEnteredById_idx`;

-- RenameIndex
ALTER TABLE `RadiologyTestOrder` RENAME INDEX `RadiologyTestOrder_testId_fkey` TO `RadiologyTestOrder_testId_idx`;

-- RenameIndex
ALTER TABLE `RadiologyTestOrder` RENAME INDEX `RadiologyTestOrder_verifiedById_fkey` TO `RadiologyTestOrder_verifiedById_idx`;

-- RenameIndex
ALTER TABLE `RadiologyTestResult` RENAME INDEX `RadiologyTestResult_orderId_fkey` TO `RadiologyTestResult_orderId_idx`;

-- RenameIndex
ALTER TABLE `RadiologyTestResult` RENAME INDEX `RadiologyTestResult_templateId_fkey` TO `RadiologyTestResult_templateId_idx`;

-- RenameIndex
ALTER TABLE `RadiologyTestService` RENAME INDEX `RadiologyTestService_serviceId_fkey` TO `RadiologyTestService_serviceId_idx`;

-- RenameIndex
ALTER TABLE `ReferenceRange` RENAME INDEX `ReferenceRange_testParameterId_fkey` TO `ReferenceRange_testParameterId_idx`;

-- RenameIndex
ALTER TABLE `Room` RENAME INDEX `Room_roomTypeId_fkey` TO `Room_roomTypeId_idx`;

-- RenameIndex
ALTER TABLE `RoomType` RENAME INDEX `RoomType_departmentId_fkey` TO `RoomType_departmentId_idx`;

-- RenameIndex
ALTER TABLE `transaction` RENAME INDEX `Transaction_invoiceId_fkey` TO `Transaction_invoiceId_idx`;

-- RenameIndex
ALTER TABLE `UserPermission` RENAME INDEX `UserPermission_userId_fkey` TO `UserPermission_userId_idx`;
