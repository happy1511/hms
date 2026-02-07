import { PATIENT } from "@/lib/apiDefinations";
import {
  ApiResponse,
  PaginatedResponse,
  FilterValues,
  PatientType,
} from "@/lib/type";
import { showError } from "@/lib/utils";
import { createRequest } from "@/services/apiRequest";
import {
  PartialPatientValidatorType,
  PatientValidatorType,
} from "@/validators/api/masters/patient";
import { useMutation, useQuery } from "@tanstack/react-query";
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

const getPatients = createRequest<
  PaginatedResponse<PatientType>,
  { limit: number; name?: string; createdAt?: string; status?: string }
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
        urlHelpers: { id: data.patientId.toString() },
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
      deletePatient({ urlHelpers: { id: data.patientId.toString() } }),
    onSuccess: () => {
      toast.success("Patient Deleted Successfully");
    },
    onError: showError,
  });
};
