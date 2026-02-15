import { BILLING_SECTIONS, OPD } from "@/lib/apiDefinations";
import {
  ApiResponse,
  BillingSectionType,
  FilterValues,
  OPDType,
  PaginatedResponse,
} from "@/lib/type";
import { showError } from "@/lib/utils";
import { createRequest } from "@/services/apiRequest";
import { PartialBillingSectionValidatorType } from "@/validators/api/masters/billingSection";
import { opdValidatorType } from "@/validators/api/opd/opd";
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

const createOpd = createRequest<ApiResponse<OPDType>>(OPD, "POST");
const updateBillingSection = createRequest<
  ApiResponse<BillingSectionType>,
  undefined,
  { id: string }
>((p) => `${BILLING_SECTIONS}/${p.id}`, "PUT");
const deleteBillingSection = createRequest<
  ApiResponse<null>,
  undefined,
  { id: string }
>((p) => `${BILLING_SECTIONS}/${p.id}`, "DELETE");
const getBillingSection = createRequest<
  ApiResponse<BillingSectionType>,
  undefined,
  { id: string }
>((p) => `${BILLING_SECTIONS}/${p.id}`, "GET");

const getOPDs = createRequest<
  PaginatedResponse<OPDType>,
  { limit: number; name?: string; createdAt?: string; status?: string }
>(OPD, "GET");

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
          ...(filters.consultantDoctorId && {
            consultantDoctorId: filters.consultantDoctorId,
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

export const useGetBillingSection = (id?: string) => {
  return useQuery<
    ApiResponse<BillingSectionType>,
    AxiosError<ApiResponse<null>>,
    BillingSectionType,
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

export const useCreateOpd = () => {
  const queryClient = useQueryClient();
  const router = useRouter();
  return useMutation<
    ApiResponse<OPDType>,
    AxiosError<ApiResponse<null>>,
    opdValidatorType
  >({
    mutationKey: ["create-opd"],
    mutationFn: (data) => createOpd({ body: data }),
    onSuccess: () => {
      toast.success("OPD Created Successfully");
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
    ApiResponse<BillingSectionType>,
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
