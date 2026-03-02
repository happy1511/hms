import { createAPI, getAPI } from "@/controllers/pharmacy/sale-bill/saleBill";
import { ActionType, ModuleType } from "@/generated/prisma/enums";
import { withErrorHandling } from "@/lib/errorHandler";
import { checkPermission } from "@/middlewares/auth/checkUserPermissions";

export async function GET(request: Request) {
  return withErrorHandling(() =>
    checkPermission(
      request,
      [{ module: ModuleType.PHARMACY_SALE_BILL, action: ActionType.VIEW }],
      getAPI,
    ),
  );
}

export async function POST(request: Request) {
  return withErrorHandling(() =>
    checkPermission(
      request,
      [{ module: ModuleType.PHARMACY_SALE_BILL, action: ActionType.CREATE }],
      createAPI,
    ),
  );
}
