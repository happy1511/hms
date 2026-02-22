import {
  getOrdersAPI,
  updateOrderAPI,
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
          module: ModuleType["RADIOLOGY_ORDER"],
          action: ActionType["VIEW"],
        },
      ],
      getOrdersAPI,
    ),
  );
}

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
      updateOrderAPI,
    ),
  );
}
