import { PHARMACY_PURCHASE_ORDER } from "@/lib/apiDefinations";
import {
  ApiResponse,
  FilterValues,
  PaginatedResponse,
  PharmacyPurchaseOrderType,
} from "@/lib/type";
import { showError } from "@/lib/utils";
import { createRequest } from "@/services/apiRequest";
import {
  partialPurchaseOrderValidatorType,
  purchaseOrderValidatorType,
} from "@/validators/api/masters/pharmacyPurchase";
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

const createPurchaseOrder = createRequest<
  ApiResponse<PharmacyPurchaseOrderType>
>(PHARMACY_PURCHASE_ORDER, "POST");
const updatePurchaseOrder = createRequest<
  ApiResponse<PharmacyPurchaseOrderType>,
  undefined,
  { id: string }
>((p) => `${PHARMACY_PURCHASE_ORDER}/${p.id}`, "PUT");
const deletePurchaseOrder = createRequest<
  ApiResponse<null>,
  undefined,
  { id: string }
>((p) => `${PHARMACY_PURCHASE_ORDER}/${p.id}`, "DELETE");
const getPurchaseOrder = createRequest<
  ApiResponse<PharmacyPurchaseOrderType>,
  undefined,
  { id: string }
>((p) => `${PHARMACY_PURCHASE_ORDER}/${p.id}`, "GET");

const getPurchaseOrders = createRequest<
  PaginatedResponse<PharmacyPurchaseOrderType>,
  {
    name?: string;
    limit: number;
    createdAt?: string | { from?: Date; to?: Date };
    supplierId?: number;
    withoutGrn?: boolean;
  }
>(PHARMACY_PURCHASE_ORDER, "GET");

export const usePurchaseOrderList = (
  filters: FilterValues,
  page: number,
  limit: number,
) => {
  return useQuery<
    PaginatedResponse<PharmacyPurchaseOrderType>,
    AxiosError<ApiResponse<null>>,
    PaginatedResponse<PharmacyPurchaseOrderType>,
    [string, FilterValues, number, number]
  >({
    queryKey: ["purchase-orders", filters, page, limit],
    queryFn: () =>
      getPurchaseOrders({
        pageParam: page,
        params: {
          limit,
          ...(filters.createdAt && { createdAt: filters.createdAt }),
          ...(filters.name && { search: filters.name }),
          ...(filters.supplierId && {
            supplierId: Number(filters.supplierId),
          }),
          ...(filters.withoutGrn && { withoutGrn: true }),
        },
      }),
  });
};

export const useGetPurchaseOrder = (id?: string) => {
  return useQuery<
    ApiResponse<PharmacyPurchaseOrderType>,
    AxiosError<ApiResponse<null>>,
    PharmacyPurchaseOrderType,
    [string, string | undefined]
  >({
    queryKey: ["purchase-order", id],
    queryFn: () =>
      getPurchaseOrder({
        urlHelpers: {
          id: id as string,
        },
      }),
    select: (data) => data.data,
    enabled: !!id,
  });
};

export const useCreatePurchaseOrder = () => {
  const queryClient = useQueryClient();
  const router = useRouter();
  return useMutation<
    ApiResponse<PharmacyPurchaseOrderType>,
    AxiosError<ApiResponse<null>>,
    purchaseOrderValidatorType
  >({
    mutationKey: ["create-purchase-order"],
    mutationFn: (data) => createPurchaseOrder({ body: data }),
    onSuccess: () => {
      toast.success("Purchase Order Created Successfully");
      queryClient.invalidateQueries({
        queryKey: ["purchase-orders"],
      });
      router.back();
    },
    onError: showError,
  });
};

export const useUpdatePurchaseOrder = () => {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation<
    ApiResponse<PharmacyPurchaseOrderType>,
    AxiosError<ApiResponse<null>>,
    partialPurchaseOrderValidatorType
  >({
    mutationKey: ["update-purchase-order"],
    mutationFn: (data) =>
      updatePurchaseOrder({
        body: data,
        urlHelpers: {
          id: data.orderId as string,
        },
      }),
    onSuccess: () => {
      toast.success("Purchase Order Updated Successfully");
      queryClient.invalidateQueries({
        queryKey: ["purchase-orders"],
      });
      router.back();
    },
    onError: showError,
  });
};

export const useDeletePurchaseOrder = () => {
  const queryClient = useQueryClient();

  return useMutation<
    ApiResponse<null>,
    AxiosError<ApiResponse<null>>,
    partialPurchaseOrderValidatorType
  >({
    mutationKey: ["delete-purchase-order"],
    mutationFn: (data) =>
      deletePurchaseOrder({ urlHelpers: { id: String(data.orderId) } }),
    onSuccess: () => {
      toast.success("Purchase Order Deleted Successfully");
      queryClient.invalidateQueries({
        queryKey: ["purchase-orders"],
      });
    },
    onError: showError,
  });
};

export const useInfinitePurchaseOrderList = (
  filters: FilterValues,
  limit: number,
) => {
  return useInfiniteQuery<
    PaginatedResponse<PharmacyPurchaseOrderType>,
    AxiosError<ApiResponse<null>>,
    InfiniteData<PaginatedResponse<PharmacyPurchaseOrderType>>,
    [string, FilterValues, number]
  >({
    queryKey: ["drugs-infinite", filters, limit],

    queryFn: ({ pageParam = 1 }) =>
      getPurchaseOrders({
        pageParam: pageParam as number,
        params: {
          limit,
          ...(filters.createdAt && { createdAt: filters.createdAt }),
          ...(filters.name && { search: filters.name }),
          ...(filters.supplierId && {
            supplierId: Number(filters.supplierId),
          }),
          ...(filters.withoutGrn && { withoutGrn: true }),
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
