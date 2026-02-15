import { User } from "@/generated/prisma/client";
import { ActionType, ModuleType, Status } from "@/generated/prisma/enums";
import { apiResponse } from "@/lib/apiResponse";
import { RESPONSE_STATUS } from "@/lib/responseStatus";
import { decodeToken } from "@/services/jwt";
import { prisma } from "@/services/prisma";
import { cookies } from "next/headers";

type PermissionCheck = {
  module: ModuleType;
  action: ActionType;
};

export const checkPermission = async (
  req: Request,
  permissions: PermissionCheck[],
  callback: (req: Request, user: User) => Promise<Response>,
) => {
  const reqCookies = await cookies();
  const accessToken = reqCookies.get("accessToken")?.value;

  if (!accessToken) {
    return apiResponse({
      status: RESPONSE_STATUS.UNAUTHORIZED,
      message: "Not Allowed to permit the action",
    });
  }

  const decodedToken = decodeToken<{ userId: string }>(accessToken);

  if (!decodedToken || !decodedToken.userId) {
    return apiResponse({
      status: RESPONSE_STATUS.UNAUTHORIZED,
      message: "Not Allowed to permit the action",
    });
  }

  const userId = Number(decodedToken.userId);

  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    return apiResponse({
      status: RESPONSE_STATUS.NOT_FOUND,
      message: "Not Allowed to permit the action",
    });
  }

  if (user.status === Status["inactive"]) {
    return apiResponse({
      status: RESPONSE_STATUS.FORBIDDEN,
      message: "Your Account has been marked as inactive",
    });
  }

  // 🔥 Build OR conditions dynamically
  const orConditions = permissions.map((p) => ({
    permission: {
      action: { name: p.action },
      module: { name: p.module },
    },
  }));

  const userPermission = await prisma.userPermission.findFirst({
    where: {
      userId,
      OR: orConditions, // 👈 OR across module+action pairs
    },
  });

  if (userPermission) {
    return callback(req, user);
  }

  return apiResponse({
    status: RESPONSE_STATUS.UNAUTHORIZED,
    message: "Not Allowed to permit the action",
  });
};
