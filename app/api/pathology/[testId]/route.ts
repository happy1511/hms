import {
  deleteAPI,
  getDetailsAPI,
  updateAPI,
} from "@/controllers/pathology/pathology";
import { ActionType, ModuleType } from "@/generated/prisma/enums";
import { withErrorHandling } from "@/lib/errorHandler";
import { checkPermission } from "@/middlewares/auth/checkUserPermissions";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ testId: string }> },
) {
  const { testId } = await params;
  return withErrorHandling(() =>
    checkPermission(
      request,
      [
        {
          module: ModuleType["PATHOLOGY_TEST_MASTER"],
          action: ActionType["VIEW"],
        },
      ],
      () => getDetailsAPI(request, { params: { testId: Number(testId) } }),
    ),
  );
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ testId: string }> },
) {
  const { testId } = await params;
  return withErrorHandling(() =>
    checkPermission(
      request,
      [
        {
          module: ModuleType["PATHOLOGY_TEST_MASTER"],
          action: ActionType["UPDATE"],
        },
      ],
      () => updateAPI(request, { params: { testId: Number(testId) } }),
    ),
  );
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ testId: string }> },
) {
  const { testId } = await params;
  return withErrorHandling(() =>
    checkPermission(
      request,
      [
        {
          module: ModuleType["PATHOLOGY_TEST_MASTER"],
          action: ActionType["DELETE"],
        },
      ],
      () => deleteAPI(request, { params: { testId: Number(testId) } }),
    ),
  );
}
