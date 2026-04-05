import { createAPI } from "@/controllers/master-import/masterImport";
import { ActionType } from "@/generated/prisma/enums";
import { MASTER_IMPORT_CONFIG, MasterImportKey } from "@/lib/masterImportConfig";
import { withErrorHandling } from "@/lib/errorHandler";
import { apiResponse } from "@/lib/apiResponse";
import { RESPONSE_STATUS } from "@/lib/responseStatus";
import { checkPermission } from "@/middlewares/auth/checkUserPermissions";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const getMasterKey = (value: string): MasterImportKey | null => {
  if (value in MASTER_IMPORT_CONFIG) {
    return value as MasterImportKey;
  }
  return null;
};

export async function POST(
  request: Request,
  { params }: { params: Promise<{ master: string }> },
) {
  const resolvedParams = await params;
  const master = getMasterKey(resolvedParams.master);

  if (!master) {
    return apiResponse({
      status: RESPONSE_STATUS.BAD_REQUEST,
      message: "Invalid master selected",
    });
  }

  return withErrorHandling(() =>
    checkPermission(
      request,
      [
        {
          module: MASTER_IMPORT_CONFIG[master].module,
          action: ActionType.CREATE,
        },
      ],
      (req, user) => createAPI(req, { params: resolvedParams }, user),
    ),
  );
}
