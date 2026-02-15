import { createAPI } from "@/controllers/opd/opd";
import { ActionType, ModuleType } from "@/generated/prisma/enums";
import { withErrorHandling } from "@/lib/errorHandler";
import { checkPermission } from "@/middlewares/auth/checkUserPermissions";

export async function POST(request: Request) {
  return withErrorHandling(() =>
    checkPermission(
      request,
      [{ module: ModuleType["OPD_BILL"], action: ActionType["CREATE"] }],
      () => createAPI(request),
    ),
  );
}
