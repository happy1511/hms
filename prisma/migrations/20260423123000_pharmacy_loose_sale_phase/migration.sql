-- AlterTable
ALTER TABLE `DrugBill`
    ADD COLUMN `isLooseBill` BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE `DrugSaleItem`
    ADD COLUMN `isLooseQuantity` BOOLEAN NOT NULL DEFAULT false;
