import { createAPI, getAPI } from "@/controllers/service/service";
import { ActionType, ModuleType } from "@/generated/prisma/enums";
import { withErrorHandling } from "@/lib/errorHandler";
import { checkPermission } from "@/middlewares/auth/checkUserPermissions";

export async function GET(request: Request) {
  return withErrorHandling(() =>
    checkPermission(
      request,
      ModuleType["SERVICE_MASTER"],
      ActionType["VIEW"],
      () => getAPI(request),
    ),
  );
}

export async function POST(request: Request) {
  return withErrorHandling(() =>
    checkPermission(
      request,
      ModuleType["SERVICE_MASTER"],
      ActionType["CREATE"],
      () => createAPI(request),
    ),
  );
}
