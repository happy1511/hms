import { Bed } from "@/generated/prisma/client";
import { BedGetPayload } from "@/generated/prisma/models";
import { BEDS } from "@/lib/apiDefinations";
import { ApiResponse, FilterValues, PaginatedResponse } from "@/lib/type";
import { showError } from "@/lib/utils";
import { createRequest } from "@/services/apiRequest";
import {
  BedValidatorType,
  PartialBedValidatorType,
} from "@/validators/api/masters/bed";
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

const createBeds = createRequest<ApiResponse<Bed[]>>(BEDS, "POST");
const updateBed = createRequest<
  ApiResponse<BedGetPayload<{ include: { room: true } }>>,
  undefined,
  { id: string }
>((p) => `${BEDS}/${p.id}`, "PUT");
const deleteBed = createRequest<ApiResponse<null>, undefined, { id: string }>(
  (p) => `${BEDS}/${p.id}`,
  "DELETE",
);
const getBed = createRequest<
  ApiResponse<BedGetPayload<{ include: { room: true } }>>,
  undefined,
  { id: string }
>((p) => `${BEDS}/${p.id}`, "GET");

const getBeds = createRequest<
  PaginatedResponse<BedGetPayload<{ include: { room: true } }>>,
  { limit: number; name?: string; createdAt?: string; status?: string }
>(BEDS, "GET");

export const useBedsList = (
  filters: FilterValues,
  page: number,
  limit: number,
) => {
  return useQuery<
    PaginatedResponse<BedGetPayload<{ include: { room: true } }>>,
    AxiosError<ApiResponse<null>>,
    PaginatedResponse<BedGetPayload<{ include: { room: true } }>>,
    [string, FilterValues, number, number]
  >({
    queryKey: ["beds", filters, page, limit],
    queryFn: () =>
      getBeds({
        pageParam: page,
        params: {
          limit,
          ...(filters.createdAt && { createdAt: filters.createdAt }),
          ...(filters.name && { search: filters.name }),
          ...(filters.status && { status: filters.status }),
        },
      }),
  });
};

export const useInfiniteBedsList = (filters: FilterValues, limit: number) => {
  return useInfiniteQuery<
    PaginatedResponse<Bed>,
    AxiosError<ApiResponse<null>>,
    InfiniteData<PaginatedResponse<Bed>>,
    [string, FilterValues, number]
  >({
    queryKey: ["beds-infinite", filters, limit],

    queryFn: ({ pageParam = 1 }) =>
      getBeds({
        pageParam: pageParam as number,
        params: {
          limit,
          ...(filters.createdAt && { createdAt: filters.createdAt }),
          ...(filters.name && { search: filters.name }),
          ...(filters.status && { status: filters.status }),
          ...(filters.roomId && { roomId: filters.roomId }),
          ...(filters.nonOccupied && { nonOccupied: filters.nonOccupied }),
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

export const useGetBed = (id?: string) => {
  return useQuery<
    ApiResponse<BedGetPayload<{ include: { room: true } }>>,
    AxiosError<ApiResponse<null>>,
    BedGetPayload<{ include: { room: true } }>,
    [string, string | undefined]
  >({
    queryKey: ["get-beds", id],
    queryFn: () =>
      getBed({
        urlHelpers: {
          id: id as string,
        },
      }),
    select: (data) => data.data,
    enabled: !!id,
  });
};

export const useCreateBed = () => {
  const queryClient = useQueryClient();
  const router = useRouter();
  return useMutation<
    ApiResponse<Bed[]>,
    AxiosError<ApiResponse<null>>,
    BedValidatorType
  >({
    mutationKey: ["create-beds"],
    mutationFn: (data) => createBeds({ body: data }),
    onSuccess: () => {
      toast.success("Beds Created Successfully");
      queryClient.invalidateQueries({
        queryKey: ["beds"],
      });
      router.back();
    },
    onError: showError,
  });
};

export const useUpdateBed = () => {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation<
    ApiResponse<BedGetPayload<{ include: { room: true } }>>,
    AxiosError<ApiResponse<null>>,
    PartialBedValidatorType
  >({
    mutationKey: ["update-bed"],
    mutationFn: (data) =>
      updateBed({ body: data, urlHelpers: { id: data.bedId.toString() } }),
    onSuccess: () => {
      toast.success("Bed Updated Successfully");
      queryClient.invalidateQueries({
        queryKey: ["beds"],
      });
      router.back();
    },
    onError: showError,
  });
};

export const useDeleteBed = () => {
  const queryClient = useQueryClient();

  return useMutation<
    ApiResponse<null>,
    AxiosError<ApiResponse<null>>,
    PartialBedValidatorType
  >({
    mutationKey: ["delete-bed"],
    mutationFn: (data) =>
      deleteBed({ urlHelpers: { id: data.bedId.toString() } }),
    onSuccess: () => {
      toast.success("Bed Deleted Successfully");
      queryClient.invalidateQueries({
        queryKey: ["beds"],
      });
    },
    onError: showError,
  });
};
