import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import { RESPONSE_STATUS } from "./lib/responseStatus";
import { checkAuth } from "./middlewares/auth/checkAuth";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 🔴 Always allow refresh endpoint
  if (pathname === "/api/auth/refresh-token") {
    return NextResponse.next();
  }

  const accessToken = request.cookies.get("accessToken")?.value;
  const refreshToken = request.cookies.get("refreshToken")?.value;

  // 🔐 API protection
  if (pathname.startsWith("/api/")) {
    if (pathname.startsWith("/api/auth")) {
      return NextResponse.next();
    }
    if (accessToken && refreshToken) {
      return NextResponse.next();
    } else if (!accessToken && !refreshToken) {
      return NextResponse.json(
        { status: false, message: "Unauthorized", data: null },
        { status: RESPONSE_STATUS.UNAUTHORIZED },
      );
    } else if (!accessToken && refreshToken) {
      const correct = await checkAuth(request);
      if (correct) {
        return NextResponse.next();
      } else {
        return NextResponse.json(
          { status: false, message: "Unauthorized", data: null },
          { status: RESPONSE_STATUS.UNAUTHORIZED },
        );
      }
    } else {
      return NextResponse.json(
        { status: false, message: "Unauthorized", data: null },
        { status: RESPONSE_STATUS.UNAUTHORIZED },
      );
    }
  }

  // 🔐 Page protection
  if (!accessToken && !refreshToken && pathname !== "/login") {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};
