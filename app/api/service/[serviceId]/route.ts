import {
  deleteAPI,
  getDetailsAPI,
  updateAPI,
} from "@/controllers/service/service";
import { ActionType, ModuleType } from "@/generated/prisma/enums";
import { withErrorHandling } from "@/lib/errorHandler";
import { checkPermission } from "@/middlewares/auth/checkUserPermissions";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ serviceId: string }> },
) {
  const { serviceId } = await params;
  return withErrorHandling(() =>
    checkPermission(
      request,
      ModuleType["SERVICE_MASTER"],
      ActionType["VIEW"],
      () =>
        getDetailsAPI(request, { params: { serviceId: Number(serviceId) } }),
    ),
  );
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ serviceId: string }> },
) {
  const { serviceId } = await params;
  return withErrorHandling(() =>
    checkPermission(
      request,
      ModuleType["SERVICE_MASTER"],
      ActionType["UPDATE"],
      () => updateAPI(request, { params: { serviceId: Number(serviceId) } }),
    ),
  );
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ serviceId: string }> },
) {
  const { serviceId } = await params;
  return withErrorHandling(() =>
    checkPermission(
      request,
      ModuleType["SERVICE_MASTER"],
      ActionType["DELETE"],
      () => deleteAPI(request, { params: { serviceId: Number(serviceId) } }),
    ),
  );
}
