import {
  createSupplierPaymentAPI,
  getSupplierPaymentsAPI,
} from "@/controllers/pharmacy/supplier-payment/supplierPayment";
import { ActionType, ModuleType } from "@/generated/prisma/enums";
import { withErrorHandling } from "@/lib/errorHandler";
import { checkPermission } from "@/middlewares/auth/checkUserPermissions";

export async function GET(request: Request) {
  return withErrorHandling(() =>
    checkPermission(
      request,
      [{ module: ModuleType.PHARMACY_SUPPLIER_PAYMENT, action: ActionType.VIEW }],
      getSupplierPaymentsAPI,
    ),
  );
}

export async function POST(request: Request) {
  return withErrorHandling(() =>
    checkPermission(
      request,
      [
        {
          module: ModuleType.PHARMACY_SUPPLIER_PAYMENT,
          action: ActionType.CREATE,
        },
      ],
      createSupplierPaymentAPI,
    ),
  );
}
