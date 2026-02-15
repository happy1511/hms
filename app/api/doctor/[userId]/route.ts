import {
  deleteAPI,
  getDetailsAPI,
  updateAPI,
} from "@/controllers/doctor/doctor";
import { ActionType, ModuleType } from "@/generated/prisma/enums";
import { withErrorHandling } from "@/lib/errorHandler";
import { checkPermission } from "@/middlewares/auth/checkUserPermissions";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ userId: string }> },
) {
  const p = await params;
  return withErrorHandling(() =>
    checkPermission(
      request,
      [{ module: ModuleType["DOCTOR_MASTER"], action: ActionType["VIEW"] }],
      () => getDetailsAPI(request, { params: p }),
    ),
  );
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ userId: string }> },
) {
  const p = await params;
  return withErrorHandling(() =>
    checkPermission(
      request,
      [{ module: ModuleType["DOCTOR_MASTER"], action: ActionType["UPDATE"] }],
      () => updateAPI(request, { params: p }),
    ),
  );
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ userId: string }> },
) {
  const p = await params;
  return withErrorHandling(() =>
    checkPermission(
      request,
      [{ module: ModuleType["DOCTOR_MASTER"], action: ActionType["DELETE"] }],
      () => deleteAPI(request, { params: p }),
    ),
  );
}
