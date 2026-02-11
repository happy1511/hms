import {
  PATHOLOGY,
  PATHOLOGY_TEST_OPTION,
  PATHOLOGY_TEST_PARAMETER,
  PATHOLOGY_TEST_PARAMETER_HEADER,
  PATHOLOGY_TEST_REFERENCE_RANGE,
} from "@/lib/apiDefinations";
import {
  ApiResponse,
  FilterValues,
  PaginatedResponse,
  PathologyTestDataType,
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
  PathologyTestValidatorType,
  UpdateParameterHeaderToTestValidatorType,
  UpdateParameterToTestValidatorType,
  UpdateReferenceRangeToParameterValidatorType,
} from "@/validators/api/masters/pathologyTest";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { toast } from "sonner";

const createPathologyTest = createRequest<ApiResponse<PathologyTestDataType>>(
  PATHOLOGY,
  "POST",
);
const updatePathologyTest = createRequest<ApiResponse<PathologyTestDataType>>(
  PATHOLOGY,
  "PUT",
);
const deletePathologyTest = createRequest<
  ApiResponse<null>,
  undefined,
  { id: string }
>((p) => `${PATHOLOGY}/${p.id}`, "DELETE");
const createPathologyTestParameter = createRequest<ApiResponse<null>>(
  PATHOLOGY_TEST_PARAMETER,
  "POST",
);
const updatePathologyTestParameter = createRequest<ApiResponse<null>>(
  PATHOLOGY_TEST_PARAMETER,
  "PUT",
);
const deletePathologyTestParameter = createRequest<
  ApiResponse<null>,
  undefined
>(PATHOLOGY_TEST_PARAMETER, "DELETE");
const createReferenceRange = createRequest<ApiResponse<null>>(
  PATHOLOGY_TEST_REFERENCE_RANGE,
  "POST",
);
const updateReferenceRange = createRequest<ApiResponse<null>>(
  PATHOLOGY_TEST_REFERENCE_RANGE,
  "PUT",
);
const deleteReferenceRange = createRequest<ApiResponse<null>, undefined>(
  PATHOLOGY_TEST_REFERENCE_RANGE,
  "DELETE",
);
const createOption = createRequest<ApiResponse<null>>(
  PATHOLOGY_TEST_OPTION,
  "POST",
);
const deleteOption = createRequest<ApiResponse<null>, undefined>(
  PATHOLOGY_TEST_OPTION,
  "DELETE",
);
const createPathologyTestParameterHeader = createRequest<ApiResponse<null>>(
  PATHOLOGY_TEST_PARAMETER_HEADER,
  "POST",
);
const updatePathologyTestParameterHeader = createRequest<ApiResponse<null>>(
  PATHOLOGY_TEST_PARAMETER_HEADER,
  "PUT",
);
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
  { limit: number; name?: string; createdAt?: string; status?: string }
>(PATHOLOGY, "GET");

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

