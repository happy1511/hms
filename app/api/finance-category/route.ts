import { createAPI, getAPI } from "@/controllers/finance/category";
import { ActionType, ModuleType } from "@/generated/prisma/enums";
import { withErrorHandling } from "@/lib/errorHandler";
import { checkPermission } from "@/middlewares/auth/checkUserPermissions";

export async function GET(request: Request) {
  return withErrorHandling(() =>
    checkPermission(
      request,
      [
        { module: ModuleType.FINANCE_CATEGORY_MASTER, action: ActionType.VIEW },
        { module: ModuleType.INCOME, action: ActionType.VIEW },
        { module: ModuleType.INCOME, action: ActionType.CREATE },
        { module: ModuleType.INCOME, action: ActionType.UPDATE },
        { module: ModuleType.EXPENSE, action: ActionType.VIEW },
        { module: ModuleType.EXPENSE, action: ActionType.CREATE },
        { module: ModuleType.EXPENSE, action: ActionType.UPDATE },
      ],
      () => getAPI(request),
    ),
  );
}

export async function POST(request: Request) {
  return withErrorHandling(() =>
    checkPermission(
      request,
      [
        {
          module: ModuleType.FINANCE_CATEGORY_MASTER,
          action: ActionType.CREATE,
        },
      ],
      (req, user) => createAPI(req, user),
    ),
  );
}
