import { createAPI, getAPI } from "@/controllers/hsn-sac/hsnSac";
import { ActionType, ModuleType } from "@/generated/prisma/enums";
import { withErrorHandling } from "@/lib/errorHandler";
import { checkPermission } from "@/middlewares/auth/checkUserPermissions";

export async function GET(request: Request) {
  return withErrorHandling(() =>
    checkPermission(
      request,
      [
        {
          module: ModuleType.PHARMACY_HSN_SAC_MASTER,
          action: ActionType.VIEW,
        },
        {
          module: ModuleType.PHARMACY_DRUG_MASTER,
          action: ActionType.CREATE,
        },
        {
          module: ModuleType.PHARMACY_DRUG_MASTER,
          action: ActionType.UPDATE,
        },
        {
          module: ModuleType.PHARMACY_PURCHASE_ORDER,
          action: ActionType.CREATE,
        },
        {
          module: ModuleType.PHARMACY_PURCHASE_ORDER,
          action: ActionType.UPDATE,
        },
        {
          module: ModuleType.PHARMACY_GRN,
          action: ActionType.CREATE,
        },
        {
          module: ModuleType.PHARMACY_SALE_BILL,
          action: ActionType.CREATE,
        },
        {
          module: ModuleType.PHARMACY_SALE_BILL,
          action: ActionType.UPDATE,
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
          module: ModuleType.PHARMACY_HSN_SAC_MASTER,
          action: ActionType.CREATE,
        },
      ],
      (req, user) => createAPI(req, user),
    ),
  );
}
