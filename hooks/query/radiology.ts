import { RadiologyTemplate, RadiologyTest } from "@/generated/prisma/client";
import { RADIOLOGY, RADIOLOGY_TEMPLATE } from "@/lib/apiDefinations";
import { ApiResponse, FilterValues, PaginatedResponse } from "@/lib/type";
import { showError } from "@/lib/utils";
import { createRequest } from "@/services/apiRequest";
import {
  PartialRadiologyTemplateValidatorType,
  PartialRadiologyTestValidatorType,
  RadiologyTemplateValidatorType,
  RadiologyTestValidatorType,
} from "@/validators/api/masters/radiologyTest";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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
    mutationKey: ["update-pathology-test"],
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
    mutationKey: ["update-pathology-template"],
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
