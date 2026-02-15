import {
  addParameterHeaderAPI,
  deleteParameterHeaderAPI,
  updateParameterHeaderAPI,
} from "@/controllers/pathology/pathology";
import { ActionType, ModuleType } from "@/generated/prisma/enums";
import { withErrorHandling } from "@/lib/errorHandler";
import { checkPermission } from "@/middlewares/auth/checkUserPermissions";

export async function POST(request: Request) {
  return withErrorHandling(() =>
    checkPermission(
      request,
      [
        {
          module: ModuleType["PATHOLOGY_TEST_MASTER"],
          action: ActionType["CREATE"],
        },
      ],
      () => addParameterHeaderAPI(request),
    ),
  );
}

export async function PUT(request: Request) {
  return withErrorHandling(() =>
    checkPermission(
      request,
      [
        {
          module: ModuleType["PATHOLOGY_TEST_MASTER"],
          action: ActionType["UPDATE"],
        },
      ],
      () => updateParameterHeaderAPI(request),
    ),
  );
}

export async function DELETE(request: Request) {
  return withErrorHandling(() =>
    checkPermission(
      request,
      [
        {
          module: ModuleType["PATHOLOGY_TEST_MASTER"],
          action: ActionType["DELETE"],
        },
      ],
      () => deleteParameterHeaderAPI(request),
    ),
  );
}
