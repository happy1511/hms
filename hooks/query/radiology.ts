import { RadiologyTemplate, RadiologyTest } from "@/generated/prisma/client";
import {
  CANCEL_RADIOLOGY_ORDERS,
  OUTSOURCE_RADIOLOGY_ORDERS,
  RADIOLOGY,
  RADIOLOGY_COMPLETED_ORDERS_WITH_RESULTS,
  RADIOLOGY_ORDER_TEMPLATE,
  RADIOLOGY_ORDERS,
  RADIOLOGY_TEMPLATE,
} from "@/lib/apiDefinations";
import {
  ApiResponse,
  FilterValues,
  PaginatedResponse,
  RadiologyOrderByPatientsType,
  RadiologyTestOrderWithResults,
  RadiologyTestResultType,
} from "@/lib/type";
import { showError } from "@/lib/utils";
import { createRequest } from "@/services/apiRequest";
import {
  PartialRadiologyTemplateValidatorType,
  PartialRadiologyTestValidatorType,
  RadiologyOrderValidatorType,
  RadiologyTemplateValidatorType,
  RadiologyTestValidatorType,
} from "@/validators/api/masters/radiologyTest";
import {
  InfiniteData,
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { AxiosError } from "axios";
import { toast } from "sonner";

const createRadiologyTest = createRequest<ApiResponse<RadiologyTest>>(
  RADIOLOGY,
  "POST",
);
const updateRadiologyTest = createRequest<ApiResponse<RadiologyTest>>(
  RADIOLOGY,
  "PUT",
);
const updateRadiologyOrder = createRequest<
  ApiResponse<RadiologyOrderValidatorType>,
  undefined,
  { id: number }
>(RADIOLOGY_ORDERS, "PUT");
const cancelRadiologyOrder = createRequest<
  ApiResponse<RadiologyOrderValidatorType>
>(CANCEL_RADIOLOGY_ORDERS, "PUT");
const outsourceRadiologyOrder = createRequest<
  ApiResponse<RadiologyOrderValidatorType>
>(OUTSOURCE_RADIOLOGY_ORDERS, "PUT");
const deleteRadiologyTest = createRequest<
  ApiResponse<null>,
  undefined,
  { id: string }
>((p) => `${RADIOLOGY}/${p.id}`, "DELETE");

const createRadiologyTemplate = createRequest<ApiResponse<RadiologyTemplate>>(
  RADIOLOGY_TEMPLATE,
  "POST",
);
const updateRadiologyTemplate = createRequest<ApiResponse<RadiologyTemplate>>(
  RADIOLOGY_TEMPLATE,
  "PUT",
);
const deleteRadiologyTemplate = createRequest<ApiResponse<null>>(
  RADIOLOGY_TEMPLATE,
  "DELETE",
);

const getRadiologyTests = createRequest<
  PaginatedResponse<RadiologyTest>,
  { limit: number; name?: string; createdAt?: string; status?: string }
>(RADIOLOGY, "GET");
const getRadiologyTemplates = createRequest<
  PaginatedResponse<RadiologyTemplate>,
  { limit: number; name?: string; createdAt?: string; status?: string }
>(RADIOLOGY_TEMPLATE, "GET");
const getRadiologyTemplateDetails = createRequest<
  ApiResponse<RadiologyTemplate>,
  undefined,
  { id: string }
>((p) => `${RADIOLOGY_TEMPLATE}/${p.id}`, "GET");
const getRadiologyOrderTemplate = createRequest<
  ApiResponse<RadiologyTestResultType>,
  { orderId: string }
>(RADIOLOGY_ORDER_TEMPLATE, "GET");
const getRadiologyOrders = createRequest<
  PaginatedResponse<RadiologyOrderByPatientsType>,
  { limit: number; name?: string; createdAt?: string; status?: string }
>(RADIOLOGY_ORDERS, "GET");
const getCompletedRadiologyOrdersWithResults = createRequest<
  ApiResponse<RadiologyTestOrderWithResults[]>,
  { opdId: number }
>(RADIOLOGY_COMPLETED_ORDERS_WITH_RESULTS, "GET");

export const useRadiologyTestsList = (
  filters: FilterValues,
  page: number,
  limit: number,
) => {
  return useQuery<
    PaginatedResponse<RadiologyTest>,
    AxiosError<ApiResponse<null>>,
    PaginatedResponse<RadiologyTest>,
    [string, FilterValues, number, number]
  >({
    queryKey: ["radiology-tests", filters, page, limit],
    queryFn: () =>
      getRadiologyTests({
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

export const useRadiologyOrdersList = (
  filters: FilterValues,
  page: number,
  limit: number,
) => {
  return useQuery<
    PaginatedResponse<RadiologyOrderByPatientsType>,
    AxiosError<ApiResponse<null>>,
    PaginatedResponse<RadiologyOrderByPatientsType>,
    [string, FilterValues, number, number]
  >({
    queryKey: ["radiology-orders", filters, page, limit],
    queryFn: () =>
      getRadiologyOrders({
        pageParam: page,
        params: {
          limit,

          ...(filters.createdAt && { createdAt: filters.createdAt }),
          ...(filters.name && { search: filters.name }),
          ...(filters.status && { status: filters.status }),
          ...(filters.testStatus && { testStatus: filters.testStatus }),
          ...(filters.outsourced !== undefined && {
            outsourced: filters.outsourced,
          }),
          ...(filters.cancelled !== undefined && {
            cancelled: filters.cancelled,
          }),
        },
      }),
  });
};

export const useInfiniteRadiologyTestsList = (
  filters: FilterValues,
  limit: number,
  enabled: boolean = true,
) => {
  return useInfiniteQuery<
    PaginatedResponse<RadiologyTest>,
    AxiosError<ApiResponse<null>>,
    InfiniteData<PaginatedResponse<RadiologyTest>>,
    [string, FilterValues, number]
  >({
    queryKey: ["radiology-tests-infinite", filters, limit],
    queryFn: ({ pageParam }) =>
      getRadiologyTests({
        pageParam: pageParam as number,
        params: {
          limit,
          ...(filters.createdAt && { createdAt: filters.createdAt }),
          ...(filters.name && { search: filters.name }),
          ...(filters.status && { status: filters.status }),
          ...(filters.defaultSelectedIds && {
            defaultSelectedIds: filters.defaultSelectedIds,
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
    enabled,
  });
};

export const useGetRadiologyOrderTemplate = (id?: string) => {
  return useQuery<
    ApiResponse<RadiologyTestResultType>,
    AxiosError<ApiResponse<null>>,
    RadiologyTestResultType,
    [string, string | undefined]
  >({
    queryKey: ["get-radiology-order-templates", id],
    queryFn: () =>
      getRadiologyOrderTemplate({
        params: {
          orderId: id as string,
        },
      }),
    select: (data) => data.data,
    enabled: !!id,
  });
};

export const useCreateRadiologyTest = () => {
  const queryClient = useQueryClient();
  return useMutation<
    ApiResponse<RadiologyTest>,
    AxiosError<ApiResponse<null>>,
    RadiologyTestValidatorType
  >({
    mutationKey: ["create-radiology-test"],
    mutationFn: (data) => createRadiologyTest({ body: data }),
    onSuccess: () => {
      toast.success("Test Created Successfully");
      queryClient.invalidateQueries({
        queryKey: ["radiology-tests"],
      });
    },
    onError: showError,
  });
};

export const useUpdateRadiologyTest = () => {
  const queryClient = useQueryClient();
  return useMutation<
    ApiResponse<RadiologyTest>,
    AxiosError<ApiResponse<null>>,
    PartialRadiologyTestValidatorType
  >({
    mutationKey: ["update-Radiology-test"],
    mutationFn: (data) => updateRadiologyTest({ body: data }),
    onSuccess: () => {
      toast.success("Test updated Successfully");
      queryClient.invalidateQueries({
        queryKey: ["radiology-tests"],
      });
    },
    onError: showError,
  });
};

export const useUpdateRadiologyTestOrder = () => {
  const queryClient = useQueryClient();
  return useMutation<
    ApiResponse<RadiologyOrderValidatorType>,
    AxiosError<ApiResponse<null>>,
    RadiologyOrderValidatorType
  >({
    mutationKey: ["update-radiology-order"],
    mutationFn: (data) =>
      updateRadiologyOrder({
        body: data,
      }),
    onSuccess: () => {
      toast.success("Order updated Successfully");
      queryClient.invalidateQueries({
        queryKey: ["radiology-orders"],
      });
    },
    onError: showError,
  });
};

export const useDeleteRadiologyTest = () => {
  const queryClient = useQueryClient();

  return useMutation<
    ApiResponse<null>,
    AxiosError<ApiResponse<null>>,
    PartialRadiologyTestValidatorType
  >({
    mutationKey: ["delete-radiology-test"],
    mutationFn: (data) =>
      deleteRadiologyTest({ urlHelpers: { id: data.testId as string } }),
    onSuccess: () => {
      toast.success("Test Deleted Successfully");
      queryClient.invalidateQueries({
        queryKey: ["radiology-tests"],
      });
    },
    onError: showError,
  });
};

export const useCancelRadiologyTestOrder = () => {
  const queryClient = useQueryClient();
  return useMutation<
    ApiResponse<RadiologyOrderValidatorType>,
    AxiosError<ApiResponse<null>>,
    RadiologyOrderValidatorType
  >({
    mutationKey: ["cancel-radiology-order"],
    mutationFn: (data) =>
      cancelRadiologyOrder({
        body: data,
      }),
    onSuccess: () => {
      toast.success("Order Cancelled Successfully");
      queryClient.invalidateQueries({
        queryKey: ["radiology-orders"],
      });
    },
    onError: showError,
  });
};

export const useOutsourceRadiologyTestOrder = () => {
  const queryClient = useQueryClient();
  return useMutation<
    ApiResponse<RadiologyOrderValidatorType>,
    AxiosError<ApiResponse<null>>,
    RadiologyOrderValidatorType
  >({
    mutationKey: ["outsource-radiology-order"],
    mutationFn: (data) =>
      outsourceRadiologyOrder({
        body: data,
      }),
    onSuccess: () => {
      toast.success("Order outsource Successfully");
      queryClient.invalidateQueries({
        queryKey: ["radiology-orders"],
      });
    },
    onError: showError,
  });
};

export const useRadiologyTemplatesList = (
  filters: FilterValues,
  page: number,
  limit: number,
) => {
  return useQuery<
    PaginatedResponse<RadiologyTemplate>,
    AxiosError<ApiResponse<null>>,
    PaginatedResponse<RadiologyTemplate>,
    [string, FilterValues, number, number]
  >({
    queryKey: ["radiology-templates", filters, page, limit],
    queryFn: () =>
      getRadiologyTemplates({
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

export const useRadiologyTemplate = (id?: string) => {
  return useQuery<
    ApiResponse<RadiologyTemplate>,
    AxiosError<ApiResponse<null>>,
    RadiologyTemplate,
    [string, string | undefined]
  >({
    queryKey: ["get-beds", id],
    queryFn: () =>
      getRadiologyTemplateDetails({
        urlHelpers: {
          id: id as string,
        },
      }),
    select: (data) => data.data,
    enabled: !!id,
  });
};

export const useCreateRadiologyTemplate = () => {
  const queryClient = useQueryClient();
  return useMutation<
    ApiResponse<RadiologyTemplate>,
    AxiosError<ApiResponse<null>>,
    RadiologyTemplateValidatorType
  >({
    mutationKey: ["create-radiology-template"],
    mutationFn: (data) => createRadiologyTemplate({ body: data }),
    onSuccess: () => {
      toast.success("Template Created Successfully");
      queryClient.invalidateQueries({
        queryKey: ["radiology-templates"],
      });
    },
    onError: showError,
  });
};

export const useUpdateRadiologyTemplate = () => {
  const queryClient = useQueryClient();
  return useMutation<
    ApiResponse<RadiologyTemplate>,
    AxiosError<ApiResponse<null>>,
    PartialRadiologyTemplateValidatorType
  >({
    mutationKey: ["update-Radiology-template"],
    mutationFn: (data) => updateRadiologyTemplate({ body: data }),
    onSuccess: () => {
      toast.success("Template updated Successfully");
      queryClient.invalidateQueries({
        queryKey: ["radiology-templates"],
      });
    },
    onError: showError,
  });
};

export const useDeleteRadiologyTemplate = () => {
  const queryClient = useQueryClient();

  return useMutation<
    ApiResponse<null>,
    AxiosError<ApiResponse<null>>,
    PartialRadiologyTemplateValidatorType
  >({
    mutationKey: ["delete-radiology-template"],
    mutationFn: (data) =>
      deleteRadiologyTemplate({ body: { id: data.templateId as string } }),
    onSuccess: () => {
      toast.success("Template Deleted Successfully");
      queryClient.invalidateQueries({
        queryKey: ["radiology-templates"],
      });
    },
    onError: showError,
  });
};

export const useCompletedRadiologyOrdersWithResults = (opdId?: number) => {
  return useQuery<
    ApiResponse<RadiologyTestOrderWithResults[]>,
    AxiosError<ApiResponse<null>>,
    RadiologyTestOrderWithResults[],
    [string, number | undefined]
  >({
    queryKey: ["completed-radiology-orders-with-results", opdId],
    queryFn: () =>
      getCompletedRadiologyOrdersWithResults({
        params: {
          opdId: opdId as number,
        },
      }),
    select: (data) => data.data,
    enabled: !!opdId,
  });
};
