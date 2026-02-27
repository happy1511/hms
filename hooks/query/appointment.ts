import { APPOINTMENTS } from "@/lib/apiDefinations";
import {
  ApiResponse,
  AppointmentWithPatient,
  FilterValues,
  PaginatedResponse,
} from "@/lib/type";
import { showError } from "@/lib/utils";
import { createRequest } from "@/services/apiRequest";
import { AppointmentValidatorType } from "@/validators/api/appointment/appointment";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { toast } from "sonner";

const createAppointment = createRequest<ApiResponse<AppointmentWithPatient>>(
  APPOINTMENTS,
  "POST",
);

const getAppointments = createRequest<
  PaginatedResponse<AppointmentWithPatient>,
  { limit: number; name?: string; createdAt?: string; status?: string }
>(APPOINTMENTS, "GET");

export const useAppointmentsList = (
  filters: FilterValues,
  page: number,
  limit: number,
) => {
  return useQuery<
    PaginatedResponse<AppointmentWithPatient>,
    AxiosError<ApiResponse<null>>,
    PaginatedResponse<AppointmentWithPatient>,
    [string, FilterValues, number, number]
  >({
    queryKey: ["appointments", filters, page, limit],
    queryFn: () =>
      getAppointments({
        pageParam: page,
        params: {
          limit,
          ...(filters.createdAt && { createdAt: filters.createdAt }),
          ...(filters.name && { search: filters.name }),
          ...(filters.status && { status: filters.status }),
          ...(filters.wardId && { wardId: filters.wardId }),
          ...(filters.departmentId && { departmentId: filters.departmentId }),
        },
      }),
  });
};

export const useCreateAppointment = () => {
  const queryClient = useQueryClient();
  return useMutation<
    ApiResponse<AppointmentWithPatient>,
    AxiosError<ApiResponse<null>>,
    AppointmentValidatorType
  >({
    mutationKey: ["create-appointments"],
    mutationFn: (data) => createAppointment({ body: data }),
    onSuccess: () => {
      toast.success("Appointment Created Successfully");
      queryClient.invalidateQueries({
        queryKey: ["appointments"],
      });
    },
    onError: showError,
  });
};
