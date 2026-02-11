import {
  addOptionAPI,
  deleteOptionAPI,
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
      () => addOptionAPI(request),
    ),
  );
}

export async function DELETE(request: Request) {
  return withErrorHandling(() =>
    checkPermission(
      request,
      ModuleType["PATHOLOGY_TEST_MASTER"],
      ActionType["DELETE"],
      () => deleteOptionAPI(request),
    ),
  );
}
