import { createAPI, getAPI } from "@/controllers/department/department";
import { ActionType, ModuleType } from "@/generated/prisma/enums";
import { withErrorHandling } from "@/lib/errorHandler";
import { checkPermission } from "@/middlewares/auth/checkUserPermissions";

export async function GET(request: Request) {
  return withErrorHandling(() =>
    checkPermission(
      request,
      [
        { module: ModuleType["DEPARTMENT_MASTER"], action: ActionType["VIEW"] },
        {
          module: ModuleType["ROOM_TYPE_MASTER"],
          action: ActionType["CREATE"],
        },
        {
          module: ModuleType["ROOM_TYPE_MASTER"],
          action: ActionType["UPDATE"],
        },
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
          module: ModuleType["DEPARTMENT_MASTER"],
          action: ActionType["CREATE"],
        },
      ],
      () => createAPI(request),
    ),
  );
}
