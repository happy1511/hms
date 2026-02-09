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
      ModuleType["BILLING_SECTION_MASTER"],
      ActionType["VIEW"],
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
      ModuleType["BILLING_SECTION_MASTER"],
      ActionType["UPDATE"],
      () => updateAPI(request, { params: { sectionId: Number(sectionId) } }),
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
      ModuleType["BILLING_SECTION_MASTER"],
      ActionType["DELETE"],
      () => deleteAPI(request, { params: { sectionId: Number(sectionId) } }),
    ),
  );
}
