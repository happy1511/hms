import {
  addReferenceRangeAPI,
  deleteReferenceRangeAPI,
  updateReferenceRangeAPI,
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
      () => addReferenceRangeAPI(request),
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
      () => updateReferenceRangeAPI(request),
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
      () => deleteReferenceRangeAPI(request),
    ),
  );
}
