import { DASHBOARD } from "@/lib/apiDefinations";
import { ApiResponse, DashboardType, FilterValues } from "@/lib/type";
import { createRequest } from "@/services/apiRequest";
import { useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";

const getDashboard = createRequest<
  ApiResponse<DashboardType>,
  { createdAt?: string | { from?: Date; to?: Date } }
>(
  DASHBOARD,
  "GET",
);

export const useDashboard = (filters?: FilterValues) => {
  return useQuery<
    ApiResponse<DashboardType>,
    AxiosError<ApiResponse<null>>,
    DashboardType,
    [string, FilterValues | undefined]
  >({
    queryKey: ["dashboard", filters],
    queryFn: () =>
      getDashboard({
        params: {
          ...(filters?.createdAt && { createdAt: filters.createdAt }),
        },
      }),
    placeholderData: (previousData) => previousData,
    select: (data) => data?.data,
  });
};
