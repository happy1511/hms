import { deleteAPI, getDetailsAPI, updateAPI } from "@/controllers/user/user";
import { ActionType, ModuleType } from "@/generated/prisma/enums";
import { withErrorHandling } from "@/lib/errorHandler";
import { checkPermission } from "@/middlewares/auth/checkUserPermissions";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const p = await params;
  return withErrorHandling(() =>
    checkPermission(request, ModuleType["USER"], ActionType["VIEW"], () =>
      getDetailsAPI(request, { params: p }),
    ),
  );
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const p = await params;
  return withErrorHandling(() =>
    checkPermission(request, ModuleType["USER"], ActionType["UPDATE"], () =>
      updateAPI(request, { params: p }),
    ),
  );
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const p = await params;
  return withErrorHandling(() =>
    checkPermission(request, ModuleType["USER"], ActionType["DELETE"], () =>
      deleteAPI(request, { params: p }),
    ),
  );
}
