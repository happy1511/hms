import { addTransactionAPI } from "@/controllers/invoice/invoice";
import { ActionType, ModuleType } from "@/generated/prisma/enums";
import { withErrorHandling } from "@/lib/errorHandler";
import { checkPermission } from "@/middlewares/auth/checkUserPermissions";

export async function POST(request: Request) {
  return withErrorHandling(() =>
    checkPermission(
      request,
      [{ module: ModuleType["INVOICE"], action: ActionType["UPDATE"] }],
      addTransactionAPI,
    ),
  );
}
