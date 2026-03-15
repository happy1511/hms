import {
  getCompanyDetailsAPI,
  updateCompanyDetailsAPI,
} from "@/controllers/company/company";
import { ActionType, ModuleType } from "@/generated/prisma/enums";
import { withErrorHandling } from "@/lib/errorHandler";
import { checkPermission } from "@/middlewares/auth/checkUserPermissions";

export async function GET(request: Request) {
  return withErrorHandling(() =>
    checkPermission(
      request,
      [{ module: ModuleType.COMPANY_DETAILS, action: ActionType.VIEW }],
      (req) => getCompanyDetailsAPI(req),
    ),
  );
}

export async function PUT(request: Request) {
  return withErrorHandling(() =>
    checkPermission(
      request,
      [{ module: ModuleType.COMPANY_DETAILS, action: ActionType.UPDATE }],
      (req) => updateCompanyDetailsAPI(req),
    ),
  );
}
