import { getCertificateByIdAPI } from "@/controllers/certificate/certificate";
import { ActionType, ModuleType } from "@/generated/prisma/enums";
import { withErrorHandling } from "@/lib/errorHandler";
import { checkPermission } from "@/middlewares/auth/checkUserPermissions";

const CERTIFICATES_MODULE = "CERTIFICATES" as ModuleType;

export async function GET(
  request: Request,
  context: { params: Promise<{ certificateId: string }> },
) {
  const params = await context.params;
  return withErrorHandling(() =>
    checkPermission(
      request,
      [{ module: CERTIFICATES_MODULE, action: ActionType.PRINT }],
      () => getCertificateByIdAPI(request, { params }),
    ),
  );
}
