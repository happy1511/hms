import { getInvoiceDetailsAPI, updateInvoiceAPI } from "@/controllers/opd/opd";
import { ActionType, ModuleType } from "@/generated/prisma/enums";
import { withErrorHandling } from "@/lib/errorHandler";
import { checkPermission } from "@/middlewares/auth/checkUserPermissions";

export async function GET(request: Request) {
  return withErrorHandling(() =>
    checkPermission(
      request,
      [{ module: ModuleType["OPD_BILL"], action: ActionType["VIEW"] }],
      getInvoiceDetailsAPI,
    ),
  );
}

export async function PUT(request: Request) {
  return withErrorHandling(() =>
    checkPermission(
      request,
      [{ module: ModuleType["OPD_BILL"], action: ActionType["UPDATE"] }],
      updateInvoiceAPI,
    ),
  );
}
