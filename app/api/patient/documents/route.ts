import {
  createDocumentAPI,
  getDocumentsAPI,
} from "@/controllers/patient/patient";
import { ActionType, ModuleType } from "@/generated/prisma/enums";
import { withErrorHandling } from "@/lib/errorHandler";
import { checkPermission } from "@/middlewares/auth/checkUserPermissions";

export async function GET(request: Request) {
  return withErrorHandling(() =>
    checkPermission(
      request,
      [
        {
          module: ModuleType["OPD_BILL"],
          action: ActionType["VIEW"],
        },
        {
          module: ModuleType["IPD_BILL"],
          action: ActionType["VIEW"],
        },
        {
          module: ModuleType["DAY_CARE_IPD"],
          action: ActionType["VIEW"],
        },
        {
          module: ModuleType["DISCHARGE_PATIENT"],
          action: ActionType["VIEW"],
        },
        {
          module: ModuleType["PATIENT_MASTER"],
          action: ActionType["VIEW"],
        },
      ],
      () => getDocumentsAPI(request),
    ),
  );
}

export async function POST(request: Request) {
  return withErrorHandling(() =>
    checkPermission(
      request,
      [
        {
          module: ModuleType["OPD_BILL"],
          action: ActionType["UPDATE"],
        },
        {
          module: ModuleType["IPD_BILL"],
          action: ActionType["UPDATE"],
        },
        {
          module: ModuleType["DAY_CARE_IPD"],
          action: ActionType["UPDATE"],
        },
        {
          module: ModuleType["DISCHARGE_PATIENT"],
          action: ActionType["UPDATE"],
        },
      ],
      (req, user) => createDocumentAPI(req, user),
    ),
  );
}
