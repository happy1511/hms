import { PATIENT } from "@/lib/apiDefinations";
import {
  ApiResponse,
  PaginatedResponse,
  PatientFilterValues,
  PatientType,
  UserFilterValues,
} from "@/lib/type";
import { createRequest } from "@/services/apiRequest";
import {
  PartialPatientValidatorType,
  PatientValidatorType,
} from "@/validators/api/masters/patient";
import { useMutation, useQuery } from "@tanstack/react-query";
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
  filters: PatientFilterValues,
  page: number,
  limit: number,
) => {
  return useQuery<
    PaginatedResponse<PatientType>,
    Error,
    PaginatedResponse<PatientType>,
    [string, PatientFilterValues, number, number]
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
    Error,
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
  return useMutation<ApiResponse<PatientType>, Error, PatientValidatorType>({
    mutationKey: ["create-patient"],
    mutationFn: (data) => createPatient({ body: data }),
    onSuccess: () => {
      toast.success("Patient Created Successfully");
      router.back();
    },
    onError: (data) => {
      toast.error(data.message || "Something went wrong");
    },
  });
};

export const useUpdatePatient = () => {
  const router = useRouter();
  return useMutation<
    ApiResponse<PatientType>,
    Error,
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
    onError: (data) => {
      toast.error(data.message || "Something went wrong");
    },
  });
};

export const useDeletePatient = (
  filters: UserFilterValues,
  page: number,
  limit: number,
) => {
  return useMutation<ApiResponse<null>, Error, PartialPatientValidatorType>({
    mutationKey: ["delete-patient"],
    mutationFn: (data) =>
      deletePatient({ urlHelpers: { id: data.patientId.toString() } }),
    onSuccess: () => {
      toast.success("Patient Deleted Successfully");
    },
    onError: (data) => {
      toast.error(data.message || "Something went wrong");
    },
  });
};
