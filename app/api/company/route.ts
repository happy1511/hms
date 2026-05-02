import {
  getCompanyDetailsAPI,
  updateCompanyDetailsAPI,
} from "@/controllers/company/company";
import { User } from "@/generated/prisma/client";
import { ActionType, CompanyDetailsType, ModuleType, Status } from "@/generated/prisma/enums";
import { apiResponse } from "@/lib/apiResponse";
import { withErrorHandling } from "@/lib/errorHandler";
import { RESPONSE_STATUS } from "@/lib/responseStatus";
import { checkPermission } from "@/middlewares/auth/checkUserPermissions";
import { decodeToken } from "@/services/jwt";
import { prisma } from "@/services/prisma";
import { NextRequest } from "next/server";

const moduleByType: Record<CompanyDetailsType, ModuleType> = {
  [CompanyDetailsType.HOSPITAL]: ModuleType.HOSPITAL_COMPANY_DETAILS,
  [CompanyDetailsType.LAB]: ModuleType.LAB_COMPANY_DETAILS,
  [CompanyDetailsType.PHARMACY]: ModuleType.PHARMACY_COMPANY_DETAILS,
};

const getAuthenticatedUser = async (request: NextRequest): Promise<User | null> => {
  const accessToken = request.cookies.get("accessToken")?.value;

  if (!accessToken) {
    return null;
  }

  const decodedToken = decodeToken<{ userId: string }>(accessToken);

  if (!decodedToken?.userId) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { id: Number(decodedToken.userId) },
  });

  if (!user || user.status === Status.inactive) {
    return null;
  }

  return user;
};

export async function GET(request: NextRequest) {
  return withErrorHandling(async () => {
    const user = await getAuthenticatedUser(request);

    if (!user) {
      return apiResponse({
        status: RESPONSE_STATUS.UNAUTHORIZED,
        message: "Not Allowed to permit the action",
      });
    }

    return getCompanyDetailsAPI(request);
  });
}

export async function PUT(request: NextRequest) {
  return withErrorHandling(async () => {
    const body = await request.clone().json().catch(() => null);
    const requestedType = body?.type as CompanyDetailsType | undefined;

    if (!requestedType || !moduleByType[requestedType]) {
      return apiResponse({
        status: RESPONSE_STATUS.BAD_REQUEST,
        message: "Valid company details type is required",
      });
    }

    return checkPermission(
      request,
      [{ module: moduleByType[requestedType], action: ActionType.UPDATE }],
      (req) => updateCompanyDetailsAPI(req),
    );
  });
}
