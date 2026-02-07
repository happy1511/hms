import { apiResponse } from "@/lib/apiResponse";
import { RESPONSE_STATUS } from "@/lib/responseStatus";

export async function withErrorHandling(
  handler: () => Promise<Response>,
): Promise<Response> {
  try {
    return await handler();
  } catch (error: unknown) {
    console.error(error);

    const message =
      error instanceof Error ? error.message : "Internal server error";

    return apiResponse({
      status: RESPONSE_STATUS.INTERNAL_SERVER_ERROR,
      message,
    });
  }
}
