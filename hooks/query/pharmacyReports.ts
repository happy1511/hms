import { PHARMACY_REPORTS } from "@/lib/apiDefinations";
import {
  ApiResponse,
  FilterValues,
  PharmacyReportsType,
} from "@/lib/type";
import { createRequest } from "@/services/apiRequest";
import { useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";

const getPharmacyReports = createRequest<
  ApiResponse<PharmacyReportsType>,
  {
    createdAt?: string | { from?: Date; to?: Date };
  }
>(PHARMACY_REPORTS, "GET");

export const usePharmacyReports = (filters: FilterValues) => {
  return useQuery<
    ApiResponse<PharmacyReportsType>,
    AxiosError<ApiResponse<null>>,
    PharmacyReportsType,
    [string, FilterValues]
  >({
    queryKey: ["pharmacy-reports", filters],
    queryFn: () =>
      getPharmacyReports({
        params: {
          ...(filters.createdAt && { createdAt: filters.createdAt }),
        },
      }),
    select: (data) => data.data,
  });
};
