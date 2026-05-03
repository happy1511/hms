import { getIpdPatientListAPI } from "@/controllers/pharmacy/ipd-bill/ipdBill";
import { ActionType, ModuleType } from "@/generated/prisma/enums";
import { withErrorHandling } from "@/lib/errorHandler";
import { checkPermission } from "@/middlewares/auth/checkUserPermissions";

const PHARMACY_IPD_ISSUE_MODULE = "PHARMACY_IPD_ISSUE" as ModuleType;
const PHARMACY_IPD_RETURN_MODULE = "PHARMACY_IPD_RETURN" as ModuleType;
const PHARMACY_IPD_BILL_MODULE = "PHARMACY_IPD_BILL" as ModuleType;

export async function GET(request: Request) {
  return withErrorHandling(() =>
    checkPermission(
      request,
      [
        { module: PHARMACY_IPD_ISSUE_MODULE, action: ActionType.VIEW },
        { module: PHARMACY_IPD_ISSUE_MODULE, action: ActionType.CREATE },
        { module: PHARMACY_IPD_RETURN_MODULE, action: ActionType.VIEW },
        { module: PHARMACY_IPD_RETURN_MODULE, action: ActionType.CREATE },
        { module: PHARMACY_IPD_BILL_MODULE, action: ActionType.VIEW },
      ],
      getIpdPatientListAPI,
    ),
  );
}
