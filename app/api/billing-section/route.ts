import {
  createAPI,
  getAPI,
} from "@/controllers/billing-section/billingSection";
import { ActionType, ModuleType } from "@/generated/prisma/enums";
import { withErrorHandling } from "@/lib/errorHandler";
import { checkPermission } from "@/middlewares/auth/checkUserPermissions";

export async function GET(request: Request) {
  return withErrorHandling(() =>
    checkPermission(
      request,
      [
        {
          module: ModuleType["BILLING_SECTION_MASTER"],
          action: ActionType["VIEW"],
        },
        {
          module: ModuleType["OPD_BILL"],
          action: ActionType["CREATE"],
        },
        {
          module: ModuleType["OPD_BILL"],
          action: ActionType["UPDATE"],
        },
        {
          module: ModuleType["OPD_BILL"],
          action: ActionType["VIEW"],
        },
        {
          module: ModuleType["IPD_BILL"],
          action: ActionType["CREATE"],
        },
        {
          module: ModuleType["IPD_BILL"],
          action: ActionType["UPDATE"],
        },
        {
          module: ModuleType["IPD_BILL"],
          action: ActionType["VIEW"],
        },
        {
          module: ModuleType["PHARMACY_SALE_BILL"],
          action: ActionType["UPDATE"],
        },
        {
          module: ModuleType["PHARMACY_SALE_BILL"],
          action: ActionType["VIEW"],
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
          module: ModuleType["BILLING_SECTION_MASTER"],
          action: ActionType["VIEW"],
        },
      ],
      (req, user) => createAPI(req, user),
    ),
  );
}
