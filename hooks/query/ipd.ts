import {
  IPD,
  IPD_ADMISSION_PRINT,
  IPD_BED,
  IPD_BILLING_TYPE,
  IPD_CANCEL_DISCHARGE,
  IPD_DATETIME,
  IPD_DISCHARGE,
  IPD_DISCHARGE_PRINT,
  IPD_DISCHARGE_SUMMARY,
  IPD_DOCTORS,
  IPD_MLC,
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
  ipdDischargeSummaryValidatorType,
  ipdMlcDeclareValidatorType,
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

export type IpdDischargeDrugLine = {
  id?: number;
  dischargeSummaryId?: number;
  drugId?: number | null;
  drug?: { id: number; name: string } | null;
  index?: number | null;
  frequency?: number;
  days?: number;
  unit?: string | null;
  route?: string;
  remarks?: string | null;
};

export type IpdDischargeSummaryResponse = {
  id?: number;
  ipdId: number;
  ipdDateTime?: string | Date | null;
  isUnfitForFurtherManagement?: boolean;
  diagnosis?: string | null;
  procedureDate?: string | Date | null;
  procedure?: string | null;
  courseInHospital?: string | null;
  investigationResults?: string | null;
  allergies?: string | null;
  diet?: string | null;
  physicalActivity?: string | null;
  followUpAfterDays?: number | null;
  followUpDate?: string | Date | null;
  followUpAdvice?: string | null;
  otherAdvice?: string | null;
  urgentCareWhen?: string | null;
  isTransferred?: boolean;
  remarks?: string | null;
  drugs?: IpdDischargeDrugLine[];
};

export type IpdDischargePrintResponse = IPDType & {
  dischargeSummary: IpdDischargeSummaryResponse;
};

const createIpd = createRequest<ApiResponse<IPDType>>(IPD, "POST");
const dischargeIpd = createRequest<ApiResponse<IPDType>>(IPD_DISCHARGE, "PUT");
const upsertIpdDischargeSummary = createRequest<
  ApiResponse<IpdDischargeSummaryResponse>,
  undefined,
  undefined,
  ipdDischargeSummaryValidatorType
>(IPD_DISCHARGE_SUMMARY, "PUT");
const getIpdAdmissionPrint = createRequest<
  ApiResponse<IPDType>,
  undefined,
  { id: string }
>((p) => `${IPD_ADMISSION_PRINT}/${p.id}`, "GET");
const getIpdDischargeSummary = createRequest<
  ApiResponse<IpdDischargeSummaryResponse>,
  undefined,
  { id: string }
>((p) => `${IPD_DISCHARGE_SUMMARY}/${p.id}`, "GET");
const getIpdDischargePrint = createRequest<
  ApiResponse<IpdDischargePrintResponse>,
  undefined,
  { id: string }
>((p) => `${IPD_DISCHARGE_PRINT}/${p.id}`, "GET");
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
const declareIpdMlc = createRequest<ApiResponse<unknown>>(IPD_MLC, "PUT");

const getIPDs = createRequest<
  PaginatedResponse<IPDType>,
  {
    limit: number;
    name?: string;
    createdAt?: string | { from?: Date; to?: Date };
    mlcDeclarationDate?: string | { from?: Date; to?: Date };
    status?: string;
    isDayCare?: boolean;
    isMlcPatient?: boolean;
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
          ...(filters.mlcDeclarationDate && {
            mlcDeclarationDate: filters.mlcDeclarationDate,
          }),
          ...(filters.name && { search: filters.name }),
          ...(filters.status && { status: filters.status }),
          ...(filters.doctorType && { doctorType: filters.doctorType }),
          ...(typeof filters.isDischarged === "boolean" && {
            isDischarged: filters.isDischarged,
          }),
          ...(typeof filters.isDayCare === "boolean" && {
            isDayCare: filters.isDayCare,
          }),
          ...(typeof filters.isMlcPatient === "boolean" && {
            isMlcPatient: filters.isMlcPatient,
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

export const useGetIpdDischargeSummary = (id?: string) => {
  return useQuery<
    ApiResponse<IpdDischargeSummaryResponse>,
    AxiosError<ApiResponse<null>>,
    IpdDischargeSummaryResponse,
    [string, string | undefined]
  >({
    queryKey: ["get-ipd-discharge-summary", id],
    queryFn: () =>
      getIpdDischargeSummary({
        urlHelpers: {
          id: id as string,
        },
      }),
    select: (data) => data.data,
    enabled: !!id,
  });
};

export const useUpsertIpdDischargeSummary = () => {
  const queryClient = useQueryClient();
  return useMutation<
    ApiResponse<IpdDischargeSummaryResponse>,
    AxiosError<ApiResponse<null>>,
    ipdDischargeSummaryValidatorType
  >({
    mutationKey: ["upsert-ipd-discharge-summary"],
    mutationFn: (data) => upsertIpdDischargeSummary({ body: data }),
    onSuccess: (_, variables) => {
      toast.success("Discharge summary saved successfully");
      queryClient.invalidateQueries({
        queryKey: ["get-ipd-discharge-summary", String(variables.ipdId)],
      });
    },
    onError: showError,
  });
};

export const useGetIpdDischargePrint = (id?: string) => {
  return useQuery<
    ApiResponse<IpdDischargePrintResponse>,
    AxiosError<ApiResponse<null>>,
    IpdDischargePrintResponse,
    [string, string | undefined]
  >({
    queryKey: ["get-ipd-discharge-print", id],
    queryFn: () =>
      getIpdDischargePrint({
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

export const useDeclareIpdMlc = () => {
  const queryClient = useQueryClient();

  return useMutation<
    ApiResponse<unknown>,
    AxiosError<ApiResponse<null>>,
    ipdMlcDeclareValidatorType
  >({
    mutationKey: ["declare-ipd-mlc"],
    mutationFn: (data) => declareIpdMlc({ body: data }),
    onSuccess: () => {
      toast.success("Patient marked as MLC successfully");
      queryClient.invalidateQueries({ queryKey: ["ipds"] });
    },
    onError: showError,
  });
};
