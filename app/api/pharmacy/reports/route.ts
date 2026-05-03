import { getAPI } from "@/controllers/pharmacy/report/report";
import { ActionType, ModuleType } from "@/generated/prisma/enums";
import { withErrorHandling } from "@/lib/errorHandler";
import { checkPermission } from "@/middlewares/auth/checkUserPermissions";

const PHARMACY_REPORT_COUNTER_SALE_MODULE =
  "PHARMACY_REPORT_COUNTER_SALE" as ModuleType;
const PHARMACY_REPORT_IPD_SALE_MODULE =
  "PHARMACY_REPORT_IPD_SALE" as ModuleType;
const PHARMACY_REPORT_PO_MODULE = "PHARMACY_REPORT_PO" as ModuleType;
const PHARMACY_REPORT_GRN_MODULE = "PHARMACY_REPORT_GRN" as ModuleType;
const PHARMACY_REPORT_STOCK_MODULE = "PHARMACY_REPORT_STOCK" as ModuleType;

export async function GET(request: Request) {
  return withErrorHandling(() =>
    checkPermission(
      request,
      [
        { module: PHARMACY_REPORT_COUNTER_SALE_MODULE, action: ActionType.VIEW },
        { module: PHARMACY_REPORT_IPD_SALE_MODULE, action: ActionType.VIEW },
        { module: PHARMACY_REPORT_PO_MODULE, action: ActionType.VIEW },
        { module: PHARMACY_REPORT_GRN_MODULE, action: ActionType.VIEW },
        { module: PHARMACY_REPORT_STOCK_MODULE, action: ActionType.VIEW },
      ],
      getAPI,
    ),
  );
}
