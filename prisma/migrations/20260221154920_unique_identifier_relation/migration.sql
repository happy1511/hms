/*
  Warnings:

  - You are about to alter the column `type` on the `patientrelations` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Enum(EnumId(7))`.
  - A unique constraint covering the columns `[patientId,name,type]` on the table `PatientRelations` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `patientrelations` MODIFY `type` ENUM('NONE', 'WIFE_OF', 'HUSBAND_OF', 'SON_OF', 'DAUGHTER_OF', 'BROTHER_OF', 'SISTER_OF', 'FATHER_OF', 'MOTHER_OF', 'OTHER') NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `PatientRelations_patientId_name_type_key` ON `PatientRelations`(`patientId`, `name`, `type`);
