import { deleteAPI, getDetailsAPI, updateAPI } from "@/controllers/floor/floor";
import { ActionType, ModuleType } from "@/generated/prisma/enums";
import { withErrorHandling } from "@/lib/errorHandler";
import { checkPermission } from "@/middlewares/auth/checkUserPermissions";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ floorId: string }> },
) {
  const p = await params;
  return withErrorHandling(() =>
    checkPermission(
      request,
      ModuleType["FLOOR_MASTER"],
      ActionType["VIEW"],
      () => getDetailsAPI(request, { params: p }),
    ),
  );
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ floorId: string }> },
) {
  const p = await params;
  return withErrorHandling(() =>
    checkPermission(
      request,
      ModuleType["FLOOR_MASTER"],
      ActionType["UPDATE"],
      () => updateAPI(request, { params: p }),
    ),
  );
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ floorId: string }> },
) {
  const p = await params;
  return withErrorHandling(() =>
    checkPermission(
      request,
      ModuleType["FLOOR_MASTER"],
      ActionType["DELETE"],
      () => deleteAPI(request, { params: p }),
    ),
  );
}
