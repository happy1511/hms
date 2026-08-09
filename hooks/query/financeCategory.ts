import {
  FinanceCategory,
  FinanceCategoryType,
} from "@/generated/prisma/client";
import { FINANCE_CATEGORY } from "@/lib/apiDefinations";
import { ApiResponse, FilterValues, PaginatedResponse } from "@/lib/type";
import { showError } from "@/lib/utils";
import { createRequest } from "@/services/apiRequest";
import {
  FinanceCategoryValidatorType,
  PartialFinanceCategoryValidatorType,
} from "@/validators/api/finance/category";
import {
  useMutation,
  useQuery,
  useQueryClient,
  useInfiniteQuery,
  InfiniteData,
} from "@tanstack/react-query";
import { AxiosError } from "axios";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export type FinanceCategoryFilters = FilterValues & {
  type?: FinanceCategoryType;
};

const createFinanceCategory = createRequest<ApiResponse<FinanceCategory>>(
  FINANCE_CATEGORY,
  "POST",
);
const updateFinanceCategory = createRequest<
  ApiResponse<FinanceCategory>,
  undefined,
  { id: string }
>((p) => `${FINANCE_CATEGORY}/${p.id}`, "PUT");
const deleteFinanceCategory = createRequest<
  ApiResponse<null>,
  undefined,
  { id: string }
>((p) => `${FINANCE_CATEGORY}/${p.id}`, "DELETE");
const getFinanceCategory = createRequest<
  ApiResponse<FinanceCategory>,
  undefined,
  { id: string }
>((p) => `${FINANCE_CATEGORY}/${p.id}`, "GET");
const getFinanceCategories = createRequest<
  PaginatedResponse<FinanceCategory>,
  {
    limit: number;
    name?: string;
    createdAt?: string | { from?: Date; to?: Date };
    type?: FinanceCategoryType;
  }
>(FINANCE_CATEGORY, "GET");

export const useFinanceCategoryList = (
  filters: FinanceCategoryFilters,
  page: number,
  limit: number,
) => {
  return useQuery<
    PaginatedResponse<FinanceCategory>,
    AxiosError<ApiResponse<null>>,
    PaginatedResponse<FinanceCategory>,
    [string, FinanceCategoryFilters, number, number]
  >({
    queryKey: ["finance-categories", filters, page, limit],
    queryFn: () =>
      getFinanceCategories({
        pageParam: page,
        params: {
          limit,
          ...(filters.createdAt && { createdAt: filters.createdAt }),
          ...(filters.name && { search: filters.name }),
          ...(filters.type && { type: filters.type }),
        },
      }),
  });
};

export const useInfiniteFinanceCategoryList = (
  filters: FinanceCategoryFilters,
  limit: number,
  enabled: boolean = true,
) => {
  return useInfiniteQuery<
    PaginatedResponse<FinanceCategory>,
    AxiosError<ApiResponse<null>>,
    InfiniteData<PaginatedResponse<FinanceCategory>>,
    [string, FinanceCategoryFilters, number]
  >({
    queryKey: ["finance-categories-infinite", filters, limit],
    queryFn: ({ pageParam }) =>
      getFinanceCategories({
        pageParam: pageParam as number,
        params: {
          limit,
          ...(filters.createdAt && { createdAt: filters.createdAt }),
          ...(filters.name && { search: filters.name }),
          ...(filters.type && { type: filters.type }),
        },
      }),
    initialPageParam: 1,

    getNextPageParam: (lastPage, allPages) => {
      const totalFetched = allPages.reduce(
        (acc, page) => acc + page.data.length,
        0,
      );
      return totalFetched < lastPage.total ? allPages.length + 1 : undefined;
    },
    enabled,
  });
};

export const useGetFinanceCategory = (id?: string) => {
  return useQuery<
    ApiResponse<FinanceCategory>,
    AxiosError<ApiResponse<null>>,
    FinanceCategory,
    [string, string | undefined]
  >({
    queryKey: ["get-finance-category", id],
    queryFn: () =>
      getFinanceCategory({
        urlHelpers: {
          id: id as string,
        },
      }),
    select: (data) => data.data,
    enabled: !!id,
  });
};

export const useCreateFinanceCategory = () => {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation<
    ApiResponse<FinanceCategory>,
    AxiosError<ApiResponse<null>>,
    FinanceCategoryValidatorType
  >({
    mutationKey: ["create-finance-category"],
    mutationFn: (data) => createFinanceCategory({ body: data }),
    onSuccess: () => {
      toast.success("Finance category created successfully");
      queryClient.invalidateQueries({ queryKey: ["finance-categories"] });
      router.back();
    },
    onError: showError,
  });
};

export const useUpdateFinanceCategory = () => {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation<
    ApiResponse<FinanceCategory>,
    AxiosError<ApiResponse<null>>,
    PartialFinanceCategoryValidatorType
  >({
    mutationKey: ["update-finance-category"],
    mutationFn: (data) =>
      updateFinanceCategory({
        body: data,
        urlHelpers: { id: String(data.categoryId) },
      }),
    onSuccess: () => {
      toast.success("Finance category updated successfully");
      queryClient.invalidateQueries({ queryKey: ["finance-categories"] });
      router.back();
    },
    onError: showError,
  });
};

export const useDeleteFinanceCategory = () => {
  const queryClient = useQueryClient();

  return useMutation<
    ApiResponse<null>,
    AxiosError<ApiResponse<null>>,
    PartialFinanceCategoryValidatorType
  >({
    mutationKey: ["delete-finance-category"],
    mutationFn: (data) =>
      deleteFinanceCategory({
        urlHelpers: { id: String(data.categoryId) },
      }),
    onSuccess: () => {
      toast.success("Finance category deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["finance-categories"] });
    },
    onError: showError,
  });
};
