import { updateStockCorrectionAPI } from "@/controllers/pharmacy/inventory/inventory";
import { ActionType, ModuleType } from "@/generated/prisma/enums";
import { withErrorHandling } from "@/lib/errorHandler";
import { checkPermission } from "@/middlewares/auth/checkUserPermissions";

export async function PUT(
  request: Request,
  context: { params: Promise<{ inventoryItemId: string }> },
) {
  return withErrorHandling(async () =>
    checkPermission(
      request,
      [{ module: ModuleType.PHARMACY_STOCK_CORRECTION, action: ActionType.UPDATE }],
      async (req, user) =>
        updateStockCorrectionAPI(req, { params: await context.params }, user),
    ),
  );
}
