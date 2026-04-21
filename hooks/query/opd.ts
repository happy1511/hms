import {
  BILLING_SECTIONS,
  OPD,
  OPD_CONSULTATION,
  OPD_DATETIME,
  OPD_DOCTORS,
  OPD_QUEUE,
  OPD_STATUS,
  OPD_VITALS,
} from "@/lib/apiDefinations";
import { AddressType, ContactType } from "@/generated/prisma/enums";
import {
  ApiResponse,
  FilterValues,
  OPDType,
  PaginatedResponse,
} from "@/lib/type";
import { showError } from "@/lib/utils";
import { createRequest } from "@/services/apiRequest";
import { PartialBillingSectionValidatorType } from "@/validators/api/masters/billingSection";
import {
  consultantFileType,
  opdDateTimeUpdateValidatorType,
  opdDoctorUpdateValidatorType,
  opdStatusUpdateValidatorType,
  opdValidatorType,
  partialOpdValidatorType,
  vitalValidatorType,
} from "@/validators/api/opd/opd";
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

export type opdConsultationDetailsType = consultantFileType & {
  patient?: {
    id?: number;
    firstName?: string;
    lastName?: string;
    uhid?: string;
    gender?: string;
    contacts?: { type: ContactType; value: string }[];
    addresses?: {
      type?: AddressType;
      addressLineOne?: string | null;
      addressLineTwo?: string | null;
      addressLineThree?: string | null;
      location?: {
        city?: string | null;
        state?: string | null;
        country?: string | null;
        postcode?: string | null;
      } | null;
    }[];
  };
  consultantDoctorName?: string | null;
  referringDoctorName?: string | null;
  createdAt?: Date | string;
  previousOpdHistory?: {
    opdId: number;
    createdAt: Date | string;
    investigations: string[];
  }[];
};

type UseCreateOpdOptions = {
  navigateBackOnSuccess?: boolean;
  onSuccess?: (data: ApiResponse<OPDType>) => void;
};

const createOpd = createRequest<ApiResponse<OPDType>>(OPD, "POST");
const updateVitals = createRequest<ApiResponse<OPDType>>(OPD_VITALS, "PUT");
const updateConsultation = createRequest<ApiResponse<OPDType>>(
  OPD_CONSULTATION,
  "PUT",
);
const updateOpdDoctors = createRequest<ApiResponse<unknown>>(OPD_DOCTORS, "PUT");
const updateOpdStatus = createRequest<ApiResponse<unknown>>(OPD_STATUS, "PUT");
const updateOpdDateTime = createRequest<ApiResponse<unknown>>(OPD_DATETIME, "PUT");
const deleteOpd = createRequest<ApiResponse<OPDType>>(OPD, "DELETE");
const deleteBillingSection = createRequest<
  ApiResponse<null>,
  undefined,
  { id: string }
>((p) => `${BILLING_SECTIONS}/${p.id}`, "DELETE");
const deleteOpdQueue = createRequest<ApiResponse<null>>(OPD_QUEUE, "DELETE");
const getConsultation = createRequest<
  ApiResponse<opdConsultationDetailsType>,
  { doctorId?: string },
  { id: string }
>((p) => `${OPD_CONSULTATION}/${p.id}`, "GET");

const getOPDs = createRequest<
  PaginatedResponse<OPDType>,
  {
    limit: number;
    name?: string;
    createdAt?: string | { from?: Date; to?: Date };
    status?: string;
  }
>(OPD, "GET");
const getOPDQueue = createRequest<
  PaginatedResponse<OPDType>,
  {
    limit: number;
    name?: string;
    createdAt?: string | { from?: Date; to?: Date };
    status?: string;
  }
>(OPD_QUEUE, "GET");

