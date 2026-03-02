import { DrugBillingCategory } from "@/generated/prisma/client";
import { DRUG_CATEGORY } from "@/lib/apiDefinations";
import { ApiResponse, FilterValues, PaginatedResponse } from "@/lib/type";
import { showError } from "@/lib/utils";
import { createRequest } from "@/services/apiRequest";
import {
  drugBillingCategoryValidatorType,
  partialDrugBillingCategoryValidatorType,
} from "@/validators/api/masters/drugBillingCategory";

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

const createDrugBillingCategory = createRequest<
  ApiResponse<DrugBillingCategory>
>(DRUG_CATEGORY, "POST");
const updateDrugBillingCategory = createRequest<
  ApiResponse<DrugBillingCategory>,
  undefined,
  { id: string }
>((p) => `${DRUG_CATEGORY}/${p.id}`, "PUT");
const deleteDrugBillingCategory = createRequest<
  ApiResponse<null>,
  undefined,
  { id: string }
>((p) => `${DRUG_CATEGORY}/${p.id}`, "DELETE");
const getDrugBillingCategory = createRequest<
  ApiResponse<DrugBillingCategory>,
  undefined,
  { id: string }
>((p) => `${DRUG_CATEGORY}/${p.id}`, "GET");

const getDrugCategories = createRequest<
  PaginatedResponse<DrugBillingCategory>,
  { limit: number; name?: string; createdAt?: string; status?: string }
>(DRUG_CATEGORY, "GET");

export const useDrugBillingCategoryList = (
  filters: FilterValues,
  page: number,
  limit: number,
) => {
  return useQuery<
    PaginatedResponse<DrugBillingCategory>,
    AxiosError<ApiResponse<null>>,
    PaginatedResponse<DrugBillingCategory>,
    [string, FilterValues, number, number]
  >({
    queryKey: ["drug-categories", filters, page, limit],
    queryFn: () =>
      getDrugCategories({
        pageParam: page,
        params: {
          limit,
          ...(filters.createdAt && { createdAt: filters.createdAt }),
          ...(filters.name && { search: filters.name }),
        },
      }),
  });
};

export const useGetDrugBillingCategory = (id?: string) => {
  return useQuery<
    ApiResponse<DrugBillingCategory>,
    AxiosError<ApiResponse<null>>,
    DrugBillingCategory,
    [string, string | undefined]
  >({
    queryKey: ["drug", id],
    queryFn: () =>
      getDrugBillingCategory({
        urlHelpers: {
          id: id as string,
        },
      }),
    select: (data) => data.data,
    enabled: !!id,
  });
};

export const useCreateDrugBillingCategory = () => {
  const queryClient = useQueryClient();
  const router = useRouter();
  return useMutation<
    ApiResponse<DrugBillingCategory>,
    AxiosError<ApiResponse<null>>,
    drugBillingCategoryValidatorType
  >({
    mutationKey: ["create-drug-category"],
    mutationFn: (data) => createDrugBillingCategory({ body: data }),
    onSuccess: () => {
      toast.success("Drug Category Created Successfully");
      queryClient.invalidateQueries({
        queryKey: ["drug-categories"],
      });
      router.back();
    },
    onError: showError,
  });
};

export const useUpdateDrugBillingCategory = () => {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation<
    ApiResponse<DrugBillingCategory>,
    AxiosError<ApiResponse<null>>,
    partialDrugBillingCategoryValidatorType
  >({
    mutationKey: ["update-drug-category"],
    mutationFn: (data) =>
      updateDrugBillingCategory({
        body: data,
        urlHelpers: { id: String(data.categoryId) },
      }),
    onSuccess: () => {
      toast.success("Drug Category Updated Successfully");
      queryClient.invalidateQueries({
        queryKey: ["drug-categories"],
      });
      router.back();
    },
    onError: showError,
  });
};

export const useDeleteDrugBillingCategory = () => {
  const queryClient = useQueryClient();

  return useMutation<
    ApiResponse<null>,
    AxiosError<ApiResponse<null>>,
    partialDrugBillingCategoryValidatorType
  >({
    mutationKey: ["delete-drug-category"],
    mutationFn: (data) =>
      deleteDrugBillingCategory({
        urlHelpers: { id: String(data.categoryId) },
      }),
    onSuccess: () => {
      toast.success("Drug Category Deleted Successfully");
      queryClient.invalidateQueries({
        queryKey: ["drug-categories"],
      });
    },
    onError: showError,
  });
};

export const useInfiniteDrugBillingCategoryList = (
  filters: FilterValues,
  limit: number,
) => {
  return useInfiniteQuery<
    PaginatedResponse<DrugBillingCategory>,
    AxiosError<ApiResponse<null>>,
    InfiniteData<PaginatedResponse<DrugBillingCategory>>,
    [string, FilterValues, number]
  >({
    queryKey: ["drug-category-infinite", filters, limit],

    queryFn: ({ pageParam = 1 }) =>
      getDrugCategories({
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
