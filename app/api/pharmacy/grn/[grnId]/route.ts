import { getDetailsAPI } from "@/controllers/pharmacy/grn/grn";
import { ActionType, ModuleType } from "@/generated/prisma/enums";
import { withErrorHandling } from "@/lib/errorHandler";
import { checkPermission } from "@/middlewares/auth/checkUserPermissions";

export async function GET(
  request: Request,
  context: { params: Promise<{ grnId: string }> },
) {
  const params = await context.params;

  return withErrorHandling(() =>
    checkPermission(
      request,
      [
        {
          module: ModuleType.PHARMACY_GRN,
          action: ActionType.VIEW,
        },
      ],
      (req) => getDetailsAPI(req, { params }),
    ),
  );
}
