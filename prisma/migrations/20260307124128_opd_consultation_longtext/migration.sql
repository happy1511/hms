-- AlterTable
ALTER TABLE `opdconsultation` MODIFY `notes` LONGTEXT NULL,
    MODIFY `generalExaminations` LONGTEXT NULL,
    MODIFY `systemicExaminations` LONGTEXT NULL,
    MODIFY `diagnosis` LONGTEXT NULL,
    MODIFY `chronicIllness` LONGTEXT NULL;

-- AlterTable
ALTER TABLE `prescription` MODIFY `followUpAdvice` LONGTEXT NULL,
    MODIFY `otherAdvice` LONGTEXT NULL;
