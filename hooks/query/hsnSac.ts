import { HSN_SAC } from "@/lib/apiDefinations";
import {
  ApiResponse,
  FilterValues,
  HsnSacType,
  PaginatedResponse,
} from "@/lib/type";
import { showError } from "@/lib/utils";
import { createRequest } from "@/services/apiRequest";
import {
  hsnSacValidatorType,
  partialHsnSacValidatorType,
} from "@/validators/api/masters/hsnSac";
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

const createHsnSac = createRequest<ApiResponse<HsnSacType>>(HSN_SAC, "POST");
const updateHsnSac = createRequest<
  ApiResponse<HsnSacType>,
  undefined,
  { id: string }
>((p) => `${HSN_SAC}/${p.id}`, "PUT");
const deleteHsnSac = createRequest<ApiResponse<null>, undefined, { id: string }>(
  (p) => `${HSN_SAC}/${p.id}`,
  "DELETE",
);
const getHsnSac = createRequest<ApiResponse<HsnSacType>, undefined, { id: string }>(
  (p) => `${HSN_SAC}/${p.id}`,
  "GET",
);
const getHsnSacList = createRequest<
  PaginatedResponse<HsnSacType>,
  {
    limit: number;
    search?: string;
    createdAt?: string | { from?: Date; to?: Date };
  }
>(HSN_SAC, "GET");

export const useHsnSacList = (
  filters: FilterValues,
  page: number,
  limit: number,
) => {
  return useQuery<
    PaginatedResponse<HsnSacType>,
    AxiosError<ApiResponse<null>>,
    PaginatedResponse<HsnSacType>,
    [string, FilterValues, number, number]
  >({
    queryKey: ["hsn-sac", filters, page, limit],
    queryFn: () =>
      getHsnSacList({
        pageParam: page,
        params: {
          limit,
          ...(filters.createdAt && { createdAt: filters.createdAt }),
          ...(filters.name && { search: filters.name }),
        },
      }),
  });
};

export const useInfiniteHsnSacList = (filters: FilterValues, limit: number) => {
  return useInfiniteQuery<
    PaginatedResponse<HsnSacType>,
    AxiosError<ApiResponse<null>>,
    InfiniteData<PaginatedResponse<HsnSacType>>,
    [string, FilterValues, number]
  >({
    queryKey: ["hsn-sac-infinite", filters, limit],
    queryFn: ({ pageParam = 1 }) =>
      getHsnSacList({
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

export const useGetHsnSac = (id?: string) => {
  return useQuery<
    ApiResponse<HsnSacType>,
    AxiosError<ApiResponse<null>>,
    HsnSacType,
    [string, string | undefined]
  >({
    queryKey: ["hsn-sac-details", id],
    queryFn: () => getHsnSac({ urlHelpers: { id: id as string } }),
    select: (data) => data.data,
    enabled: !!id,
  });
};

export const useCreateHsnSac = () => {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation<
    ApiResponse<HsnSacType>,
    AxiosError<ApiResponse<null>>,
    hsnSacValidatorType
  >({
    mutationKey: ["create-hsn-sac"],
    mutationFn: (data) => createHsnSac({ body: data }),
    onSuccess: () => {
      toast.success("HSN/SAC created successfully");
      queryClient.invalidateQueries({ queryKey: ["hsn-sac"] });
      queryClient.invalidateQueries({ queryKey: ["hsn-sac-infinite"] });
      router.back();
    },
    onError: showError,
  });
};

export const useUpdateHsnSac = () => {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation<
    ApiResponse<HsnSacType>,
    AxiosError<ApiResponse<null>>,
    partialHsnSacValidatorType
  >({
    mutationKey: ["update-hsn-sac"],
    mutationFn: (data) =>
      updateHsnSac({
        body: data,
        urlHelpers: { id: String(data.hsnSacId) },
      }),
    onSuccess: () => {
      toast.success("HSN/SAC updated successfully");
      queryClient.invalidateQueries({ queryKey: ["hsn-sac"] });
      queryClient.invalidateQueries({ queryKey: ["hsn-sac-infinite"] });
      router.back();
    },
    onError: showError,
  });
};

export const useDeleteHsnSac = () => {
  const queryClient = useQueryClient();

  return useMutation<
    ApiResponse<null>,
    AxiosError<ApiResponse<null>>,
    partialHsnSacValidatorType
  >({
    mutationKey: ["delete-hsn-sac"],
    mutationFn: (data) =>
      deleteHsnSac({
        urlHelpers: { id: String(data.hsnSacId) },
      }),
    onSuccess: () => {
      toast.success("HSN/SAC deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["hsn-sac"] });
      queryClient.invalidateQueries({ queryKey: ["hsn-sac-infinite"] });
    },
    onError: showError,
  });
};
