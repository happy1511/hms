import { getAdmissionPrintAPI } from "@/controllers/ipd/ipd";
import { ActionType, ModuleType } from "@/generated/prisma/enums";
import { withErrorHandling } from "@/lib/errorHandler";
import { checkPermission } from "@/middlewares/auth/checkUserPermissions";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ ipdId: string }> },
) {
  const { ipdId } = await params;
  return withErrorHandling(() =>
    checkPermission(
      request,
      [{ module: ModuleType.IPD_BILL, action: ActionType["VIEW"] }],
      (req) => getAdmissionPrintAPI(req, { params: { ipdId: Number(ipdId) } }),
    ),
  );
}
