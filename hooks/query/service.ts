import { SERVICES } from "@/lib/apiDefinations";
import {
  ApiResponse,
  FilterValues,
  PaginatedResponse,
  ServiceDataType,
} from "@/lib/type";
import { showError } from "@/lib/utils";
import { createRequest } from "@/services/apiRequest";
import {
  PartialServiceValidatorType,
  ServiceValidatorType,
} from "@/validators/api/masters/service";
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

const createServiceSection = createRequest<ApiResponse<ServiceDataType>>(
  SERVICES,
  "POST",
);
const updateServiceSection = createRequest<
  ApiResponse<ServiceDataType>,
  undefined,
  { id: string }
>((p) => `${SERVICES}/${p.id}`, "PUT");
const deleteServiceSection = createRequest<
  ApiResponse<null>,
  undefined,
  { id: string }
>((p) => `${SERVICES}/${p.id}`, "DELETE");
const getServiceSection = createRequest<
  ApiResponse<ServiceDataType>,
  undefined,
  { id: string }
>((p) => `${SERVICES}/${p.id}`, "GET");

const getServices = createRequest<
  PaginatedResponse<ServiceDataType>,
  {
    limit: number;
    name?: string;
    createdAt?: string | { from?: Date; to?: Date };
    status?: string;
    doctorId?: number;
    billingSectionId?: number;
    isInvoiceOnly?: boolean;
  }
>(SERVICES, "GET");

export const useServicesList = (
  filters: FilterValues,
  page: number,
  limit: number,
) => {
  return useQuery<
    PaginatedResponse<ServiceDataType>,
    AxiosError<ApiResponse<null>>,
    PaginatedResponse<ServiceDataType>,
    [string, FilterValues, number, number]
  >({
    queryKey: ["services", filters, page, limit],
    queryFn: () =>
      getServices({
        pageParam: page,
        params: {
          limit,
          ...(filters.createdAt && { createdAt: filters.createdAt }),
          ...(filters.name && { search: filters.name }),
          ...(filters.status && { status: filters.status }),
          ...(filters.doctorType && { doctorType: filters.doctorType }),
          ...(filters.doctorId && { doctorId: filters.doctorId }),
          ...(typeof filters.isInvoiceOnly === "boolean" && {
            isInvoiceOnly: filters.isInvoiceOnly,
          }),
        },
      }),
  });
};

export const useInfiniteServicesList = (
  filters: FilterValues,
  limit: number,
) => {
  return useInfiniteQuery<
    PaginatedResponse<ServiceDataType>,
    AxiosError<ApiResponse<null>>,
    InfiniteData<PaginatedResponse<ServiceDataType>>,
    [string, FilterValues, number]
  >({
    queryKey: ["services", filters, limit],

    queryFn: ({ pageParam = 1 }) =>
      getServices({
        pageParam: pageParam as number,
        params: {
          limit,
          ...(filters.createdAt && { createdAt: filters.createdAt }),
          ...(filters.name && { search: filters.name }),
          ...(filters.status && { status: filters.status }),
          ...(filters.doctorType && { doctorType: filters.doctorType }),
          ...(filters.doctorId && { doctorId: filters.doctorId }),
          ...(typeof filters.isInvoiceOnly === "boolean" && {
            isInvoiceOnly: filters.isInvoiceOnly,
          }),
          ...(filters.billingSectionId && {
            billingSectionId: Number(filters.billingSectionId),
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

export const useGetService = (id?: string) => {
  return useQuery<
    ApiResponse<ServiceDataType>,
    AxiosError<ApiResponse<null>>,
    ServiceDataType,
    [string, string | undefined]
  >({
    queryKey: ["get-service", id],
    queryFn: () =>
      getServiceSection({
        urlHelpers: {
          id: id as string,
        },
      }),
    select: (data) => data.data,
    enabled: !!id,
  });
};

export const useConsultingDoctorService = (doctorId?: number) => {
  return useQuery<
    PaginatedResponse<ServiceDataType>,
    AxiosError<ApiResponse<null>>,
    ServiceDataType | null,
    [string, number | undefined]
  >({
    queryKey: ["consulting-doctor-service", doctorId],
    queryFn: () =>
      getServices({
        pageParam: 1,
        params: {
          limit: 1,
          doctorId: doctorId as number,
        },
      }),
    select: (data) => data.data?.[0] ?? null,
    enabled: !!doctorId,
  });
};

export const useCreateService = () => {
  const queryClient = useQueryClient();
  const router = useRouter();
  return useMutation<
    ApiResponse<ServiceDataType>,
    AxiosError<ApiResponse<null>>,
    ServiceValidatorType
  >({
    mutationKey: ["create-service"],
    mutationFn: (data) => createServiceSection({ body: data }),
    onSuccess: () => {
      toast.success("Service Created Successfully");
      queryClient.invalidateQueries({
        queryKey: ["services"],
      });
      router.back();
    },
    onError: showError,
  });
};

export const useUpdateService = () => {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation<
    ApiResponse<ServiceDataType>,
    AxiosError<ApiResponse<null>>,
    PartialServiceValidatorType
  >({
    mutationKey: ["update-service"],
    mutationFn: (data) =>
      updateServiceSection({
        body: data,
        urlHelpers: { id: data.serviceId.toString() },
      }),
    onSuccess: () => {
      toast.success("Service Updated Successfully");
      queryClient.invalidateQueries({
        queryKey: ["services"],
      });
      router.back();
    },
    onError: showError,
  });
};

export const useDeleteService = () => {
  const queryClient = useQueryClient();

  return useMutation<
    ApiResponse<null>,
    AxiosError<ApiResponse<null>>,
    PartialServiceValidatorType
  >({
    mutationKey: ["delete-service"],
    mutationFn: (data) =>
      deleteServiceSection({ urlHelpers: { id: data.serviceId.toString() } }),
    onSuccess: () => {
      toast.success("Service Deleted Successfully");
      queryClient.invalidateQueries({
        queryKey: ["services"],
      });
    },
    onError: showError,
  });
};
