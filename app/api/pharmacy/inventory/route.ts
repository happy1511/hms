import { getAPI } from "@/controllers/pharmacy/inventory/inventory";
import { ActionType, ModuleType } from "@/generated/prisma/enums";
import { withErrorHandling } from "@/lib/errorHandler";
import { checkPermission } from "@/middlewares/auth/checkUserPermissions";

export async function GET(request: Request) {
  return withErrorHandling(() =>
    checkPermission(
      request,
      [{ module: ModuleType.PHARMACY_INVENTORY, action: ActionType.VIEW }],
      getAPI,
    ),
  );
}
