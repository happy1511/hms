/*
  Warnings:

  - You are about to drop the column `Department` on the `doctor` table. All the data in the column will be lost.
  - You are about to drop the column `Department` on the `user` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[currentIpdId]` on the table `Bed` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `bed` ADD COLUMN `currentIpdId` INTEGER NULL;

-- AlterTable
ALTER TABLE `doctor` DROP COLUMN `Department`,
    ADD COLUMN `department` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `location` ALTER COLUMN `updatedAt` DROP DEFAULT;

-- AlterTable
ALTER TABLE `user` DROP COLUMN `Department`,
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
ALTER TABLE `advisedpathologytests` RENAME INDEX `AdvisedPathologyTests_consultationId_fkey` TO `AdvisedPathologyTests_consultationId_idx`;

-- RenameIndex
ALTER TABLE `advisedpathologytests` RENAME INDEX `AdvisedPathologyTests_testId_fkey` TO `AdvisedPathologyTests_testId_idx`;

-- RenameIndex
ALTER TABLE `advisedradiologytests` RENAME INDEX `AdvisedRadiologyTests_consultationId_fkey` TO `AdvisedRadiologyTests_consultationId_idx`;

-- RenameIndex
ALTER TABLE `advisedradiologytests` RENAME INDEX `AdvisedRadiologyTests_testId_fkey` TO `AdvisedRadiologyTests_testId_idx`;

-- RenameIndex
ALTER TABLE `appointment` RENAME INDEX `Appointment_doctorId_fkey` TO `Appointment_doctorId_idx`;

-- RenameIndex
ALTER TABLE `appointment` RENAME INDEX `Appointment_patientId_fkey` TO `Appointment_patientId_idx`;

-- RenameIndex
ALTER TABLE `bed` RENAME INDEX `Bed_roomId_fkey` TO `Bed_roomId_idx`;

-- RenameIndex
ALTER TABLE `doctor` RENAME INDEX `Doctor_createdBy_fkey` TO `Doctor_createdBy_idx`;

-- RenameIndex
ALTER TABLE `doctor` RENAME INDEX `Doctor_updatedBy_fkey` TO `Doctor_updatedBy_idx`;

-- RenameIndex
ALTER TABLE `drugbill` RENAME INDEX `DrugBill_doctorId_fkey` TO `DrugBill_doctorId_idx`;

-- RenameIndex
ALTER TABLE `drugbill` RENAME INDEX `DrugBill_patientId_fkey` TO `DrugBill_patientId_idx`;

-- RenameIndex
ALTER TABLE `emergencycontact` RENAME INDEX `emergencyContact_patientId_fkey` TO `emergencyContact_patientId_idx`;

-- RenameIndex
ALTER TABLE `inventoryitems` RENAME INDEX `InventoryItems_drugId_fkey` TO `InventoryItems_drugId_idx`;

-- RenameIndex
ALTER TABLE `inventoryitems` RENAME INDEX `InventoryItems_supplierId_fkey` TO `InventoryItems_supplierId_idx`;

-- RenameIndex
ALTER TABLE `invoice` RENAME INDEX `Invoice_createdBy_fkey` TO `Invoice_createdBy_idx`;

-- RenameIndex
ALTER TABLE `invoicebillingitem` RENAME INDEX `InvoiceBillingItem_billingSectionId_fkey` TO `InvoiceBillingItem_billingSectionId_idx`;

-- RenameIndex
ALTER TABLE `invoicebillingitem` RENAME INDEX `InvoiceBillingItem_invoiceId_fkey` TO `InvoiceBillingItem_invoiceId_idx`;

-- RenameIndex
ALTER TABLE `invoicebillingitem` RENAME INDEX `InvoiceBillingItem_serviceId_fkey` TO `InvoiceBillingItem_serviceId_idx`;

-- RenameIndex
ALTER TABLE `ipd` RENAME INDEX `Ipd_bedId_fkey` TO `Ipd_bedId_idx`;

-- RenameIndex
ALTER TABLE `ipd` RENAME INDEX `Ipd_consultantDoctorId_fkey` TO `Ipd_consultantDoctorId_idx`;

-- RenameIndex
ALTER TABLE `ipd` RENAME INDEX `Ipd_patientId_fkey` TO `Ipd_patientId_idx`;

-- RenameIndex
ALTER TABLE `ipd` RENAME INDEX `Ipd_referringDoctorId_fkey` TO `Ipd_referringDoctorId_idx`;

-- RenameIndex
ALTER TABLE `opd` RENAME INDEX `Opd_consultantDoctorId_fkey` TO `Opd_consultantDoctorId_idx`;

-- RenameIndex
ALTER TABLE `opd` RENAME INDEX `Opd_patientId_fkey` TO `Opd_patientId_idx`;

-- RenameIndex
ALTER TABLE `opd` RENAME INDEX `Opd_referringDoctorId_fkey` TO `Opd_referringDoctorId_idx`;

-- RenameIndex
ALTER TABLE `parameteroptions` RENAME INDEX `ParameterOptions_testParameterId_fkey` TO `ParameterOptions_testParameterId_idx`;

-- RenameIndex
ALTER TABLE `pathologytestorder` RENAME INDEX `PathologyTestOrder_ipdId_fkey` TO `PathologyTestOrder_ipdId_idx`;

-- RenameIndex
ALTER TABLE `pathologytestorder` RENAME INDEX `PathologyTestOrder_opdId_fkey` TO `PathologyTestOrder_opdId_idx`;

-- RenameIndex
ALTER TABLE `pathologytestorder` RENAME INDEX `PathologyTestOrder_patientId_fkey` TO `PathologyTestOrder_patientId_idx`;

-- RenameIndex
ALTER TABLE `pathologytestorder` RENAME INDEX `PathologyTestOrder_resultEnteredById_fkey` TO `PathologyTestOrder_resultEnteredById_idx`;

-- RenameIndex
ALTER TABLE `pathologytestorder` RENAME INDEX `PathologyTestOrder_testId_fkey` TO `PathologyTestOrder_testId_idx`;

-- RenameIndex
ALTER TABLE `pathologytestorder` RENAME INDEX `PathologyTestOrder_verifiedById_fkey` TO `PathologyTestOrder_verifiedById_idx`;

-- RenameIndex
ALTER TABLE `pathologytestparameter` RENAME INDEX `PathologyTestParameter_testId_fkey` TO `PathologyTestParameter_testId_idx`;

-- RenameIndex
ALTER TABLE `pathologytestresult` RENAME INDEX `PathologyTestResult_orderId_fkey` TO `PathologyTestResult_orderId_idx`;

-- RenameIndex
ALTER TABLE `pathologytestresult` RENAME INDEX `PathologyTestResult_parameterId_fkey` TO `PathologyTestResult_parameterId_idx`;

-- RenameIndex
ALTER TABLE `pathologytestservice` RENAME INDEX `PathologyTestService_serviceId_fkey` TO `PathologyTestService_serviceId_idx`;

-- RenameIndex
ALTER TABLE `patient` RENAME INDEX `Patient_createdBy_fkey` TO `Patient_createdBy_idx`;

-- RenameIndex
ALTER TABLE `patientaddress` RENAME INDEX `PatientAddress_locationId_fkey` TO `PatientAddress_locationId_idx`;

-- RenameIndex
ALTER TABLE `patientaddress` RENAME INDEX `PatientAddress_patientId_fkey` TO `PatientAddress_patientId_idx`;

-- RenameIndex
ALTER TABLE `patientcontact` RENAME INDEX `PatientContact_patientId_fkey` TO `PatientContact_patientId_idx`;

-- RenameIndex
ALTER TABLE `patientidentification` RENAME INDEX `PatientIdentification_patientId_fkey` TO `PatientIdentification_patientId_idx`;

-- RenameIndex
ALTER TABLE `patientnotes` RENAME INDEX `PatientNotes_patientId_fkey` TO `PatientNotes_patientId_idx`;

-- RenameIndex
ALTER TABLE `permission` RENAME INDEX `Permission_actionId_fkey` TO `Permission_actionId_idx`;

-- RenameIndex
ALTER TABLE `radiologytestorder` RENAME INDEX `RadiologyTestOrder_ipdId_fkey` TO `RadiologyTestOrder_ipdId_idx`;

-- RenameIndex
ALTER TABLE `radiologytestorder` RENAME INDEX `RadiologyTestOrder_opdId_fkey` TO `RadiologyTestOrder_opdId_idx`;

-- RenameIndex
ALTER TABLE `radiologytestorder` RENAME INDEX `RadiologyTestOrder_patientId_fkey` TO `RadiologyTestOrder_patientId_idx`;

-- RenameIndex
ALTER TABLE `radiologytestorder` RENAME INDEX `RadiologyTestOrder_resultEnteredById_fkey` TO `RadiologyTestOrder_resultEnteredById_idx`;

-- RenameIndex
ALTER TABLE `radiologytestorder` RENAME INDEX `RadiologyTestOrder_testId_fkey` TO `RadiologyTestOrder_testId_idx`;

-- RenameIndex
ALTER TABLE `radiologytestorder` RENAME INDEX `RadiologyTestOrder_verifiedById_fkey` TO `RadiologyTestOrder_verifiedById_idx`;

-- RenameIndex
ALTER TABLE `radiologytestresult` RENAME INDEX `RadiologyTestResult_orderId_fkey` TO `RadiologyTestResult_orderId_idx`;

-- RenameIndex
ALTER TABLE `radiologytestresult` RENAME INDEX `RadiologyTestResult_templateId_fkey` TO `RadiologyTestResult_templateId_idx`;

-- RenameIndex
ALTER TABLE `radiologytestservice` RENAME INDEX `RadiologyTestService_serviceId_fkey` TO `RadiologyTestService_serviceId_idx`;

-- RenameIndex
ALTER TABLE `referencerange` RENAME INDEX `ReferenceRange_testParameterId_fkey` TO `ReferenceRange_testParameterId_idx`;

-- RenameIndex
ALTER TABLE `room` RENAME INDEX `Room_roomTypeId_fkey` TO `Room_roomTypeId_idx`;

-- RenameIndex
ALTER TABLE `roomtype` RENAME INDEX `RoomType_departmentId_fkey` TO `RoomType_departmentId_idx`;

-- RenameIndex
ALTER TABLE `transaction` RENAME INDEX `Transaction_invoiceId_fkey` TO `Transaction_invoiceId_idx`;

-- RenameIndex
ALTER TABLE `userpermission` RENAME INDEX `UserPermission_userId_fkey` TO `UserPermission_userId_idx`;
