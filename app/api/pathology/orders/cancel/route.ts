import { cancelOrderAPI } from "@/controllers/pathology/pathology";
import { ActionType, ModuleType } from "@/generated/prisma/enums";
import { withErrorHandling } from "@/lib/errorHandler";
import { checkPermission } from "@/middlewares/auth/checkUserPermissions";

export async function PUT(request: Request) {
  return withErrorHandling(() =>
    checkPermission(
      request,
      [
        {
          module: ModuleType["PATHOLOGY_ORDER"],
          action: ActionType["UPDATE"],
        },
      ],
      cancelOrderAPI,
    ),
  );
}
