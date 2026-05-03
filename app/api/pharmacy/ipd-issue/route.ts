import {
  createIssueAPI,
  getIssueListAPI,
} from "@/controllers/pharmacy/ipd-bill/ipdBill";
import { ActionType, ModuleType } from "@/generated/prisma/enums";
import { withErrorHandling } from "@/lib/errorHandler";
import { checkPermission } from "@/middlewares/auth/checkUserPermissions";

const PHARMACY_IPD_ISSUE_MODULE = "PHARMACY_IPD_ISSUE" as ModuleType;

export async function GET(request: Request) {
  return withErrorHandling(() =>
    checkPermission(
      request,
      [{ module: PHARMACY_IPD_ISSUE_MODULE, action: ActionType.VIEW }],
      getIssueListAPI,
    ),
  );
}

export async function POST(request: Request) {
  return withErrorHandling(() =>
    checkPermission(
      request,
      [{ module: PHARMACY_IPD_ISSUE_MODULE, action: ActionType.CREATE }],
      createIssueAPI,
    ),
  );
}
