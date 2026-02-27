import { IPD, IPD_DISCHARGE } from "@/lib/apiDefinations";
import {
  ApiResponse,
  FilterValues,
  IPDType,
  PaginatedResponse,
} from "@/lib/type";
import { showError } from "@/lib/utils";
import { createRequest } from "@/services/apiRequest";
import {
  ipdValidatorType,
  partialIpdValidatorType,
} from "@/validators/api/ipd/ipd";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

const createIpd = createRequest<ApiResponse<IPDType>>(IPD, "POST");
const dischargeIpd = createRequest<ApiResponse<IPDType>>(IPD_DISCHARGE, "PUT");

const getIPDs = createRequest<
  PaginatedResponse<IPDType>,
  { limit: number; name?: string; createdAt?: string; status?: string }
>(IPD, "GET");

export const useIpdList = (
  filters: FilterValues,
  page: number,
  limit: number,
) => {
  return useQuery<
    PaginatedResponse<IPDType>,
    AxiosError<ApiResponse<null>>,
    PaginatedResponse<IPDType>,
    [string, FilterValues, number, number]
  >({
    queryKey: ["ipds", filters, page, limit],
    queryFn: () =>
      getIPDs({
        pageParam: page,
        params: {
          limit,
          ...(filters.createdAt && { createdAt: filters.createdAt }),
          ...(filters.name && { search: filters.name }),
          ...(filters.status && { status: filters.status }),
          ...(filters.doctorType && { doctorType: filters.doctorType }),
          ...(typeof filters.isDischarged === "boolean" && {
            isDischarged: filters.isDischarged,
          }),
          ...(filters.consultantDoctor && {
            consultantDoctorId: filters.consultantDoctor.userId,
          }),
          ...(filters.referringDoctorId && {
            referringDoctorId: filters.referringDoctorId,
          }),
        },
      }),
  });
};

export const useCreateIpd = () => {
  const queryClient = useQueryClient();
  const router = useRouter();
  return useMutation<
    ApiResponse<IPDType>,
    AxiosError<ApiResponse<null>>,
    ipdValidatorType
  >({
    mutationKey: ["create-ipd"],
    mutationFn: (data) => createIpd({ body: data }),
    onSuccess: () => {
      toast.success("IPD Created Successfully");
      queryClient.invalidateQueries({
        queryKey: ["ipds"],
      });
      router.back();
    },
    onError: showError,
  });
};

export const useDischargeIpd = () => {
  const queryClient = useQueryClient();
  return useMutation<
    ApiResponse<IPDType>,
    AxiosError<ApiResponse<null>>,
    partialIpdValidatorType
  >({
    mutationKey: ["discharge-ipd"],
    mutationFn: (data) => dischargeIpd({ body: data }),
    onSuccess: () => {
      toast.success("Patient Discharged Successfully");
      queryClient.invalidateQueries({
        queryKey: ["ipds"],
      });
    },
    onError: showError,
  });
};
