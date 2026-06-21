-- Add RoleType enum-backed column to users with a safe default for existing rows.
ALTER TABLE `User`
    ADD COLUMN `roleType` ENUM(
        'DOCTOR',
        'NURSE',
        'PHARMACIST',
        'LAB_TECHNICIAN',
        'RECEPTIONIST',
        'ACCOUNTANT'
    ) NOT NULL DEFAULT 'RECEPTIONIST' AFTER `title`;
