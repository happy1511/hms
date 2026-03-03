import { signAccessToken, signRefreshToken } from "@/services/jwt";
import { prisma } from "@/services/prisma";
import { RESPONSE_STATUS } from "@/lib/responseStatus";
import { validateRequest } from "@/lib/validator";
import {
  authValidator,
  refreshTokenValidator,
} from "@/validators/api/auth/auth";
import { cookies } from "next/headers";
import { apiResponse } from "@/lib/apiResponse";
import { Status } from "@/generated/prisma/enums";

export const auth = async (req: Request) => {
  return validateRequest({
    bodySchema: authValidator,
    req,
    onSuccess: async ({ body }) => {
      const data = body;
      const user = await prisma.user.findFirst({
        where: { ...data, isDeleted: false },
      });

      if (!user) {
        return apiResponse({
          status: RESPONSE_STATUS.UNAUTHORIZED,
          message: "Unauthorized",
        });
      }

      if (user.status === Status["inactive"]) {
        return apiResponse({
          status: RESPONSE_STATUS.FORBIDDEN,
          message: "Your Account has been marked as inactive",
        });
      }

      const refreshToken = signRefreshToken({ userId: user.id.toString() });
      const accessToken = signAccessToken({
        userId: user.id.toString(),
        loginId: user.loginId,
      });

      (await cookies()).set({
        name: "accessToken",
        value: accessToken,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 15 * 60,
      });

      (await cookies()).set({
        name: "refreshToken",
        value: refreshToken,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60,
      });

      return apiResponse({
        status: RESPONSE_STATUS.SUCCESS,
        message: "Login Success",
      });
    },
  });
};

export const logout = async (req: Request) => {
  return validateRequest({
    req,
    onSuccess: async () => {
      (await cookies()).delete({
        name: "accessToken",
      });

      (await cookies()).delete({
        name: "refreshToken",
      });

      return apiResponse({
        status: RESPONSE_STATUS.SUCCESS,
        message: "Logout Success",
      });
    },
  });
};

export const refreshToken = async (req: Request) => {
  return validateRequest({
    bodySchema: refreshTokenValidator,
    req,
    onSuccess: async ({ body }) => {
      const data = body;
      const user = await prisma.user.findFirst({
        where: { id: parseInt(data.refreshToken), isDeleted: false },
      });

      if (!user) {
        return apiResponse({
          status: RESPONSE_STATUS.UNAUTHORIZED,
          message: "Unauthorized",
        });
      }

      const refreshToken = signRefreshToken({ userId: user.id.toString() });
      const accessToken = signAccessToken({
        userId: user.id.toString(),
        loginId: user.loginId,
      });

      (await cookies()).set({
        name: "accessToken",
        value: accessToken,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 15 * 60,
      });

      (await cookies()).set({
        name: "refreshToken",
        value: refreshToken,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60,
      });

      return apiResponse({
        status: RESPONSE_STATUS.SUCCESS,
        message: "New Token Assigned Successfully",
      });
    },
  });
};
