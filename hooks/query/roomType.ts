import { RoomType } from "@/generated/prisma/client";
import { RoomTypeGetPayload } from "@/generated/prisma/models";
import { ROOM_TYPE } from "@/lib/apiDefinations";
import { ApiResponse, FilterValues, PaginatedResponse } from "@/lib/type";
import { showError } from "@/lib/utils";
import { createRequest } from "@/services/apiRequest";
import {
  PartialRoomTypeValidatorType,
  RoomTypeValidatorType,
} from "@/validators/api/masters/roomType";
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

const createRoomType = createRequest<ApiResponse<RoomType>>(ROOM_TYPE, "POST");
const updateRoomType = createRequest<
  ApiResponse<RoomType>,
  undefined,
  { id: string }
>((p) => `${ROOM_TYPE}/${p.id}`, "PUT");
const deleteRoomType = createRequest<
  ApiResponse<null>,
  undefined,
  { id: string }
>((p) => `${ROOM_TYPE}/${p.id}`, "DELETE");
const getRoomType = createRequest<
  ApiResponse<RoomTypeGetPayload<{ include: { department: true } }>>,
  undefined,
  { id: string }
>((p) => `${ROOM_TYPE}/${p.id}`, "GET");

const getRoomTypes = createRequest<
  PaginatedResponse<RoomTypeGetPayload<{ include: { department: true } }>>,
  {
    limit: number;
    name?: string;
    createdAt?: string | { from?: Date; to?: Date };
    status?: string;
  }
>(ROOM_TYPE, "GET");

export const useRoomTypeList = (
  filters: FilterValues,
  page: number,
  limit: number,
) => {
  return useQuery<
    PaginatedResponse<RoomTypeGetPayload<{ include: { department: true } }>>,
    AxiosError<ApiResponse<null>>,
    PaginatedResponse<RoomTypeGetPayload<{ include: { department: true } }>>,
    [string, FilterValues, number, number]
  >({
    queryKey: ["room-types", filters, page, limit],
    queryFn: () =>
      getRoomTypes({
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

export const useGetRoomType = (id?: string) => {
  return useQuery<
    ApiResponse<RoomTypeGetPayload<{ include: { department: true } }>>,
    AxiosError<ApiResponse<null>>,
    RoomTypeGetPayload<{ include: { department: true } }>,
    [string, string | undefined]
  >({
    queryKey: ["get-room-types", id],
    queryFn: () =>
      getRoomType({
        urlHelpers: {
          id: id as string,
        },
      }),
    select: (data) => data.data,
    enabled: !!id,
  });
};

export const useCreateRoomType = () => {
  const queryClient = useQueryClient();
  const router = useRouter();
  return useMutation<
    ApiResponse<RoomType>,
    AxiosError<ApiResponse<null>>,
    RoomTypeValidatorType
  >({
    mutationKey: ["create-room-type"],
    mutationFn: (data) => createRoomType({ body: data }),
    onSuccess: () => {
      toast.success("Room Type Created Successfully");
      queryClient.invalidateQueries({
        queryKey: ["room-types"],
      });
      router.back();
    },
    onError: showError,
  });
};

export const useUpdateRoomType = () => {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation<
    ApiResponse<RoomType>,
    AxiosError<ApiResponse<null>>,
    PartialRoomTypeValidatorType
  >({
    mutationKey: ["update-room-type"],
    mutationFn: (data) =>
      updateRoomType({ body: data, urlHelpers: { id: String(data.typeId) } }),
    onSuccess: () => {
      toast.success("Ward Updated Successfully");
      queryClient.invalidateQueries({
        queryKey: ["ROOM_TYPE"],
      });
      router.back();
    },
    onError: showError,
  });
};

export const useDeleteRoomType = () => {
  const queryClient = useQueryClient();

  return useMutation<
    ApiResponse<null>,
    AxiosError<ApiResponse<null>>,
    PartialRoomTypeValidatorType
  >({
    mutationKey: ["delete-ward"],
    mutationFn: (data) =>
      deleteRoomType({ urlHelpers: { id: String(data.typeId) } }),
    onSuccess: () => {
      toast.success("Ward Deleted Successfully");
      queryClient.invalidateQueries({
        queryKey: ["ROOM_TYPE"],
      });
    },
    onError: showError,
  });
};

export const useInfiniteRoomTypeList = (
  filters: FilterValues,
  limit: number,
) => {
  return useInfiniteQuery<
    PaginatedResponse<RoomType>,
    AxiosError<ApiResponse<null>>,
    InfiniteData<PaginatedResponse<RoomType>>,
    [string, FilterValues, number]
  >({
    queryKey: ["room-types", filters, limit],

    queryFn: ({ pageParam = 1 }) =>
      getRoomTypes({
        pageParam: pageParam as number,
        params: {
          limit,
          ...(filters.createdAt && { createdAt: filters.createdAt }),
          ...(filters.departmentId && { departmentId: filters.departmentId }),
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
