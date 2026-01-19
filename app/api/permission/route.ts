import { getAPI } from "@/controllers/permission/permission";
import { withErrorHandling } from "@/lib/errorHandler";

export async function GET(request: Request) {
  return withErrorHandling(() => getAPI(request));
}
