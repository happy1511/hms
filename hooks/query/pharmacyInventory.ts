import { PHARMACY_INVENTORY } from "@/lib/apiDefinations";
import {
  ApiResponse,
  FilterValues,
  PaginatedResponse,
  PharmacyInventoryItemType,
} from "@/lib/type";
import { showError } from "@/lib/utils";
import { createRequest } from "@/services/apiRequest";
import {
  InfiniteData,
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { AxiosError } from "axios";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { stockCorrectionValidatorType } from "@/validators/api/masters/pharmacyStockCorrection";

const getInventoryItems = createRequest<
  PaginatedResponse<PharmacyInventoryItemType>,
  {
    limit: number;
    search?: string;
    supplierId?: number;
    drugId?: number;
    includeZeroStock?: boolean;
  }
>(PHARMACY_INVENTORY, "GET");

const updateInventoryStockCorrection = createRequest<
  ApiResponse<PharmacyInventoryItemType>,
  stockCorrectionValidatorType,
  { inventoryItemId: string }
>((p) => `${PHARMACY_INVENTORY}/${p.inventoryItemId}/stock-correction`, "PUT");

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
          ...(filters.supplierId && { supplierId: filters.supplierId }),
          ...(filters.drugId && { drugId: filters.drugId }),
          ...(filters.includeZeroStock && { includeZeroStock: filters.includeZeroStock }),
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
          ...(filters.supplierId && { supplierId: filters.supplierId }),
          ...(filters.drugId && { drugId: filters.drugId }),
          ...(filters.includeZeroStock && { includeZeroStock: filters.includeZeroStock }),
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

export const useUpdateInventoryStockCorrection = () => {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation<
    ApiResponse<PharmacyInventoryItemType>,
    AxiosError<ApiResponse<null>>,
    stockCorrectionValidatorType & { inventoryItemId: number }
  >({
    mutationKey: ["update-inventory-stock-correction"],
    mutationFn: (data) =>
      updateInventoryStockCorrection({
        body: data,
        urlHelpers: {
          inventoryItemId: String(data.inventoryItemId),
        },
      }),
    onSuccess: () => {
      toast.success("Stock corrected successfully");
      queryClient.invalidateQueries({ queryKey: ["inventory-items"] });
      queryClient.invalidateQueries({ queryKey: ["inventory-items-infinite"] });
      router.refresh();
    },
    onError: showError,
  });
};
