import SupplierLedgerEntryForm from "./SupplierLedgerEntryForm";
import { ModuleType, SupplierPaymentType } from "@/generated/prisma/enums";

const SupplierCreditNoteForm = () => {
  return (
    <SupplierLedgerEntryForm
      type={SupplierPaymentType.CREDIT}
      title="Create Supplier Credit Note"
      permissionModule={ModuleType.PHARMACY_SUPPLIER_CREDIT_NOTE}
      submitLabel="Save Supplier Credit Note"
      referenceLabel="Supplier Reference"
    />
  );
};

export default SupplierCreditNoteForm;
