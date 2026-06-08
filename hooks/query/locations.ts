import { Location } from "@/generated/prisma/client";
import { LOCATIONS } from "@/lib/apiDefinations";
import {
  ApiResponse,
  FilterValues,
  LocationFieldName,
  LocationOption,
  PaginatedResponse,
} from "@/lib/type";
import { showError } from "@/lib/utils";
import { createRequest } from "@/services/apiRequest";
import {
  LocationQueryValidatorType,
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
  {
    limit: number;
    search?: string;
    createdAt?: string | { from?: Date; to?: Date };
    status?: string;
  }
>(LOCATIONS, "GET");
const getLocationOptions = createRequest<
  PaginatedResponse<LocationOption>,
  {
    limit: number;
    field?: LocationFieldName;
    search?: string;
    country?: string;
    state?: string;
    city?: string;
    postcode?: string;
    postName?: string;
  }
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

type LocationOptionFilters = Pick<
  LocationQueryValidatorType,
  "field" | "country" | "state" | "city" | "postcode" | "postName"
> & {
  search?: string;
};

export const useInfiniteLocationOptionsList = (
  filters: LocationOptionFilters,
  limit: number,
  enabled = true,
) => {
  return useInfiniteQuery<
    PaginatedResponse<LocationOption>,
    AxiosError<ApiResponse<null>>,
    InfiniteData<PaginatedResponse<LocationOption>>,
    [string, LocationOptionFilters, number]
  >({
    queryKey: ["infinite-location-options", filters, limit],
    enabled,
    queryFn: ({ pageParam = 1 }) =>
      getLocationOptions({
        pageParam: pageParam as number,
        params: {
          limit,
          ...(filters.field && { field: filters.field }),
          ...(filters.search && { search: filters.search }),
          ...(filters.country && { country: filters.country }),
          ...(filters.state && { state: filters.state }),
          ...(filters.city && { city: filters.city }),
          ...(filters.postcode && { postcode: filters.postcode }),
          ...(filters.postName && { postName: filters.postName }),
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
    PartialLocationValidatorType
  >({
    mutationKey: ["delete-locations"],
    mutationFn: (data) =>
      deleteLocation({ body: data, urlHelpers: { id: data.id.toString() } }),
    onSuccess: () => {
      toast.success("Location Deleted Successfully");
      queryClient.invalidateQueries({
        queryKey: ["locations"],
      });
    },
    onError: showError,
  });
};
