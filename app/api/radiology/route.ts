import {
  createAPI,
  deleteAPI,
  getAPI,
  updateAPI,
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
      (req, user) => createAPI(req, user),
    ),
  );
}

export async function PUT(request: Request) {
  return withErrorHandling(() =>
    checkPermission(
      request,
      [
        {
          module: ModuleType["RADIOLOGY_TEST_MASTER"],
          action: ActionType["UPDATE"],
        },
      ],
      (req, user) => updateAPI(req, user),
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
      (req, user) => deleteAPI(req, user),
    ),
  );
}
