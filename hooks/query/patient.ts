import { PATIENT, PATIENT_DOCUMENTS } from "@/lib/apiDefinations";
import {
  ApiResponse,
  FilterValues,
  PaginatedResponse,
  PatientType,
  PatientDocumentType,
} from "@/lib/type";
import { showError } from "@/lib/utils";
import { createRequest } from "@/services/apiRequest";
import {
  PartialPatientValidatorType,
  PatientValidatorType,
} from "@/validators/api/masters/patient";
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

const createPatient = createRequest<ApiResponse<PatientType>>(PATIENT, "POST");
const updatePatient = createRequest<
  ApiResponse<PatientType>,
  undefined,
  { id: string }
>((p) => `${PATIENT}/${p.id}`, "PUT");
const deletePatient = createRequest<
  ApiResponse<null>,
  undefined,
  { id: string }
>((p) => `${PATIENT}/${p.id}`, "DELETE");
const getPatient = createRequest<
  ApiResponse<PatientType>,
  undefined,
  { id: string }
>((p) => `${PATIENT}/${p.id}`, "GET");
const getPatientDocuments = createRequest<
  PaginatedResponse<PatientDocumentType>,
  {
    limit: number;
    search?: string;
    createdAt?: string | { from?: Date; to?: Date };
    status?: string;
    uhid?: number;
    contactNo?: string;
    documentType?: string;
    opdId?: number;
    ipdId?: number;
  }
>(PATIENT_DOCUMENTS, "GET");
const createPatientDocument = createRequest<
  ApiResponse<PatientDocumentType>,
  undefined,
  undefined,
  {
    documentName: string;
    file: File;
    opdId?: number;
    ipdId?: number;
  }
>(PATIENT_DOCUMENTS, "POST", true);

const getPatients = createRequest<
  PaginatedResponse<PatientType>,
  {
    limit: number;
    search?: string;
    createdAt?: string | { from?: Date; to?: Date };
    status?: string;
  }
>(PATIENT, "GET");

export const usePatientsList = (
  filters: FilterValues,
  page: number,
  limit: number,
) => {
  return useQuery<
    PaginatedResponse<PatientType>,
    AxiosError<ApiResponse<null>>,
    PaginatedResponse<PatientType>,
    [string, FilterValues, number, number]
  >({
    queryKey: ["patients", filters, page, limit],
    queryFn: () =>
      getPatients({
        pageParam: page,
        params: {
          limit,
          ...(filters.uhid && { uhid: filters.uhid }),
          ...(filters.name && { search: filters.name }),
          ...(filters.contactNo && { contactNo: filters.contactNo }),
        },
      }),
  });
};

export const usePatientDocumentsList = (
  filters: FilterValues,
  page: number,
  limit: number,
  options?: { enabled?: boolean },
) => {
  return useQuery<
    PaginatedResponse<PatientDocumentType>,
    AxiosError<ApiResponse<null>>,
    PaginatedResponse<PatientDocumentType>,
    [string, FilterValues, number, number]
  >({
    queryKey: ["patient-documents", filters, page, limit],
    queryFn: () =>
      getPatientDocuments({
        pageParam: page,
        params: {
          limit,
          ...(filters.uhid && { uhid: filters.uhid }),
          ...(filters.name && { search: filters.name }),
          ...(filters.contactNo && { contactNo: filters.contactNo }),
          ...(filters.documentType && { documentType: filters.documentType }),
          ...(filters.opdId && { opdId: filters.opdId }),
          ...(filters.ipdId && { ipdId: filters.ipdId }),
          ...(filters.createdAt && { createdAt: filters.createdAt }),
        },
      }),
    enabled: options?.enabled ?? true,
  });
};

export const useCreatePatientDocument = () => {
  const queryClient = useQueryClient();
  return useMutation<
    ApiResponse<PatientDocumentType>,
    AxiosError<ApiResponse<null>>,
    {
      documentName: string;
      file: File;
      opdId?: number;
      ipdId?: number;
    }
  >({
    mutationKey: ["create-patient-document"],
    mutationFn: (data) => createPatientDocument({ body: data }),
    onSuccess: () => {
      toast.success("Document uploaded successfully");
      queryClient.invalidateQueries({
        queryKey: ["patient-documents"],
      });
    },
    onError: showError,
  });
};

export const useGetPatient = (id?: string) => {
  return useQuery<
    ApiResponse<PatientType>,
    AxiosError<ApiResponse<null>>,
    PatientType,
    [string, string | undefined]
  >({
    queryKey: ["get-patients", id],
    queryFn: () =>
      getPatient({
        urlHelpers: {
          id: id as string,
        },
      }),
    select: (data) => data.data,
    enabled: !!id,
  });
};

export const useCreatePatient = () => {
  const router = useRouter();
  return useMutation<
    ApiResponse<PatientType>,
    AxiosError<ApiResponse<null>>,
    PatientValidatorType
  >({
    mutationKey: ["create-patient"],
    mutationFn: (data) => createPatient({ body: data }),
    onSuccess: () => {
      toast.success("Patient Created Successfully");
      router.back();
    },
    onError: showError,
  });
};

export const useUpdatePatient = () => {
  const router = useRouter();
  return useMutation<
    ApiResponse<PatientType>,
    AxiosError<ApiResponse<null>>,
    PartialPatientValidatorType
  >({
    mutationKey: ["update-patient"],
    mutationFn: (data) =>
      updatePatient({
        body: data,
        urlHelpers: { id: String(data.patientId) },
      }),
    onSuccess: () => {
      toast.success("Patient Updated Successfully");
      router.back();
    },
    onError: showError,
  });
};

export const useDeletePatient = () => {
  return useMutation<
    ApiResponse<null>,
    AxiosError<ApiResponse<null>>,
    PartialPatientValidatorType
  >({
    mutationKey: ["delete-patient"],
    mutationFn: (data) =>
      deletePatient({ urlHelpers: { id: String(data.patientId) } }),
    onSuccess: () => {
      toast.success("Patient Deleted Successfully");
    },
    onError: showError,
  });
};

export const useInfinitePatientsList = (
  filters: FilterValues,
  limit: number,
) => {
  return useInfiniteQuery<
    PaginatedResponse<PatientType>,
    AxiosError<ApiResponse<null>>,
    InfiniteData<PaginatedResponse<PatientType>>,
    [string, FilterValues, number]
  >({
    queryKey: ["patients-infinite", filters, limit],
    queryFn: ({ pageParam = 1 }) =>
      getPatients({
        pageParam: pageParam as number,
        params: {
          limit,
          ...(filters.uhid && { uhid: filters.uhid }),
          ...(filters.name && { search: filters.name }),
          ...(filters.contactNo && { contactNo: filters.contactNo }),
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