export const useUpdatePathologyTest = () => {
  const queryClient = useQueryClient();
  return useMutation<
    ApiResponse<PathologyTestDataType>,
    AxiosError<ApiResponse<null>>,
    PartialPathologyTestValidatorType
  >({
    mutationKey: ["update-pathology-test"],
    mutationFn: (data) => updatePathologyTest({ body: data }),
    onSuccess: () => {
      toast.success("Test updated Successfully");
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
    ApiResponse<null>,
    AxiosError<ApiResponse<null>>,
    AddParameterToTestValidatorType
  >({
    mutationKey: ["create-pathology-test-parameter"],
    mutationFn: (data) => createPathologyTestParameter({ body: data }),
    onSuccess: () => {
      toast.success("Test Parameter Created Successfully");
      queryClient.invalidateQueries({
        queryKey: ["pathology-tests"],
      });
    },
    onError: showError,
  });
};

export const useUpdateTestParameterHeader = () => {
  const queryClient = useQueryClient();
  return useMutation<
    ApiResponse<null>,
    AxiosError<ApiResponse<null>>,
    UpdateParameterHeaderToTestValidatorType
  >({
    mutationKey: ["update-pathology-test-parameter-header"],
    mutationFn: (data) => updatePathologyTestParameterHeader({ body: data }),
    onSuccess: () => {
      toast.success("Test Parameter updated Successfully");
      queryClient.invalidateQueries({
        queryKey: ["pathology-tests"],
      });
    },
    onError: showError,
  });
};

export const useDeletePathologyTestParameterHeader = () => {
  // const queryClient = useQueryClient();

  return useMutation<
    ApiResponse<null>,
    AxiosError<ApiResponse<null>>,
    PartialParameterHeaderToTestValidatorType
  >({
    mutationKey: ["delete-pathology-test-parameter-header"],
    mutationFn: (data) => deletePathologyTestParameterHeader({ body: data }),
    onSuccess: () => {
      toast.success("Test Parameter Deleted Successfully");
      // queryClient.invalidateQueries({
      //   queryKey: ["pathology-tests"],
      // });
    },
    onError: showError,
  });
};

export const useCreateReferenceRange = () => {
  const queryClient = useQueryClient();
  return useMutation<
    ApiResponse<null>,
    AxiosError<ApiResponse<null>>,
    AddReferenceRangeToParameterValidatorType
  >({
    mutationKey: ["create-pathology-reference-range"],
    mutationFn: (data) => createReferenceRange({ body: data }),
    onSuccess: () => {
      toast.success("Test Parameter Created Successfully");
      queryClient.invalidateQueries({
        queryKey: ["pathology-tests"],
      });
    },
    onError: showError,
  });
};

export const useUpdateReferenceRange = () => {
  const queryClient = useQueryClient();
  return useMutation<
    ApiResponse<null>,
    AxiosError<ApiResponse<null>>,
    UpdateReferenceRangeToParameterValidatorType
  >({
    mutationKey: ["update-pathology-reference-range"],
    mutationFn: (data) => updateReferenceRange({ body: data }),
    onSuccess: () => {
      toast.success("Test Parameter updated Successfully");
      queryClient.invalidateQueries({
        queryKey: ["pathology-tests"],
      });
    },
    onError: showError,
  });
};

export const useDeleteReferenceRange = () => {
  // const queryClient = useQueryClient();

  return useMutation<
    ApiResponse<null>,
    AxiosError<ApiResponse<null>>,
    PartialReferenceRangeToParameterValidatorType
  >({
    mutationKey: ["delete-pathology-reference-range"],
    mutationFn: () => deleteReferenceRange({}),
    onSuccess: () => {
      toast.success("Test Parameter Deleted Successfully");
      // queryClient.invalidateQueries({
      //   queryKey: ["pathology-tests"],
      // });
    },
    onError: showError,
  });
};

export const useCreateOption = () => {
  const queryClient = useQueryClient();
  return useMutation<
    ApiResponse<null>,
    AxiosError<ApiResponse<null>>,
    AddOptionToParameterValidatorType
  >({
    mutationKey: ["create-pathology-option"],
    mutationFn: (data) => createOption({ body: data }),
    onSuccess: () => {
      toast.success("Test Parameter Created Successfully");
      queryClient.invalidateQueries({
        queryKey: ["pathology-tests"],
      });
    },
    onError: showError,
  });
};

export const useDeleteOption = () => {
  // const queryClient = useQueryClient();

  return useMutation<
    ApiResponse<null>,
    AxiosError<ApiResponse<null>>,
    PartialOptionToParameterValidatorType
  >({
    mutationKey: ["delete-pathology-option"],
    mutationFn: (data) => deleteOption({ body: data }),
    onSuccess: () => {
      toast.success("Test Parameter Deleted Successfully");
      // queryClient.invalidateQueries({
      //   queryKey: ["pathology-tests"],
      // });
    },
    onError: showError,
  });
};

export const useCreateTestParameterHeader = () => {
  const queryClient = useQueryClient();
  return useMutation<
    ApiResponse<null>,
    AxiosError<ApiResponse<null>>,
    AddParameterHeaderToTestValidatorType
  >({
    mutationKey: ["create-pathology-test-parameter-header"],
    mutationFn: (data) => createPathologyTestParameterHeader({ body: data }),
    onSuccess: () => {
      toast.success("Test Parameter Created Successfully");
      queryClient.invalidateQueries({
        queryKey: ["pathology-tests"],
      });
    },
    onError: showError,
  });
};

export const useUpdateTestParameter = () => {
  const queryClient = useQueryClient();
  return useMutation<
    ApiResponse<null>,
    AxiosError<ApiResponse<null>>,
    UpdateParameterToTestValidatorType
  >({
    mutationKey: ["update-pathology-test-parameter"],
    mutationFn: (data) => updatePathologyTestParameter({ body: data }),
    onSuccess: () => {
      toast.success("Test Parameter updated Successfully");
      queryClient.invalidateQueries({
        queryKey: ["pathology-tests"],
      });
    },
    onError: showError,
  });
};

export const useDeletePathologyTestParameter = () => {
  // const queryClient = useQueryClient();

  return useMutation<
    ApiResponse<null>,
    AxiosError<ApiResponse<null>>,
    PartialParameterToTestValidatorType
  >({
    mutationKey: ["delete-pathology-test-parameter"],
    mutationFn: (data) => deletePathologyTestParameter({ body: data }),
    onSuccess: () => {
      toast.success("Test Parameter Deleted Successfully");
      // queryClient.invalidateQueries({
      //   queryKey: ["pathology-tests"],
      // });
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
