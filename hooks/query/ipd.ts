import {
  IPD,
  IPD_ADMISSION_PRINT,
  IPD_BED,
  IPD_BILLING_TYPE,
  IPD_CANCEL_DISCHARGE,
  IPD_DATETIME,
  IPD_DISCHARGE,
  IPD_DOCTORS,
} from "@/lib/apiDefinations";
import {
  ApiResponse,
  FilterValues,
  IPDType,
  PaginatedResponse,
} from "@/lib/type";
import { showError } from "@/lib/utils";
import { createRequest } from "@/services/apiRequest";
import {
  ipdBedUpdateValidatorType,
  ipdBillingTypeUpdateValidatorType,
  ipdDateTimeUpdateValidatorType,
  ipdDoctorUpdateValidatorType,
  ipdValidatorType,
  partialIpdValidatorType,
} from "@/validators/api/ipd/ipd";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

type UseCreateIpdOptions = {
  navigateBackOnSuccess?: boolean;
  onSuccess?: (data: ApiResponse<IPDType>) => void;
};

const createIpd = createRequest<ApiResponse<IPDType>>(IPD, "POST");
const dischargeIpd = createRequest<ApiResponse<IPDType>>(IPD_DISCHARGE, "PUT");
const getIpdAdmissionPrint = createRequest<
  ApiResponse<IPDType>,
  undefined,
  { id: string }
>((p) => `${IPD_ADMISSION_PRINT}/${p.id}`, "GET");
const cancelDischargeIpd = createRequest<ApiResponse<IPDType>>(
  IPD_CANCEL_DISCHARGE,
  "PUT",
);
const updateIpdDoctors = createRequest<ApiResponse<unknown>>(IPD_DOCTORS, "PUT");
const updateIpdBillingType = createRequest<ApiResponse<unknown>>(
  IPD_BILLING_TYPE,
  "PUT",
);
const updateIpdBed = createRequest<ApiResponse<unknown>>(IPD_BED, "PUT");
const updateIpdDateTime = createRequest<ApiResponse<unknown>>(IPD_DATETIME, "PUT");

const getIPDs = createRequest<
  PaginatedResponse<IPDType>,
  {
    limit: number;
    name?: string;
    createdAt?: string | { from?: Date; to?: Date };
    status?: string;
  }
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

export const useGetIpdAdmissionPrint = (id?: string) => {
  return useQuery<
    ApiResponse<IPDType>,
    AxiosError<ApiResponse<null>>,
    IPDType,
    [string, string | undefined]
  >({
    queryKey: ["get-ipd-admission-print", id],
    queryFn: () =>
      getIpdAdmissionPrint({
        urlHelpers: {
          id: id as string,
        },
      }),
    select: (data) => data.data,
    enabled: !!id,
  });
};

export const useCreateIpd = (options?: UseCreateIpdOptions) => {
  const queryClient = useQueryClient();
  const router = useRouter();
  return useMutation<
    ApiResponse<IPDType>,
    AxiosError<ApiResponse<null>>,
    ipdValidatorType
  >({
    mutationKey: ["create-ipd"],
    mutationFn: (data) => createIpd({ body: data }),
    onSuccess: (response) => {
      toast.success("IPD Created Successfully");
      queryClient.invalidateQueries({
        queryKey: ["ipds"],
      });
      options?.onSuccess?.(response);
      if (options?.navigateBackOnSuccess !== false) {
        router.back();
      }
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

export const useCancelDischargeIpd = () => {
  const queryClient = useQueryClient();
  return useMutation<
    ApiResponse<IPDType>,
    AxiosError<ApiResponse<null>>,
    partialIpdValidatorType
  >({
    mutationKey: ["cancel-discharge-ipd"],
    mutationFn: (data) => cancelDischargeIpd({ body: data }),
    onSuccess: () => {
      toast.success("Discharge Cancelled Successfully");
      queryClient.invalidateQueries({
        queryKey: ["ipds"],
      });
    },
    onError: showError,
  });
};

export const useUpdateIpdDoctors = () => {
  const queryClient = useQueryClient();

  return useMutation<
    ApiResponse<unknown>,
    AxiosError<ApiResponse<null>>,
    ipdDoctorUpdateValidatorType
  >({
    mutationKey: ["update-ipd-doctors"],
    mutationFn: (data) => updateIpdDoctors({ body: data }),
    onSuccess: () => {
      toast.success("IPD doctors updated successfully");
      queryClient.invalidateQueries({
        queryKey: ["ipds"],
      });
    },
    onError: showError,
  });
};

export const useUpdateIpdBillingType = () => {
  const queryClient = useQueryClient();

  return useMutation<
    ApiResponse<unknown>,
    AxiosError<ApiResponse<null>>,
    ipdBillingTypeUpdateValidatorType
  >({
    mutationKey: ["update-ipd-billing-type"],
    mutationFn: (data) => updateIpdBillingType({ body: data }),
    onSuccess: () => {
      toast.success("Billing type updated successfully");
      queryClient.invalidateQueries({
        queryKey: ["ipds"],
      });
    },
    onError: showError,
  });
};

export const useUpdateIpdBed = () => {
  const queryClient = useQueryClient();

  return useMutation<
    ApiResponse<unknown>,
    AxiosError<ApiResponse<null>>,
    ipdBedUpdateValidatorType
  >({
    mutationKey: ["update-ipd-bed"],
    mutationFn: (data) => updateIpdBed({ body: data }),
    onSuccess: () => {
      toast.success("Bed reallocated successfully");
      queryClient.invalidateQueries({
        queryKey: ["ipds"],
      });
      queryClient.invalidateQueries({
        queryKey: ["beds-infinite"],
      });
    },
    onError: showError,
  });
};

export const useUpdateIpdDateTime = () => {
  const queryClient = useQueryClient();

  return useMutation<
    ApiResponse<unknown>,
    AxiosError<ApiResponse<null>>,
    ipdDateTimeUpdateValidatorType
  >({
    mutationKey: ["update-ipd-datetime"],
    mutationFn: (data) => updateIpdDateTime({ body: data }),
    onSuccess: () => {
      toast.success("IPD date/time updated successfully");
      queryClient.invalidateQueries({
        queryKey: ["ipds"],
      });
    },
    onError: showError,
  });
};
