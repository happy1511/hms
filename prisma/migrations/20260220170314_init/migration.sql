-- CreateTable
CREATE TABLE `Location` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `city` VARCHAR(191) NOT NULL,
    `state` VARCHAR(191) NOT NULL,
    `country` VARCHAR(191) NOT NULL,
    `postcode` VARCHAR(191) NOT NULL,

    INDEX `Location_city_idx`(`city`),
    INDEX `Location_postcode_idx`(`postcode`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Action` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` ENUM('CREATE', 'UPDATE', 'DELETE', 'PRINT', 'VIEW') NOT NULL,

    UNIQUE INDEX `Action_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Module` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` ENUM('USER', 'DOCTOR_MASTER', 'FLOOR_MASTER', 'WARD_MASTER', 'BED_MASTER', 'APPOINTMENT', 'PATIENT_MASTER', 'BILLING_SECTION_MASTER', 'SERVICE_MASTER', 'PATHOLOGY_TEST_MASTER', 'RADIOLOGY_TEST_MASTER', 'OPD_BILL', 'OPD_QUEUE', 'PATHOLOGY_ORDER', 'LOCATION_MASTER') NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `Module_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Permission` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `moduleId` INTEGER NOT NULL,
    `actionId` INTEGER NOT NULL,

    UNIQUE INDEX `Permission_moduleId_actionId_key`(`moduleId`, `actionId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `UserPermission` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `permissionId` INTEGER NOT NULL,

    UNIQUE INDEX `UserPermission_permissionId_userId_key`(`permissionId`, `userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `User` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `username` VARCHAR(191) NOT NULL,
    `loginId` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `status` ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
    `name` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `User_username_key`(`username`),
    UNIQUE INDEX `User_loginId_key`(`loginId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Doctor` (
    `userId` INTEGER NOT NULL,
    `licenseNumber` VARCHAR(191) NOT NULL,
    `specialization` VARCHAR(191) NOT NULL,
    `qualifications` VARCHAR(191) NOT NULL,
    `yearsExperience` INTEGER NOT NULL,
    `Department` VARCHAR(191) NULL,
    `designation` VARCHAR(191) NULL,
    `doctorType` ENUM('referring', 'consulting') NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `phoneNumber` VARCHAR(191) NOT NULL,
    `emergencyContact` VARCHAR(191) NULL,
    `consultationStartingTime` VARCHAR(191) NULL,
    `consultationEndingTime` VARCHAR(191) NULL,

    UNIQUE INDEX `Doctor_licenseNumber_key`(`licenseNumber`),
    UNIQUE INDEX `Doctor_email_key`(`email`),
    UNIQUE INDEX `Doctor_phoneNumber_key`(`phoneNumber`),
    PRIMARY KEY (`userId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `DoctorAvailableDay` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `doctorId` INTEGER NOT NULL,
    `day` ENUM('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday') NOT NULL,

    UNIQUE INDEX `DoctorAvailableDay_doctorId_day_key`(`doctorId`, `day`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PatientContact` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `type` ENUM('EMAIL', 'PHONE', 'MOBILE') NOT NULL,
    `value` VARCHAR(191) NOT NULL,
    `patientId` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `emergencyContact` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `contact` VARCHAR(191) NOT NULL,
    `relation` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NULL,
    `patientId` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PatientNotes` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `type` VARCHAR(191) NOT NULL,
    `note` VARCHAR(191) NOT NULL,
    `patientId` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PatientRelations` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `type` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `contact` VARCHAR(191) NULL,
    `patientId` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PatientAddress` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `type` VARCHAR(191) NOT NULL,
    `country` VARCHAR(191) NOT NULL,
    `addressLineOne` VARCHAR(191) NOT NULL,
    `addressLineTwo` VARCHAR(191) NULL,
    `addressLineThree` VARCHAR(191) NULL,
    `city` VARCHAR(191) NOT NULL,
    `state` VARCHAR(191) NOT NULL,
    `postalCode` VARCHAR(191) NOT NULL,
    `patientId` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PatientIdentification` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `type` ENUM('Passport', 'DriverLicense', 'NationalID') NOT NULL,
    `number` VARCHAR(191) NOT NULL,
    `active` ENUM('active', 'inactive') NOT NULL,
    `patientId` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Patient` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `uhid` VARCHAR(191) NOT NULL,
    `firstName` VARCHAR(191) NOT NULL,
    `middleName` VARCHAR(191) NULL,
    `lastName` VARCHAR(191) NOT NULL,
    `preferredName` VARCHAR(191) NOT NULL,
    `dob` DATETIME(3) NOT NULL,
    `identificationMark` VARCHAR(191) NULL,
    `gender` ENUM('Male', 'Female', 'Other') NOT NULL,
    `maritalStatus` ENUM('Single', 'Married', 'Divorced', 'Widowed') NOT NULL,
    `religion` VARCHAR(191) NOT NULL,
    `bloodGroup` ENUM('A_PLUS', 'A_NEGATIVE', 'B_PLUS', 'B_NEGATIVE', 'AB_PLUS', 'AB_NEGATIVE', 'O_PLUS', 'O_NEGATIVE') NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Patient_uhid_key`(`uhid`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Floor` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `status` ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Floor_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Ward` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `departmentId` INTEGER NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `status` ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Ward_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Bed` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `wardId` INTEGER NOT NULL,
    `bedNumber` VARCHAR(191) NOT NULL,
    `status` ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
    `occupied` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Appointment` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `patientId` INTEGER NOT NULL,
    `doctorId` INTEGER NOT NULL,
    `appointmentDate` DATETIME(3) NOT NULL,
    `remarks` VARCHAR(191) NULL,
    `type` ENUM('CONSULTATION', 'CONTRACEPTION', 'EDD', 'EYE_CARE', 'GETTING_STARTED', 'MAMMOGRAMS', 'OPERATION', 'OTHER', 'ROUTINE_CHECKUP', 'SAME_DAY_ASSISTANCE', 'SICK_VISIT', 'SURGERY', 'TRAVEL_CLINIC', 'VACCINATIONS') NOT NULL,
    `status` ENUM('SCHEDULED', 'COMPLETED', 'CANCELLED', 'NO_SHOW', 'RESCHEDULED') NOT NULL DEFAULT 'SCHEDULED',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PathologyTest` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `alias` VARCHAR(191) NOT NULL,
    `price` DOUBLE NOT NULL,
    `status` ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
    `section` ENUM('BIOCHEMISTRY', 'CLINICAL_PATHOLOGY', 'COAGULATION', 'CYTOGENETICS', 'CYTOPATHOLOGY', 'HAEMATOLOGY', 'HISTOPATHOLOGY', 'HORMONES_IMMUNOLOGY', 'IMMUNOASSAY', 'IMMUNOFLUORESCENCE', 'MICROBIOLOGY', 'MOLECULAR_BIOLOGY', 'NEPHELOMETRY', 'SEROLOGY', 'TRANSFUSION_MEDICINE') NOT NULL,
    `container` ENUM('CLOT_ACTIVATOR', 'EDTA', 'EDTA_CLOT_ACTIVATOR', 'EDTA_CITRATE_ACTIVATOR', 'SODIUM_CITRATE_3_2', 'OTHER') NOT NULL,
    `sampleType` ENUM('CSF', 'ASCITIC_FLUID', 'OTHER', 'PERICARDIAL_FLUID', 'PERITONEAL_FLUID', 'PLASMA', 'PLEURAL_FLUID', 'PUS', 'SEMEN', 'SERUM', 'SPUTUM', 'STOOL', 'SYNOVIAL_FLUID', 'URINE', 'WHOLE_BLOOD', 'WHOLE_BLOOD_SERUM') NOT NULL,
    `footerNotes` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `PathologyTest_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PathologyTestHeader` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `note` VARCHAR(191) NULL,
    `displayOrder` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `testId` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PathologyTestParameter` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `headerId` INTEGER NULL,
    `name` VARCHAR(191) NOT NULL,
    `displayOrder` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `testId` INTEGER NULL,
    `isDescriptiveOnly` BOOLEAN NOT NULL DEFAULT false,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ParameterOptions` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `testParameterId` INTEGER NOT NULL,
    `value` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ReferenceRange` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `testParameterId` INTEGER NOT NULL,
    `applicableGender` ENUM('MALE', 'FEMALE', 'Both') NOT NULL,
    `lowerDay` VARCHAR(191) NULL,
    `upperDay` VARCHAR(191) NULL,
    `lowerMonth` VARCHAR(191) NULL,
    `upperMonth` VARCHAR(191) NULL,
    `lowerYear` VARCHAR(191) NULL,
    `upperYear` VARCHAR(191) NULL,
    `lowerRange` VARCHAR(191) NULL,
    `upperRange` VARCHAR(191) NULL,
    `unit` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PathologyTestOrder` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `opdId` INTEGER NOT NULL,
    `patientId` INTEGER NOT NULL,
    `testId` INTEGER NOT NULL,
    `sampleTakenAt` DATETIME(3) NULL,
    `resultEnteredAt` DATETIME(3) NULL,
    `verifiedAt` DATETIME(3) NULL,
    `sampleTakenById` INTEGER NULL,
    `resultEnteredById` INTEGER NULL,
    `verifiedById` INTEGER NULL,
    `cancelledById` INTEGER NULL,
    `isOutSourced` BOOLEAN NOT NULL DEFAULT false,
    `isCancelled` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `status` ENUM('SAMPLE_PENDING', 'RESULT_PENDING', 'COMPLETED') NOT NULL DEFAULT 'SAMPLE_PENDING',

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PathologyTestResult` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `orderId` INTEGER NOT NULL,
    `parameterId` INTEGER NOT NULL,
    `numericValue` DOUBLE NULL,
    `textValue` VARCHAR(191) NULL,
    `optionId` INTEGER NULL,
    `remark` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `RadiologyTest` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `alias` VARCHAR(191) NOT NULL,
    `price` DOUBLE NOT NULL,
    `status` ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
    `section` ENUM('COAGULATION', 'CT_SCAN', 'CYTOGENETICS', 'CYTOPATHOLOGY', 'HISTOPATHOLOGY', 'IMMUNOASSAY', 'IMMUNOFLUORESCENCE', 'MICROBIOLOGY', 'MOLECULAR_BIOLOGY', 'MRI', 'NEPHELOMETRY', 'SONOGRAPHY_ULTRASOUND', 'TRANSFUSION_MEDICINE', 'X_RAY') NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `RadiologyTest_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `RadiologyTemplate` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `section` ENUM('COAGULATION', 'CT_SCAN', 'CYTOGENETICS', 'CYTOPATHOLOGY', 'HISTOPATHOLOGY', 'IMMUNOASSAY', 'IMMUNOFLUORESCENCE', 'MICROBIOLOGY', 'MOLECULAR_BIOLOGY', 'MRI', 'NEPHELOMETRY', 'SONOGRAPHY_ULTRASOUND', 'TRANSFUSION_MEDICINE', 'X_RAY') NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `content` VARCHAR(191) NOT NULL,
    `status` ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `radiologyTestId` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `BillingSection` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `status` ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
    `isPathologyTest` BOOLEAN NOT NULL DEFAULT false,
    `isRadiologyTest` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `BillingSection_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Service` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `type` ENUM('LAB_TEST', 'RADIOLOGY_TEST', 'CLINICAL_TEST', 'OTHER') NOT NULL,
    `price` DOUBLE NOT NULL,
    `discountAvailable` BOOLEAN NOT NULL DEFAULT false,
    `maxDiscount` DOUBLE NULL,
    `applicableOn` ENUM('INPATIENT', 'OUTPATIENT', 'CONSULTATION', 'BOTH') NOT NULL DEFAULT 'BOTH',
    `status` ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Service_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `BillingSectionService` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `billingSectionId` INTEGER NOT NULL,
    `serviceId` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `BillingSectionService_billingSectionId_serviceId_key`(`billingSectionId`, `serviceId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PathologyTestService` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `testId` INTEGER NOT NULL,
    `serviceId` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `PathologyTestService_testId_serviceId_key`(`testId`, `serviceId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `RadiologyTestService` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `testId` INTEGER NOT NULL,
    `serviceId` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `RadiologyTestService_testId_serviceId_key`(`testId`, `serviceId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Transaction` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `opdId` INTEGER NULL,
    `amount` DOUBLE NOT NULL,
    `mode` ENUM('PAYMENT_MODE_DEFAULT', 'CASH', 'CARD_PAYMENT', 'CHEQUE', 'DIGITAL_WALLET', 'INSURANCE', 'INTERNAL_ADJUSTMENTS', 'LOYALTY_CARD', 'NEFT', 'RTGS', 'TDS_AYUSHMAN_BHARAT', 'TDS_CHIRANJIVI_YOJNA', 'TDS_OTHERS', 'TDS', 'OTHER') NOT NULL,
    `remarks` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `receivedById` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PrescribedDrugs` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `frequency` INTEGER NOT NULL,
    `days` INTEGER NOT NULL,
    `remarks` VARCHAR(191) NULL,
    `prescriptionId` INTEGER NOT NULL,
    `opdId` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Prescription` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `opdId` INTEGER NOT NULL,
    `followUpAfterDays` INTEGER NULL,
    `followUpDate` DATETIME(3) NULL,
    `followUpAdvice` VARCHAR(191) NULL,
    `otherAdvice` VARCHAR(191) NULL,

    UNIQUE INDEX `Prescription_opdId_key`(`opdId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Vital` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `opdId` INTEGER NOT NULL,
    `height` INTEGER NULL,
    `weight` INTEGER NULL,
    `bpMm` INTEGER NULL,
    `bpHg` INTEGER NULL,
    `pulse` INTEGER NULL,
    `rbs` INTEGER NULL,
    `rr` INTEGER NULL,
    `spo2` INTEGER NULL,
    `temp` INTEGER NULL,

    UNIQUE INDEX `Vital_opdId_key`(`opdId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AdvisedPathologyTests` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `testId` INTEGER NOT NULL,
    `consultationId` INTEGER NOT NULL,
    `opdId` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AdvisedRadiologyTests` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `testId` INTEGER NOT NULL,
    `consultationId` INTEGER NOT NULL,
    `opdId` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `OpdConsultation` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `opdId` INTEGER NOT NULL,
    `vitalsId` INTEGER NOT NULL,
    `notes` VARCHAR(191) NULL,
    `generalExaminations` VARCHAR(191) NULL,
    `systemicExaminations` VARCHAR(191) NULL,
    `diagnosis` VARCHAR(191) NULL,
    `chronicIllness` VARCHAR(191) NULL,

    UNIQUE INDEX `OpdConsultation_opdId_key`(`opdId`),
    UNIQUE INDEX `OpdConsultation_vitalsId_key`(`vitalsId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Opd` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `patientId` INTEGER NOT NULL,
    `arrivalState` ENUM('ROUTINE', 'APPOINTMENT', 'FOLLOW_UP', 'EMERGENCY', 'AYUSHMAN_NEW_IP', 'AYUSHMAN_IP_FIRST', 'AYUSHMAN_IP_SECOND', 'AYUSHMAN_IP_THIRD', 'OTHER') NOT NULL,
    `remarks` VARCHAR(191) NULL,
    `rate` DOUBLE NOT NULL,
    `discountType` ENUM('PERCENTAGE', 'VALUE') NOT NULL,
    `discountValue` DOUBLE NOT NULL,
    `total` DOUBLE NOT NULL,
    `isPaid` BOOLEAN NOT NULL DEFAULT false,
    `isFree` BOOLEAN NOT NULL DEFAULT false,
    `consultantDoctorId` INTEGER NOT NULL,
    `referringDoctorId` INTEGER NULL,
    `billingType` ENUM('CASHLESS_INSURANCE', 'CORPORATE_AFFILIATION', 'AYUSHMAN_BHARAT', 'CGHS', 'RGHS', 'CHIRANJIVI_YOJNA', 'GOVERNMENT_BENEFITS', 'NOT_DETERMINED', 'SELF_PAY', 'DO_NOT_CONSIDER') NOT NULL,
    `isInQueue` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `OpdBillingItem` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `opdId` INTEGER NOT NULL,
    `billingSectionId` INTEGER NOT NULL,
    `serviceId` INTEGER NOT NULL,
    `quantity` INTEGER NOT NULL,
    `rate` DOUBLE NOT NULL,
    `discountType` ENUM('PERCENTAGE', 'VALUE') NOT NULL,
    `discountValue` DOUBLE NOT NULL,
    `total` DOUBLE NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Permission` ADD CONSTRAINT `Permission_moduleId_fkey` FOREIGN KEY (`moduleId`) REFERENCES `Module`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Permission` ADD CONSTRAINT `Permission_actionId_fkey` FOREIGN KEY (`actionId`) REFERENCES `Action`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `UserPermission` ADD CONSTRAINT `UserPermission_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `UserPermission` ADD CONSTRAINT `UserPermission_permissionId_fkey` FOREIGN KEY (`permissionId`) REFERENCES `Permission`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Doctor` ADD CONSTRAINT `Doctor_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DoctorAvailableDay` ADD CONSTRAINT `DoctorAvailableDay_doctorId_fkey` FOREIGN KEY (`doctorId`) REFERENCES `Doctor`(`userId`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PatientContact` ADD CONSTRAINT `PatientContact_patientId_fkey` FOREIGN KEY (`patientId`) REFERENCES `Patient`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `emergencyContact` ADD CONSTRAINT `emergencyContact_patientId_fkey` FOREIGN KEY (`patientId`) REFERENCES `Patient`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PatientNotes` ADD CONSTRAINT `PatientNotes_patientId_fkey` FOREIGN KEY (`patientId`) REFERENCES `Patient`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PatientRelations` ADD CONSTRAINT `PatientRelations_patientId_fkey` FOREIGN KEY (`patientId`) REFERENCES `Patient`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PatientAddress` ADD CONSTRAINT `PatientAddress_patientId_fkey` FOREIGN KEY (`patientId`) REFERENCES `Patient`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PatientIdentification` ADD CONSTRAINT `PatientIdentification_patientId_fkey` FOREIGN KEY (`patientId`) REFERENCES `Patient`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Ward` ADD CONSTRAINT `Ward_departmentId_fkey` FOREIGN KEY (`departmentId`) REFERENCES `Floor`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Bed` ADD CONSTRAINT `Bed_wardId_fkey` FOREIGN KEY (`wardId`) REFERENCES `Ward`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Appointment` ADD CONSTRAINT `Appointment_patientId_fkey` FOREIGN KEY (`patientId`) REFERENCES `Patient`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Appointment` ADD CONSTRAINT `Appointment_doctorId_fkey` FOREIGN KEY (`doctorId`) REFERENCES `Doctor`(`userId`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PathologyTestHeader` ADD CONSTRAINT `PathologyTestHeader_testId_fkey` FOREIGN KEY (`testId`) REFERENCES `PathologyTest`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PathologyTestParameter` ADD CONSTRAINT `PathologyTestParameter_headerId_fkey` FOREIGN KEY (`headerId`) REFERENCES `PathologyTestHeader`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PathologyTestParameter` ADD CONSTRAINT `PathologyTestParameter_testId_fkey` FOREIGN KEY (`testId`) REFERENCES `PathologyTest`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ParameterOptions` ADD CONSTRAINT `ParameterOptions_testParameterId_fkey` FOREIGN KEY (`testParameterId`) REFERENCES `PathologyTestParameter`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ReferenceRange` ADD CONSTRAINT `ReferenceRange_testParameterId_fkey` FOREIGN KEY (`testParameterId`) REFERENCES `PathologyTestParameter`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PathologyTestOrder` ADD CONSTRAINT `PathologyTestOrder_verifiedById_fkey` FOREIGN KEY (`verifiedById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PathologyTestOrder` ADD CONSTRAINT `PathologyTestOrder_resultEnteredById_fkey` FOREIGN KEY (`resultEnteredById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PathologyTestOrder` ADD CONSTRAINT `PathologyTestOrder_sampleTakenById_fkey` FOREIGN KEY (`sampleTakenById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PathologyTestOrder` ADD CONSTRAINT `PathologyTestOrder_cancelledById_fkey` FOREIGN KEY (`cancelledById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PathologyTestOrder` ADD CONSTRAINT `PathologyTestOrder_patientId_fkey` FOREIGN KEY (`patientId`) REFERENCES `Patient`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PathologyTestOrder` ADD CONSTRAINT `PathologyTestOrder_testId_fkey` FOREIGN KEY (`testId`) REFERENCES `PathologyTest`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PathologyTestOrder` ADD CONSTRAINT `PathologyTestOrder_opdId_fkey` FOREIGN KEY (`opdId`) REFERENCES `Opd`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PathologyTestResult` ADD CONSTRAINT `PathologyTestResult_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `PathologyTestOrder`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PathologyTestResult` ADD CONSTRAINT `PathologyTestResult_parameterId_fkey` FOREIGN KEY (`parameterId`) REFERENCES `PathologyTestParameter`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RadiologyTemplate` ADD CONSTRAINT `RadiologyTemplate_radiologyTestId_fkey` FOREIGN KEY (`radiologyTestId`) REFERENCES `RadiologyTest`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `BillingSectionService` ADD CONSTRAINT `BillingSectionService_billingSectionId_fkey` FOREIGN KEY (`billingSectionId`) REFERENCES `BillingSection`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `BillingSectionService` ADD CONSTRAINT `BillingSectionService_serviceId_fkey` FOREIGN KEY (`serviceId`) REFERENCES `Service`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PathologyTestService` ADD CONSTRAINT `PathologyTestService_testId_fkey` FOREIGN KEY (`testId`) REFERENCES `PathologyTest`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PathologyTestService` ADD CONSTRAINT `PathologyTestService_serviceId_fkey` FOREIGN KEY (`serviceId`) REFERENCES `Service`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RadiologyTestService` ADD CONSTRAINT `RadiologyTestService_testId_fkey` FOREIGN KEY (`testId`) REFERENCES `RadiologyTest`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RadiologyTestService` ADD CONSTRAINT `RadiologyTestService_serviceId_fkey` FOREIGN KEY (`serviceId`) REFERENCES `Service`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Transaction` ADD CONSTRAINT `Transaction_receivedById_fkey` FOREIGN KEY (`receivedById`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Transaction` ADD CONSTRAINT `Transaction_opdId_fkey` FOREIGN KEY (`opdId`) REFERENCES `Opd`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PrescribedDrugs` ADD CONSTRAINT `PrescribedDrugs_prescriptionId_fkey` FOREIGN KEY (`prescriptionId`) REFERENCES `Prescription`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PrescribedDrugs` ADD CONSTRAINT `PrescribedDrugs_opdId_fkey` FOREIGN KEY (`opdId`) REFERENCES `Opd`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Prescription` ADD CONSTRAINT `Prescription_opdId_fkey` FOREIGN KEY (`opdId`) REFERENCES `Opd`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Vital` ADD CONSTRAINT `Vital_opdId_fkey` FOREIGN KEY (`opdId`) REFERENCES `Opd`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AdvisedPathologyTests` ADD CONSTRAINT `AdvisedPathologyTests_testId_fkey` FOREIGN KEY (`testId`) REFERENCES `PathologyTest`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AdvisedPathologyTests` ADD CONSTRAINT `AdvisedPathologyTests_consultationId_fkey` FOREIGN KEY (`consultationId`) REFERENCES `OpdConsultation`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AdvisedPathologyTests` ADD CONSTRAINT `AdvisedPathologyTests_opdId_fkey` FOREIGN KEY (`opdId`) REFERENCES `Opd`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AdvisedRadiologyTests` ADD CONSTRAINT `AdvisedRadiologyTests_testId_fkey` FOREIGN KEY (`testId`) REFERENCES `RadiologyTest`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AdvisedRadiologyTests` ADD CONSTRAINT `AdvisedRadiologyTests_consultationId_fkey` FOREIGN KEY (`consultationId`) REFERENCES `OpdConsultation`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AdvisedRadiologyTests` ADD CONSTRAINT `AdvisedRadiologyTests_opdId_fkey` FOREIGN KEY (`opdId`) REFERENCES `Opd`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OpdConsultation` ADD CONSTRAINT `OpdConsultation_opdId_fkey` FOREIGN KEY (`opdId`) REFERENCES `Opd`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OpdConsultation` ADD CONSTRAINT `OpdConsultation_vitalsId_fkey` FOREIGN KEY (`vitalsId`) REFERENCES `Vital`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Opd` ADD CONSTRAINT `Opd_consultantDoctorId_fkey` FOREIGN KEY (`consultantDoctorId`) REFERENCES `Doctor`(`userId`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Opd` ADD CONSTRAINT `Opd_referringDoctorId_fkey` FOREIGN KEY (`referringDoctorId`) REFERENCES `Doctor`(`userId`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Opd` ADD CONSTRAINT `Opd_patientId_fkey` FOREIGN KEY (`patientId`) REFERENCES `Patient`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OpdBillingItem` ADD CONSTRAINT `OpdBillingItem_opdId_fkey` FOREIGN KEY (`opdId`) REFERENCES `Opd`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OpdBillingItem` ADD CONSTRAINT `OpdBillingItem_billingSectionId_fkey` FOREIGN KEY (`billingSectionId`) REFERENCES `BillingSection`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OpdBillingItem` ADD CONSTRAINT `OpdBillingItem_serviceId_fkey` FOREIGN KEY (`serviceId`) REFERENCES `Service`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
