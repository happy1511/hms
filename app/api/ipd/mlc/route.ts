import { declareIpdMlcAPI } from "@/controllers/ipd/ipd";
import { ActionType, ModuleType } from "@/generated/prisma/enums";
import { withErrorHandling } from "@/lib/errorHandler";
import { checkPermission } from "@/middlewares/auth/checkUserPermissions";

export async function PUT(request: Request) {
  return withErrorHandling(() =>
    checkPermission(
      request,
      [{ module: ModuleType.IPD_MLC, action: ActionType.UPDATE }],
      (req, user) => declareIpdMlcAPI(req, user),
    ),
  );
}
