import SupplierLedgerEntryForm from "./SupplierLedgerEntryForm";
import { ModuleType, SupplierPaymentType } from "@/generated/prisma/enums";

const SupplierPaymentForm = () => {
  return (
    <SupplierLedgerEntryForm
      type={SupplierPaymentType.DEBIT}
      title="Create Supplier Payment"
      permissionModule={ModuleType.PHARMACY_SUPPLIER_PAYMENT}
      submitLabel="Save Supplier Payment"
      referenceLabel="Reference"
    />
  );
};

export default SupplierPaymentForm;
