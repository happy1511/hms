import {
  getInvoiceDetailsAPI,
  updateInvoiceAPI,
} from "@/controllers/invoice/invoice";
import { ActionType, ModuleType } from "@/generated/prisma/enums";
import { withErrorHandling } from "@/lib/errorHandler";
import { checkPermission } from "@/middlewares/auth/checkUserPermissions";

export async function GET(request: Request) {
  return withErrorHandling(() =>
    checkPermission(
      request,
      [{ module: ModuleType["INVOICE"], action: ActionType["VIEW"] }],
      () => getInvoiceDetailsAPI(request),
    ),
  );
}

export async function PUT(request: Request) {
  return withErrorHandling(() =>
    checkPermission(
      request,
      [{ module: ModuleType["INVOICE"], action: ActionType["UPDATE"] }],
      updateInvoiceAPI,
    ),
  );
}
