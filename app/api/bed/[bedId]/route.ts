import { deleteAPI, getDetailsAPI, updateAPI } from "@/controllers/bed/bed";
import { ActionType, ModuleType } from "@/generated/prisma/enums";
import { withErrorHandling } from "@/lib/errorHandler";
import { checkPermission } from "@/middlewares/auth/checkUserPermissions";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ bedId: string }> },
) {
  const { bedId } = await params;
  return withErrorHandling(() =>
    checkPermission(
      request,
      [{ module: ModuleType["BED_MASTER"], action: ActionType["VIEW"] }],
      () => getDetailsAPI(request, { params: { bedId: Number(bedId) } }),
    ),
  );
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ bedId: string }> },
) {
  const { bedId } = await params;
  return withErrorHandling(() =>
    checkPermission(
      request,
      [{ module: ModuleType["BED_MASTER"], action: ActionType["UPDATE"] }],
      () => updateAPI(request, { params: { bedId: Number(bedId) } }),
    ),
  );
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ bedId: string }> },
) {
  const { bedId } = await params;
  return withErrorHandling(() =>
    checkPermission(
      request,
      [{ module: ModuleType["BED_MASTER"], action: ActionType["DELETE"] }],
      () => deleteAPI(request, { params: { bedId: Number(bedId) } }),
    ),
  );
}
