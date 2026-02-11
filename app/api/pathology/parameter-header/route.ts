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
      ModuleType["PATHOLOGY_TEST_MASTER"],
      ActionType["CREATE"],
      () => addParameterHeaderAPI(request),
    ),
  );
}

export async function PUT(request: Request) {
  return withErrorHandling(() =>
    checkPermission(
      request,
      ModuleType["PATHOLOGY_TEST_MASTER"],
      ActionType["UPDATE"],
      () => updateParameterHeaderAPI(request),
    ),
  );
}

export async function DELETE(request: Request) {
  return withErrorHandling(() =>
    checkPermission(
      request,
      ModuleType["PATHOLOGY_TEST_MASTER"],
      ActionType["DELETE"],
      () => deleteParameterHeaderAPI(request),
    ),
  );
}
