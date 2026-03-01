import { DrugCategory } from "@/generated/prisma/client";
import { DRUG_CATEGORY } from "@/lib/apiDefinations";
import { ApiResponse, FilterValues, PaginatedResponse } from "@/lib/type";
import { showError } from "@/lib/utils";
import { createRequest } from "@/services/apiRequest";
import {
  drugCategoryValidatorType,
  partialDrugCategoryValidatorType,
} from "@/validators/api/masters/drugCategory";
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

const createDrugCategory = createRequest<ApiResponse<DrugCategory>>(
  DRUG_CATEGORY,
  "POST",
);
const updateDrugCategory = createRequest<
  ApiResponse<DrugCategory>,
  undefined,
  { id: string }
>((p) => `${DRUG_CATEGORY}/${p.id}`, "PUT");
const deleteDrugCategory = createRequest<
  ApiResponse<null>,
  undefined,
  { id: string }
>((p) => `${DRUG_CATEGORY}/${p.id}`, "DELETE");
const getDrugCategory = createRequest<
  ApiResponse<DrugCategory>,
  undefined,
  { id: string }
>((p) => `${DRUG_CATEGORY}/${p.id}`, "GET");

const getDrugCategories = createRequest<
  PaginatedResponse<DrugCategory>,
  { limit: number; name?: string; createdAt?: string; status?: string }
>(DRUG_CATEGORY, "GET");

export const useDrugCategoryList = (
  filters: FilterValues,
  page: number,
  limit: number,
) => {
  return useQuery<
    PaginatedResponse<DrugCategory>,
    AxiosError<ApiResponse<null>>,
    PaginatedResponse<DrugCategory>,
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

export const useGetDrugCategory = (id?: string) => {
  return useQuery<
    ApiResponse<DrugCategory>,
    AxiosError<ApiResponse<null>>,
    DrugCategory,
    [string, string | undefined]
  >({
    queryKey: ["drug", id],
    queryFn: () =>
      getDrugCategory({
        urlHelpers: {
          id: id as string,
        },
      }),
    select: (data) => data.data,
    enabled: !!id,
  });
};

export const useCreateDrugCategory = () => {
  const queryClient = useQueryClient();
  const router = useRouter();
  return useMutation<
    ApiResponse<DrugCategory>,
    AxiosError<ApiResponse<null>>,
    drugCategoryValidatorType
  >({
    mutationKey: ["create-drug-category"],
    mutationFn: (data) => createDrugCategory({ body: data }),
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

export const useUpdateDrugCategory = () => {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation<
    ApiResponse<DrugCategory>,
    AxiosError<ApiResponse<null>>,
    partialDrugCategoryValidatorType
  >({
    mutationKey: ["update-drug-category"],
    mutationFn: (data) =>
      updateDrugCategory({
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

export const useDeleteDrugCategory = () => {
  const queryClient = useQueryClient();

  return useMutation<
    ApiResponse<null>,
    AxiosError<ApiResponse<null>>,
    partialDrugCategoryValidatorType
  >({
    mutationKey: ["delete-drug-category"],
    mutationFn: (data) =>
      deleteDrugCategory({ urlHelpers: { id: String(data.categoryId) } }),
    onSuccess: () => {
      toast.success("Drug Category Deleted Successfully");
      queryClient.invalidateQueries({
        queryKey: ["drug-categories"],
      });
    },
    onError: showError,
  });
};

export const useInfiniteDrugCategoryList = (
  filters: FilterValues,
  limit: number,
) => {
  return useInfiniteQuery<
    PaginatedResponse<DrugCategory>,
    AxiosError<ApiResponse<null>>,
    InfiniteData<PaginatedResponse<DrugCategory>>,
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
