import { apiResponse } from "@/lib/apiResponse";
import { RESPONSE_STATUS } from "@/lib/responseStatus";
import { checkAuth } from "@/middlewares/auth/checkAuth";
import { prisma } from "@/services/prisma";
import { NextRequest } from "next/server";

export const getProfile = async (req: NextRequest) => {
  const user = await checkAuth(req);

  if (user) {
    const foundUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        name: true,
        createdAt: true,
        updatedAt: true,
        permissions: {
          select: {
            permission: {
              select: {
                action: { select: { id: true, name: true } },
                module: { select: { id: true, name: true } },
              },
            },
          },
        },
      },
    });

    if (!foundUser) {
      return apiResponse({
        status: RESPONSE_STATUS.UNAUTHORIZED,
        message: "Unauthorized",
      });
    }

    const moduleMap = new Map<
      number,
      {
        module: {
          name: string;
          id: number;
        };
        actions: { id: number; name: string }[];
      }
    >();

    foundUser.permissions.forEach((up) => {
      if (up.permission) {
        const { module, action } = up.permission;

        if (!moduleMap.has(module.id)) {
          moduleMap.set(module.id, {
            module,
            actions: [],
          });
        }

        moduleMap.get(module.id)?.actions.push(action);
      }
    });

    return apiResponse({
      status: RESPONSE_STATUS.SUCCESS,
      data: { ...foundUser, permissions: Array.from(moduleMap.values()) },
      message: "New Token Assigned Successfully",
    });
  }

  return apiResponse({
    status: RESPONSE_STATUS.UNAUTHORIZED,
    message: "Unauthorized",
  });
};
