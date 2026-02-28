import { DASHBOARD } from "@/lib/apiDefinations";
import { ApiResponse, DashboardType } from "@/lib/type";
import { createRequest } from "@/services/apiRequest";
import { useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";

const getDashboard = createRequest<ApiResponse<DashboardType>, undefined>(
  DASHBOARD,
  "GET",
);

export const useDashboard = () => {
  return useQuery<
    ApiResponse<DashboardType>,
    AxiosError<ApiResponse<null>>,
    DashboardType
  >({
    queryKey: ["dashboard"],
    queryFn: () => getDashboard({}),
    select: (data) => data?.data,
  });
};
