import { signAccessToken, signRefreshToken, verifyToken } from "@/services/jwt";
import { prisma } from "@/services/prisma";
import { cookies } from "next/headers";
import { NextRequest } from "next/server";

export const checkAuth = async (req: NextRequest) => {
  const reqCookies = req.cookies;
  const accessToken = reqCookies.get("accessToken")?.value;
  const refreshTokenCookie = reqCookies.get("refreshToken")?.value;

  if (!accessToken && !refreshTokenCookie) {
    return false;
  }

  if (!accessToken && refreshTokenCookie) {
    const payload = verifyToken(refreshTokenCookie);
    if (!payload) return false;

    const user = await prisma.user.findUnique({
      where: { id: Number(payload.userId) },
    });

    if (!user) {
      return false;
    }

    const newRefreshToken = signRefreshToken({ userId: user.id.toString() });
    const newAccessToken = signAccessToken({
      userId: user.id.toString(),
      loginId: user.loginId,
    });

    const cookieStore = await cookies();

    cookieStore.set({
      name: "accessToken",
      value: newAccessToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 15 * 60,
    });

    cookieStore.set({
      name: "refreshToken",
      value: newRefreshToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60,
    });

    return true;
  }

  return true;
};
