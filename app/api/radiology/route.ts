import {
  createAPI,
  deleteAPI,
  getAPI,
} from "@/controllers/radiology/radiology";
import { ActionType, ModuleType } from "@/generated/prisma/enums";
import { withErrorHandling } from "@/lib/errorHandler";
import { checkPermission } from "@/middlewares/auth/checkUserPermissions";

export async function GET(request: Request) {
  return withErrorHandling(() =>
    checkPermission(
      request,
      [
        {
          module: ModuleType["RADIOLOGY_TEST_MASTER"],
          action: ActionType["VIEW"],
        },
        {
          module: ModuleType["SERVICE_MASTER"],
          action: ActionType["CREATE"],
        },
        {
          module: ModuleType["SERVICE_MASTER"],
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
          module: ModuleType["RADIOLOGY_TEST_MASTER"],
          action: ActionType["CREATE"],
        },
      ],
      () => createAPI(request),
    ),
  );
}

export async function DELETE(request: Request) {
  return withErrorHandling(() =>
    checkPermission(
      request,
      [
        {
          module: ModuleType["RADIOLOGY_TEST_MASTER"],
          action: ActionType["DELETE"],
        },
      ],
      () => deleteAPI(request),
    ),
  );
}
