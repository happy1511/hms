import { auth } from "@/controllers/auth/auth";
import { withErrorHandling } from "@/lib/errorHandler";

export async function POST(request: Request) {
  console.log(process.env, 'process.env')
  return withErrorHandling(() => auth(request));
}
