-- CreateTable
CREATE TABLE `Location` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `city` VARCHAR(191) NOT NULL,
    `state` VARCHAR(191) NOT NULL,
    `country` VARCHAR(191) NOT NULL,
    `postcode` VARCHAR(191) NOT NULL,
    `isDeleted` BOOLEAN NOT NULL DEFAULT false,
    `createdBy` INTEGER NULL,
    `updatedBy` INTEGER NULL,
    `deletedBy` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

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
    `name` ENUM('USER', 'DASHBOARD', 'COMPANY_DETAILS', 'DAY_CARE_IPD', 'IPD_MLC', 'DOCTOR_MASTER', 'DEPARTMENT_MASTER', 'ROOM_TYPE_MASTER', 'ROOM_MASTER', 'BED_MASTER', 'APPOINTMENT', 'PATIENT_MASTER', 'BILLING_SECTION_MASTER', 'SERVICE_MASTER', 'PATHOLOGY_TEST_MASTER', 'RADIOLOGY_TEMPLATE_MASTER', 'RADIOLOGY_TEST_MASTER', 'IPD_BILL', 'DISCHARGE_PATIENT', 'CANCEL_DISCHARGE_PATIENT', 'OPD_BILL', 'CONSULTATION_FILE', 'OPD_QUEUE', 'PATHOLOGY_ORDER', 'RADIOLOGY_ORDER', 'LOCATION_MASTER', 'INVOICE', 'FINANCE_BILLING', 'FINANCE_PAYMENTS', 'PHARMACY_SUPPLIER', 'PHARMACY_DRUG_MASTER', 'PHARMACY_HSN_SAC_MASTER', 'PHARMACY_DRUG_CATEGORY_MASTER', 'PHARMACY_PURCHASE_ORDER', 'PHARMACY_GRN', 'PHARMACY_CHALLAN', 'PHARMACY_INVENTORY', 'PHARMACY_SALE_BILL', 'FINANCE_CATEGORY_MASTER', 'INCOME', 'EXPENSE') NOT NULL,
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

    INDEX `Permission_moduleId_idx`(`moduleId`),
    INDEX `Permission_actionId_idx`(`actionId`),
    UNIQUE INDEX `Permission_moduleId_actionId_key`(`moduleId`, `actionId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `UserPermission` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `permissionId` INTEGER NOT NULL,

    INDEX `UserPermission_userId_idx`(`userId`),
    INDEX `UserPermission_permissionId_idx`(`permissionId`),
    UNIQUE INDEX `UserPermission_permissionId_userId_key`(`permissionId`, `userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `User` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `username` VARCHAR(191) NOT NULL,
    `loginId` VARCHAR(191) NOT NULL,
    `title` ENUM('DR', 'MR', 'MS', 'MRS', 'BABY', 'MASTER') NOT NULL DEFAULT 'MR',
    `password` VARCHAR(191) NOT NULL,
    `status` ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
    `isDeleted` BOOLEAN NOT NULL DEFAULT false,
    `name` VARCHAR(191) NULL,
    `firstName` VARCHAR(191) NOT NULL DEFAULT '',
    `middleName` VARCHAR(191) NULL,
    `lastName` VARCHAR(191) NOT NULL DEFAULT '',
    `preferredName` VARCHAR(191) NOT NULL DEFAULT '',
    `gender` ENUM('Male', 'Female', 'Other') NOT NULL DEFAULT 'Other',
    `dob` DATETIME(3) NULL,
    `maritalStatus` ENUM('Single', 'Married', 'Divorced', 'Widowed') NULL,
    `address` VARCHAR(191) NULL,
    `city` VARCHAR(191) NULL,
    `country` VARCHAR(191) NULL,
    `state` VARCHAR(191) NULL,
    `postcode` VARCHAR(191) NULL,
    `contactNumber` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NULL,
    `identityType` ENUM('ADHAR_CARD', 'DRIVING_LICENSE', 'PAN_CARD', 'VOTER_CARD') NULL,
    `identityNumber` VARCHAR(191) NULL,
    `education` VARCHAR(191) NULL,
    `qualifications` VARCHAR(191) NULL,
    `department` VARCHAR(191) NULL,
    `createdBy` INTEGER NULL,
    `updatedBy` INTEGER NULL,
    `deletedBy` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `User_username_key`(`username`),
    UNIQUE INDEX `User_loginId_key`(`loginId`),
    UNIQUE INDEX `User_contactNumber_key`(`contactNumber`),
    INDEX `User_isDeleted_idx`(`isDeleted`),
    INDEX `User_createdAt_idx`(`createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Doctor` (
    `userId` INTEGER NOT NULL,
    `licenseNumber` VARCHAR(191) NULL,
    `specialization` VARCHAR(191) NULL,
    `qualifications` VARCHAR(191) NULL,
    `yearsExperience` INTEGER NULL,
    `department` VARCHAR(191) NULL,
    `designation` VARCHAR(191) NULL,
    `doctorType` ENUM('referring', 'consulting') NOT NULL,
    `consultationCharges` DOUBLE NULL,
    `email` VARCHAR(191) NULL,
    `phoneNumber` VARCHAR(191) NULL,
    `emergencyContact` VARCHAR(191) NULL,
    `consultationStartingTime` VARCHAR(191) NULL,
    `consultationEndingTime` VARCHAR(191) NULL,
    `createdBy` INTEGER NULL,
    `updatedBy` INTEGER NULL,
    `deletedBy` INTEGER NULL,

    UNIQUE INDEX `Doctor_licenseNumber_key`(`licenseNumber`),
    UNIQUE INDEX `Doctor_email_key`(`email`),
    UNIQUE INDEX `Doctor_phoneNumber_key`(`phoneNumber`),
    INDEX `Doctor_createdBy_idx`(`createdBy`),
    INDEX `Doctor_updatedBy_idx`(`updatedBy`),
    INDEX `Doctor_userId_idx`(`userId`),
    PRIMARY KEY (`userId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `DoctorAvailableDay` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `doctorId` INTEGER NOT NULL,
    `day` ENUM('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday') NOT NULL,

    INDEX `DoctorAvailableDay_doctorId_idx`(`doctorId`),
    UNIQUE INDEX `DoctorAvailableDay_doctorId_day_key`(`doctorId`, `day`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PatientContact` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `type` ENUM('EMAIL', 'PHONE', 'MOBILE') NOT NULL,
    `value` VARCHAR(191) NOT NULL,
    `patientId` INTEGER NOT NULL,

    INDEX `PatientContact_patientId_idx`(`patientId`),
    UNIQUE INDEX `PatientContact_type_patientId_key`(`type`, `patientId`),
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

    INDEX `emergencyContact_patientId_idx`(`patientId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PatientNotes` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `type` VARCHAR(191) NOT NULL,
    `note` VARCHAR(191) NOT NULL,
    `patientId` INTEGER NOT NULL,

    INDEX `PatientNotes_patientId_idx`(`patientId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PatientRelations` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `type` ENUM('NONE', 'WIFE_OF', 'HUSBAND_OF', 'SON_OF', 'DAUGHTER_OF', 'BROTHER_OF', 'SISTER_OF', 'FATHER_OF', 'MOTHER_OF', 'OTHER') NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `contact` VARCHAR(191) NULL,
    `patientId` INTEGER NOT NULL,

    INDEX `PatientRelations_patientId_idx`(`patientId`),
    UNIQUE INDEX `PatientRelations_patientId_name_type_key`(`patientId`, `name`, `type`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PatientAddress` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `type` ENUM('BILLING', 'CONTACT', 'BUSINESS', 'HOME', 'POSTAL', 'SHIPPING') NOT NULL DEFAULT 'HOME',
    `addressLineOne` VARCHAR(191) NOT NULL,
    `addressLineTwo` VARCHAR(191) NULL,
    `addressLineThree` VARCHAR(191) NULL,
    `patientId` INTEGER NOT NULL,
    `locationId` INTEGER NULL,

    INDEX `PatientAddress_patientId_idx`(`patientId`),
    INDEX `PatientAddress_locationId_idx`(`locationId`),
    UNIQUE INDEX `PatientAddress_type_patientId_key`(`type`, `patientId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PatientIdentification` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `type` ENUM('ADHAR_CARD', 'DRIVING_LICENSE', 'PAN_CARD', 'VOTER_CARD') NOT NULL,
    `number` VARCHAR(191) NOT NULL,
    `active` ENUM('active', 'inactive') NOT NULL,
    `patientId` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `PatientIdentification_patientId_idx`(`patientId`),
    UNIQUE INDEX `PatientIdentification_type_patientId_key`(`type`, `patientId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Patient` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `title` ENUM('DR', 'MR', 'MS', 'MRS', 'BABY', 'MASTER') NOT NULL,
    `firstName` VARCHAR(191) NOT NULL,
    `middleName` VARCHAR(191) NULL,
    `lastName` VARCHAR(191) NOT NULL,
    `preferredName` VARCHAR(191) NULL,
    `dob` DATETIME(3) NOT NULL,
    `identificationMark` VARCHAR(191) NULL,
    `gender` ENUM('Male', 'Female', 'Other') NOT NULL,
    `maritalStatus` ENUM('Single', 'Married', 'Divorced', 'Widowed') NULL,
    `religion` VARCHAR(191) NULL,
    `bloodGroup` ENUM('A_PLUS', 'A_NEGATIVE', 'B_PLUS', 'B_NEGATIVE', 'AB_PLUS', 'AB_NEGATIVE', 'O_PLUS', 'O_NEGATIVE') NULL,
    `createdBy` INTEGER NULL,
    `updatedBy` INTEGER NULL,
    `deletedBy` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Patient_createdAt_idx`(`createdAt`),
    INDEX `Patient_createdBy_idx`(`createdBy`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Department` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `status` ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
    `isDeleted` BOOLEAN NOT NULL DEFAULT false,
    `createdBy` INTEGER NULL,
    `updatedBy` INTEGER NULL,
    `deletedBy` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Department_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `RoomType` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `departmentId` INTEGER NOT NULL,
    `status` ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
    `isDeleted` BOOLEAN NOT NULL DEFAULT false,
    `createdBy` INTEGER NULL,
    `updatedBy` INTEGER NULL,
    `deletedBy` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `RoomType_name_key`(`name`),
    INDEX `RoomType_departmentId_idx`(`departmentId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Room` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `roomTypeId` INTEGER NOT NULL,
    `price` DOUBLE NOT NULL DEFAULT 0,
    `status` ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
    `isDeleted` BOOLEAN NOT NULL DEFAULT false,
    `createdBy` INTEGER NULL,
    `updatedBy` INTEGER NULL,
    `deletedBy` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Room_name_key`(`name`),
    INDEX `Room_roomTypeId_idx`(`roomTypeId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Bed` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `roomId` INTEGER NOT NULL,
    `patientId` INTEGER NULL,
    `currentIpdId` INTEGER NULL,
    `bedNumber` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NULL,
    `status` ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
    `createdBy` INTEGER NULL,
    `updatedBy` INTEGER NULL,
    `deletedBy` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `isOccupied` BOOLEAN NOT NULL DEFAULT false,
    `isDeleted` BOOLEAN NOT NULL DEFAULT false,

    UNIQUE INDEX `Bed_currentIpdId_key`(`currentIpdId`),
    INDEX `Bed_roomId_idx`(`roomId`),
    INDEX `Bed_currentIpdId_idx`(`currentIpdId`),
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
    `createdBy` INTEGER NULL,
    `updatedBy` INTEGER NULL,
    `deletedBy` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Appointment_patientId_idx`(`patientId`),
    INDEX `Appointment_appointmentDate_idx`(`appointmentDate`),
    INDEX `Appointment_doctorId_idx`(`doctorId`),
    INDEX `Appointment_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PathologyTest` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `alias` VARCHAR(191) NOT NULL,
    `price` DOUBLE NOT NULL,
    `status` ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
    `isDeleted` BOOLEAN NOT NULL DEFAULT false,
    `section` ENUM('BIOCHEMISTRY', 'CLINICAL_PATHOLOGY', 'COAGULATION', 'CYTOGENETICS', 'CYTOPATHOLOGY', 'HAEMATOLOGY', 'HISTOPATHOLOGY', 'HORMONES_IMMUNOLOGY', 'IMMUNOASSAY', 'IMMUNOFLUORESCENCE', 'MICROBIOLOGY', 'MOLECULAR_BIOLOGY', 'NEPHELOMETRY', 'SEROLOGY', 'TRANSFUSION_MEDICINE') NOT NULL,
    `container` ENUM('CLOT_ACTIVATOR', 'EDTA', 'EDTA_CLOT_ACTIVATOR', 'EDTA_CITRATE_ACTIVATOR', 'SODIUM_CITRATE_3_2', 'OTHER') NOT NULL,
    `sampleType` ENUM('CSF', 'ASCITIC_FLUID', 'OTHER', 'PERICARDIAL_FLUID', 'PERITONEAL_FLUID', 'PLASMA', 'PLEURAL_FLUID', 'PUS', 'SEMEN', 'SERUM', 'SPUTUM', 'STOOL', 'SYNOVIAL_FLUID', 'URINE', 'WHOLE_BLOOD', 'WHOLE_BLOOD_SERUM') NOT NULL,
    `footerNotes` VARCHAR(191) NULL,
    `createdBy` INTEGER NULL,
    `updatedBy` INTEGER NULL,
    `deletedBy` INTEGER NULL,
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
    `createdBy` INTEGER NULL,
    `updatedBy` INTEGER NULL,
    `deletedBy` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `isDeleted` BOOLEAN NOT NULL DEFAULT false,
    `testId` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PathologyTestParameter` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `headerId` INTEGER NULL,
    `name` VARCHAR(191) NOT NULL,
    `displayOrder` INTEGER NOT NULL,
    `createdBy` INTEGER NULL,
    `updatedBy` INTEGER NULL,
    `deletedBy` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `testId` INTEGER NULL,
    `isDescriptiveOnly` BOOLEAN NOT NULL DEFAULT false,
    `isDeleted` BOOLEAN NOT NULL DEFAULT false,

    INDEX `PathologyTestParameter_testId_idx`(`testId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ParameterOptions` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `testParameterId` INTEGER NOT NULL,
    `value` VARCHAR(191) NOT NULL,
    `isDeleted` BOOLEAN NOT NULL DEFAULT false,

    INDEX `ParameterOptions_testParameterId_idx`(`testParameterId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Income` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `title` VARCHAR(191) NOT NULL,
    `mode` ENUM('PAYMENT_MODE_DEFAULT', 'CASH', 'CARD_PAYMENT', 'CHEQUE', 'DIGITAL_WALLET', 'INSURANCE', 'INTERNAL_ADJUSTMENTS', 'LOYALTY_CARD', 'NEFT', 'RTGS', 'TDS_AYUSHMAN_BHARAT', 'TDS_CHIRANJIVI_YOJNA', 'TDS_OTHERS', 'TDS', 'OTHER') NOT NULL,
    `amount` DOUBLE NOT NULL,
    `collectedOn` DATETIME(3) NOT NULL,
    `collectedById` INTEGER NOT NULL,
    `categoryId` INTEGER NOT NULL,
    `description` LONGTEXT NULL,
    `isDeleted` BOOLEAN NOT NULL DEFAULT false,
    `createdBy` INTEGER NULL,
    `updatedBy` INTEGER NULL,
    `deletedBy` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Income_categoryId_idx`(`categoryId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Expense` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `title` VARCHAR(191) NOT NULL,
    `categoryId` INTEGER NOT NULL,
    `amount` DOUBLE NOT NULL,
    `paymentMode` ENUM('PAYMENT_MODE_DEFAULT', 'CASH', 'CARD_PAYMENT', 'CHEQUE', 'DIGITAL_WALLET', 'INSURANCE', 'INTERNAL_ADJUSTMENTS', 'LOYALTY_CARD', 'NEFT', 'RTGS', 'TDS_AYUSHMAN_BHARAT', 'TDS_CHIRANJIVI_YOJNA', 'TDS_OTHERS', 'TDS', 'OTHER') NOT NULL,
    `dateTime` DATETIME(3) NOT NULL,
    `description` LONGTEXT NULL,
    `isDeleted` BOOLEAN NOT NULL DEFAULT false,
    `createdBy` INTEGER NULL,
    `updatedBy` INTEGER NULL,
    `deletedBy` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Expense_categoryId_idx`(`categoryId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `FinanceCategory` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `type` ENUM('INCOME', 'EXPENSE') NOT NULL,
    `description` LONGTEXT NULL,
    `isDeleted` BOOLEAN NOT NULL DEFAULT false,
    `createdBy` INTEGER NULL,
    `updatedBy` INTEGER NULL,
    `deletedBy` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `FinanceCategory_type_idx`(`type`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ReferenceRange` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `testParameterId` INTEGER NOT NULL,
    `applicableGender` ENUM('MALE', 'FEMALE', 'Both') NOT NULL,
    `lowerAgeInDays` INTEGER NULL,
    `upperAgeInDays` INTEGER NULL,
    `lowerRange` INTEGER NULL,
    `upperRange` INTEGER NULL,
    `unit` VARCHAR(191) NULL,
    `isDeleted` BOOLEAN NOT NULL DEFAULT false,
    `createdBy` INTEGER NULL,
    `updatedBy` INTEGER NULL,
    `deletedBy` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `ReferenceRange_testParameterId_idx`(`testParameterId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PathologyTestOrder` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `opdId` INTEGER NULL,
    `ipdId` INTEGER NULL,
    `patientId` INTEGER NOT NULL,
    `testId` INTEGER NOT NULL,
    `invoiceBillingItemId` INTEGER NULL,
    `scannedReportDocumentId` INTEGER NULL,
    `isDeleted` BOOLEAN NOT NULL DEFAULT false,
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

    INDEX `PathologyTestOrder_opdId_idx`(`opdId`),
    INDEX `PathologyTestOrder_ipdId_idx`(`ipdId`),
    INDEX `PathologyTestOrder_patientId_idx`(`patientId`),
    INDEX `PathologyTestOrder_testId_idx`(`testId`),
    INDEX `PathologyTestOrder_status_idx`(`status`),
    INDEX `PathologyTestOrder_createdAt_idx`(`createdAt`),
    INDEX `PathologyTestOrder_isDeleted_idx`(`isDeleted`),
    INDEX `PathologyTestOrder_verifiedById_idx`(`verifiedById`),
    INDEX `PathologyTestOrder_resultEnteredById_idx`(`resultEnteredById`),
    INDEX `PathologyTestOrder_scannedReportDocumentId_idx`(`scannedReportDocumentId`),
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

    INDEX `PathologyTestResult_orderId_idx`(`orderId`),
    INDEX `PathologyTestResult_parameterId_idx`(`parameterId`),
    INDEX `PathologyTestResult_optionId_idx`(`optionId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `RadiologyTestOrder` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `opdId` INTEGER NULL,
    `ipdId` INTEGER NULL,
    `patientId` INTEGER NOT NULL,
    `testId` INTEGER NOT NULL,
    `invoiceBillingItemId` INTEGER NULL,
    `scannedReportDocumentId` INTEGER NULL,
    `isDeleted` BOOLEAN NOT NULL DEFAULT false,
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
    `status` ENUM('RESULT_PENDING', 'COMPLETED') NOT NULL DEFAULT 'RESULT_PENDING',

    INDEX `RadiologyTestOrder_opdId_idx`(`opdId`),
    INDEX `RadiologyTestOrder_patientId_idx`(`patientId`),
    INDEX `RadiologyTestOrder_testId_idx`(`testId`),
    INDEX `RadiologyTestOrder_status_idx`(`status`),
    INDEX `RadiologyTestOrder_createdAt_idx`(`createdAt`),
    INDEX `RadiologyTestOrder_isDeleted_idx`(`isDeleted`),
    INDEX `RadiologyTestOrder_ipdId_idx`(`ipdId`),
    INDEX `RadiologyTestOrder_verifiedById_idx`(`verifiedById`),
    INDEX `RadiologyTestOrder_resultEnteredById_idx`(`resultEnteredById`),
    INDEX `RadiologyTestOrder_scannedReportDocumentId_idx`(`scannedReportDocumentId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `DocumentStore` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `type` ENUM('LAB_REPORT_PATHOLOGY', 'LAB_REPORT_RADIOLOGY', 'PATIENT_DOCUMENT', 'OTHER') NOT NULL DEFAULT 'OTHER',
    `path` VARCHAR(191) NOT NULL,
    `originalName` VARCHAR(191) NOT NULL,
    `mimeType` VARCHAR(191) NULL,
    `size` INTEGER NOT NULL,
    `createdBy` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `DocumentStore_type_idx`(`type`),
    INDEX `DocumentStore_createdBy_idx`(`createdBy`),
    INDEX `DocumentStore_createdAt_idx`(`createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `RadiologyTestResult` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `orderId` INTEGER NOT NULL,
    `templateId` INTEGER NOT NULL,
    `value` LONGTEXT NULL,
    `remark` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `RadiologyTestResult_orderId_idx`(`orderId`),
    INDEX `RadiologyTestResult_templateId_idx`(`templateId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `RadiologyTest` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `alias` VARCHAR(191) NOT NULL,
    `price` DOUBLE NOT NULL,
    `status` ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
    `isDeleted` BOOLEAN NOT NULL DEFAULT false,
    `section` ENUM('COAGULATION', 'CT_SCAN', 'CYTOGENETICS', 'CYTOPATHOLOGY', 'HISTOPATHOLOGY', 'IMMUNOASSAY', 'IMMUNOFLUORESCENCE', 'MICROBIOLOGY', 'MOLECULAR_BIOLOGY', 'MRI', 'NEPHELOMETRY', 'SONOGRAPHY_ULTRASOUND', 'TRANSFUSION_MEDICINE', 'X_RAY') NOT NULL,
    `templateId` INTEGER NULL,
    `createdBy` INTEGER NULL,
    `updatedBy` INTEGER NULL,
    `deletedBy` INTEGER NULL,
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
    `content` LONGTEXT NOT NULL,
    `status` ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
    `isDeleted` BOOLEAN NOT NULL DEFAULT false,
    `createdBy` INTEGER NULL,
    `updatedBy` INTEGER NULL,
    `deletedBy` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `BillingSection` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `systemKey` VARCHAR(191) NULL,
    `isOtherCharges` BOOLEAN NOT NULL DEFAULT false,
    `isDoctorConsultationCharges` BOOLEAN NOT NULL DEFAULT false,
    `description` VARCHAR(191) NULL,
    `status` ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
    `isDeleted` BOOLEAN NOT NULL DEFAULT false,
    `createdBy` INTEGER NULL,
    `updatedBy` INTEGER NULL,
    `deletedBy` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `BillingSection_name_key`(`name`),
    UNIQUE INDEX `BillingSection_systemKey_key`(`systemKey`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Service` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `isInvoiceOnly` BOOLEAN NOT NULL DEFAULT false,
    `isEditableRate` BOOLEAN NOT NULL DEFAULT false,
    `type` ENUM('LAB_TEST', 'RADIOLOGY_TEST', 'CLINICAL_TEST', 'OTHER') NOT NULL,
    `price` DOUBLE NOT NULL,
    `discountAvailable` BOOLEAN NOT NULL DEFAULT false,
    `maxDiscount` DOUBLE NULL DEFAULT 0,
    `applicableOn` ENUM('INPATIENT', 'OUTPATIENT', 'CONSULTATION', 'BOTH') NOT NULL DEFAULT 'BOTH',
    `status` ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
    `isDeleted` BOOLEAN NOT NULL DEFAULT false,
    `createdBy` INTEGER NULL,
    `updatedBy` INTEGER NULL,
    `deletedBy` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `consultingDoctorId` INTEGER NULL,
    `roomId` INTEGER NULL,

    UNIQUE INDEX `Service_consultingDoctorId_key`(`consultingDoctorId`),
    UNIQUE INDEX `Service_roomId_key`(`roomId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PathologyTestService` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `testId` INTEGER NOT NULL,
    `serviceId` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `PathologyTestService_testId_idx`(`testId`),
    INDEX `PathologyTestService_serviceId_idx`(`serviceId`),
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

    INDEX `RadiologyTestService_testId_idx`(`testId`),
    INDEX `RadiologyTestService_serviceId_idx`(`serviceId`),
    UNIQUE INDEX `RadiologyTestService_testId_serviceId_key`(`testId`, `serviceId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Transaction` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `opdId` INTEGER NULL,
    `amount` DOUBLE NOT NULL,
    `mode` ENUM('PAYMENT_MODE_DEFAULT', 'CASH', 'CARD_PAYMENT', 'CHEQUE', 'DIGITAL_WALLET', 'INSURANCE', 'INTERNAL_ADJUSTMENTS', 'LOYALTY_CARD', 'NEFT', 'RTGS', 'TDS_AYUSHMAN_BHARAT', 'TDS_CHIRANJIVI_YOJNA', 'TDS_OTHERS', 'TDS', 'OTHER') NOT NULL,
    `transactionType` ENUM('PAYMENT', 'REFUND') NOT NULL DEFAULT 'PAYMENT',
    `remarks` VARCHAR(191) NULL,
    `isDeleted` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `receivedById` INTEGER NOT NULL,
    `invoiceId` INTEGER NULL,

    INDEX `Transaction_invoiceId_idx`(`invoiceId`),
    INDEX `Transaction_isDeleted_idx`(`isDeleted`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `InvoiceBillingItem` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `opdId` INTEGER NULL,
    `billingSectionId` INTEGER NOT NULL,
    `invoiceBillingSectionId` INTEGER NOT NULL,
    `serviceId` INTEGER NOT NULL,
    `isLocked` BOOLEAN NOT NULL DEFAULT false,
    `ipdBedAllocationId` INTEGER NULL,
    `quantity` INTEGER NOT NULL,
    `rate` DOUBLE NOT NULL,
    `discountType` ENUM('PERCENTAGE', 'VALUE') NOT NULL,
    `discountValue` DOUBLE NOT NULL,
    `total` DOUBLE NOT NULL,
    `updateReason` LONGTEXT NULL,
    `createdBy` INTEGER NULL,
    `updatedBy` INTEGER NULL,
    `deletedBy` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `invoiceId` INTEGER NULL,

    UNIQUE INDEX `InvoiceBillingItem_ipdBedAllocationId_key`(`ipdBedAllocationId`),
    INDEX `InvoiceBillingItem_invoiceId_idx`(`invoiceId`),
    INDEX `InvoiceBillingItem_billingSectionId_idx`(`billingSectionId`),
    INDEX `InvoiceBillingItem_invoiceBillingSectionId_idx`(`invoiceBillingSectionId`),
    INDEX `InvoiceBillingItem_serviceId_idx`(`serviceId`),
    INDEX `InvoiceBillingItem_ipdBedAllocationId_idx`(`ipdBedAllocationId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `InvoiceBillingSection` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `invoiceId` INTEGER NOT NULL,
    `billingSectionId` INTEGER NOT NULL,
    `discountValue` DOUBLE NOT NULL DEFAULT 0,
    `discountType` ENUM('PERCENTAGE', 'VALUE') NOT NULL DEFAULT 'VALUE',
    `createdBy` INTEGER NULL,
    `updatedBy` INTEGER NULL,
    `deletedBy` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `InvoiceBillingSection_invoiceId_idx`(`invoiceId`),
    INDEX `InvoiceBillingSection_billingSectionId_idx`(`billingSectionId`),
    UNIQUE INDEX `InvoiceBillingSection_invoiceId_billingSectionId_key`(`invoiceId`, `billingSectionId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Invoice` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `rate` DOUBLE NOT NULL,
    `discountType` ENUM('PERCENTAGE', 'VALUE') NOT NULL,
    `discountValue` DOUBLE NOT NULL,
    `total` DOUBLE NOT NULL,
    `isPaid` BOOLEAN NOT NULL DEFAULT false,
    `isFree` BOOLEAN NOT NULL DEFAULT false,
    `billingType` ENUM('CASHLESS_INSURANCE', 'CORPORATE_AFFILIATION', 'AYUSHMAN_BHARAT', 'CGHS', 'RGHS', 'CHIRANJIVI_YOJNA', 'GOVERNMENT_BENEFITS', 'NOT_DETERMINED', 'SELF_PAY', 'DO_NOT_CONSIDER') NOT NULL,
    `isDeleted` BOOLEAN NOT NULL DEFAULT false,
    `createdBy` INTEGER NULL,
    `updatedBy` INTEGER NULL,
    `deletedBy` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `Invoice_createdAt_idx`(`createdAt`),
    INDEX `Invoice_createdBy_idx`(`createdBy`),
    INDEX `Invoice_isPaid_idx`(`isPaid`),
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
    `followUpAdvice` LONGTEXT NULL,
    `otherAdvice` LONGTEXT NULL,

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

    INDEX `AdvisedPathologyTests_consultationId_idx`(`consultationId`),
    INDEX `AdvisedPathologyTests_testId_idx`(`testId`),
    UNIQUE INDEX `AdvisedPathologyTests_opdId_testId_key`(`opdId`, `testId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AdvisedRadiologyTests` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `testId` INTEGER NOT NULL,
    `consultationId` INTEGER NOT NULL,
    `opdId` INTEGER NOT NULL,

    INDEX `AdvisedRadiologyTests_consultationId_idx`(`consultationId`),
    INDEX `AdvisedRadiologyTests_testId_idx`(`testId`),
    UNIQUE INDEX `AdvisedRadiologyTests_opdId_testId_key`(`opdId`, `testId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `OpdConsultation` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `opdId` INTEGER NOT NULL,
    `vitalsId` INTEGER NOT NULL,
    `notes` LONGTEXT NULL,
    `generalExaminations` LONGTEXT NULL,
    `systemicExaminations` LONGTEXT NULL,
    `diagnosis` LONGTEXT NULL,
    `chronicIllness` LONGTEXT NULL,

    UNIQUE INDEX `OpdConsultation_opdId_key`(`opdId`),
    UNIQUE INDEX `OpdConsultation_vitalsId_key`(`vitalsId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Opd` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `patientId` INTEGER NOT NULL,
    `arrivalState` ENUM('ROUTINE', 'APPOINTMENT', 'FOLLOW_UP', 'EMERGENCY', 'AYUSHMAN_NEW_IP', 'AYUSHMAN_IP_FIRST', 'AYUSHMAN_IP_SECOND', 'AYUSHMAN_IP_THIRD', 'OTHER') NOT NULL,
    `status` ENUM('IN_QUEUE', 'IN_CONSULTATION', 'WAITING', 'COMPLETED') NOT NULL DEFAULT 'IN_QUEUE',
    `opdDateTime` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `remarks` VARCHAR(191) NULL,
    `consultantDoctorId` INTEGER NOT NULL,
    `referringDoctorId` INTEGER NULL,
    `invoiceId` INTEGER NOT NULL,
    `isDeleted` BOOLEAN NOT NULL DEFAULT false,
    `createdBy` INTEGER NULL,
    `updatedBy` INTEGER NULL,
    `deletedBy` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Opd_invoiceId_key`(`invoiceId`),
    INDEX `Opd_patientId_idx`(`patientId`),
    INDEX `Opd_consultantDoctorId_idx`(`consultantDoctorId`),
    INDEX `Opd_referringDoctorId_idx`(`referringDoctorId`),
    INDEX `Opd_invoiceId_idx`(`invoiceId`),
    INDEX `Opd_status_idx`(`status`),
    INDEX `Opd_opdDateTime_idx`(`opdDateTime`),
    INDEX `Opd_createdAt_idx`(`createdAt`),
    INDEX `Opd_isDeleted_idx`(`isDeleted`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Ipd` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `patientId` INTEGER NOT NULL,
    `arrivalState` ENUM('ROUTINE', 'EMERGENCY', 'PLANNED', 'OP', 'OTHER') NOT NULL,
    `remarks` VARCHAR(191) NULL,
    `consultantDoctorId` INTEGER NOT NULL,
    `referringDoctorId` INTEGER NULL,
    `bedId` INTEGER NOT NULL,
    `invoiceId` INTEGER NOT NULL,
    `careType` ENUM('SURGICAL', 'MEDICAL') NOT NULL DEFAULT 'MEDICAL',
    `isDischarged` BOOLEAN NOT NULL DEFAULT false,
    `isDayCare` BOOLEAN NOT NULL DEFAULT false,
    `isMlcPatient` BOOLEAN NOT NULL DEFAULT false,
    `isDeleted` BOOLEAN NOT NULL DEFAULT false,
    `mlcDeclaredById` INTEGER NULL,
    `mlcDeclarationDate` DATETIME(3) NULL,
    `ipdDateTime` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `dischargedAt` DATETIME(3) NULL,
    `dischargedById` INTEGER NULL,
    `createdBy` INTEGER NULL,
    `updatedBy` INTEGER NULL,
    `deletedBy` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `roomId` INTEGER NULL,

    UNIQUE INDEX `Ipd_invoiceId_key`(`invoiceId`),
    INDEX `Ipd_patientId_idx`(`patientId`),
    INDEX `Ipd_consultantDoctorId_idx`(`consultantDoctorId`),
    INDEX `Ipd_referringDoctorId_idx`(`referringDoctorId`),
    INDEX `Ipd_bedId_idx`(`bedId`),
    INDEX `Ipd_invoiceId_idx`(`invoiceId`),
    INDEX `Ipd_isDischarged_idx`(`isDischarged`),
    INDEX `Ipd_isDayCare_idx`(`isDayCare`),
    INDEX `Ipd_isMlcPatient_idx`(`isMlcPatient`),
    INDEX `Ipd_mlcDeclarationDate_idx`(`mlcDeclarationDate`),
    INDEX `Ipd_ipdDateTime_idx`(`ipdDateTime`),
    INDEX `Ipd_dischargedAt_idx`(`dischargedAt`),
    INDEX `Ipd_createdAt_idx`(`createdAt`),
    INDEX `Ipd_isDeleted_idx`(`isDeleted`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `IpdBedAllocation` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `ipdId` INTEGER NOT NULL,
    `bedId` INTEGER NOT NULL,
    `roomId` INTEGER NOT NULL,
    `fromDateTime` DATETIME(3) NOT NULL,
    `toDateTime` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `IpdBedAllocation_ipdId_idx`(`ipdId`),
    INDEX `IpdBedAllocation_bedId_idx`(`bedId`),
    INDEX `IpdBedAllocation_roomId_idx`(`roomId`),
    INDEX `IpdBedAllocation_fromDateTime_idx`(`fromDateTime`),
    INDEX `IpdBedAllocation_toDateTime_idx`(`toDateTime`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `IpdDischargeSummary` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `ipdId` INTEGER NOT NULL,
    `ipdDateTime` DATETIME(3) NULL,
    `isUnfitForFurtherManagement` BOOLEAN NOT NULL DEFAULT false,
    `diagnosis` LONGTEXT NULL,
    `procedureDate` DATETIME(3) NULL,
    `procedure` LONGTEXT NULL,
    `courseInHospital` LONGTEXT NULL,
    `investigationResults` LONGTEXT NULL,
    `allergies` VARCHAR(191) NULL,
    `diet` VARCHAR(191) NULL,
    `physicalActivity` VARCHAR(191) NULL,
    `followUpDate` DATETIME(3) NULL,
    `otherAdvice` LONGTEXT NULL,
    `urgentCareWhen` VARCHAR(191) NULL,
    `isTransferred` BOOLEAN NOT NULL DEFAULT false,
    `remarks` LONGTEXT NULL,
    `followUpAfterDays` INTEGER NULL,
    `followUpAdvice` LONGTEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `IpdDischargeSummary_ipdId_key`(`ipdId`),
    INDEX `IpdDischargeSummary_ipdId_idx`(`ipdId`),
    INDEX `IpdDischargeSummary_followUpDate_idx`(`followUpDate`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `IpdDischargeDrug` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `dischargeSummaryId` INTEGER NOT NULL,
    `drugId` INTEGER NOT NULL,
    `frequency` INTEGER NOT NULL,
    `days` INTEGER NOT NULL,
    `unit` VARCHAR(191) NULL,
    `route` VARCHAR(191) NOT NULL,
    `remarks` VARCHAR(191) NULL,

    INDEX `IpdDischargeDrug_dischargeSummaryId_idx`(`dischargeSummaryId`),
    INDEX `IpdDischargeDrug_drugId_idx`(`drugId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CompanyDetails` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL DEFAULT '',
    `address` VARCHAR(191) NOT NULL DEFAULT '',
    `mobile` VARCHAR(191) NOT NULL DEFAULT '',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `DrugBill` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `patientId` INTEGER NULL,
    `customerId` INTEGER NULL,
    `doctorId` INTEGER NULL,
    `invoiceId` INTEGER NOT NULL,
    `isWholesaleBill` BOOLEAN NOT NULL DEFAULT false,
    `isLooseBill` BOOLEAN NOT NULL DEFAULT false,
    `isDeleted` BOOLEAN NOT NULL DEFAULT false,
    `createdBy` INTEGER NULL,
    `updatedBy` INTEGER NULL,
    `deletedBy` INTEGER NULL,

    UNIQUE INDEX `DrugBill_invoiceId_key`(`invoiceId`),
    INDEX `DrugBill_invoiceId_idx`(`invoiceId`),
    INDEX `DrugBill_patientId_idx`(`patientId`),
    INDEX `DrugBill_customerId_idx`(`customerId`),
    INDEX `DrugBill_doctorId_idx`(`doctorId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PharmacyCustomer` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `address` VARCHAR(191) NULL,
    `contact` VARCHAR(191) NULL,
    `isBusinessCustomer` BOOLEAN NOT NULL DEFAULT false,
    `dlNumber` VARCHAR(191) NULL,
    `gstNumber` VARCHAR(191) NULL,
    `patientId` INTEGER NULL,
    `isDeleted` BOOLEAN NOT NULL DEFAULT false,
    `createdBy` INTEGER NULL,
    `updatedBy` INTEGER NULL,
    `deletedBy` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `PharmacyCustomer_name_idx`(`name`),
    INDEX `PharmacyCustomer_patientId_idx`(`patientId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `DrugBillingCategory` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `isDeleted` BOOLEAN NOT NULL DEFAULT false,
    `createdBy` INTEGER NULL,
    `updatedBy` INTEGER NULL,
    `deletedBy` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `HsnSac` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `code` INTEGER NOT NULL,
    `cGstPercentage` DOUBLE NOT NULL DEFAULT 0,
    `sGstPercentage` DOUBLE NOT NULL DEFAULT 0,
    `iGstPercentage` DOUBLE NOT NULL DEFAULT 0,
    `isDeleted` BOOLEAN NOT NULL DEFAULT false,
    `createdBy` INTEGER NULL,
    `updatedBy` INTEGER NULL,
    `deletedBy` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `HsnSac_code_key`(`code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Drug` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `manufacturer` VARCHAR(191) NOT NULL,
    `unit` VARCHAR(191) NOT NULL,
    `isDeleted` BOOLEAN NOT NULL DEFAULT false,
    `createdBy` INTEGER NULL,
    `updatedBy` INTEGER NULL,
    `deletedBy` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `DrugSupplier` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `gstIn` VARCHAR(191) NULL,
    `email` VARCHAR(191) NULL,
    `phone` INTEGER NOT NULL,
    `isDeleted` BOOLEAN NOT NULL DEFAULT false,
    `createdBy` INTEGER NULL,
    `updatedBy` INTEGER NULL,
    `deletedBy` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `InventoryItems` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `drugId` INTEGER NOT NULL,
    `hsnSacCode` INTEGER NULL,
    `batchNo` INTEGER NOT NULL,
    `expiryDate` DATETIME(3) NOT NULL,
    `manufacturingDate` DATETIME(3) NOT NULL,
    `purchasePrice` DOUBLE NOT NULL,
    `mrp` DOUBLE NOT NULL,
    `sellingPrice` DOUBLE NOT NULL,
    `wholeSalePrice` DOUBLE NOT NULL,
    `itemsPerPack` INTEGER NOT NULL DEFAULT 1,
    `quantityInStock` INTEGER NOT NULL,
    `supplierId` INTEGER NOT NULL,
    `createdBy` INTEGER NULL,
    `updatedBy` INTEGER NULL,
    `deletedBy` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `InventoryItems_drugId_idx`(`drugId`),
    INDEX `InventoryItems_supplierId_idx`(`supplierId`),
    INDEX `InventoryItems_expiryDate_idx`(`expiryDate`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `DrugSaleItem` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `drugBillId` INTEGER NOT NULL,
    `inventoryItemId` INTEGER NOT NULL,
    `quantity` INTEGER NOT NULL,
    `isLooseQuantity` BOOLEAN NOT NULL DEFAULT false,
    `rate` DOUBLE NOT NULL,
    `discountType` ENUM('PERCENTAGE', 'VALUE') NOT NULL DEFAULT 'VALUE',
    `discountValue` DOUBLE NOT NULL DEFAULT 0,
    `taxableAmount` DOUBLE NOT NULL DEFAULT 0,
    `gstPercentage` DOUBLE NOT NULL DEFAULT 0,
    `cGstPercentage` DOUBLE NOT NULL DEFAULT 0,
    `sGstPercentage` DOUBLE NOT NULL DEFAULT 0,
    `iGstPercentage` DOUBLE NOT NULL DEFAULT 0,
    `gstAmount` DOUBLE NOT NULL DEFAULT 0,
    `cGstAmount` DOUBLE NOT NULL DEFAULT 0,
    `sGstAmount` DOUBLE NOT NULL DEFAULT 0,
    `iGstAmount` DOUBLE NOT NULL DEFAULT 0,
    `total` DOUBLE NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `DrugSaleItem_drugBillId_idx`(`drugBillId`),
    INDEX `DrugSaleItem_inventoryItemId_idx`(`inventoryItemId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `GRNItems` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `purchaseItemId` INTEGER NULL,
    `challanItemId` INTEGER NULL,
    `inventoryItemId` INTEGER NOT NULL,
    `grnId` INTEGER NOT NULL,

    INDEX `GRNItems_purchaseItemId_idx`(`purchaseItemId`),
    INDEX `GRNItems_challanItemId_idx`(`challanItemId`),
    INDEX `GRNItems_inventoryItemId_idx`(`inventoryItemId`),
    INDEX `GRNItems_grnId_idx`(`grnId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `GRN` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `orderId` INTEGER NULL,
    `challanId` INTEGER NULL,
    `invoiceNumber` VARCHAR(191) NOT NULL,
    `invoiceDate` DATETIME(3) NOT NULL,
    `discountAmount` DOUBLE NOT NULL DEFAULT 0,
    `taxableAmount` DOUBLE NOT NULL DEFAULT 0,
    `cGstAmount` DOUBLE NOT NULL DEFAULT 0,
    `sGstAmount` DOUBLE NOT NULL DEFAULT 0,
    `iGstAmount` DOUBLE NOT NULL DEFAULT 0,
    `tcsAmount` DOUBLE NOT NULL DEFAULT 0,
    `packingForwarding` DOUBLE NOT NULL DEFAULT 0,
    `roundOffAmount` DOUBLE NOT NULL DEFAULT 0,
    `grandTotal` DOUBLE NOT NULL DEFAULT 0,
    `cnAmount` DOUBLE NOT NULL DEFAULT 0,
    `cnRef` VARCHAR(191) NULL,
    `createdBy` INTEGER NULL,
    `updatedBy` INTEGER NULL,
    `deletedBy` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `GRN_orderId_key`(`orderId`),
    UNIQUE INDEX `GRN_challanId_key`(`challanId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ChallanItem` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `challanId` INTEGER NOT NULL,
    `drugId` INTEGER NOT NULL,
    `hsnSacCode` INTEGER NULL,
    `quantity` INTEGER NOT NULL,
    `freeQuantity` INTEGER NOT NULL DEFAULT 0,
    `packaging` VARCHAR(191) NULL,
    `qtyType` VARCHAR(191) NULL,
    `itemsPerPack` INTEGER NOT NULL DEFAULT 1,
    `batchNo` INTEGER NOT NULL,
    `expiryDate` DATETIME(3) NOT NULL,
    `manufacturingDate` DATETIME(3) NOT NULL,
    `purchasePrice` DOUBLE NOT NULL DEFAULT 0,
    `mrp` DOUBLE NOT NULL DEFAULT 0,
    `sellingPrice` DOUBLE NOT NULL DEFAULT 0,
    `wholeSalePrice` DOUBLE NOT NULL DEFAULT 0,
    `total` DOUBLE NOT NULL DEFAULT 0,
    `categoryId` INTEGER NULL,
    `inventoryItemId` INTEGER NOT NULL,

    INDEX `ChallanItem_challanId_idx`(`challanId`),
    INDEX `ChallanItem_drugId_idx`(`drugId`),
    INDEX `ChallanItem_inventoryItemId_idx`(`inventoryItemId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Challan` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `supplierId` INTEGER NOT NULL,
    `challanNumber` VARCHAR(191) NOT NULL,
    `invoiceNumber` VARCHAR(191) NOT NULL,
    `invoiceDate` DATETIME(3) NOT NULL,
    `discountAmount` DOUBLE NOT NULL DEFAULT 0,
    `taxableAmount` DOUBLE NOT NULL DEFAULT 0,
    `cGstAmount` DOUBLE NOT NULL DEFAULT 0,
    `sGstAmount` DOUBLE NOT NULL DEFAULT 0,
    `iGstAmount` DOUBLE NOT NULL DEFAULT 0,
    `tcsAmount` DOUBLE NOT NULL DEFAULT 0,
    `packingForwarding` DOUBLE NOT NULL DEFAULT 0,
    `roundOffAmount` DOUBLE NOT NULL DEFAULT 0,
    `grandTotal` DOUBLE NOT NULL DEFAULT 0,
    `cnAmount` DOUBLE NOT NULL DEFAULT 0,
    `cnRef` VARCHAR(191) NULL,
    `isDeleted` BOOLEAN NOT NULL DEFAULT false,
    `createdBy` INTEGER NULL,
    `updatedBy` INTEGER NULL,
    `deletedBy` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `Challan_challanNumber_key`(`challanNumber`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PurchaseItem` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `drugId` INTEGER NOT NULL,
    `hsnSacCode` INTEGER NULL,
    `quantity` INTEGER NOT NULL,
    `categoryId` INTEGER NULL,
    `discountPercentage` DOUBLE NOT NULL DEFAULT 0,
    `rate` DOUBLE NOT NULL DEFAULT 0,
    `total` DOUBLE NOT NULL DEFAULT 0,
    `purchaseOrderId` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PurchaseOrder` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `supplierId` INTEGER NOT NULL,
    `grnId` INTEGER NULL,
    `remarks` VARCHAR(191) NULL,
    `termsAndConditions` VARCHAR(191) NULL,
    `orderDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `taxableAmount` DOUBLE NOT NULL DEFAULT 0,
    `packingForwarding` DOUBLE NOT NULL DEFAULT 0,
    `cGstAmount` DOUBLE NOT NULL DEFAULT 0,
    `sGstAmount` DOUBLE NOT NULL DEFAULT 0,
    `iGstAmount` DOUBLE NOT NULL DEFAULT 0,
    `tcsAmount` DOUBLE NOT NULL DEFAULT 0,
    `discountAmount` DOUBLE NOT NULL DEFAULT 0,
    `roundOffAmount` DOUBLE NOT NULL DEFAULT 0,
    `grandTotal` DOUBLE NOT NULL DEFAULT 0,
    `status` ENUM('draft', 'placed', 'received') NOT NULL DEFAULT 'draft',
    `isDeleted` BOOLEAN NOT NULL DEFAULT false,
    `createdBy` INTEGER NULL,
    `updatedBy` INTEGER NULL,
    `deletedBy` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `PurchaseOrder_grnId_key`(`grnId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Location` ADD CONSTRAINT `Location_createdBy_fkey` FOREIGN KEY (`createdBy`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Location` ADD CONSTRAINT `Location_updatedBy_fkey` FOREIGN KEY (`updatedBy`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Location` ADD CONSTRAINT `Location_deletedBy_fkey` FOREIGN KEY (`deletedBy`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Permission` ADD CONSTRAINT `Permission_moduleId_fkey` FOREIGN KEY (`moduleId`) REFERENCES `Module`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Permission` ADD CONSTRAINT `Permission_actionId_fkey` FOREIGN KEY (`actionId`) REFERENCES `Action`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `UserPermission` ADD CONSTRAINT `UserPermission_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `UserPermission` ADD CONSTRAINT `UserPermission_permissionId_fkey` FOREIGN KEY (`permissionId`) REFERENCES `Permission`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `User` ADD CONSTRAINT `User_createdBy_fkey` FOREIGN KEY (`createdBy`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `User` ADD CONSTRAINT `User_updatedBy_fkey` FOREIGN KEY (`updatedBy`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `User` ADD CONSTRAINT `User_deletedBy_fkey` FOREIGN KEY (`deletedBy`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Doctor` ADD CONSTRAINT `Doctor_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Doctor` ADD CONSTRAINT `Doctor_createdBy_fkey` FOREIGN KEY (`createdBy`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Doctor` ADD CONSTRAINT `Doctor_updatedBy_fkey` FOREIGN KEY (`updatedBy`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Doctor` ADD CONSTRAINT `Doctor_deletedBy_fkey` FOREIGN KEY (`deletedBy`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

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
ALTER TABLE `PatientAddress` ADD CONSTRAINT `PatientAddress_locationId_fkey` FOREIGN KEY (`locationId`) REFERENCES `Location`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PatientAddress` ADD CONSTRAINT `PatientAddress_patientId_fkey` FOREIGN KEY (`patientId`) REFERENCES `Patient`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PatientIdentification` ADD CONSTRAINT `PatientIdentification_patientId_fkey` FOREIGN KEY (`patientId`) REFERENCES `Patient`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Patient` ADD CONSTRAINT `Patient_createdBy_fkey` FOREIGN KEY (`createdBy`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Patient` ADD CONSTRAINT `Patient_updatedBy_fkey` FOREIGN KEY (`updatedBy`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Patient` ADD CONSTRAINT `Patient_deletedBy_fkey` FOREIGN KEY (`deletedBy`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Department` ADD CONSTRAINT `Department_createdBy_fkey` FOREIGN KEY (`createdBy`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Department` ADD CONSTRAINT `Department_updatedBy_fkey` FOREIGN KEY (`updatedBy`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Department` ADD CONSTRAINT `Department_deletedBy_fkey` FOREIGN KEY (`deletedBy`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RoomType` ADD CONSTRAINT `RoomType_departmentId_fkey` FOREIGN KEY (`departmentId`) REFERENCES `Department`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RoomType` ADD CONSTRAINT `RoomType_createdBy_fkey` FOREIGN KEY (`createdBy`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RoomType` ADD CONSTRAINT `RoomType_updatedBy_fkey` FOREIGN KEY (`updatedBy`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RoomType` ADD CONSTRAINT `RoomType_deletedBy_fkey` FOREIGN KEY (`deletedBy`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Room` ADD CONSTRAINT `Room_roomTypeId_fkey` FOREIGN KEY (`roomTypeId`) REFERENCES `RoomType`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Room` ADD CONSTRAINT `Room_createdBy_fkey` FOREIGN KEY (`createdBy`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Room` ADD CONSTRAINT `Room_updatedBy_fkey` FOREIGN KEY (`updatedBy`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Room` ADD CONSTRAINT `Room_deletedBy_fkey` FOREIGN KEY (`deletedBy`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Bed` ADD CONSTRAINT `Bed_patientId_fkey` FOREIGN KEY (`patientId`) REFERENCES `Patient`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Bed` ADD CONSTRAINT `Bed_roomId_fkey` FOREIGN KEY (`roomId`) REFERENCES `Room`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Bed` ADD CONSTRAINT `Bed_currentIpdId_fkey` FOREIGN KEY (`currentIpdId`) REFERENCES `Ipd`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Bed` ADD CONSTRAINT `Bed_createdBy_fkey` FOREIGN KEY (`createdBy`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Bed` ADD CONSTRAINT `Bed_updatedBy_fkey` FOREIGN KEY (`updatedBy`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Bed` ADD CONSTRAINT `Bed_deletedBy_fkey` FOREIGN KEY (`deletedBy`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Appointment` ADD CONSTRAINT `Appointment_patientId_fkey` FOREIGN KEY (`patientId`) REFERENCES `Patient`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Appointment` ADD CONSTRAINT `Appointment_doctorId_fkey` FOREIGN KEY (`doctorId`) REFERENCES `Doctor`(`userId`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Appointment` ADD CONSTRAINT `Appointment_createdBy_fkey` FOREIGN KEY (`createdBy`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Appointment` ADD CONSTRAINT `Appointment_updatedBy_fkey` FOREIGN KEY (`updatedBy`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Appointment` ADD CONSTRAINT `Appointment_deletedBy_fkey` FOREIGN KEY (`deletedBy`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PathologyTest` ADD CONSTRAINT `PathologyTest_createdBy_fkey` FOREIGN KEY (`createdBy`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PathologyTest` ADD CONSTRAINT `PathologyTest_updatedBy_fkey` FOREIGN KEY (`updatedBy`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PathologyTest` ADD CONSTRAINT `PathologyTest_deletedBy_fkey` FOREIGN KEY (`deletedBy`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PathologyTestHeader` ADD CONSTRAINT `PathologyTestHeader_testId_fkey` FOREIGN KEY (`testId`) REFERENCES `PathologyTest`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PathologyTestHeader` ADD CONSTRAINT `PathologyTestHeader_createdBy_fkey` FOREIGN KEY (`createdBy`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PathologyTestHeader` ADD CONSTRAINT `PathologyTestHeader_updatedBy_fkey` FOREIGN KEY (`updatedBy`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PathologyTestHeader` ADD CONSTRAINT `PathologyTestHeader_deletedBy_fkey` FOREIGN KEY (`deletedBy`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PathologyTestParameter` ADD CONSTRAINT `PathologyTestParameter_headerId_fkey` FOREIGN KEY (`headerId`) REFERENCES `PathologyTestHeader`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PathologyTestParameter` ADD CONSTRAINT `PathologyTestParameter_testId_fkey` FOREIGN KEY (`testId`) REFERENCES `PathologyTest`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PathologyTestParameter` ADD CONSTRAINT `PathologyTestParameter_createdBy_fkey` FOREIGN KEY (`createdBy`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PathologyTestParameter` ADD CONSTRAINT `PathologyTestParameter_updatedBy_fkey` FOREIGN KEY (`updatedBy`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PathologyTestParameter` ADD CONSTRAINT `PathologyTestParameter_deletedBy_fkey` FOREIGN KEY (`deletedBy`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ParameterOptions` ADD CONSTRAINT `ParameterOptions_testParameterId_fkey` FOREIGN KEY (`testParameterId`) REFERENCES `PathologyTestParameter`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Income` ADD CONSTRAINT `Income_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `FinanceCategory`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Income` ADD CONSTRAINT `Income_collectedById_fkey` FOREIGN KEY (`collectedById`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Income` ADD CONSTRAINT `Income_createdBy_fkey` FOREIGN KEY (`createdBy`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Income` ADD CONSTRAINT `Income_updatedBy_fkey` FOREIGN KEY (`updatedBy`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Income` ADD CONSTRAINT `Income_deletedBy_fkey` FOREIGN KEY (`deletedBy`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Expense` ADD CONSTRAINT `Expense_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `FinanceCategory`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Expense` ADD CONSTRAINT `Expense_createdBy_fkey` FOREIGN KEY (`createdBy`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Expense` ADD CONSTRAINT `Expense_updatedBy_fkey` FOREIGN KEY (`updatedBy`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Expense` ADD CONSTRAINT `Expense_deletedBy_fkey` FOREIGN KEY (`deletedBy`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FinanceCategory` ADD CONSTRAINT `FinanceCategory_createdBy_fkey` FOREIGN KEY (`createdBy`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FinanceCategory` ADD CONSTRAINT `FinanceCategory_updatedBy_fkey` FOREIGN KEY (`updatedBy`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FinanceCategory` ADD CONSTRAINT `FinanceCategory_deletedBy_fkey` FOREIGN KEY (`deletedBy`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ReferenceRange` ADD CONSTRAINT `ReferenceRange_testParameterId_fkey` FOREIGN KEY (`testParameterId`) REFERENCES `PathologyTestParameter`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ReferenceRange` ADD CONSTRAINT `ReferenceRange_createdBy_fkey` FOREIGN KEY (`createdBy`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ReferenceRange` ADD CONSTRAINT `ReferenceRange_updatedBy_fkey` FOREIGN KEY (`updatedBy`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ReferenceRange` ADD CONSTRAINT `ReferenceRange_deletedBy_fkey` FOREIGN KEY (`deletedBy`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

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
ALTER TABLE `PathologyTestOrder` ADD CONSTRAINT `PathologyTestOrder_invoiceBillingItemId_fkey` FOREIGN KEY (`invoiceBillingItemId`) REFERENCES `InvoiceBillingItem`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PathologyTestOrder` ADD CONSTRAINT `PathologyTestOrder_scannedReportDocumentId_fkey` FOREIGN KEY (`scannedReportDocumentId`) REFERENCES `DocumentStore`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PathologyTestOrder` ADD CONSTRAINT `PathologyTestOrder_opdId_fkey` FOREIGN KEY (`opdId`) REFERENCES `Opd`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PathologyTestOrder` ADD CONSTRAINT `PathologyTestOrder_ipdId_fkey` FOREIGN KEY (`ipdId`) REFERENCES `Ipd`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PathologyTestResult` ADD CONSTRAINT `PathologyTestResult_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `PathologyTestOrder`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PathologyTestResult` ADD CONSTRAINT `PathologyTestResult_parameterId_fkey` FOREIGN KEY (`parameterId`) REFERENCES `PathologyTestParameter`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RadiologyTestOrder` ADD CONSTRAINT `RadiologyTestOrder_verifiedById_fkey` FOREIGN KEY (`verifiedById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RadiologyTestOrder` ADD CONSTRAINT `RadiologyTestOrder_resultEnteredById_fkey` FOREIGN KEY (`resultEnteredById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RadiologyTestOrder` ADD CONSTRAINT `RadiologyTestOrder_sampleTakenById_fkey` FOREIGN KEY (`sampleTakenById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RadiologyTestOrder` ADD CONSTRAINT `RadiologyTestOrder_cancelledById_fkey` FOREIGN KEY (`cancelledById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RadiologyTestOrder` ADD CONSTRAINT `RadiologyTestOrder_patientId_fkey` FOREIGN KEY (`patientId`) REFERENCES `Patient`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RadiologyTestOrder` ADD CONSTRAINT `RadiologyTestOrder_testId_fkey` FOREIGN KEY (`testId`) REFERENCES `RadiologyTest`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RadiologyTestOrder` ADD CONSTRAINT `RadiologyTestOrder_invoiceBillingItemId_fkey` FOREIGN KEY (`invoiceBillingItemId`) REFERENCES `InvoiceBillingItem`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RadiologyTestOrder` ADD CONSTRAINT `RadiologyTestOrder_scannedReportDocumentId_fkey` FOREIGN KEY (`scannedReportDocumentId`) REFERENCES `DocumentStore`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RadiologyTestOrder` ADD CONSTRAINT `RadiologyTestOrder_opdId_fkey` FOREIGN KEY (`opdId`) REFERENCES `Opd`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RadiologyTestOrder` ADD CONSTRAINT `RadiologyTestOrder_ipdId_fkey` FOREIGN KEY (`ipdId`) REFERENCES `Ipd`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DocumentStore` ADD CONSTRAINT `DocumentStore_createdBy_fkey` FOREIGN KEY (`createdBy`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RadiologyTestResult` ADD CONSTRAINT `RadiologyTestResult_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `RadiologyTestOrder`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RadiologyTestResult` ADD CONSTRAINT `RadiologyTestResult_templateId_fkey` FOREIGN KEY (`templateId`) REFERENCES `RadiologyTemplate`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RadiologyTest` ADD CONSTRAINT `RadiologyTest_createdBy_fkey` FOREIGN KEY (`createdBy`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RadiologyTest` ADD CONSTRAINT `RadiologyTest_updatedBy_fkey` FOREIGN KEY (`updatedBy`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RadiologyTest` ADD CONSTRAINT `RadiologyTest_deletedBy_fkey` FOREIGN KEY (`deletedBy`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RadiologyTest` ADD CONSTRAINT `RadiologyTest_templateId_fkey` FOREIGN KEY (`templateId`) REFERENCES `RadiologyTemplate`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RadiologyTemplate` ADD CONSTRAINT `RadiologyTemplate_createdBy_fkey` FOREIGN KEY (`createdBy`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RadiologyTemplate` ADD CONSTRAINT `RadiologyTemplate_updatedBy_fkey` FOREIGN KEY (`updatedBy`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RadiologyTemplate` ADD CONSTRAINT `RadiologyTemplate_deletedBy_fkey` FOREIGN KEY (`deletedBy`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `BillingSection` ADD CONSTRAINT `BillingSection_createdBy_fkey` FOREIGN KEY (`createdBy`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `BillingSection` ADD CONSTRAINT `BillingSection_updatedBy_fkey` FOREIGN KEY (`updatedBy`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `BillingSection` ADD CONSTRAINT `BillingSection_deletedBy_fkey` FOREIGN KEY (`deletedBy`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Service` ADD CONSTRAINT `Service_createdBy_fkey` FOREIGN KEY (`createdBy`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Service` ADD CONSTRAINT `Service_updatedBy_fkey` FOREIGN KEY (`updatedBy`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Service` ADD CONSTRAINT `Service_deletedBy_fkey` FOREIGN KEY (`deletedBy`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Service` ADD CONSTRAINT `Service_consultingDoctorId_fkey` FOREIGN KEY (`consultingDoctorId`) REFERENCES `Doctor`(`userId`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Service` ADD CONSTRAINT `Service_roomId_fkey` FOREIGN KEY (`roomId`) REFERENCES `Room`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

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
ALTER TABLE `Transaction` ADD CONSTRAINT `Transaction_invoiceId_fkey` FOREIGN KEY (`invoiceId`) REFERENCES `Invoice`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `InvoiceBillingItem` ADD CONSTRAINT `InvoiceBillingItem_billingSectionId_fkey` FOREIGN KEY (`billingSectionId`) REFERENCES `BillingSection`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `InvoiceBillingItem` ADD CONSTRAINT `InvoiceBillingItem_invoiceBillingSectionId_fkey` FOREIGN KEY (`invoiceBillingSectionId`) REFERENCES `InvoiceBillingSection`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `InvoiceBillingItem` ADD CONSTRAINT `InvoiceBillingItem_serviceId_fkey` FOREIGN KEY (`serviceId`) REFERENCES `Service`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `InvoiceBillingItem` ADD CONSTRAINT `InvoiceBillingItem_invoiceId_fkey` FOREIGN KEY (`invoiceId`) REFERENCES `Invoice`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `InvoiceBillingItem` ADD CONSTRAINT `InvoiceBillingItem_ipdBedAllocationId_fkey` FOREIGN KEY (`ipdBedAllocationId`) REFERENCES `IpdBedAllocation`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `InvoiceBillingItem` ADD CONSTRAINT `InvoiceBillingItem_createdBy_fkey` FOREIGN KEY (`createdBy`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `InvoiceBillingItem` ADD CONSTRAINT `InvoiceBillingItem_updatedBy_fkey` FOREIGN KEY (`updatedBy`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `InvoiceBillingItem` ADD CONSTRAINT `InvoiceBillingItem_deletedBy_fkey` FOREIGN KEY (`deletedBy`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `InvoiceBillingSection` ADD CONSTRAINT `InvoiceBillingSection_invoiceId_fkey` FOREIGN KEY (`invoiceId`) REFERENCES `Invoice`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `InvoiceBillingSection` ADD CONSTRAINT `InvoiceBillingSection_billingSectionId_fkey` FOREIGN KEY (`billingSectionId`) REFERENCES `BillingSection`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `InvoiceBillingSection` ADD CONSTRAINT `InvoiceBillingSection_createdBy_fkey` FOREIGN KEY (`createdBy`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `InvoiceBillingSection` ADD CONSTRAINT `InvoiceBillingSection_updatedBy_fkey` FOREIGN KEY (`updatedBy`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `InvoiceBillingSection` ADD CONSTRAINT `InvoiceBillingSection_deletedBy_fkey` FOREIGN KEY (`deletedBy`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Invoice` ADD CONSTRAINT `Invoice_createdBy_fkey` FOREIGN KEY (`createdBy`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Invoice` ADD CONSTRAINT `Invoice_updatedBy_fkey` FOREIGN KEY (`updatedBy`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Invoice` ADD CONSTRAINT `Invoice_deletedBy_fkey` FOREIGN KEY (`deletedBy`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

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
ALTER TABLE `Opd` ADD CONSTRAINT `Opd_createdBy_fkey` FOREIGN KEY (`createdBy`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Opd` ADD CONSTRAINT `Opd_updatedBy_fkey` FOREIGN KEY (`updatedBy`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Opd` ADD CONSTRAINT `Opd_deletedBy_fkey` FOREIGN KEY (`deletedBy`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Opd` ADD CONSTRAINT `Opd_consultantDoctorId_fkey` FOREIGN KEY (`consultantDoctorId`) REFERENCES `Doctor`(`userId`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Opd` ADD CONSTRAINT `Opd_referringDoctorId_fkey` FOREIGN KEY (`referringDoctorId`) REFERENCES `Doctor`(`userId`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Opd` ADD CONSTRAINT `Opd_patientId_fkey` FOREIGN KEY (`patientId`) REFERENCES `Patient`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Opd` ADD CONSTRAINT `Opd_invoiceId_fkey` FOREIGN KEY (`invoiceId`) REFERENCES `Invoice`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Ipd` ADD CONSTRAINT `Ipd_createdBy_fkey` FOREIGN KEY (`createdBy`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Ipd` ADD CONSTRAINT `Ipd_updatedBy_fkey` FOREIGN KEY (`updatedBy`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Ipd` ADD CONSTRAINT `Ipd_deletedBy_fkey` FOREIGN KEY (`deletedBy`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Ipd` ADD CONSTRAINT `Ipd_dischargedById_fkey` FOREIGN KEY (`dischargedById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Ipd` ADD CONSTRAINT `Ipd_mlcDeclaredById_fkey` FOREIGN KEY (`mlcDeclaredById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Ipd` ADD CONSTRAINT `Ipd_bedId_fkey` FOREIGN KEY (`bedId`) REFERENCES `Bed`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Ipd` ADD CONSTRAINT `Ipd_consultantDoctorId_fkey` FOREIGN KEY (`consultantDoctorId`) REFERENCES `Doctor`(`userId`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Ipd` ADD CONSTRAINT `Ipd_referringDoctorId_fkey` FOREIGN KEY (`referringDoctorId`) REFERENCES `Doctor`(`userId`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Ipd` ADD CONSTRAINT `Ipd_patientId_fkey` FOREIGN KEY (`patientId`) REFERENCES `Patient`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Ipd` ADD CONSTRAINT `Ipd_invoiceId_fkey` FOREIGN KEY (`invoiceId`) REFERENCES `Invoice`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Ipd` ADD CONSTRAINT `Ipd_roomId_fkey` FOREIGN KEY (`roomId`) REFERENCES `Room`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `IpdBedAllocation` ADD CONSTRAINT `IpdBedAllocation_ipdId_fkey` FOREIGN KEY (`ipdId`) REFERENCES `Ipd`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `IpdBedAllocation` ADD CONSTRAINT `IpdBedAllocation_bedId_fkey` FOREIGN KEY (`bedId`) REFERENCES `Bed`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `IpdBedAllocation` ADD CONSTRAINT `IpdBedAllocation_roomId_fkey` FOREIGN KEY (`roomId`) REFERENCES `Room`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `IpdDischargeSummary` ADD CONSTRAINT `IpdDischargeSummary_ipdId_fkey` FOREIGN KEY (`ipdId`) REFERENCES `Ipd`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `IpdDischargeDrug` ADD CONSTRAINT `IpdDischargeDrug_dischargeSummaryId_fkey` FOREIGN KEY (`dischargeSummaryId`) REFERENCES `IpdDischargeSummary`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `IpdDischargeDrug` ADD CONSTRAINT `IpdDischargeDrug_drugId_fkey` FOREIGN KEY (`drugId`) REFERENCES `Drug`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DrugBill` ADD CONSTRAINT `DrugBill_invoiceId_fkey` FOREIGN KEY (`invoiceId`) REFERENCES `Invoice`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DrugBill` ADD CONSTRAINT `DrugBill_patientId_fkey` FOREIGN KEY (`patientId`) REFERENCES `Patient`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DrugBill` ADD CONSTRAINT `DrugBill_customerId_fkey` FOREIGN KEY (`customerId`) REFERENCES `PharmacyCustomer`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DrugBill` ADD CONSTRAINT `DrugBill_doctorId_fkey` FOREIGN KEY (`doctorId`) REFERENCES `Doctor`(`userId`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DrugBill` ADD CONSTRAINT `DrugBill_createdBy_fkey` FOREIGN KEY (`createdBy`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DrugBill` ADD CONSTRAINT `DrugBill_updatedBy_fkey` FOREIGN KEY (`updatedBy`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DrugBill` ADD CONSTRAINT `DrugBill_deletedBy_fkey` FOREIGN KEY (`deletedBy`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PharmacyCustomer` ADD CONSTRAINT `PharmacyCustomer_patientId_fkey` FOREIGN KEY (`patientId`) REFERENCES `Patient`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PharmacyCustomer` ADD CONSTRAINT `PharmacyCustomer_createdBy_fkey` FOREIGN KEY (`createdBy`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PharmacyCustomer` ADD CONSTRAINT `PharmacyCustomer_updatedBy_fkey` FOREIGN KEY (`updatedBy`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PharmacyCustomer` ADD CONSTRAINT `PharmacyCustomer_deletedBy_fkey` FOREIGN KEY (`deletedBy`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DrugBillingCategory` ADD CONSTRAINT `DrugBillingCategory_createdBy_fkey` FOREIGN KEY (`createdBy`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DrugBillingCategory` ADD CONSTRAINT `DrugBillingCategory_updatedBy_fkey` FOREIGN KEY (`updatedBy`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DrugBillingCategory` ADD CONSTRAINT `DrugBillingCategory_deletedBy_fkey` FOREIGN KEY (`deletedBy`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `HsnSac` ADD CONSTRAINT `HsnSac_createdBy_fkey` FOREIGN KEY (`createdBy`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `HsnSac` ADD CONSTRAINT `HsnSac_updatedBy_fkey` FOREIGN KEY (`updatedBy`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `HsnSac` ADD CONSTRAINT `HsnSac_deletedBy_fkey` FOREIGN KEY (`deletedBy`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Drug` ADD CONSTRAINT `Drug_createdBy_fkey` FOREIGN KEY (`createdBy`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Drug` ADD CONSTRAINT `Drug_updatedBy_fkey` FOREIGN KEY (`updatedBy`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Drug` ADD CONSTRAINT `Drug_deletedBy_fkey` FOREIGN KEY (`deletedBy`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DrugSupplier` ADD CONSTRAINT `DrugSupplier_createdBy_fkey` FOREIGN KEY (`createdBy`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DrugSupplier` ADD CONSTRAINT `DrugSupplier_updatedBy_fkey` FOREIGN KEY (`updatedBy`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DrugSupplier` ADD CONSTRAINT `DrugSupplier_deletedBy_fkey` FOREIGN KEY (`deletedBy`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `InventoryItems` ADD CONSTRAINT `InventoryItems_drugId_fkey` FOREIGN KEY (`drugId`) REFERENCES `Drug`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `InventoryItems` ADD CONSTRAINT `InventoryItems_hsnSacCode_fkey` FOREIGN KEY (`hsnSacCode`) REFERENCES `HsnSac`(`code`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `InventoryItems` ADD CONSTRAINT `InventoryItems_supplierId_fkey` FOREIGN KEY (`supplierId`) REFERENCES `DrugSupplier`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `InventoryItems` ADD CONSTRAINT `InventoryItems_createdBy_fkey` FOREIGN KEY (`createdBy`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `InventoryItems` ADD CONSTRAINT `InventoryItems_updatedBy_fkey` FOREIGN KEY (`updatedBy`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `InventoryItems` ADD CONSTRAINT `InventoryItems_deletedBy_fkey` FOREIGN KEY (`deletedBy`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DrugSaleItem` ADD CONSTRAINT `DrugSaleItem_drugBillId_fkey` FOREIGN KEY (`drugBillId`) REFERENCES `DrugBill`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DrugSaleItem` ADD CONSTRAINT `DrugSaleItem_inventoryItemId_fkey` FOREIGN KEY (`inventoryItemId`) REFERENCES `InventoryItems`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `GRNItems` ADD CONSTRAINT `GRNItems_grnId_fkey` FOREIGN KEY (`grnId`) REFERENCES `GRN`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `GRNItems` ADD CONSTRAINT `GRNItems_inventoryItemId_fkey` FOREIGN KEY (`inventoryItemId`) REFERENCES `InventoryItems`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `GRNItems` ADD CONSTRAINT `GRNItems_purchaseItemId_fkey` FOREIGN KEY (`purchaseItemId`) REFERENCES `PurchaseItem`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `GRNItems` ADD CONSTRAINT `GRNItems_challanItemId_fkey` FOREIGN KEY (`challanItemId`) REFERENCES `ChallanItem`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `GRN` ADD CONSTRAINT `GRN_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `PurchaseOrder`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `GRN` ADD CONSTRAINT `GRN_challanId_fkey` FOREIGN KEY (`challanId`) REFERENCES `Challan`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `GRN` ADD CONSTRAINT `GRN_createdBy_fkey` FOREIGN KEY (`createdBy`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `GRN` ADD CONSTRAINT `GRN_updatedBy_fkey` FOREIGN KEY (`updatedBy`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `GRN` ADD CONSTRAINT `GRN_deletedBy_fkey` FOREIGN KEY (`deletedBy`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ChallanItem` ADD CONSTRAINT `ChallanItem_challanId_fkey` FOREIGN KEY (`challanId`) REFERENCES `Challan`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ChallanItem` ADD CONSTRAINT `ChallanItem_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `DrugBillingCategory`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ChallanItem` ADD CONSTRAINT `ChallanItem_drugId_fkey` FOREIGN KEY (`drugId`) REFERENCES `Drug`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ChallanItem` ADD CONSTRAINT `ChallanItem_hsnSacCode_fkey` FOREIGN KEY (`hsnSacCode`) REFERENCES `HsnSac`(`code`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ChallanItem` ADD CONSTRAINT `ChallanItem_inventoryItemId_fkey` FOREIGN KEY (`inventoryItemId`) REFERENCES `InventoryItems`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Challan` ADD CONSTRAINT `Challan_supplierId_fkey` FOREIGN KEY (`supplierId`) REFERENCES `DrugSupplier`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Challan` ADD CONSTRAINT `Challan_createdBy_fkey` FOREIGN KEY (`createdBy`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Challan` ADD CONSTRAINT `Challan_updatedBy_fkey` FOREIGN KEY (`updatedBy`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Challan` ADD CONSTRAINT `Challan_deletedBy_fkey` FOREIGN KEY (`deletedBy`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PurchaseItem` ADD CONSTRAINT `PurchaseItem_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `DrugBillingCategory`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PurchaseItem` ADD CONSTRAINT `PurchaseItem_drugId_fkey` FOREIGN KEY (`drugId`) REFERENCES `Drug`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PurchaseItem` ADD CONSTRAINT `PurchaseItem_hsnSacCode_fkey` FOREIGN KEY (`hsnSacCode`) REFERENCES `HsnSac`(`code`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PurchaseItem` ADD CONSTRAINT `PurchaseItem_purchaseOrderId_fkey` FOREIGN KEY (`purchaseOrderId`) REFERENCES `PurchaseOrder`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PurchaseOrder` ADD CONSTRAINT `PurchaseOrder_supplierId_fkey` FOREIGN KEY (`supplierId`) REFERENCES `DrugSupplier`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PurchaseOrder` ADD CONSTRAINT `PurchaseOrder_createdBy_fkey` FOREIGN KEY (`createdBy`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PurchaseOrder` ADD CONSTRAINT `PurchaseOrder_updatedBy_fkey` FOREIGN KEY (`updatedBy`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PurchaseOrder` ADD CONSTRAINT `PurchaseOrder_deletedBy_fkey` FOREIGN KEY (`deletedBy`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
