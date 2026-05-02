import {
  CERTIFICATE,
  CERTIFICATE_TEMPLATE,
} from "@/lib/apiDefinations";
import {
  ApiResponse,
  CertificateTemplateMap,
  FilterValues,
  OpdCertificateType,
  PaginatedResponse,
} from "@/lib/type";
import { showError } from "@/lib/utils";
import { createRequest } from "@/services/apiRequest";
import {
  CertificateTemplateValidatorType,
  OpdCertificateValidatorType,
} from "@/validators/api/masters/certificate";
import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { AxiosError } from "axios";
import { toast } from "sonner";

const getCertificateTemplates = createRequest<ApiResponse<CertificateTemplateMap>>(
  CERTIFICATE_TEMPLATE,
  "GET",
);
const saveCertificateTemplate = createRequest<
  ApiResponse<unknown>,
  undefined,
  undefined,
  CertificateTemplateValidatorType
>(CERTIFICATE_TEMPLATE, "PUT");
const getCertificates = createRequest<
  PaginatedResponse<OpdCertificateType>,
  {
    limit: number;
    opdId?: number;
    type?: string;
  }
>(CERTIFICATE, "GET");
const createCertificate = createRequest<
  ApiResponse<OpdCertificateType>,
  undefined,
  undefined,
  OpdCertificateValidatorType
>(CERTIFICATE, "POST");
const getCertificateById = createRequest<
  ApiResponse<OpdCertificateType>,
  undefined,
  { certificateId: number }
>((p) => `${CERTIFICATE}/${p.certificateId}`, "GET");

export const useCertificateTemplates = () =>
  useQuery<
    ApiResponse<CertificateTemplateMap>,
    AxiosError<ApiResponse<null>>,
    CertificateTemplateMap,
    [string]
  >({
    queryKey: ["certificate-templates"],
    queryFn: () => getCertificateTemplates({}),
    select: (data) => data.data,
  });

export const useSaveCertificateTemplate = () => {
  const queryClient = useQueryClient();
  return useMutation<
    ApiResponse<unknown>,
    AxiosError<ApiResponse<null>>,
    CertificateTemplateValidatorType
  >({
    mutationKey: ["save-certificate-template"],
    mutationFn: (data) => saveCertificateTemplate({ body: data }),
    onSuccess: () => {
      toast.success("Certificate template saved successfully");
      queryClient.invalidateQueries({ queryKey: ["certificate-templates"] });
    },
    onError: showError,
  });
};

export const useCertificatesList = (
  filters: FilterValues,
  page: number,
  limit: number,
  enabled = true,
) =>
  useQuery<
    PaginatedResponse<OpdCertificateType>,
    AxiosError<ApiResponse<null>>,
    PaginatedResponse<OpdCertificateType>,
    [string, FilterValues, number, number]
  >({
    queryKey: ["certificates", filters, page, limit],
    queryFn: () =>
      getCertificates({
        pageParam: page,
        params: {
          limit,
          ...(filters.opdId && { opdId: filters.opdId }),
          ...(filters.documentType && { type: filters.documentType }),
        },
      }),
    enabled,
  });

export const useCreateCertificate = () => {
  const queryClient = useQueryClient();
  return useMutation<
    ApiResponse<OpdCertificateType>,
    AxiosError<ApiResponse<null>>,
    OpdCertificateValidatorType
  >({
    mutationKey: ["create-certificate"],
    mutationFn: (data) => createCertificate({ body: data }),
    onSuccess: () => {
      toast.success("Certificate created successfully");
      queryClient.invalidateQueries({ queryKey: ["certificates"] });
    },
    onError: showError,
  });
};

export const useGetCertificate = (certificateId?: number) =>
  useQuery<
    ApiResponse<OpdCertificateType>,
    AxiosError<ApiResponse<null>>,
    OpdCertificateType,
    [string, number | undefined]
  >({
    queryKey: ["certificate", certificateId],
    queryFn: () =>
      getCertificateById({
        urlHelpers: { certificateId: certificateId as number },
      }),
    select: (data) => data.data,
    enabled: !!certificateId,
  });
