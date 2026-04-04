import { DrugBillGetPayload } from "@/generated/prisma/models";
import { PHARMACY_SALE_BILL } from "@/lib/apiDefinations";
import { ApiResponse, FilterValues, PaginatedResponse } from "@/lib/type";
import { showError } from "@/lib/utils";
import { createRequest } from "@/services/apiRequest";
import {
  partialSaleBillValidatorType,
  saleBillValidatorType,
} from "@/validators/api/masters/pharmacySaleBill";
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

type SaleBillPayload = DrugBillGetPayload<{
  include: {
    patient: true;
    customer: { include: { patient: true } };
    doctor: { include: { user: true } };
    invoice: {
      include: {
        transactions: { include: { receivedBy: { select: { name: true } } } };
      };
    };
    saleItems: {
      include: {
        inventoryItem: {
          include: {
            drug: true;
            supplier: true;
          };
        };
      };
    };
  };
}>;

const createSaleBill = createRequest<ApiResponse<SaleBillPayload>>(
  PHARMACY_SALE_BILL,
  "POST",
);

const updateSaleBill = createRequest<
  ApiResponse<SaleBillPayload>,
  undefined,
  { id: string }
>((p) => `${PHARMACY_SALE_BILL}/${p.id}`, "PUT");

const deleteSaleBill = createRequest<
  ApiResponse<null>,
  undefined,
  { id: string }
>((p) => `${PHARMACY_SALE_BILL}/${p.id}`, "DELETE");

const getSaleBill = createRequest<
  ApiResponse<SaleBillPayload>,
  undefined,
  { id: string }
>((p) => `${PHARMACY_SALE_BILL}/${p.id}`, "GET");

const getSaleBills = createRequest<
  PaginatedResponse<SaleBillPayload>,
  {
    name?: string;
    limit: number;
    createdAt?: string | { from?: Date; to?: Date };
  }
>(PHARMACY_SALE_BILL, "GET");

export const useSaleBillList = (
  filters: FilterValues,
  page: number,
  limit: number,
) => {
  return useQuery<
    PaginatedResponse<SaleBillPayload>,
    AxiosError<ApiResponse<null>>,
    PaginatedResponse<SaleBillPayload>,
    [string, FilterValues, number, number]
  >({
    queryKey: ["sale-bills", filters, page, limit],
    queryFn: () =>
      getSaleBills({
        pageParam: page,
        params: {
          limit,
          ...(filters.createdAt && { createdAt: filters.createdAt }),
          ...(filters.name && { search: filters.name }),
        },
      }),
  });
};

export const useInfiniteSaleBillList = (
  filters: FilterValues,
  limit: number,
) => {
  return useInfiniteQuery<
    PaginatedResponse<SaleBillPayload>,
    AxiosError<ApiResponse<null>>,
    InfiniteData<PaginatedResponse<SaleBillPayload>>,
    [string, FilterValues, number]
  >({
    queryKey: ["sale-bills-infinite", filters, limit],
    queryFn: ({ pageParam = 1 }) =>
      getSaleBills({
        pageParam: pageParam as number,
        params: {
          limit,
          ...(filters.createdAt && { createdAt: filters.createdAt }),
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

export const useGetSaleBill = (id?: string) => {
  return useQuery<
    ApiResponse<SaleBillPayload>,
    AxiosError<ApiResponse<null>>,
    SaleBillPayload,
    [string, string | undefined]
  >({
    queryKey: ["sale-bill", id],
    queryFn: () =>
      getSaleBill({
        urlHelpers: {
          id: id as string,
        },
      }),
    select: (data) => data.data,
    enabled: !!id,
  });
};

export const useCreateSaleBill = () => {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation<
    ApiResponse<SaleBillPayload>,
    AxiosError<ApiResponse<null>>,
    saleBillValidatorType
  >({
    mutationKey: ["create-sale-bill"],
    mutationFn: (data) => createSaleBill({ body: data }),
    onSuccess: () => {
      toast.success("Sale bill created successfully");
      queryClient.invalidateQueries({ queryKey: ["sale-bills"] });
      router.back();
    },
    onError: showError,
  });
};

export const useUpdateSaleBill = () => {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation<
    ApiResponse<SaleBillPayload>,
    AxiosError<ApiResponse<null>>,
    partialSaleBillValidatorType
  >({
    mutationKey: ["update-sale-bill"],
    mutationFn: (data) =>
      updateSaleBill({
        body: data,
        urlHelpers: { id: String(data.billId) },
      }),
    onSuccess: () => {
      toast.success("Sale bill updated successfully");
      queryClient.invalidateQueries({ queryKey: ["sale-bills"] });
      router.back();
    },
    onError: showError,
  });
};

export const useDeleteSaleBill = () => {
  const queryClient = useQueryClient();

  return useMutation<
    ApiResponse<null>,
    AxiosError<ApiResponse<null>>,
    partialSaleBillValidatorType
  >({
    mutationKey: ["delete-sale-bill"],
    mutationFn: (data) =>
      deleteSaleBill({
        urlHelpers: {
          id: String(data.billId),
        },
      }),
    onSuccess: () => {
      toast.success("Sale bill deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["sale-bills"] });
    },
    onError: showError,
  });
};
