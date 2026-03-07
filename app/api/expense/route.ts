import { createAPI, getAPI } from "@/controllers/finance/expense";
import { ActionType, ModuleType } from "@/generated/prisma/enums";
import { withErrorHandling } from "@/lib/errorHandler";
import { checkPermission } from "@/middlewares/auth/checkUserPermissions";

export async function GET(request: Request) {
  return withErrorHandling(() =>
    checkPermission(
      request,
      [{ module: ModuleType.EXPENSE, action: ActionType.VIEW }],
      () => getAPI(request),
    ),
  );
}

export async function POST(request: Request) {
  return withErrorHandling(() =>
    checkPermission(
      request,
      [{ module: ModuleType.EXPENSE, action: ActionType.CREATE }],
      (req, user) => createAPI(req, user),
    ),
  );
}
