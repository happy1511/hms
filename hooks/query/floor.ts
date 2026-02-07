import { Floor } from "@/generated/prisma/client";
import { FLOORS } from "@/lib/apiDefinations";
import { ApiResponse, FilterValues, PaginatedResponse } from "@/lib/type";
import { showError } from "@/lib/utils";
import { createRequest } from "@/services/apiRequest";
import {
  FloorValidatorType,
  PartialFloorValidatorType,
} from "@/validators/api/masters/floor";
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

const createFloor = createRequest<ApiResponse<Floor>>(FLOORS, "POST");
const updateFloor = createRequest<
  ApiResponse<Floor>,
  undefined,
  { id: string }
>((p) => `${FLOORS}/${p.id}`, "PUT");
const deleteFloor = createRequest<ApiResponse<null>, undefined, { id: string }>(
  (p) => `${FLOORS}/${p.id}`,
  "DELETE",
);
const getFloor = createRequest<ApiResponse<Floor>, undefined, { id: string }>(
  (p) => `${FLOORS}/${p.id}`,
  "GET",
);

const getFloors = createRequest<
  PaginatedResponse<Floor>,
  { limit: number; name?: string; createdAt?: string; status?: string }
>(FLOORS, "GET");

export const useFloorsList = (
  filters: FilterValues,
  page: number,
  limit: number,
) => {
  return useQuery<
    PaginatedResponse<Floor>,
    AxiosError<ApiResponse<null>>,
    PaginatedResponse<Floor>,
    [string, FilterValues, number, number]
  >({
    queryKey: ["floors", filters, page, limit],
    queryFn: () =>
      getFloors({
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

export const useInfiniteFloorsList = (filters: FilterValues, limit: number) => {
  return useInfiniteQuery<
    PaginatedResponse<Floor>,
    AxiosError<ApiResponse<null>>,
    InfiniteData<PaginatedResponse<Floor>>,
    [string, FilterValues, number]
  >({
    queryKey: ["floors", filters, limit],

    queryFn: ({ pageParam = 1 }) =>
      getFloors({
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

export const useGetFloor = (id?: string) => {
  return useQuery<
    ApiResponse<Floor>,
    AxiosError<ApiResponse<null>>,
    Floor,
    [string, string | undefined]
  >({
    queryKey: ["get-floors", id],
    queryFn: () =>
      getFloor({
        urlHelpers: {
          id: id as string,
        },
      }),
    select: (data) => data.data,
    enabled: !!id,
  });
};

export const useCreateFloor = () => {
  const queryClient = useQueryClient();
  const router = useRouter();
  return useMutation<
    ApiResponse<Floor>,
    AxiosError<ApiResponse<null>>,
    FloorValidatorType
  >({
    mutationKey: ["create-floor"],
    mutationFn: (data) => createFloor({ body: data }),
    onSuccess: () => {
      toast.success("Floor Created Successfully");
      queryClient.invalidateQueries({
        queryKey: ["floors"],
      });
      router.back();
    },
    onError: showError,
  });
};

export const useUpdateFloor = () => {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation<
    ApiResponse<Floor>,
    AxiosError<ApiResponse<null>>,
    PartialFloorValidatorType
  >({
    mutationKey: ["update-floor"],
    mutationFn: (data) =>
      updateFloor({ body: data, urlHelpers: { id: data.floorId.toString() } }),
    onSuccess: () => {
      toast.success("Floor Updated Successfully");
      queryClient.invalidateQueries({
        queryKey: ["floors"],
      });
      router.back();
    },
    onError: showError,
  });
};

export const useDeleteFloor = () => {
  const queryClient = useQueryClient();

  return useMutation<
    ApiResponse<null>,
    AxiosError<ApiResponse<null>>,
    PartialFloorValidatorType
  >({
    mutationKey: ["delete-floor"],
    mutationFn: (data) =>
      deleteFloor({ urlHelpers: { id: data.floorId.toString() } }),
    onSuccess: () => {
      toast.success("Floor Deleted Successfully");
      queryClient.invalidateQueries({
        queryKey: ["floors"],
      });
    },
    onError: showError,
  });
};
