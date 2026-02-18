import { Bed } from "@/generated/prisma/client";
import { LOCATIONS } from "@/lib/apiDefinations";
import { ApiResponse, FilterValues, PaginatedResponse } from "@/lib/type";
import { showError } from "@/lib/utils";
import { createRequest } from "@/services/apiRequest";
import {
  BedValidatorType,
  PartialBedValidatorType,
} from "@/validators/api/masters/bed";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

const createLocations = createRequest<ApiResponse<Bed[]>>(LOCATIONS, "POST");
const updateLocation = createRequest<
  ApiResponse<Bed>,
  undefined,
  { id: string }
>(LOCATIONS, "PUT");
const deleteLocation = createRequest<
  ApiResponse<null>,
  undefined,
  { id: string }
>(LOCATIONS, "DELETE");
const getLocations = createRequest<
  PaginatedResponse<Bed>,
  { limit: number; name?: string; createdAt?: string; status?: string }
>(LOCATIONS, "GET");

export const useLocationsList = (
  filters: FilterValues,
  page: number,
  limit: number,
) => {
  return useQuery<
    PaginatedResponse<Bed>,
    AxiosError<ApiResponse<null>>,
    PaginatedResponse<Bed>,
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
          ...(filters.floorId && { floorId: filters.floorId }),
        },
      }),
  });
};

export const useCreateLocation = () => {
  const queryClient = useQueryClient();
  const router = useRouter();
  return useMutation<
    ApiResponse<Bed[]>,
    AxiosError<ApiResponse<null>>,
    BedValidatorType
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
    ApiResponse<Bed>,
    AxiosError<ApiResponse<null>>,
    PartialBedValidatorType
  >({
    mutationKey: ["update-locations"],
    mutationFn: (data) =>
      updateLocation({ body: data, urlHelpers: { id: data.bedId.toString() } }),
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
