import { getTemplateDetailsAPI } from "@/controllers/radiology/radiology";
import { ActionType, ModuleType } from "@/generated/prisma/enums";
import { withErrorHandling } from "@/lib/errorHandler";
import { checkPermission } from "@/middlewares/auth/checkUserPermissions";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ templateId: string }> },
) {
  const { templateId } = await params;
  return withErrorHandling(() =>
    checkPermission(
      request,
      ModuleType["RADIOLOGY_TEST_MASTER"],
      ActionType["VIEW"],
      () =>
        getTemplateDetailsAPI(request, {
          params: { templateId: Number(templateId) },
        }),
    ),
  );
}
