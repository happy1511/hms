import { updateOpdDoctorsAPI } from "@/controllers/opd/opd";
import { ActionType, ModuleType } from "@/generated/prisma/enums";
import { withErrorHandling } from "@/lib/errorHandler";
import { checkPermission } from "@/middlewares/auth/checkUserPermissions";

export async function PUT(request: Request) {
  return withErrorHandling(() =>
    checkPermission(
      request,
      [{ module: ModuleType["OPD_BILL"], action: ActionType["UPDATE"] }],
      (req, user) => updateOpdDoctorsAPI(req, user),
    ),
  );
}

