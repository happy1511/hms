import {
  deleteAPI,
  getDetailsAPI,
  updateAPI,
} from "@/controllers/billing-section/billingSection";
import { ActionType, ModuleType } from "@/generated/prisma/enums";
import { withErrorHandling } from "@/lib/errorHandler";
import { checkPermission } from "@/middlewares/auth/checkUserPermissions";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ sectionId: string }> },
) {
  const { sectionId } = await params;
  return withErrorHandling(() =>
    checkPermission(
      request,
      [
        {
          module: ModuleType["BILLING_SECTION_MASTER"],
          action: ActionType["VIEW"],
        },
      ],
      () =>
        getDetailsAPI(request, { params: { sectionId: Number(sectionId) } }),
    ),
  );
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ sectionId: string }> },
) {
  const { sectionId } = await params;
  return withErrorHandling(() =>
    checkPermission(
      request,
      [
        {
          module: ModuleType["BILLING_SECTION_MASTER"],
          action: ActionType["UPDATE"],
        },
      ],
      (req, user) => updateAPI(req, { params: { sectionId: Number(sectionId) } }, user),
    ),
  );
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ sectionId: string }> },
) {
  const { sectionId } = await params;
  return withErrorHandling(() =>
    checkPermission(
      request,
      [
        {
          module: ModuleType["BILLING_SECTION_MASTER"],
          action: ActionType["DELETE"],
        },
      ],
      (req, user) => deleteAPI(req, { params: { sectionId: Number(sectionId) } }, user),
    ),
  );
}
