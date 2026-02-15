import { ZodSchema } from "zod";
import { apiResponse } from "@/lib/apiResponse";
import { RESPONSE_STATUS } from "@/lib/responseStatus";

type SuccessData<B, Q, P, U> = (B extends undefined ? never : { body: B }) &
  (Q extends undefined ? never : { query: Q }) &
  (P extends undefined ? never : { params: P }) &
  (P extends undefined ? never : { user: U });

type ValidateOptions<B, Q, P, U = undefined> = {
  bodySchema?: ZodSchema<B>;
  querySchema?: ZodSchema<Q>;
  paramsSchema?: ZodSchema<P>;
  req: Request;
  params?: unknown;
  user?: U;
  onSuccess: (data: SuccessData<B, Q, P, U>, req: Request) => Promise<Response>;
};

export async function validateRequest<B, Q, P, U>({
  bodySchema,
  querySchema,
  paramsSchema,
  req,
  params,
  user,
  onSuccess,
}: ValidateOptions<B, Q, P, U>): Promise<Response> {
  let body: B | undefined;
  let query: Q | undefined;
  let parsedParams: P | undefined;

  /* -------- Body validation -------- */
  if (bodySchema) {
    const json = await req.json();
    const parsedBody = bodySchema.safeParse(json);

    if (!parsedBody.success) {
      return apiResponse({
        status: RESPONSE_STATUS.BAD_REQUEST,
        message: "Body validation failed",
        data: parsedBody.error.issues[0].message ?? "validation failed",
      });
    }

    body = parsedBody.data;
  }

  /* -------- Query validation -------- */
  if (querySchema) {
    const { searchParams } = new URL(req.url);
    const rawQuery = Object.fromEntries(searchParams.entries());
    const parsedQuery = querySchema.safeParse(rawQuery);

    if (!parsedQuery.success) {
      return apiResponse({
        status: RESPONSE_STATUS.BAD_REQUEST,
        message: "Query validation failed",
        data: parsedQuery.error.issues[0].message ?? "validation failed",
      });
    }

    query = parsedQuery.data;
  }

  /* -------- Params -------- */
  if (paramsSchema) {
    const result = paramsSchema.safeParse(params);
    if (!result.success) {
      return apiResponse({
        status: RESPONSE_STATUS.BAD_REQUEST,
        message: "Params validation failed",
        data: result.error.issues[0].message ?? "validation failed",
      });
    }
    parsedParams = result.data;
  }

  return onSuccess(
    {
      ...(body !== undefined ? { body } : {}),
      ...(query !== undefined ? { query } : {}),
      ...(parsedParams ? { params: parsedParams } : {}),
      ...(user !== undefined ? { user } : {}),
    } as SuccessData<B, Q, P, U>,
    req,
  );
}
