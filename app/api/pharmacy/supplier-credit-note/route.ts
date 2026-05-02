import {
  createSupplierCreditNoteAPI,
  getSupplierCreditNotesAPI,
} from "@/controllers/pharmacy/supplier-payment/supplierPayment";
import { ActionType, ModuleType } from "@/generated/prisma/enums";
import { withErrorHandling } from "@/lib/errorHandler";
import { checkPermission } from "@/middlewares/auth/checkUserPermissions";

export async function GET(request: Request) {
  return withErrorHandling(() =>
    checkPermission(
      request,
      [
        {
          module: ModuleType.PHARMACY_SUPPLIER_CREDIT_NOTE,
          action: ActionType.VIEW,
        },
      ],
      getSupplierCreditNotesAPI,
    ),
  );
}

export async function POST(request: Request) {
  return withErrorHandling(() =>
    checkPermission(
      request,
      [
        {
          module: ModuleType.PHARMACY_SUPPLIER_CREDIT_NOTE,
          action: ActionType.CREATE,
        },
      ],
      createSupplierCreditNoteAPI,
    ),
  );
}
