import { getIpdDischargeSummaryAPI } from "@/controllers/ipd/ipd";
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
      [{ module: ModuleType.DISCHARGE_PATIENT, action: ActionType.VIEW }],
      (req, user) =>
        getIpdDischargeSummaryAPI(req, { params: { ipdId: Number(ipdId) } }, user),
    ),
  );
}

