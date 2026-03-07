import { BillingSection } from "@/generated/prisma/client";
import { BILLING_SECTIONS } from "@/lib/apiDefinations";
import { ApiResponse, FilterValues, PaginatedResponse } from "@/lib/type";
import { showError } from "@/lib/utils";
import { createRequest } from "@/services/apiRequest";
import {
  BillingSectionValidatorType,
  PartialBillingSectionValidatorType,
} from "@/validators/api/masters/billingSection";
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

const createBillingSection = createRequest<ApiResponse<BillingSection>>(
  BILLING_SECTIONS,
  "POST",
);
const updateBillingSection = createRequest<
  ApiResponse<BillingSection>,
  undefined,
  { id: string }
>((p) => `${BILLING_SECTIONS}/${p.id}`, "PUT");
const deleteBillingSection = createRequest<
  ApiResponse<null>,
  undefined,
  { id: string }
>((p) => `${BILLING_SECTIONS}/${p.id}`, "DELETE");
const getBillingSection = createRequest<
  ApiResponse<BillingSection>,
  undefined,
  { id: string }
>((p) => `${BILLING_SECTIONS}/${p.id}`, "GET");

const getBillingSections = createRequest<
  PaginatedResponse<BillingSection>,
  {
    limit: number;
    name?: string;
    createdAt?: string | { from?: Date; to?: Date };
    status?: string;
  }
>(BILLING_SECTIONS, "GET");

export const useBillingSectionsList = (
  filters: FilterValues,
  page: number,
  limit: number,
) => {
  return useQuery<
    PaginatedResponse<BillingSection>,
    AxiosError<ApiResponse<null>>,
    PaginatedResponse<BillingSection>,
    [string, FilterValues, number, number]
  >({
    queryKey: ["billing-sections", filters, page, limit],
    queryFn: () =>
      getBillingSections({
        pageParam: page,
        params: {
          limit,
          ...(filters.createdAt && { createdAt: filters.createdAt }),
          ...(filters.name && { search: filters.name }),
          ...(filters.status && { status: filters.status }),
          ...(filters.doctorType && { doctorType: filters.doctorType }),
        },
      }),
  });
};

export const useInfiniteBillingSectionsList = (
  filters: FilterValues,
  limit: number,
) => {
  return useInfiniteQuery<
    PaginatedResponse<BillingSection>,
    AxiosError<ApiResponse<null>>,
    InfiniteData<PaginatedResponse<BillingSection>>,
    [string, FilterValues, number]
  >({
    queryKey: ["wards", filters, limit],

    queryFn: ({ pageParam = 1 }) =>
      getBillingSections({
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

export const useGetBillingSection = (id?: string) => {
  return useQuery<
    ApiResponse<BillingSection>,
    AxiosError<ApiResponse<null>>,
    BillingSection,
    [string, string | undefined]
  >({
    queryKey: ["get-billing-section", id],
    queryFn: () =>
      getBillingSection({
        urlHelpers: {
          id: id as string,
        },
      }),
    select: (data) => data.data,
    enabled: !!id,
  });
};

export const useCreateBillingSection = () => {
  const queryClient = useQueryClient();
  const router = useRouter();
  return useMutation<
    ApiResponse<BillingSection>,
    AxiosError<ApiResponse<null>>,
    BillingSectionValidatorType
  >({
    mutationKey: ["create-billing-section"],
    mutationFn: (data) => createBillingSection({ body: data }),
    onSuccess: () => {
      toast.success("Billing Section Created Successfully");
      queryClient.invalidateQueries({
        queryKey: ["billing-sections"],
      });
      router.back();
    },
    onError: showError,
  });
};

export const useUpdateBillingSection = () => {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation<
    ApiResponse<BillingSection>,
    AxiosError<ApiResponse<null>>,
    PartialBillingSectionValidatorType
  >({
    mutationKey: ["update-billing-section"],
    mutationFn: (data) =>
      updateBillingSection({
        body: data,
        urlHelpers: { id: data.sectionId.toString() },
      }),
    onSuccess: () => {
      toast.success("Billing Section Updated Successfully");
      queryClient.invalidateQueries({
        queryKey: ["billing-sections"],
      });
      router.back();
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
