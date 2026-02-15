import { deleteQueueAPI, getQueueAPI } from "@/controllers/opd/opd";
import { ActionType, ModuleType } from "@/generated/prisma/enums";
import { withErrorHandling } from "@/lib/errorHandler";
import { checkPermission } from "@/middlewares/auth/checkUserPermissions";

export async function GET(request: Request) {
  return withErrorHandling(() =>
    checkPermission(
      request,
      [{ module: ModuleType["OPD_QUEUE"], action: ActionType["VIEW"] }],
      () => getQueueAPI(request),
    ),
  );
}

export async function DELETE(request: Request) {
  return withErrorHandling(() =>
    checkPermission(
      request,
      [{ module: ModuleType["OPD_QUEUE"], action: ActionType["DELETE"] }],
      () => deleteQueueAPI(request),
    ),
  );
}
