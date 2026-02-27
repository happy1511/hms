import { Room } from "@/generated/prisma/client";
import { RoomGetPayload } from "@/generated/prisma/models";
import { ROOMS } from "@/lib/apiDefinations";
import { ApiResponse, FilterValues, PaginatedResponse } from "@/lib/type";
import { showError } from "@/lib/utils";
import { createRequest } from "@/services/apiRequest";
import {
  PartialRoomValidatorType,
  roomValidatorType,
} from "@/validators/api/masters/room";
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

const createRoom = createRequest<ApiResponse<Room>>(ROOMS, "POST");
const updateRoom = createRequest<ApiResponse<Room>, undefined, { id: string }>(
  (p) => `${ROOMS}/${p.id}`,
  "PUT",
);
const deleteRoom = createRequest<ApiResponse<null>, undefined, { id: string }>(
  (p) => `${ROOMS}/${p.id}`,
  "DELETE",
);
const getRoom = createRequest<
  ApiResponse<RoomGetPayload<{ include: { roomType: true } }>>,
  undefined,
  { id: string }
>((p) => `${ROOMS}/${p.id}`, "GET");

const getRooms = createRequest<
  PaginatedResponse<RoomGetPayload<{ include: { roomType: true } }>>,
  { limit: number; name?: string; createdAt?: string; status?: string }
>(ROOMS, "GET");

export const useRoomsList = (
  filters: FilterValues,
  page: number,
  limit: number,
) => {
  return useQuery<
    PaginatedResponse<RoomGetPayload<{ include: { roomType: true } }>>,
    AxiosError<ApiResponse<null>>,
    PaginatedResponse<RoomGetPayload<{ include: { roomType: true } }>>,
    [string, FilterValues, number, number]
  >({
    queryKey: ["rooms", filters, page, limit],
    queryFn: () =>
      getRooms({
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

export const useGetRoom = (id?: string) => {
  return useQuery<
    ApiResponse<RoomGetPayload<{ include: { roomType: true } }>>,
    AxiosError<ApiResponse<null>>,
    RoomGetPayload<{ include: { roomType: true } }>,
    [string, string | undefined]
  >({
    queryKey: ["get-rooms", id],
    queryFn: () =>
      getRoom({
        urlHelpers: {
          id: id as string,
        },
      }),
    select: (data) => data.data,
    enabled: !!id,
  });
};

export const useCreateRoom = () => {
  const queryClient = useQueryClient();
  const router = useRouter();
  return useMutation<
    ApiResponse<Room>,
    AxiosError<ApiResponse<null>>,
    roomValidatorType
  >({
    mutationKey: ["create-rooms"],
    mutationFn: (data) => createRoom({ body: data }),
    onSuccess: () => {
      toast.success("Room Created Successfully");
      queryClient.invalidateQueries({
        queryKey: ["rooms"],
      });
      router.back();
    },
    onError: showError,
  });
};

export const useUpdateRoom = () => {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation<
    ApiResponse<Room>,
    AxiosError<ApiResponse<null>>,
    PartialRoomValidatorType
  >({
    mutationKey: ["update-room"],
    mutationFn: (data) =>
      updateRoom({ body: data, urlHelpers: { id: String(data.roomId) } }),
    onSuccess: () => {
      toast.success("room Updated Successfully");
      queryClient.invalidateQueries({
        queryKey: ["rooms"],
      });
      router.back();
    },
    onError: showError,
  });
};

export const useDeleteRoom = () => {
  const queryClient = useQueryClient();

  return useMutation<
    ApiResponse<null>,
    AxiosError<ApiResponse<null>>,
    PartialRoomValidatorType
  >({
    mutationKey: ["delete-room"],
    mutationFn: (data) =>
      deleteRoom({ urlHelpers: { id: String(data.roomId) } }),
    onSuccess: () => {
      toast.success("Ward Deleted Successfully");
      queryClient.invalidateQueries({
        queryKey: ["wards"],
      });
    },
    onError: showError,
  });
};

export const useInfiniteRoomsList = (filters: FilterValues, limit: number) => {
  return useInfiniteQuery<
    PaginatedResponse<Room>,
    AxiosError<ApiResponse<null>>,
    InfiniteData<PaginatedResponse<Room>>,
    [string, FilterValues, number]
  >({
    queryKey: ["rooms", filters, limit],

    queryFn: ({ pageParam = 1 }) =>
      getRooms({
        pageParam: pageParam as number,
        params: {
          limit,
          ...(filters.createdAt && { createdAt: filters.createdAt }),
          ...(filters.name && { search: filters.name }),
          ...(filters.status && { status: filters.status }),
          ...(filters.roomTypeId && { roomTypeId: filters.roomTypeId }),
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
