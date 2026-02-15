import { createAPI, getAPI } from "@/controllers/service/service";
import { ActionType, ModuleType } from "@/generated/prisma/enums";
import { withErrorHandling } from "@/lib/errorHandler";
import { checkPermission } from "@/middlewares/auth/checkUserPermissions";

export async function GET(request: Request) {
  return withErrorHandling(() =>
    checkPermission(
      request,
      [
        {
          module: ModuleType["SERVICE_MASTER"],
          action: ActionType["VIEW"],
        },
        {
          module: ModuleType["BILLING_SECTION_MASTER"],
          action: ActionType["CREATE"],
        },
        {
          module: ModuleType["BILLING_SECTION_MASTER"],
          action: ActionType["UPDATE"],
        },
        {
          module: ModuleType["OPD_BILL"],
          action: ActionType["CREATE"],
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
          module: ModuleType["SERVICE_MASTER"],
          action: ActionType["CREATE"],
        },
      ],
      () => createAPI(request),
    ),
  );
}
