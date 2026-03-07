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
      [
        {
          module: ModuleType["SERVICE_MASTER"],
          action: ActionType["VIEW"],
        },
      ],
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
      [
        {
          module: ModuleType["SERVICE_MASTER"],
          action: ActionType["UPDATE"],
        },
      ],
      (req, user) => updateAPI(req, { params: { serviceId: Number(serviceId) } }, user),
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
      [
        {
          module: ModuleType["SERVICE_MASTER"],
          action: ActionType["DELETE"],
        },
      ],
      (req, user) => deleteAPI(req, { params: { serviceId: Number(serviceId) } }, user),
    ),
  );
}
