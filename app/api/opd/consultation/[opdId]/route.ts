import { getConsultationAPI } from "@/controllers/opd/opd";
import { ActionType, ModuleType } from "@/generated/prisma/enums";
import { withErrorHandling } from "@/lib/errorHandler";
import { checkPermission } from "@/middlewares/auth/checkUserPermissions";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ opdId: string }> },
) {
  const { opdId } = await params;
  return withErrorHandling(() =>
    checkPermission(
      request,
      [{ module: ModuleType.CONSULTATION_FILE, action: ActionType["VIEW"] }],
      (req, user) =>
        getConsultationAPI(req, { params: { opdId: Number(opdId) } }, user),
    ),
  );
}
