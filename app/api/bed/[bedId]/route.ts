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
      (req, user) => updateAPI(req, { params: { bedId: Number(bedId) } }, user),
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
      (req, user) => deleteAPI(req, { params: { bedId: Number(bedId) } }, user),
    ),
  );
}
