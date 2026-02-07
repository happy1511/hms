import { ActionType, ModuleType, Status } from "@/generated/prisma/enums";
import { apiResponse } from "@/lib/apiResponse";
import { RESPONSE_STATUS } from "@/lib/responseStatus";
import { decodeToken } from "@/services/jwt";
import { prisma } from "@/services/prisma";
import { cookies } from "next/headers";

export const checkPermission = async (
  req: Request,
  module: ModuleType,
  action: ActionType,
  callback: (req: Request) => Promise<Response>,
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

  const user = await prisma.user.findUnique({
    where: { id: Number(decodedToken.userId) },
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

  const userPermission = await prisma.userPermission.findFirst({
    where: {
      userId: Number(decodedToken.userId),
      permission: {
        action: {
          name: action,
        },
        module: {
          name: module,
        },
      },
    },
  });

  if (userPermission) {
    return callback(req);
  } else {
    return apiResponse({
      status: RESPONSE_STATUS.UNAUTHORIZED,
      message: "Not Allowed to permit the action",
    });
  }
};
