import { getDetailsAPI, updateAPI } from "@/controllers/patient/patient";
import { ActionType, ModuleType } from "@/generated/prisma/enums";
import { withErrorHandling } from "@/lib/errorHandler";
import { checkPermission } from "@/middlewares/auth/checkUserPermissions";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ patientId: string }> },
) {
  const p = await params;
  return withErrorHandling(() =>
    checkPermission(
      request,
      [
        {
          module: ModuleType["PATIENT_MASTER"],
          action: ActionType["VIEW"],
        },
        {
          module: ModuleType["OPD_BILL"],
          action: ActionType["CREATE"],
        },
        {
          module: ModuleType["OPD_BILL"],
          action: ActionType["UPDATE"],
        },
        {
          module: ModuleType["OPD_BILL"],
          action: ActionType["VIEW"],
        },
        {
          module: ModuleType["IPD_BILL"],
          action: ActionType["CREATE"],
        },
        {
          module: ModuleType["IPD_BILL"],
          action: ActionType["UPDATE"],
        },
        {
          module: ModuleType["IPD_BILL"],
          action: ActionType["VIEW"],
        },
        {
          module: ModuleType["PHARMACY_SALE_BILL"],
          action: ActionType["CREATE"],
        },
        {
          module: ModuleType["PHARMACY_SALE_BILL"],
          action: ActionType["UPDATE"],
        },
        {
          module: ModuleType["PHARMACY_SALE_BILL"],
          action: ActionType["VIEW"],
        },
      ],
      () => getDetailsAPI(request, { params: p }),
    ),
  );
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ patientId: string }> },
) {
  const p = await params;
  return withErrorHandling(() =>
    checkPermission(
      request,
      [
        {
          module: ModuleType["PATIENT_MASTER"],
          action: ActionType["UPDATE"],
        },
      ],
      (req, user) => updateAPI(req, { params: p }, user),
    ),
  );
}
