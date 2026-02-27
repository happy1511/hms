import { Location } from "@/generated/prisma/client";
import { LOCATIONS } from "@/lib/apiDefinations";
import { ApiResponse, FilterValues, PaginatedResponse } from "@/lib/type";
import { showError } from "@/lib/utils";
import { createRequest } from "@/services/apiRequest";
import { PartialBedValidatorType } from "@/validators/api/masters/bed";
import {
  LocationValidatorType,
  PartialLocationValidatorType,
} from "@/validators/api/masters/location";
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

const createLocations = createRequest<ApiResponse<Location[]>>(
  LOCATIONS,
  "POST",
);
const updateLocation = createRequest<
  ApiResponse<Location>,
  undefined,
  { id: string }
>(LOCATIONS, "PUT");
const deleteLocation = createRequest<
  ApiResponse<null>,
  undefined,
  { id: string }
>(LOCATIONS, "DELETE");
const getLocations = createRequest<
  PaginatedResponse<Location>,
  { limit: number; name?: string; createdAt?: string; status?: string }
>(LOCATIONS, "GET");

export const useLocationsList = (
  filters: FilterValues,
  page: number,
  limit: number,
) => {
  return useQuery<
    PaginatedResponse<Location>,
    AxiosError<ApiResponse<null>>,
    PaginatedResponse<Location>,
    [string, FilterValues, number, number]
  >({
    queryKey: ["locations", filters, page, limit],
    queryFn: () =>
      getLocations({
        pageParam: page,
        params: {
          limit,
          ...(filters.createdAt && { createdAt: filters.createdAt }),
          ...(filters.name && { search: filters.name }),
          ...(filters.status && { status: filters.status }),
          ...(filters.wardId && { wardId: filters.wardId }),
          ...(filters.departmentId && { departmentId: filters.departmentId }),
        },
      }),
  });
};

export const useInfiniteLocationsList = (
  filters: FilterValues,
  limit: number,
) => {
  return useInfiniteQuery<
    PaginatedResponse<Location>,
    AxiosError<ApiResponse<null>>,
    InfiniteData<PaginatedResponse<Location>>,
    [string, FilterValues, number]
  >({
    queryKey: ["infinite-locations", filters, limit],

    queryFn: ({ pageParam = 1 }) =>
      getLocations({
        pageParam: pageParam as number,
        params: {
          limit,
          ...(filters.createdAt && { createdAt: filters.createdAt }),
          ...(filters.name && { search: filters.name }),
          ...(filters.status && { status: filters.status }),
          ...(filters.doctorType && { doctorType: filters.doctorType }),
          ...(filters.billingSectionId && {
            billingSectionId: filters.billingSectionId,
          }),
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

export const useCreateLocation = () => {
  const queryClient = useQueryClient();
  const router = useRouter();
  return useMutation<
    ApiResponse<Location[]>,
    AxiosError<ApiResponse<null>>,
    LocationValidatorType
  >({
    mutationKey: ["create-locations"],
    mutationFn: (data) => createLocations({ body: data }),
    onSuccess: () => {
      toast.success("Locations Created Successfully");
      queryClient.invalidateQueries({
        queryKey: ["locations"],
      });
      router.back();
    },
    onError: showError,
  });
};

export const useUpdateLocation = () => {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation<
    ApiResponse<Location>,
    AxiosError<ApiResponse<null>>,
    PartialLocationValidatorType
  >({
    mutationKey: ["update-locations"],
    mutationFn: (data) =>
      updateLocation({ body: data, urlHelpers: { id: data.id.toString() } }),
    onSuccess: () => {
      toast.success("Location Updated Successfully");
      queryClient.invalidateQueries({
        queryKey: ["locations"],
      });
      router.back();
    },
    onError: showError,
  });
};

export const useDeleteLocation = () => {
  const queryClient = useQueryClient();

  return useMutation<
    ApiResponse<null>,
    AxiosError<ApiResponse<null>>,
    PartialBedValidatorType
  >({
    mutationKey: ["delete-locations"],
    mutationFn: (data) =>
      deleteLocation({ urlHelpers: { id: data.bedId.toString() } }),
    onSuccess: () => {
      toast.success("Location Deleted Successfully");
      queryClient.invalidateQueries({
        queryKey: ["locations"],
      });
    },
    onError: showError,
  });
};
