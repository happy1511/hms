import {
  ParameterOptions,
  PathologyTestHeader,
  ReferenceRange,
} from "@/generated/prisma/client";
import {
  CANCEL_PATHOLOGY_ORDERS,
  OUTSOURCE_PATHOLOGY_ORDERS,
  PATHOLOGY,
  PATHOLOGY_COMPLETED_ORDERS_WITH_RESULTS,
  PATHOLOGY_ORDER_PARAMETERS,
  PATHOLOGY_ORDERS,
  PATHOLOGY_TEST_OPTION,
  PATHOLOGY_TEST_PARAMETER,
  PATHOLOGY_TEST_PARAMETER_HEADER,
  PATHOLOGY_TEST_REFERENCE_RANGE,
  SAMPLE_PATHOLOGY_ORDERS,
} from "@/lib/apiDefinations";
import {
  ApiResponse,
  FilterValues,
  PaginatedResponse,
  PathologyOrderByPatientsType,
  PathologyTestDataType,
  PathologyTestOrderWithResults,
  PathologyTestParameterType,
  PathologyTestResultType,
} from "@/lib/type";
import { showError } from "@/lib/utils";
import { createRequest } from "@/services/apiRequest";
import {
  AddOptionToParameterValidatorType,
  AddParameterHeaderToTestValidatorType,
  AddParameterToTestValidatorType,
  AddReferenceRangeToParameterValidatorType,
  PartialOptionToParameterValidatorType,
  PartialParameterHeaderToTestValidatorType,
  PartialParameterToTestValidatorType,
  PartialPathologyTestValidatorType,
  PartialReferenceRangeToParameterValidatorType,
  PathologyOrderValidatorType,
  PathologyTestValidatorType,
  UpdateParameterHeaderToTestValidatorType,
  UpdateParameterToTestValidatorType,
  UpdateReferenceRangeToParameterValidatorType,
} from "@/validators/api/masters/pathologyTest";
import {
  InfiniteData,
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { AxiosError } from "axios";
import { toast } from "sonner";

const createPathologyTest = createRequest<ApiResponse<PathologyTestDataType>>(
  PATHOLOGY,
  "POST",
);
const updatePathologyTest = createRequest<
  ApiResponse<PathologyTestDataType>,
  undefined,
  { id: number }
>((p) => `${PATHOLOGY}/${p.id}`, "PUT");
const updatePathologyOrder = createRequest<
  ApiResponse<PathologyOrderValidatorType>,
  undefined,
  { id: number }
>(PATHOLOGY_ORDERS, "PUT");
const cancelPathologyOrder = createRequest<
  ApiResponse<PathologyOrderValidatorType>
>(CANCEL_PATHOLOGY_ORDERS, "PUT");
const outsourcePathologyOrder = createRequest<
  ApiResponse<PathologyOrderValidatorType>
>(OUTSOURCE_PATHOLOGY_ORDERS, "PUT");
const markSamplePathologyOrder = createRequest<
  ApiResponse<PathologyOrderValidatorType>
>(SAMPLE_PATHOLOGY_ORDERS, "PUT");
const deletePathologyTest = createRequest<
  ApiResponse<null>,
  undefined,
  { id: string }
>((p) => `${PATHOLOGY}/${p.id}`, "DELETE");
const createPathologyTestParameter = createRequest<
  ApiResponse<PathologyTestParameterType>
>(PATHOLOGY_TEST_PARAMETER, "POST");
const updatePathologyTestParameter = createRequest<
  ApiResponse<PathologyTestParameterType>
>(PATHOLOGY_TEST_PARAMETER, "PUT");
const deletePathologyTestParameter = createRequest<
  ApiResponse<null>,
  undefined
>(PATHOLOGY_TEST_PARAMETER, "DELETE");
const createReferenceRange = createRequest<ApiResponse<ReferenceRange>>(
  PATHOLOGY_TEST_REFERENCE_RANGE,
  "POST",
);
const updateReferenceRange = createRequest<ApiResponse<ReferenceRange>>(
  PATHOLOGY_TEST_REFERENCE_RANGE,
  "PUT",
);
const deleteReferenceRange = createRequest<ApiResponse<null>, undefined>(
  PATHOLOGY_TEST_REFERENCE_RANGE,
  "DELETE",
);
const createOption = createRequest<ApiResponse<ParameterOptions>>(
  PATHOLOGY_TEST_OPTION,
  "POST",
);
const deleteOption = createRequest<ApiResponse<null>, undefined>(
  PATHOLOGY_TEST_OPTION,
  "DELETE",
);
const createPathologyTestParameterHeader = createRequest<
  ApiResponse<PathologyTestHeader>
>(PATHOLOGY_TEST_PARAMETER_HEADER, "POST");
const updatePathologyTestParameterHeader = createRequest<
  ApiResponse<PathologyTestHeader>
>(PATHOLOGY_TEST_PARAMETER_HEADER, "PUT");
const deletePathologyTestParameterHeader = createRequest<
  ApiResponse<null>,
  undefined
>(PATHOLOGY_TEST_PARAMETER_HEADER, "DELETE");
const getPathologyTest = createRequest<
  ApiResponse<PathologyTestDataType>,
  undefined,
  { id: string }
>((p) => `${PATHOLOGY}/${p.id}`, "GET");

const getPathologyTests = createRequest<
  PaginatedResponse<PathologyTestDataType>,
  {
    limit: number;
    name?: string;
    createdAt?: string | { from?: Date; to?: Date };
    status?: string;
  }
>(PATHOLOGY, "GET");
const getPathologyOrderParameters = createRequest<
  ApiResponse<PathologyTestResultType>,
  { orderId: string }
>(PATHOLOGY_ORDER_PARAMETERS, "GET");
const getPathologyOrders = createRequest<
  PaginatedResponse<PathologyOrderByPatientsType>,
  {
    limit: number;
    name?: string;
    createdAt?: string | { from?: Date; to?: Date };
    status?: string;
  }
>(PATHOLOGY_ORDERS, "GET");
const getCompletedPathologyOrdersWithResults = createRequest<
  ApiResponse<PathologyTestOrderWithResults[]>,
  { opdId: number }
>(PATHOLOGY_COMPLETED_ORDERS_WITH_RESULTS, "GET");

export const usePathologyTestsList = (
  filters: FilterValues,
  page: number,
  limit: number,
) => {
  return useQuery<
    PaginatedResponse<PathologyTestDataType>,
    AxiosError<ApiResponse<null>>,
    PaginatedResponse<PathologyTestDataType>,
    [string, FilterValues, number, number]
  >({
    queryKey: ["pathology-tests", filters, page, limit],
    queryFn: () =>
      getPathologyTests({
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

export const usePathologyOrdersList = (
  filters: FilterValues,
  page: number,
  limit: number,
) => {
  return useQuery<
    PaginatedResponse<PathologyOrderByPatientsType>,
    AxiosError<ApiResponse<null>>,
    PaginatedResponse<PathologyOrderByPatientsType>,
    [string, FilterValues, number, number]
  >({
    queryKey: ["pathology-orders", filters, page, limit],
    queryFn: () =>
      getPathologyOrders({
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

export const useCompletedPathologyOrdersWithResults = (opdId?: number) => {
  return useQuery<
    ApiResponse<PathologyTestOrderWithResults[]>,
    AxiosError<ApiResponse<null>>,
    PathologyTestOrderWithResults[],
    [string, number | undefined]
  >({
    queryKey: ["completed-pathology-orders-with-results", opdId],
    queryFn: () =>
      getCompletedPathologyOrdersWithResults({
        params: {
          opdId: opdId as number,
        },
      }),
    select: (data) => data.data,
    enabled: !!opdId,
  });
};

export const useInfinitePathologyTestsList = (
  filters: FilterValues,
  limit: number,
  enabled: boolean = true,
) => {
  return useInfiniteQuery<
    PaginatedResponse<PathologyTestDataType>,
    AxiosError<ApiResponse<null>>,
    InfiniteData<PaginatedResponse<PathologyTestDataType>>,
    [string, FilterValues, number]
  >({
    queryKey: ["pathology-tests-infinite", filters, limit],
    queryFn: ({ pageParam }) =>
      getPathologyTests({
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

export const useGetPathologyTest = (id?: string) => {
  return useQuery<
    ApiResponse<PathologyTestDataType>,
    AxiosError<ApiResponse<null>>,
    PathologyTestDataType,
    [string, string | undefined]
  >({
    queryKey: ["get-pathology-test", id],
    queryFn: () =>
      getPathologyTest({
        urlHelpers: {
          id: id as string,
        },
      }),
    select: (data) => data.data,
    enabled: !!id,
  });
};

export const useGetPathologyOrderParameters = (id?: string) => {
  return useQuery<
    ApiResponse<PathologyTestResultType>,
    AxiosError<ApiResponse<null>>,
    PathologyTestResultType,
    [string, string | undefined]
  >({
    queryKey: ["get-pathology-order-parameters", id],
    queryFn: () =>
      getPathologyOrderParameters({
        params: {
          orderId: id as string,
        },
      }),
    select: (data) => data.data,
    enabled: !!id,
  });
};

export const useCreatePathologyTest = () => {
  const queryClient = useQueryClient();
  return useMutation<
    ApiResponse<PathologyTestDataType>,
    AxiosError<ApiResponse<null>>,
    PathologyTestValidatorType
  >({
    mutationKey: ["create-pathology-test"],
    mutationFn: (data) => createPathologyTest({ body: data }),
    onSuccess: () => {
      toast.success("Test Created Successfully");
      queryClient.invalidateQueries({
        queryKey: ["pathology-tests"],
      });
    },
    onError: showError,
  });
};

export const useCreateTestParameter = () => {
  const queryClient = useQueryClient();
  return useMutation<
    ApiResponse<PathologyTestParameterType>,
    AxiosError<ApiResponse<null>>,
    AddParameterToTestValidatorType
  >({
    mutationKey: ["create-pathology-test-parameter"],
    mutationFn: (data) => createPathologyTestParameter({ body: data }),
    onSuccess: (data, variables) => {
      toast.success("Test Parameter Created Successfully");

      const newParameter = data.data;

      queryClient.setQueryData<ApiResponse<PathologyTestDataType> | undefined>(
        ["get-pathology-test", String(variables.testId)],
        (oldData) => {
          if (!oldData) return oldData;

          return {
            ...oldData,
            data: {
              ...oldData.data,
              parameters: [...oldData.data.parameters, newParameter],
            },
          };
        },
      );
    },
    onError: showError,
  });
};

export const useCreateReferenceRange = (testId: number) => {
  const queryClient = useQueryClient();
  return useMutation<
    ApiResponse<ReferenceRange>,
    AxiosError<ApiResponse<null>>,
    AddReferenceRangeToParameterValidatorType
  >({
    mutationKey: ["create-pathology-reference-range"],
    mutationFn: (data) => createReferenceRange({ body: data }),
    onSuccess: (data, variables) => {
      toast.success("Test Parameter Created Successfully");
      const newRange = data.data;
      const parameterId = variables.parameterId;

      queryClient.setQueryData<ApiResponse<PathologyTestDataType> | undefined>(
        ["get-pathology-test", String(testId)],
        (oldData) => {
          if (!oldData) return oldData;

          return {
            ...oldData,
            data: {
              ...oldData.data,
              parameters: oldData.data.parameters.map((param) => {
                if (param.id !== parameterId) return param;

                return {
                  ...param,
                  referenceRanges: [...param.referenceRanges, newRange],
                };
              }),
            },
          };
        },
      );
    },
    onError: showError,
  });
};

export const useCreateOption = (testId: number) => {
  const queryClient = useQueryClient();
  return useMutation<
    ApiResponse<ParameterOptions>,
    AxiosError<ApiResponse<null>>,
    AddOptionToParameterValidatorType
  >({
    mutationKey: ["create-pathology-option"],
    mutationFn: (data) => createOption({ body: data }),
    onSuccess: (data, variables) => {
      toast.success("Test Parameter Option Created Successfully");
      const newOption = data.data;
      const parameterId = variables.parameterId;

      queryClient.setQueryData<ApiResponse<PathologyTestDataType> | undefined>(
        ["get-pathology-test", String(testId)],
        (oldData) => {
          if (!oldData) return oldData;

          return {
            ...oldData,
            data: {
              ...oldData.data,
              parameters: oldData.data.parameters.map((param) => {
                if (param.id !== parameterId) return param;

                return {
                  ...param,
                  parameterOptions: [...param.parameterOptions, newOption],
                };
              }),
            },
          };
        },
      );
    },
    onError: showError,
  });
};

export const useCreateTestParameterHeader = () => {
  const queryClient = useQueryClient();
  return useMutation<
    ApiResponse<PathologyTestHeader>,
    AxiosError<ApiResponse<null>>,
    AddParameterHeaderToTestValidatorType
  >({
    mutationKey: ["create-pathology-test-parameter-header"],
    mutationFn: (data) => createPathologyTestParameterHeader({ body: data }),
    onSuccess: (data, variables) => {
      toast.success("Test Parameter Created Successfully");

      const newHeader = data.data;

      queryClient.setQueryData<ApiResponse<PathologyTestDataType> | undefined>(
        ["get-pathology-test", String(variables.testId)],
        (oldData) => {
          if (!oldData) return oldData;
          const newData = {
            ...oldData,
            data: {
              ...oldData.data,
              testHeaders: [...oldData.data.testHeaders, newHeader],
            },
          };
          return newData;
        },
      );
    },
    onError: showError,
  });
};

export const useUpdateReferenceRange = (testId: number) => {
  const queryClient = useQueryClient();
  return useMutation<
    ApiResponse<ReferenceRange>,
    AxiosError<ApiResponse<null>>,
    UpdateReferenceRangeToParameterValidatorType
  >({
    mutationKey: ["update-pathology-reference-range"],
    mutationFn: (data) => updateReferenceRange({ body: data }),
    onSuccess: (data, variables) => {
      toast.success("Test Parameter updated Successfully");

      const updatedRange = data.data;
      const parameterId = variables.parameterId;

      queryClient.setQueryData<ApiResponse<PathologyTestDataType> | undefined>(
        ["get-pathology-test", String(testId)],
        (oldData) => {
          if (!oldData) return oldData;

          return {
            ...oldData,
            data: {
              ...oldData.data,
              parameters: oldData.data.parameters.map((param) => {
                if (param.id !== parameterId) return param;

                return {
                  ...param,
                  referenceRanges: param.referenceRanges.map((range) =>
                    range.id === updatedRange.id ? updatedRange : range,
                  ),
                };
              }),
            },
          };
        },
      );
    },
    onError: showError,
  });
};

export const useUpdateTestParameterHeader = () => {
  const queryClient = useQueryClient();
  return useMutation<
    ApiResponse<PathologyTestHeader>,
    AxiosError<ApiResponse<null>>,
    UpdateParameterHeaderToTestValidatorType
  >({
    mutationKey: ["update-pathology-test-parameter-header"],
    mutationFn: (data) => updatePathologyTestParameterHeader({ body: data }),
    onSuccess: (data, variables) => {
      toast.success("Test Parameter updated Successfully");
      const updatedHeader = data.data;

      queryClient.setQueryData<ApiResponse<PathologyTestDataType> | undefined>(
        ["get-pathology-test", String(variables.testId)],
        (oldData) => {
          if (!oldData) return oldData;

          return {
            ...oldData,
            data: {
              ...oldData.data,
              testHeaders: oldData.data.testHeaders.map((header) =>
                header.id === updatedHeader.id ? updatedHeader : header,
              ),
            },
          };
        },
      );
    },
    onError: showError,
  });
};

export const useUpdatePathologyTest = () => {
  const queryClient = useQueryClient();
  return useMutation<
    ApiResponse<PathologyTestDataType>,
    AxiosError<ApiResponse<null>>,
    PartialPathologyTestValidatorType
  >({
    mutationKey: ["update-pathology-test"],
    mutationFn: (data) =>
      updatePathologyTest({
        body: data,
        urlHelpers: { id: Number(data.testId) },
      }),
    onSuccess: () => {
      toast.success("Test updated Successfully");
      queryClient.invalidateQueries({
        queryKey: ["pathology-tests"],
      });
    },
    onError: showError,
  });
};

export const useUpdatePathologyTestOrder = () => {
  const queryClient = useQueryClient();
  return useMutation<
    ApiResponse<PathologyOrderValidatorType>,
    AxiosError<ApiResponse<null>>,
    PathologyOrderValidatorType
  >({
    mutationKey: ["update-pathology-order"],
    mutationFn: (data) =>
      updatePathologyOrder({
        body: data,
      }),
    onSuccess: () => {
      toast.success("Order updated Successfully");
      queryClient.invalidateQueries({
        queryKey: ["pathology-orders"],
      });
    },
    onError: showError,
  });
};

export const useMarkSamplePathologyTestOrder = () => {
  const queryClient = useQueryClient();
  return useMutation<
    ApiResponse<PathologyOrderValidatorType>,
    AxiosError<ApiResponse<null>>,
    PathologyOrderValidatorType
  >({
    mutationKey: ["mark-sample-pathology-order"],
    mutationFn: (data) =>
      markSamplePathologyOrder({
        body: data,
      }),
    onSuccess: () => {
      toast.success("Order Marked Successfully");
      queryClient.invalidateQueries({
        queryKey: ["pathology-orders"],
      });
    },
    onError: showError,
  });
};

export const useCancelPathologyTestOrder = () => {
  const queryClient = useQueryClient();
  return useMutation<
    ApiResponse<PathologyOrderValidatorType>,
    AxiosError<ApiResponse<null>>,
    PathologyOrderValidatorType
  >({
    mutationKey: ["cancel-pathology-order"],
    mutationFn: (data) =>
      cancelPathologyOrder({
        body: data,
      }),
    onSuccess: () => {
      toast.success("Order Cancelled Successfully");
      queryClient.invalidateQueries({
        queryKey: ["pathology-orders"],
      });
    },
    onError: showError,
  });
};

export const useOutsourcePathologyTestOrder = () => {
  const queryClient = useQueryClient();
  return useMutation<
    ApiResponse<PathologyOrderValidatorType>,
    AxiosError<ApiResponse<null>>,
    PathologyOrderValidatorType
  >({
    mutationKey: ["outsource-pathology-order"],
    mutationFn: (data) =>
      outsourcePathologyOrder({
        body: data,
      }),
    onSuccess: () => {
      toast.success("Order outsource Successfully");
      queryClient.invalidateQueries({
        queryKey: ["pathology-orders"],
      });
    },
    onError: showError,
  });
};

export const useUpdateTestParameter = () => {
  const queryClient = useQueryClient();
  return useMutation<
    ApiResponse<PathologyTestParameterType>,
    AxiosError<ApiResponse<null>>,
    UpdateParameterToTestValidatorType
  >({
    mutationKey: ["update-pathology-test-parameter"],
    mutationFn: (data) => updatePathologyTestParameter({ body: data }),
    onSuccess: (data, variables) => {
      toast.success("Test Parameter updated Successfully");
      const updatedParameter = data.data;
      const parameterId = variables.parameterId;

      queryClient.setQueryData<ApiResponse<PathologyTestDataType> | undefined>(
        ["get-pathology-test", String(variables.testId)],
        (oldData) => {
          if (!oldData) return oldData;

          return {
            ...oldData,
            data: {
              ...oldData.data,
              parameters: oldData.data.parameters.map((param) => {
                if (param.id !== parameterId) return param;

                return {
                  ...param,
                  ...updatedParameter,
                };
              }),
            },
          };
        },
      );
    },
    onError: showError,
  });
};

export const useDeletePathologyTest = () => {
  const queryClient = useQueryClient();

  return useMutation<
    ApiResponse<null>,
    AxiosError<ApiResponse<null>>,
    PartialPathologyTestValidatorType
  >({
    mutationKey: ["delete-pathology-test"],
    mutationFn: (data) =>
      deletePathologyTest({ urlHelpers: { id: data.testId as string } }),
    onSuccess: () => {
      toast.success("Test Deleted Successfully");
      queryClient.invalidateQueries({
        queryKey: ["pathology-tests"],
      });
    },
    onError: showError,
  });
};

export const useDeletePathologyTestParameterHeader = (testId: number) => {
  const queryClient = useQueryClient();

  return useMutation<
    ApiResponse<null>,
    AxiosError<ApiResponse<null>>,
    PartialParameterHeaderToTestValidatorType
  >({
    mutationKey: ["delete-pathology-test-parameter-header"],
    mutationFn: (data) => deletePathologyTestParameterHeader({ body: data }),
    onSuccess: (data, variables) => {
      toast.success("Test Header Deleted Successfully");

      queryClient.setQueryData<ApiResponse<PathologyTestDataType> | undefined>(
        ["get-pathology-test", String(testId)],
        (oldData) => {
          if (!oldData) return oldData;

          return {
            ...oldData,
            data: {
              ...oldData.data,
              testHeaders: oldData.data.testHeaders.filter(
                (header) => header.id !== variables.headerId,
              ),
            },
          };
        },
      );
    },
    onError: showError,
  });
};

export const useDeletePathologyTestParameter = (testId: number) => {
  const queryClient = useQueryClient();

  return useMutation<
    ApiResponse<null>,
    AxiosError<ApiResponse<null>>,
    PartialParameterToTestValidatorType
  >({
    mutationKey: ["delete-pathology-test-parameter"],
    mutationFn: (data) => deletePathologyTestParameter({ body: data }),
    onSuccess: (_, variables) => {
      toast.success("Test Parameter Deleted Successfully");
      queryClient.setQueryData<ApiResponse<PathologyTestDataType> | undefined>(
        ["get-pathology-test", String(testId)],
        (oldData) => {
          if (!oldData) return oldData;

          return {
            ...oldData,
            data: {
              ...oldData.data,
              parameters: oldData.data.parameters.filter(
                (param) => param.id !== variables.parameterId,
              ),
            },
          };
        },
      );
    },
    onError: showError,
  });
};

export const useDeleteReferenceRange = (
  testId: number,
  parameterId: number,
) => {
  const queryClient = useQueryClient();

  return useMutation<
    ApiResponse<null>,
    AxiosError<ApiResponse<null>>,
    PartialReferenceRangeToParameterValidatorType
  >({
    mutationKey: ["delete-pathology-reference-range"],
    mutationFn: (data) => deleteReferenceRange({ body: data }),
    onSuccess: (_, variables) => {
      toast.success("Test Parameter Deleted Successfully");

      const { referenceRangeId } = variables;

      queryClient.setQueryData<ApiResponse<PathologyTestDataType> | undefined>(
        ["get-pathology-test", String(testId)],
        (oldData) => {
          if (!oldData) return oldData;

          return {
            ...oldData,
            data: {
              ...oldData.data,
              parameters: oldData.data.parameters.map((param) => {
                if (param.id !== parameterId) return param;

                return {
                  ...param,
                  referenceRanges: param.referenceRanges.filter(
                    (range) => range.id !== referenceRangeId,
                  ),
                };
              }),
            },
          };
        },
      );
    },
    onError: showError,
  });
};

export const useDeleteOption = (testId: number, parameterId: number) => {
  const queryClient = useQueryClient();

  return useMutation<
    ApiResponse<null>,
    AxiosError<ApiResponse<null>>,
    PartialOptionToParameterValidatorType
  >({
    mutationKey: ["delete-pathology-option"],
    mutationFn: (data) => deleteOption({ body: data }),
    onSuccess: (_, variables) => {
      toast.success("Test Parameter Deleted Successfully");

      const { optionId } = variables;

      queryClient.setQueryData<ApiResponse<PathologyTestDataType> | undefined>(
        ["get-pathology-test", String(testId)],
        (oldData) => {
          if (!oldData) return oldData;

          return {
            ...oldData,
            data: {
              ...oldData.data,
              parameters: oldData.data.parameters.map((param) => {
                if (param.id !== parameterId) return param;

                return {
                  ...param,
                  parameterOptions: param.parameterOptions.filter(
                    (opt) => opt.id !== optionId,
                  ),
                };
              }),
            },
          };
        },
      );
    },
    onError: showError,
  });
};