export const useOpdList = (
  filters: FilterValues,
  page: number,
  limit: number,
) => {
  return useQuery<
    PaginatedResponse<OPDType>,
    AxiosError<ApiResponse<null>>,
    PaginatedResponse<OPDType>,
    [string, FilterValues, number, number]
  >({
    queryKey: ["opds", filters, page, limit],
    queryFn: () =>
      getOPDs({
        pageParam: page,
        params: {
          limit,
          ...(filters.createdAt && { createdAt: filters.createdAt }),
          ...(filters.name && { search: filters.name }),
          ...(filters.status && { status: filters.status }),
          ...(filters.doctorType && { doctorType: filters.doctorType }),
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

export const useOpdQueueList = (
  filters: FilterValues,
  page: number,
  limit: number,
) => {
  return useQuery<
    PaginatedResponse<OPDType>,
    AxiosError<ApiResponse<null>>,
    PaginatedResponse<OPDType>,
    [string, FilterValues, number, number]
  >({
    queryKey: ["opd-queue", filters, page, limit],
    queryFn: () =>
      getOPDQueue({
        pageParam: page,
        params: {
          limit,
          ...(filters.createdAt && { createdAt: filters.createdAt }),
          ...(filters.name && { search: filters.name }),
          ...(filters.status && { status: filters.status }),
          ...(filters.doctorType && { doctorType: filters.doctorType }),
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

export const useInfiniteBillingSectionsList = (
  filters: FilterValues,
  limit: number,
) => {
  return useInfiniteQuery<
    PaginatedResponse<OPDType>,
    AxiosError<ApiResponse<null>>,
    InfiniteData<PaginatedResponse<OPDType>>,
    [string, FilterValues, number]
  >({
    queryKey: ["wards", filters, limit],

    queryFn: ({ pageParam = 1 }) =>
      getOPDs({
        pageParam: pageParam as number,
        params: {
          limit,
          ...(filters.createdAt && { createdAt: filters.createdAt }),
          ...(filters.name && { search: filters.name }),
          ...(filters.status && { status: filters.status }),
          ...(filters.doctorType && { doctorType: filters.doctorType }),
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

export const useGetConsultationFile = (id?: string, doctorId?: string) => {
  return useQuery<
    ApiResponse<opdConsultationDetailsType>,
    AxiosError<ApiResponse<null>>,
    opdConsultationDetailsType,
    [string, string | undefined, string | undefined]
  >({
    queryKey: ["get-opd-consultation", id, doctorId],
    queryFn: () =>
      getConsultation({
        urlHelpers: {
          id: id as string,
        },
        params: doctorId ? { doctorId } : undefined,
      }),
    select: (data) => data.data,
    enabled: !!id,
  });
};

export const useCreateOpd = (options?: UseCreateOpdOptions) => {
  const queryClient = useQueryClient();
  const router = useRouter();
  return useMutation<
    ApiResponse<OPDType>,
    AxiosError<ApiResponse<null>>,
    opdValidatorType
  >({
    mutationKey: ["create-opd"],
    mutationFn: (data) => createOpd({ body: data }),
    onSuccess: (response) => {
      toast.success("OPD Created Successfully");
      queryClient.invalidateQueries({
        queryKey: ["billing-sections"],
      });
      queryClient.invalidateQueries({
        queryKey: ["opds"],
      });
      options?.onSuccess?.(response);
      if (options?.navigateBackOnSuccess !== false) {
        router.back();
      }
    },
    onError: showError,
  });
};

export const useUpdateOpdVitals = () => {
  const queryClient = useQueryClient();

  return useMutation<
    ApiResponse<OPDType>,
    AxiosError<ApiResponse<null>>,
    vitalValidatorType
  >({
    mutationKey: ["update-opd-vitals"],
    mutationFn: (data) =>
      updateVitals({
        body: data,
      }),
    onSuccess: () => {
      toast.success("Vitals Updated Successfully");
      queryClient.invalidateQueries({
        queryKey: ["opds"],
      });
    },
    onError: showError,
  });
};

export const useUpdateOpdConsultation = () => {
  const queryClient = useQueryClient();

  return useMutation<
    ApiResponse<OPDType>,
    AxiosError<ApiResponse<null>>,
    consultantFileType
  >({
    mutationKey: ["update-opd-consultation"],
    mutationFn: (data) =>
      updateConsultation({
        body: data,
      }),
    onSuccess: () => {
      toast.success("Consultations Updated Successfully");
      queryClient.invalidateQueries({
        queryKey: ["opds"],
      });
    },
    onError: showError,
  });
};

export const useUpdateOpdDoctors = () => {
  const queryClient = useQueryClient();

  return useMutation<
    ApiResponse<unknown>,
    AxiosError<ApiResponse<null>>,
    opdDoctorUpdateValidatorType
  >({
    mutationKey: ["update-opd-doctors"],
    mutationFn: (data) =>
      updateOpdDoctors({
        body: data,
      }),
    onSuccess: () => {
      toast.success("OPD doctors updated successfully");
      queryClient.invalidateQueries({
        queryKey: ["opds"],
      });
      queryClient.invalidateQueries({
        queryKey: ["opd-queue"],
      });
    },
    onError: showError,
  });
};

export const useUpdateOpdStatus = () => {
  const queryClient = useQueryClient();

  return useMutation<
    ApiResponse<unknown>,
    AxiosError<ApiResponse<null>>,
    opdStatusUpdateValidatorType
  >({
    mutationKey: ["update-opd-status"],
    mutationFn: (data) =>
      updateOpdStatus({
        body: data,
      }),
    onSuccess: () => {
      toast.success("OPD status updated successfully");
      queryClient.invalidateQueries({
        queryKey: ["opds"],
      });
      queryClient.invalidateQueries({
        queryKey: ["opd-queue"],
      });
    },
    onError: showError,
  });
};

export const useUpdateOpdDateTime = () => {
  const queryClient = useQueryClient();

  return useMutation<
    ApiResponse<unknown>,
    AxiosError<ApiResponse<null>>,
    opdDateTimeUpdateValidatorType
  >({
    mutationKey: ["update-opd-datetime"],
    mutationFn: (data) =>
      updateOpdDateTime({
        body: data,
      }),
    onSuccess: () => {
      toast.success("OPD Date/Time updated successfully");
      queryClient.invalidateQueries({
        queryKey: ["opds"],
      });
      queryClient.invalidateQueries({
        queryKey: ["opd-queue"],
      });
      queryClient.invalidateQueries({
        queryKey: ["invoice-details"],
      });
    },
    onError: showError,
  });
};

export const useDeleteBillingSection = () => {
  const queryClient = useQueryClient();

  return useMutation<
    ApiResponse<null>,
    AxiosError<ApiResponse<null>>,
    PartialBillingSectionValidatorType
  >({
    mutationKey: ["delete-billing-section"],
    mutationFn: (data) =>
      deleteBillingSection({ urlHelpers: { id: data.sectionId.toString() } }),
    onSuccess: () => {
      toast.success("Billing Section Deleted Successfully");
      queryClient.invalidateQueries({
        queryKey: ["billing-sections"],
      });
    },
    onError: showError,
  });
};

export const useDeleteOpdQueue = () => {
  const queryClient = useQueryClient();

  return useMutation<
    ApiResponse<null>,
    AxiosError<ApiResponse<null>>,
    partialOpdValidatorType
  >({
    mutationKey: ["delete-opd-queue"],
    mutationFn: (data) => deleteOpdQueue({ body: data }),
    onSuccess: () => {
      toast.success("Opd Removed Successfully");
      queryClient.invalidateQueries({
        queryKey: ["opd-queue"],
      });
    },
    onError: showError,
  });
};

export const useDeleteOpd = () => {
  const queryClient = useQueryClient();

  return useMutation<
    ApiResponse<OPDType>,
    AxiosError<ApiResponse<null>>,
    partialOpdValidatorType
  >({
    mutationKey: ["delete-opd"],
    mutationFn: (data) => deleteOpd({ body: data }),
    onSuccess: () => {
      toast.success("OPD Deleted Successfully");
      queryClient.invalidateQueries({
        queryKey: ["opds"],
      });
      queryClient.invalidateQueries({
        queryKey: ["opd-queue"],
      });
      queryClient.invalidateQueries({
        queryKey: ["invoice-details"],
      });
    },
    onError: showError,
  });
};
