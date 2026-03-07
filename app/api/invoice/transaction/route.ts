import { addTransactionAPI } from "@/controllers/invoice/invoice";
import { ActionType, ModuleType } from "@/generated/prisma/enums";
import { withErrorHandling } from "@/lib/errorHandler";
import { checkPermission } from "@/middlewares/auth/checkUserPermissions";

export async function POST(request: Request) {
  return withErrorHandling(() =>
    checkPermission(
      request,
      [
        { module: ModuleType.OPD_BILL, action: ActionType.UPDATE },
        { module: ModuleType.IPD_BILL, action: ActionType.UPDATE },
        { module: ModuleType.PHARMACY_SALE_BILL, action: ActionType.UPDATE },
      ],
      addTransactionAPI,
    ),
  );
}
