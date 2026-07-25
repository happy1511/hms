-- Preserve existing numeric batch values by converting them in place.
ALTER TABLE `InventoryItems` MODIFY `batchNo` VARCHAR(191) NOT NULL;
ALTER TABLE `ChallanItem` MODIFY `batchNo` VARCHAR(191) NOT NULL;

-- Add UHID as nullable first, backfill existing patients, then make it required.
ALTER TABLE `Patient` ADD COLUMN `uhid` VARCHAR(191) NULL;

UPDATE `Patient`
SET `uhid` = CONCAT('UHID_', `id`, DATE_FORMAT(`createdAt`, '%d%m%y'))
WHERE `uhid` IS NULL OR `uhid` = '';

ALTER TABLE `Patient` MODIFY `uhid` VARCHAR(191) NOT NULL;
CREATE UNIQUE INDEX `Patient_uhid_key` ON `Patient`(`uhid`);
CREATE INDEX `Patient_uhid_idx` ON `Patient`(`uhid`);
