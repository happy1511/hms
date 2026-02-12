import {
  createTemplateAPI,
  deleteTemplateAPI,
  getTemplatesAPI,
} from "@/controllers/radiology/radiology";
import { ActionType, ModuleType } from "@/generated/prisma/enums";
import { withErrorHandling } from "@/lib/errorHandler";
import { checkPermission } from "@/middlewares/auth/checkUserPermissions";

export async function GET(request: Request) {
  return withErrorHandling(() =>
    checkPermission(
      request,
      ModuleType["RADIOLOGY_TEST_MASTER"],
      ActionType["VIEW"],
      () => getTemplatesAPI(request),
    ),
  );
}

export async function POST(request: Request) {
  return withErrorHandling(() =>
    checkPermission(
      request,
      ModuleType["RADIOLOGY_TEST_MASTER"],
      ActionType["CREATE"],
      () => createTemplateAPI(request),
    ),
  );
}

export async function DELETE(request: Request) {
  return withErrorHandling(() =>
    checkPermission(
      request,
      ModuleType["RADIOLOGY_TEST_MASTER"],
      ActionType["CREATE"],
      () => deleteTemplateAPI(request),
    ),
  );
}
