ALTER TABLE `InventoryItems` DROP FOREIGN KEY `InventoryItems_hsnSacCode_fkey`;
ALTER TABLE `ChallanItem` DROP FOREIGN KEY `ChallanItem_hsnSacCode_fkey`;
ALTER TABLE `PurchaseItem` DROP FOREIGN KEY `PurchaseItem_hsnSacCode_fkey`;

ALTER TABLE `InventoryItems` CHANGE COLUMN `hsnSacCode` `hsnSacId` INTEGER NULL;
ALTER TABLE `ChallanItem` CHANGE COLUMN `hsnSacCode` `hsnSacId` INTEGER NULL;
ALTER TABLE `PurchaseItem` CHANGE COLUMN `hsnSacCode` `hsnSacId` INTEGER NULL;

UPDATE `InventoryItems` inventory
LEFT JOIN (
  SELECT `code`, MIN(`id`) AS `id`
  FROM `HsnSac`
  GROUP BY `code`
) hsn ON hsn.`code` = inventory.`hsnSacId`
SET inventory.`hsnSacId` = hsn.`id`
WHERE inventory.`hsnSacId` IS NOT NULL;

UPDATE `ChallanItem` challanItem
LEFT JOIN (
  SELECT `code`, MIN(`id`) AS `id`
  FROM `HsnSac`
  GROUP BY `code`
) hsn ON hsn.`code` = challanItem.`hsnSacId`
SET challanItem.`hsnSacId` = hsn.`id`
WHERE challanItem.`hsnSacId` IS NOT NULL;

UPDATE `PurchaseItem` purchaseItem
LEFT JOIN (
  SELECT `code`, MIN(`id`) AS `id`
  FROM `HsnSac`
  GROUP BY `code`
) hsn ON hsn.`code` = purchaseItem.`hsnSacId`
SET purchaseItem.`hsnSacId` = hsn.`id`
WHERE purchaseItem.`hsnSacId` IS NOT NULL;

ALTER TABLE `InventoryItems`
  ADD CONSTRAINT `InventoryItems_hsnSacId_fkey`
  FOREIGN KEY (`hsnSacId`) REFERENCES `HsnSac`(`id`)
  ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE `ChallanItem`
  ADD CONSTRAINT `ChallanItem_hsnSacId_fkey`
  FOREIGN KEY (`hsnSacId`) REFERENCES `HsnSac`(`id`)
  ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE `PurchaseItem`
  ADD CONSTRAINT `PurchaseItem_hsnSacId_fkey`
  FOREIGN KEY (`hsnSacId`) REFERENCES `HsnSac`(`id`)
  ON DELETE SET NULL ON UPDATE CASCADE;
