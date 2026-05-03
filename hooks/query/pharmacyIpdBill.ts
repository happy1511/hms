import {
  PHARMACY_IPD_BILL,
  PHARMACY_IPD_ISSUE,
  PHARMACY_IPD_PATIENT,
  PHARMACY_IPD_RETURN,
} from "@/lib/apiDefinations";
import {
  ApiResponse,
  FilterValues,
  IPDType,
  PaginatedResponse,
  PharmacyIpdBillRowType,
  PharmacyIpdIssueType,
  PharmacyIpdReturnType,
} from "@/lib/type";
import { showError } from "@/lib/utils";
import { createRequest } from "@/services/apiRequest";
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
import { ipdIssueValidatorType } from "@/validators/api/masters/pharmacyIpdIssue";
import { ipdReturnValidatorType } from "@/validators/api/masters/pharmacyIpdReturn";

const getIpdIssues = createRequest<
  PaginatedResponse<PharmacyIpdIssueType>,
  {
    limit: number;
    search?: string;
    ipdId?: number;
    createdAt?: string | { from?: Date; to?: Date };
  }
>(PHARMACY_IPD_ISSUE, "GET");

const createIpdIssue = createRequest<ApiResponse<PharmacyIpdIssueType>>(
  PHARMACY_IPD_ISSUE,
  "POST",
);

const getIpdReturns = createRequest<
  PaginatedResponse<PharmacyIpdReturnType>,
  {
    limit: number;
    search?: string;
    createdAt?: string | { from?: Date; to?: Date };
  }
>(PHARMACY_IPD_RETURN, "GET");

const createIpdReturn = createRequest<ApiResponse<PharmacyIpdReturnType>>(
  PHARMACY_IPD_RETURN,
  "POST",
);

const getIpdBillRows = createRequest<
  ApiResponse<PharmacyIpdBillRowType[]>,
  { ipdId: number }
>(PHARMACY_IPD_BILL, "GET");

const getPharmacyIpdPatients = createRequest<
  PaginatedResponse<IPDType>,
  {
    limit: number;
    search?: string;
    isDischarged?: boolean;
  }
>(PHARMACY_IPD_PATIENT, "GET");

export const useIpdIssueList = (
  filters: FilterValues,
  page: number,
  limit: number,
  options?: { enabled?: boolean },
) => {
  return useQuery<
    PaginatedResponse<PharmacyIpdIssueType>,
    AxiosError<ApiResponse<null>>,
    PaginatedResponse<PharmacyIpdIssueType>,
    [string, FilterValues, number, number]
  >({
    queryKey: ["pharmacy-ipd-issues", filters, page, limit],
    queryFn: () =>
      getIpdIssues({
        pageParam: page,
        params: {
          limit,
          ...(filters.name && { search: filters.name }),
          ...(filters.ipdId && { ipdId: filters.ipdId }),
          ...(filters.createdAt && { createdAt: filters.createdAt }),
        },
      }),
    enabled: options?.enabled ?? true,
  });
};

export const useCreateIpdIssue = () => {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation<
    ApiResponse<PharmacyIpdIssueType>,
    AxiosError<ApiResponse<null>>,
    ipdIssueValidatorType
  >({
    mutationKey: ["create-pharmacy-ipd-issue"],
    mutationFn: (data) => createIpdIssue({ body: data }),
    onSuccess: () => {
      toast.success("IPD issue created successfully");
      queryClient.invalidateQueries({ queryKey: ["pharmacy-ipd-issues"] });
      queryClient.invalidateQueries({ queryKey: ["inventory-items"] });
      queryClient.invalidateQueries({ queryKey: ["inventory-items-infinite"] });
      router.push("/pharmacy/ipd-issue");
      router.refresh();
    },
    onError: showError,
  });
};

export const useIpdReturnList = (
  filters: FilterValues,
  page: number,
  limit: number,
) => {
  return useQuery<
    PaginatedResponse<PharmacyIpdReturnType>,
    AxiosError<ApiResponse<null>>,
    PaginatedResponse<PharmacyIpdReturnType>,
    [string, FilterValues, number, number]
  >({
    queryKey: ["pharmacy-ipd-returns", filters, page, limit],
    queryFn: () =>
      getIpdReturns({
        pageParam: page,
        params: {
          limit,
          ...(filters.name && { search: filters.name }),
          ...(filters.createdAt && { createdAt: filters.createdAt }),
        },
      }),
  });
};

export const useCreateIpdReturn = () => {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation<
    ApiResponse<PharmacyIpdReturnType>,
    AxiosError<ApiResponse<null>>,
    ipdReturnValidatorType
  >({
    mutationKey: ["create-pharmacy-ipd-return"],
    mutationFn: (data) => createIpdReturn({ body: data }),
    onSuccess: () => {
      toast.success("IPD return created successfully");
      queryClient.invalidateQueries({ queryKey: ["pharmacy-ipd-returns"] });
      queryClient.invalidateQueries({ queryKey: ["inventory-items"] });
      queryClient.invalidateQueries({ queryKey: ["inventory-items-infinite"] });
      router.push("/pharmacy/ipd-return");
      router.refresh();
    },
    onError: showError,
  });
};

export const useIpdBillRows = (ipdId?: number) => {
  return useQuery<
    ApiResponse<PharmacyIpdBillRowType[]>,
    AxiosError<ApiResponse<null>>,
    PharmacyIpdBillRowType[],
    [string, number | undefined]
  >({
    queryKey: ["pharmacy-ipd-bill-rows", ipdId],
    queryFn: () =>
      getIpdBillRows({
        params: {
          ipdId: ipdId as number,
        },
      }),
    select: (data) => data.data,
    enabled: Boolean(ipdId),
  });
};

export const useInfinitePharmacyIpdPatients = (
  filters: FilterValues,
  limit: number,
) => {
  return useInfiniteQuery<
    PaginatedResponse<IPDType>,
    AxiosError<ApiResponse<null>>,
    InfiniteData<PaginatedResponse<IPDType>>,
    [string, FilterValues, number]
  >({
    queryKey: ["pharmacy-ipd-patients-infinite", filters, limit],
    queryFn: ({ pageParam = 1 }) =>
      getPharmacyIpdPatients({
        pageParam: pageParam as number,
        params: {
          limit,
          ...(filters.name && { search: filters.name }),
          ...(typeof filters.isDischarged === "boolean" && {
            isDischarged: filters.isDischarged,
          }),
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

export const usePharmacyIpdPatients = (
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
    queryKey: ["pharmacy-ipd-patients", filters, page, limit],
    queryFn: () =>
      getPharmacyIpdPatients({
        pageParam: page,
        params: {
          limit,
          ...(filters.name && { search: filters.name }),
          ...(typeof filters.isDischarged === "boolean" && {
            isDischarged: filters.isDischarged,
          }),
        },
      }),
  });
};
