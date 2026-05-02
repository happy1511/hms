import { getAPI } from "@/controllers/dashboard/dashboard";
import { ActionType, ModuleType } from "@/generated/prisma/enums";
import { withErrorHandling } from "@/lib/errorHandler";
import { checkPermission } from "@/middlewares/auth/checkUserPermissions";

export async function GET(request: Request) {
  const dashboardPermissions = [
    { module: ModuleType.HOSPITAL_DASHBOARD, action: ActionType.VIEW },
    { module: ModuleType.PHARMACY_DASHBOARD, action: ActionType.VIEW },
    { module: ModuleType.LAB_DASHBOARD, action: ActionType.VIEW },
  ];

  return withErrorHandling(() =>
    checkPermission(request, dashboardPermissions, getAPI),
  );
}
