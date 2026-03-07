import {
  createAPI,
  deleteAPI,
  getAPI,
  updateAPI,
} from "@/controllers/location/location";
import { ActionType, ModuleType } from "@/generated/prisma/enums";
import { withErrorHandling } from "@/lib/errorHandler";
import { checkPermission } from "@/middlewares/auth/checkUserPermissions";

export async function GET(request: Request) {
  return withErrorHandling(() =>
    checkPermission(
      request,
      [{ module: ModuleType["LOCATION_MASTER"], action: ActionType["VIEW"] }],
      () => getAPI(request),
    ),
  );
}

export async function POST(request: Request) {
  return withErrorHandling(() =>
    checkPermission(
      request,
      [{ module: ModuleType["LOCATION_MASTER"], action: ActionType["CREATE"] }],
      (req, user) => createAPI(req, user),
    ),
  );
}

export async function PUT(request: Request) {
  return withErrorHandling(() =>
    checkPermission(
      request,
      [{ module: ModuleType["LOCATION_MASTER"], action: ActionType["CREATE"] }],
      (req, user) => updateAPI(req, user),
    ),
  );
}

export async function DELETE(request: Request) {
  return withErrorHandling(() =>
    checkPermission(
      request,
      [{ module: ModuleType["LOCATION_MASTER"], action: ActionType["CREATE"] }],
      (req, user) => deleteAPI(req, user),
    ),
  );
}
