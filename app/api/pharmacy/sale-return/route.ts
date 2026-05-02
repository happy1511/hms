import { createAPI } from "@/controllers/pharmacy/sale-return/saleReturn";
import { ActionType, ModuleType } from "@/generated/prisma/enums";
import { withErrorHandling } from "@/lib/errorHandler";
import { checkPermission } from "@/middlewares/auth/checkUserPermissions";

export async function POST(request: Request) {
  return withErrorHandling(() =>
    checkPermission(
      request,
      [{ module: ModuleType.PHARMACY_SALE_RETURN, action: ActionType.CREATE }],
      createAPI,
    ),
  );
}
