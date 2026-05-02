import { getSupplierLedgerDetailsAPI } from "@/controllers/pharmacy/ledger/ledger";
import { ActionType, ModuleType } from "@/generated/prisma/enums";
import { withErrorHandling } from "@/lib/errorHandler";
import { checkPermission } from "@/middlewares/auth/checkUserPermissions";

export async function GET(
  request: Request,
  context: { params: Promise<{ supplierId: string }> },
) {
  return withErrorHandling(async () =>
    checkPermission(
      request,
      [{ module: ModuleType.PHARMACY_SUPPLIER_LEDGER, action: ActionType.VIEW }],
      async (req) => getSupplierLedgerDetailsAPI(req, { params: await context.params }),
    ),
  );
}
