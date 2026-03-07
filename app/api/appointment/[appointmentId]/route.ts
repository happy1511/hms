import { updateAPI } from "@/controllers/appointment/appointment";
import { ActionType, ModuleType } from "@/generated/prisma/enums";
import { withErrorHandling } from "@/lib/errorHandler";
import { checkPermission } from "@/middlewares/auth/checkUserPermissions";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ appointmentId: string }> },
) {
  const { appointmentId } = await params;
  return withErrorHandling(() =>
    checkPermission(
      request,
      [{ module: ModuleType["APPOINTMENT"], action: ActionType["UPDATE"] }],
      (req, user) =>
        updateAPI(req, {
          params: { appointmentId: Number(appointmentId) },
        }, user),
    ),
  );
}
