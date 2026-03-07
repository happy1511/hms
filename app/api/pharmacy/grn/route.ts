import { createAPI, getAPI } from "@/controllers/pharmacy/grn/grn";
import { ActionType, ModuleType } from "@/generated/prisma/enums";
import { withErrorHandling } from "@/lib/errorHandler";
import { checkPermission } from "@/middlewares/auth/checkUserPermissions";

export async function GET(request: Request) {
  return withErrorHandling(() =>
    checkPermission(
      request,
      [
        {
          module: ModuleType["PHARMACY_GRN"],
          action: ActionType["VIEW"],
        },
      ],
      getAPI,
    ),
  );
}

export async function POST(request: Request) {
  return withErrorHandling(() =>
    checkPermission(
      request,
      [
        {
          module: ModuleType["PHARMACY_GRN"],
          action: ActionType["CREATE"],
        },
      ],
      (req, user) => createAPI(req, user),
    ),
  );
}
