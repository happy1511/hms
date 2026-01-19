import { refreshToken } from "@/controllers/auth/auth";
import { withErrorHandling } from "@/lib/errorHandler";

export async function POST(request: Request) {
  return withErrorHandling(() => refreshToken(request));
}
