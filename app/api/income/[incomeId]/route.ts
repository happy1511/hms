import {
  deleteAPI,
  getDetailsAPI,
  updateAPI,
} from "@/controllers/finance/income";
import { ActionType, ModuleType } from "@/generated/prisma/enums";
import { withErrorHandling } from "@/lib/errorHandler";
import { checkPermission } from "@/middlewares/auth/checkUserPermissions";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ incomeId: string }> },
) {
  const p = await params;
  return withErrorHandling(() =>
    checkPermission(
      request,
      [{ module: ModuleType.INCOME, action: ActionType.VIEW }],
      () => getDetailsAPI(request, { params: p }),
    ),
  );
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ incomeId: string }> },
) {
  const p = await params;
  return withErrorHandling(() =>
    checkPermission(
      request,
      [{ module: ModuleType.INCOME, action: ActionType.UPDATE }],
      (req, user) => updateAPI(req, { params: p }, user),
    ),
  );
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ incomeId: string }> },
) {
  const p = await params;
  return withErrorHandling(() =>
    checkPermission(
      request,
      [{ module: ModuleType.INCOME, action: ActionType.DELETE }],
      (req, user) => deleteAPI(req, { params: p }, user),
    ),
  );
}
