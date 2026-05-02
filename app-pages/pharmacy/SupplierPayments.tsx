import SupplierLedgerEntries from "./SupplierLedgerEntries";
import { ModuleType, SupplierPaymentType } from "@/generated/prisma/enums";

const SupplierPayments = () => {
  return (
    <SupplierLedgerEntries
      type={SupplierPaymentType.DEBIT}
      title="Supplier Payments"
      createPath="/pharmacy/supplier-payment/new"
      permissionModule={ModuleType.PHARMACY_SUPPLIER_PAYMENT}
      createLabel="New Supplier Payment"
    />
  );
};

export default SupplierPayments;
