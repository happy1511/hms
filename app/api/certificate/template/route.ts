import {
  getCertificateTemplatesAPI,
  saveCertificateTemplateAPI,
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
      () => getCertificateTemplatesAPI(request),
    ),
  );
}

export async function PUT(request: Request) {
  return withErrorHandling(() =>
    checkPermission(
      request,
      [{ module: CERTIFICATES_MODULE, action: ActionType.UPDATE }],
      (req, user) => saveCertificateTemplateAPI(req, user),
    ),
  );
}
