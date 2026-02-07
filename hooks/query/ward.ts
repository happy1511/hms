import { Ward } from "@/generated/prisma/client";
import { WARDS } from "@/lib/apiDefinations";
import {
  ApiResponse,
  FilterValues,
  PaginatedResponse,
  WardType,
} from "@/lib/type";
import { showError } from "@/lib/utils";
import { createRequest } from "@/services/apiRequest";
import {
  WardValidatorType,
  PartialWardValidatorType,
} from "@/validators/api/masters/ward";
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

const createWard = createRequest<ApiResponse<Ward>>(WARDS, "POST");
const updateWard = createRequest<ApiResponse<Ward>, undefined, { id: string }>(
  (p) => `${WARDS}/${p.id}`,
  "PUT",
);
const deleteWard = createRequest<ApiResponse<null>, undefined, { id: string }>(
  (p) => `${WARDS}/${p.id}`,
  "DELETE",
);
const getWard = createRequest<ApiResponse<Ward>, undefined, { id: string }>(
  (p) => `${WARDS}/${p.id}`,
  "GET",
);

const getWards = createRequest<
  PaginatedResponse<Ward>,
  { limit: number; name?: string; createdAt?: string; status?: string }
>(WARDS, "GET");

export const useWardsList = (
  filters: FilterValues,
  page: number,
  limit: number,
) => {
  return useQuery<
    PaginatedResponse<Ward>,
    AxiosError<ApiResponse<null>>,
    PaginatedResponse<Ward>,
    [string, FilterValues, number, number]
  >({
    queryKey: ["wards", filters, page, limit],
    queryFn: () =>
      getWards({
        pageParam: page,
        params: {
          limit,
          ...(filters.createdAt && { createdAt: filters.createdAt }),
          ...(filters.name && { search: filters.name }),
          ...(filters.status && { status: filters.status }),
          ...(filters.doctorType && { doctorType: filters.doctorType }),
        },
      }),
  });
};

export const useGetWard = (id?: string) => {
  return useQuery<
    ApiResponse<Ward>,
    AxiosError<ApiResponse<null>>,
    Ward,
    [string, string | undefined]
  >({
    queryKey: ["get-wards", id],
    queryFn: () =>
      getWard({
        urlHelpers: {
          id: id as string,
        },
      }),
    select: (data) => data.data,
    enabled: !!id,
  });
};

export const useCreateWard = () => {
  const queryClient = useQueryClient();
  const router = useRouter();
  return useMutation<
    ApiResponse<Ward>,
    AxiosError<ApiResponse<null>>,
    WardValidatorType
  >({
    mutationKey: ["create-wards"],
    mutationFn: (data) => createWard({ body: data }),
    onSuccess: () => {
      toast.success("Ward Created Successfully");
      queryClient.invalidateQueries({
        queryKey: ["wards"],
      });
      router.back();
    },
    onError: showError,
  });
};

export const useUpdateWard = () => {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation<
    ApiResponse<Ward>,
    AxiosError<ApiResponse<null>>,
    PartialWardValidatorType
  >({
    mutationKey: ["update-ward"],
    mutationFn: (data) =>
      updateWard({ body: data, urlHelpers: { id: data.wardId.toString() } }),
    onSuccess: () => {
      toast.success("Ward Updated Successfully");
      queryClient.invalidateQueries({
        queryKey: ["wards"],
      });
      router.back();
    },
    onError: showError,
  });
};

export const useDeleteWard = () => {
  const queryClient = useQueryClient();

  return useMutation<
    ApiResponse<null>,
    AxiosError<ApiResponse<null>>,
    PartialWardValidatorType
  >({
    mutationKey: ["delete-ward"],
    mutationFn: (data) =>
      deleteWard({ urlHelpers: { id: data.wardId.toString() } }),
    onSuccess: () => {
      toast.success("Ward Deleted Successfully");
      queryClient.invalidateQueries({
        queryKey: ["wards"],
      });
    },
    onError: showError,
  });
};

export const useInfiniteWardsList = (filters: FilterValues, limit: number) => {
  return useInfiniteQuery<
    PaginatedResponse<WardType>,
    AxiosError<ApiResponse<null>>,
    InfiniteData<PaginatedResponse<WardType>>,
    [string, FilterValues, number]
  >({
    queryKey: ["wards", filters, limit],

    queryFn: ({ pageParam = 1 }) =>
      getWards({
        pageParam: pageParam as number,
        params: {
          limit,
          ...(filters.createdAt && { createdAt: filters.createdAt }),
          ...(filters.name && { search: filters.name }),
          ...(filters.status && { status: filters.status }),
          ...(filters.doctorType && { doctorType: filters.doctorType }),
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
