import { createAPI, getAPI } from "@/controllers/room/room";
import { ActionType, ModuleType } from "@/generated/prisma/enums";
import { withErrorHandling } from "@/lib/errorHandler";
import { checkPermission } from "@/middlewares/auth/checkUserPermissions";

export async function GET(request: Request) {
  return withErrorHandling(() =>
    checkPermission(
      request,
      [
        {
          module: ModuleType["ROOM_MASTER"],
          action: ActionType["VIEW"],
        },
        {
          module: ModuleType["BED_MASTER"],
          action: ActionType["CREATE"],
        },
        {
          module: ModuleType["BED_MASTER"],
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
          module: ModuleType["ROOM_MASTER"],
          action: ActionType["CREATE"],
        },
      ],
      () => createAPI(request),
    ),
  );
}
