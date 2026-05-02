import {
  createCertificateAPI,
  getCertificatesAPI,
} from "@/controllers/certificate/certificate";
import { ActionType, ModuleType } from "@/generated/prisma/enums";
import { withErrorHandling } from "@/lib/errorHandler";
import { checkPermission } from "@/middlewares/auth/checkUserPermissions";

const CERTIFICATES_MODULE = "CERTIFICATES" as ModuleType;

export async function GET(request: Request) {
  return withErrorHandling(() =>
    checkPermission(
      request,
      [{ module: CERTIFICATES_MODULE, action: ActionType.VIEW }],
      () => getCertificatesAPI(request),
    ),
  );
}

export async function POST(request: Request) {
  return withErrorHandling(() =>
    checkPermission(
      request,
      [{ module: CERTIFICATES_MODULE, action: ActionType.CREATE }],
      (req, user) => createCertificateAPI(req, user),
    ),
  );
}
