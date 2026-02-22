import { markOutsourceOrderAPI } from "@/controllers/radiology/radiology";
import { ActionType, ModuleType } from "@/generated/prisma/enums";
import { withErrorHandling } from "@/lib/errorHandler";
import { checkPermission } from "@/middlewares/auth/checkUserPermissions";

export async function PUT(request: Request) {
  return withErrorHandling(() =>
    checkPermission(
      request,
      [
        {
          module: ModuleType["RADIOLOGY_ORDER"],
          action: ActionType["UPDATE"],
        },
      ],
      markOutsourceOrderAPI,
    ),
  );
}
