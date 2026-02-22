/*
  Warnings:

  - A unique constraint covering the columns `[opdId,testId]` on the table `AdvisedPathologyTests` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[opdId,testId]` on the table `AdvisedRadiologyTests` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `AdvisedPathologyTests_opdId_testId_key` ON `AdvisedPathologyTests`(`opdId`, `testId`);

-- CreateIndex
CREATE UNIQUE INDEX `AdvisedRadiologyTests_opdId_testId_key` ON `AdvisedRadiologyTests`(`opdId`, `testId`);
