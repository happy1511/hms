import { getDetailsAPI } from "@/controllers/pharmacy/customer/customer";
import { ActionType, ModuleType } from "@/generated/prisma/enums";
import { withErrorHandling } from "@/lib/errorHandler";
import { checkPermission } from "@/middlewares/auth/checkUserPermissions";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ customerId: string }> },
) {
  const p = await params;
  return withErrorHandling(() =>
    checkPermission(
      request,
      [{ module: ModuleType.PHARMACY_SALE_BILL, action: ActionType.VIEW }],
      (req) => getDetailsAPI(req, { params: p }),
    ),
  );
}
