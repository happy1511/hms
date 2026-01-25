import { ZodSchema } from "zod";
import { apiResponse } from "@/lib/apiResponse";
import { RESPONSE_STATUS } from "@/lib/responseStatus";

type SuccessData<B, Q, P> = (B extends undefined ? never : { body: B }) &
  (Q extends undefined ? never : { query: Q }) &
  (P extends undefined ? never : { params: P });

type ValidateOptions<B, Q, P> = {
  bodySchema?: ZodSchema<B>;
  querySchema?: ZodSchema<Q>;
  paramsSchema?: ZodSchema<P>;
  req: Request;
  params?: unknown;
  onSuccess: (data: SuccessData<B, Q, P>) => Promise<Response>;
};

export async function validateRequest<B, Q, P>({
  bodySchema,
  querySchema,
  paramsSchema,
  req,
  params,
  onSuccess,
}: ValidateOptions<B, Q, P>): Promise<Response> {
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
    console.log(rawQuery);
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

  return onSuccess({
    ...(body !== undefined ? { body } : {}),
    ...(query !== undefined ? { query } : {}),
    ...(parsedParams ? { params: parsedParams } : {}),
  } as SuccessData<B, Q, P>);
}
