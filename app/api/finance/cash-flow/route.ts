import { getCashFlowSummaryAPI } from "@/controllers/finance/cashFlow";
import { ActionType, ModuleType } from "@/generated/prisma/enums";
import { withErrorHandling } from "@/lib/errorHandler";
import { checkPermission } from "@/middlewares/auth/checkUserPermissions";

export async function GET(request: Request) {
  return withErrorHandling(() =>
    checkPermission(
      request,
      [
        { module: ModuleType.FINANCE_BILLING, action: ActionType.VIEW },
        { module: ModuleType.FINANCE_PAYMENTS, action: ActionType.VIEW },
      ],
      () => getCashFlowSummaryAPI(request),
    ),
  );
}

