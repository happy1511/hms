import {
  createReturnAPI,
  getReturnListAPI,
} from "@/controllers/pharmacy/ipd-bill/ipdBill";
import { ActionType, ModuleType } from "@/generated/prisma/enums";
import { withErrorHandling } from "@/lib/errorHandler";
import { checkPermission } from "@/middlewares/auth/checkUserPermissions";

const PHARMACY_IPD_RETURN_MODULE = "PHARMACY_IPD_RETURN" as ModuleType;

export async function GET(request: Request) {
  return withErrorHandling(() =>
    checkPermission(
      request,
      [{ module: PHARMACY_IPD_RETURN_MODULE, action: ActionType.VIEW }],
      getReturnListAPI,
    ),
  );
}

export async function POST(request: Request) {
  return withErrorHandling(() =>
    checkPermission(
      request,
      [{ module: PHARMACY_IPD_RETURN_MODULE, action: ActionType.CREATE }],
      createReturnAPI,
    ),
  );
}
