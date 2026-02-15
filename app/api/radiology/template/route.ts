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
      [
        {
          module: ModuleType["RADIOLOGY_TEST_MASTER"],
          action: ActionType["VIEW"],
        },
      ],
      () => getTemplatesAPI(request),
    ),
  );
}

export async function POST(request: Request) {
  return withErrorHandling(() =>
    checkPermission(
      request,
      [
        {
          module: ModuleType["RADIOLOGY_TEST_MASTER"],
          action: ActionType["CREATE"],
        },
      ],
      () => createTemplateAPI(request),
    ),
  );
}

export async function DELETE(request: Request) {
  return withErrorHandling(() =>
    checkPermission(
      request,
      [
        {
          module: ModuleType["RADIOLOGY_TEST_MASTER"],
          action: ActionType["DELETE"],
        },
      ],
      () => deleteTemplateAPI(request),
    ),
  );
}
