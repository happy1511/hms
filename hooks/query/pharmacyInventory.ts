import { PHARMACY_INVENTORY } from "@/lib/apiDefinations";
import {
  ApiResponse,
  FilterValues,
  PaginatedResponse,
  PharmacyInventoryItemType,
} from "@/lib/type";
import { createRequest } from "@/services/apiRequest";
import { InfiniteData, useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";

const getInventoryItems = createRequest<
  PaginatedResponse<PharmacyInventoryItemType>,
  { limit: number; search?: string }
>(PHARMACY_INVENTORY, "GET");

export const useInventoryItemsList = (
  filters: FilterValues,
  page: number,
  limit: number,
) => {
  return useQuery<
    PaginatedResponse<PharmacyInventoryItemType>,
    AxiosError<ApiResponse<null>>,
    PaginatedResponse<PharmacyInventoryItemType>,
    [string, FilterValues, number, number]
  >({
    queryKey: ["inventory-items", filters, page, limit],
    queryFn: () =>
      getInventoryItems({
        pageParam: page,
        params: {
          limit,
          ...(filters.name && { search: filters.name }),
        },
      }),
  });
};

export const useInfiniteInventoryItems = (
  filters: FilterValues,
  limit: number,
) => {
  return useInfiniteQuery<
    PaginatedResponse<PharmacyInventoryItemType>,
    AxiosError<ApiResponse<null>>,
    InfiniteData<PaginatedResponse<PharmacyInventoryItemType>>,
    [string, FilterValues, number]
  >({
    queryKey: ["inventory-items-infinite", filters, limit],
    queryFn: ({ pageParam = 1 }) =>
      getInventoryItems({
        pageParam: pageParam as number,
        params: {
          limit,
          ...(filters.name && { search: filters.name }),
        },
      }),
    getNextPageParam: (lastPage, allPages) => {
      const totalFetched = allPages.reduce(
        (acc, page) => acc + page.data.length,
        0,
      );
      return totalFetched < lastPage.total ? allPages.length + 1 : undefined;
    },
    initialPageParam: 1,
  });
};
