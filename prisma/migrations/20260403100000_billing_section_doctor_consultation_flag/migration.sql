ALTER TABLE `BillingSection`
  ADD COLUMN `isDoctorConsultationCharges` BOOLEAN NOT NULL DEFAULT false;

UPDATE `BillingSection`
SET `isDoctorConsultationCharges` = true,
    `isDeleted` = false,
    `status` = 'active',
    `updatedAt` = CURRENT_TIMESTAMP(3)
WHERE `systemKey` = 'CONSULTATION_CHARGES';
