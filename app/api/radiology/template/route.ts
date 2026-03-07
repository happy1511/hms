import {
  createTemplateAPI,
  deleteTemplateAPI,
  getTemplatesAPI,
  updateTemplateAPI,
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
          module: ModuleType.RADIOLOGY_TEMPLATE_MASTER,
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
          module: "RADIOLOGY_TEMPLATE_MASTER" as ModuleType,
          action: ActionType["CREATE"],
        },
      ],
      (req, user) => createTemplateAPI(req, user),
    ),
  );
}

export async function PUT(request: Request) {
  return withErrorHandling(() =>
    checkPermission(
      request,
      [
        {
          module: "RADIOLOGY_TEMPLATE_MASTER" as ModuleType,
          action: ActionType["UPDATE"],
        },
      ],
      (req, user) => updateTemplateAPI(req, user),
    ),
  );
}

export async function DELETE(request: Request) {
  return withErrorHandling(() =>
    checkPermission(
      request,
      [
        {
          module: "RADIOLOGY_TEMPLATE_MASTER" as ModuleType,
          action: ActionType["DELETE"],
        },
      ],
      (req, user) => deleteTemplateAPI(req, user),
    ),
  );
}
