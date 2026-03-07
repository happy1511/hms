import { createAPI, getAPI } from "@/controllers/bed/bed";
import { ActionType, ModuleType } from "@/generated/prisma/enums";
import { withErrorHandling } from "@/lib/errorHandler";
import { checkPermission } from "@/middlewares/auth/checkUserPermissions";

export async function GET(request: Request) {
  return withErrorHandling(() =>
    checkPermission(
      request,
      [
        { module: ModuleType["BED_MASTER"], action: ActionType["VIEW"] },
        { module: ModuleType["IPD_BILL"], action: ActionType["CREATE"] },
        { module: ModuleType["IPD_BILL"], action: ActionType["UPDATE"] },
      ],
      () => getAPI(request),
    ),
  );
}

export async function POST(request: Request) {
  return withErrorHandling(() =>
    checkPermission(
      request,
      [{ module: ModuleType["BED_MASTER"], action: ActionType["CREATE"] }],
      (req, user) => createAPI(req, user),
    ),
  );
}
