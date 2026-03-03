import { Drug } from "@/generated/prisma/client";
import { PHARMACY_DRUG } from "@/lib/apiDefinations";
import { ApiResponse, FilterValues, PaginatedResponse } from "@/lib/type";
import { showError } from "@/lib/utils";
import { createRequest } from "@/services/apiRequest";
import {
  drugValidatorType,
  partialDrugValidatorType,
} from "@/validators/api/masters/drug";
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

const createDrug = createRequest<ApiResponse<Drug>>(PHARMACY_DRUG, "POST");
const updateDrug = createRequest<ApiResponse<Drug>, undefined, { id: string }>(
  (p) => `${PHARMACY_DRUG}/${p.id}`,
  "PUT",
);
const deleteDrug = createRequest<ApiResponse<null>, undefined, { id: string }>(
  (p) => `${PHARMACY_DRUG}/${p.id}`,
  "DELETE",
);
const getDrug = createRequest<ApiResponse<Drug>, undefined, { id: string }>(
  (p) => `${PHARMACY_DRUG}/${p.id}`,
  "GET",
);

const getDrugs = createRequest<
  PaginatedResponse<Drug>,
  { limit: number; name?: string; createdAt?: string; status?: string }
>(PHARMACY_DRUG, "GET");

export const useDrugList = (
  filters: FilterValues,
  page: number,
  limit: number,
) => {
  return useQuery<
    PaginatedResponse<Drug>,
    AxiosError<ApiResponse<null>>,
    PaginatedResponse<Drug>,
    [string, FilterValues, number, number]
  >({
    queryKey: ["drugs", filters, page, limit],
    queryFn: () =>
      getDrugs({
        pageParam: page,
        params: {
          limit,
          ...(filters.createdAt && { createdAt: filters.createdAt }),
          ...(filters.name && { search: filters.name }),
        },
      }),
  });
};

export const useGetDrug = (id?: string) => {
  return useQuery<
    ApiResponse<Drug>,
    AxiosError<ApiResponse<null>>,
    Drug,
    [string, string | undefined]
  >({
    queryKey: ["drug", id],
    queryFn: () =>
      getDrug({
        urlHelpers: {
          id: id as string,
        },
      }),
    select: (data) => data.data,
    enabled: !!id,
  });
};

export const useCreateDrug = () => {
  const queryClient = useQueryClient();
  const router = useRouter();
  return useMutation<
    ApiResponse<Drug>,
    AxiosError<ApiResponse<null>>,
    drugValidatorType
  >({
    mutationKey: ["create-drug"],
    mutationFn: (data) => createDrug({ body: data }),
    onSuccess: () => {
      toast.success("Drug Created Successfully");
      queryClient.invalidateQueries({
        queryKey: ["drugs"],
      });
      router.back();
    },
    onError: showError,
  });
};

export const useUpdateDrug = () => {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation<
    ApiResponse<Drug>,
    AxiosError<ApiResponse<null>>,
    partialDrugValidatorType
  >({
    mutationKey: ["update-drug"],
    mutationFn: (data) =>
      updateDrug({ body: data, urlHelpers: { id: String(data.drugId) } }),
    onSuccess: () => {
      toast.success("Drug Updated Successfully");
      queryClient.invalidateQueries({
        queryKey: ["drugs"],
      });
      router.back();
    },
    onError: showError,
  });
};

export const useDeleteDrug = () => {
  const queryClient = useQueryClient();

  return useMutation<
    ApiResponse<null>,
    AxiosError<ApiResponse<null>>,
    partialDrugValidatorType
  >({
    mutationKey: ["delete-drug"],
    mutationFn: (data) =>
      deleteDrug({ urlHelpers: { id: String(data.drugId) } }),
    onSuccess: () => {
      toast.success("Drug Deleted Successfully");
      queryClient.invalidateQueries({
        queryKey: ["drugs"],
      });
    },
    onError: showError,
  });
};

export const useInfiniteDrugList = (filters: FilterValues, limit: number) => {
  return useInfiniteQuery<
    PaginatedResponse<Drug>,
    AxiosError<ApiResponse<null>>,
    InfiniteData<PaginatedResponse<Drug>>,
    [string, FilterValues, number]
  >({
    queryKey: ["drugs-infinite", filters, limit],

    queryFn: ({ pageParam = 1 }) =>
      getDrugs({
        pageParam: pageParam as number,
        params: {
          limit,
          ...(filters.createdAt && { createdAt: filters.createdAt }),
          ...(filters.name && { search: filters.name }),
          ...(filters.status && { status: filters.status }),
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
