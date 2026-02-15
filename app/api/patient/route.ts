import { createAPI, getAPI } from "@/controllers/patient/patient";
import { ActionType, ModuleType } from "@/generated/prisma/enums";
import { withErrorHandling } from "@/lib/errorHandler";
import { checkPermission } from "@/middlewares/auth/checkUserPermissions";

export async function GET(request: Request) {
  return withErrorHandling(() =>
    checkPermission(
      request,
      [
        {
          module: ModuleType["PATIENT_MASTER"],
          action: ActionType["VIEW"],
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
          module: ModuleType["PATIENT_MASTER"],
          action: ActionType["CREATE"],
        },
      ],
      () => createAPI(request),
    ),
  );
}
