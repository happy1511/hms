import { RESPONSE_STATUS } from "./responseStatus";

export function apiResponse<T>({
  status,
  message,
  data = null,
  total = null,
}: {
  status: number;
  message: string;
  data?: T | null;
  total?: number | null;
}) {
  return new Response(
    JSON.stringify({
      status: status === RESPONSE_STATUS.SUCCESS,
      message,
      data,
      ...(total && { total }),
    }),
    {
      status,
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
}
