import { createGrnFromChallanAPI } from "@/controllers/pharmacy/challan/challan";
import { ActionType, ModuleType } from "@/generated/prisma/enums";
import { withErrorHandling } from "@/lib/errorHandler";
import { checkPermission } from "@/middlewares/auth/checkUserPermissions";

export async function POST(
  request: Request,
  context: { params: Promise<{ challanId: string }> },
) {
  return withErrorHandling(async () => {
    const params = await context.params;
    return checkPermission(
      request,
      [
        {
          module: ModuleType.PHARMACY_GRN,
          action: ActionType.CREATE,
        },
        {
          module: ModuleType.PHARMACY_CHALLAN,
          action: ActionType.VIEW,
        },
      ],
      (req, user) => createGrnFromChallanAPI(req, { params }, user),
    );
  });
}
