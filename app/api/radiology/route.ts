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
      ModuleType["RADIOLOGY_TEST_MASTER"],
      ActionType["VIEW"],
      () => getAPI(request),
    ),
  );
}

export async function POST(request: Request) {
  return withErrorHandling(() =>
    checkPermission(
      request,
      ModuleType["RADIOLOGY_TEST_MASTER"],
      ActionType["CREATE"],
      () => createAPI(request),
    ),
  );
}

export async function DELETE(request: Request) {
  return withErrorHandling(() =>
    checkPermission(
      request,
      ModuleType["RADIOLOGY_TEST_MASTER"],
      ActionType["CREATE"],
      () => deleteAPI(request),
    ),
  );
}
