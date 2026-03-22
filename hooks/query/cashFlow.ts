import { CASH_FLOW_SUMMARY } from "@/lib/apiDefinations";
import { ApiResponse, CashFlowSummaryType, FilterValues } from "@/lib/type";
import { createRequest } from "@/services/apiRequest";
import { useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";

const getCashFlowSummary = createRequest<
  ApiResponse<CashFlowSummaryType>,
  { createdAt: { from: Date; to: Date } }
>(CASH_FLOW_SUMMARY, "GET");

export const useCashFlowSummary = (
  filters: Pick<FilterValues, "createdAt">,
) => {
  const createdAt = filters.createdAt as { from?: Date; to?: Date } | undefined;
  const enabled = Boolean(createdAt?.from && createdAt?.to);

  return useQuery<
    ApiResponse<CashFlowSummaryType>,
    AxiosError<ApiResponse<null>>,
    CashFlowSummaryType,
    [string, Pick<FilterValues, "createdAt">]
  >({
    queryKey: ["cash-flow-summary", filters],
    queryFn: () =>
      getCashFlowSummary({
        params: {
          createdAt: {
            from: createdAt!.from!,
            to: createdAt!.to!,
          },
        },
      }),
    select: (data) => data.data,
    enabled,
  });
};

