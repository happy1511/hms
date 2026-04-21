import { createAPI, deleteAPI, getAPI } from "@/controllers/ipd/ipd";
import { ActionType, ModuleType } from "@/generated/prisma/enums";
import { withErrorHandling } from "@/lib/errorHandler";
import { checkPermission } from "@/middlewares/auth/checkUserPermissions";

export async function GET(request: Request) {
  return withErrorHandling(() =>
    checkPermission(
      request,
      [
        { module: ModuleType.IPD_BILL, action: ActionType.VIEW },
        { module: ModuleType.DAY_CARE_IPD, action: ActionType.VIEW },
        { module: ModuleType.IPD_MLC, action: ActionType.VIEW },
      ],
      (req, user) => getAPI(req, user),
    ),
  );
}

export async function POST(request: Request) {
  return withErrorHandling(() =>
    checkPermission(
      request,
      [
        { module: ModuleType.IPD_BILL, action: ActionType.CREATE },
        { module: ModuleType.DAY_CARE_IPD, action: ActionType.CREATE },
      ],
      (req, user) => createAPI(req, user),
    ),
  );
}

export async function DELETE(request: Request) {
  return withErrorHandling(() =>
    checkPermission(
      request,
      [
        { module: ModuleType.IPD_BILL, action: ActionType.DELETE },
        { module: ModuleType.DAY_CARE_IPD, action: ActionType.DELETE },
      ],
      (req, user) => deleteAPI(req, user),
    ),
  );
}
