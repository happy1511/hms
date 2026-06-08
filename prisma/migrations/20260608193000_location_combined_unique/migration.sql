CREATE TEMPORARY TABLE `Location_duplicate_keep` AS
SELECT
    MIN(`id`) AS `keepId`,
    `city`,
    `state`,
    `country`,
    `postcode`,
    `postName`
FROM `Location`
GROUP BY `city`, `state`, `country`, `postcode`, `postName`
HAVING COUNT(*) > 1;

CREATE TEMPORARY TABLE `Location_duplicate_map` AS
SELECT
    `Location`.`id` AS `duplicateId`,
    `Location_duplicate_keep`.`keepId`
FROM `Location`
INNER JOIN `Location_duplicate_keep`
    ON `Location`.`city` = `Location_duplicate_keep`.`city`
    AND `Location`.`state` = `Location_duplicate_keep`.`state`
    AND `Location`.`country` = `Location_duplicate_keep`.`country`
    AND `Location`.`postcode` = `Location_duplicate_keep`.`postcode`
    AND `Location`.`postName` = `Location_duplicate_keep`.`postName`
WHERE `Location`.`id` <> `Location_duplicate_keep`.`keepId`;

UPDATE `PatientAddress`
INNER JOIN `Location_duplicate_map`
    ON `PatientAddress`.`locationId` = `Location_duplicate_map`.`duplicateId`
SET `PatientAddress`.`locationId` = `Location_duplicate_map`.`keepId`;

DELETE `Location`
FROM `Location`
INNER JOIN `Location_duplicate_map`
    ON `Location`.`id` = `Location_duplicate_map`.`duplicateId`;

DROP TEMPORARY TABLE `Location_duplicate_map`;
DROP TEMPORARY TABLE `Location_duplicate_keep`;

ALTER TABLE `Location`
    MODIFY `city` VARCHAR(100) NOT NULL,
    MODIFY `state` VARCHAR(100) NOT NULL,
    MODIFY `country` VARCHAR(100) NOT NULL,
    MODIFY `postcode` VARCHAR(20) NOT NULL,
    MODIFY `postName` VARCHAR(191) NOT NULL DEFAULT '';

CREATE UNIQUE INDEX `Location_city_state_country_postcode_postName_key` ON `Location`(`city`, `state`, `country`, `postcode`, `postName`);
