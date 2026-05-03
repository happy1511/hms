import SupplierLedgerEntries from "./SupplierLedgerEntries";
import { ModuleType, SupplierPaymentType } from "@/generated/prisma/enums";

const SupplierCreditNotes = () => {
  return (
    <SupplierLedgerEntries
      type={SupplierPaymentType.CREDIT}
      title="Supplier Credit Notes"
      createPath="/pharmacy/form/supplier-credit-note/new"
      permissionModule={ModuleType.PHARMACY_SUPPLIER_CREDIT_NOTE}
      createLabel="New Supplier Credit Note"
    />
  );
};

export default SupplierCreditNotes;
