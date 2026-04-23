import { PHARMACY_CHALLAN } from "@/lib/apiDefinations";
import {
  ApiResponse,
  FilterValues,
  PaginatedResponse,
  PharmacyChallanType,
  PharmacyGrnType,
} from "@/lib/type";
import { showError } from "@/lib/utils";
import { createRequest } from "@/services/apiRequest";
import { challanValidatorType } from "@/validators/api/masters/pharmacyChallan";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

const createChallan = createRequest<ApiResponse<PharmacyChallanType>>(
  PHARMACY_CHALLAN,
  "POST",
);

const getChallans = createRequest<
  PaginatedResponse<PharmacyChallanType>,
  {
    limit: number;
    name?: string;
    createdAt?: string | { from?: Date; to?: Date };
    supplierId?: number;
    withoutGrn?: boolean;
  }
>(PHARMACY_CHALLAN, "GET");

const getChallan = createRequest<
  ApiResponse<PharmacyChallanType>,
  undefined,
  { id: string }
>((p) => `${PHARMACY_CHALLAN}/${p.id}`, "GET");

const createGrnFromChallan = createRequest<
  ApiResponse<PharmacyGrnType>,
  undefined,
  { id: string }
>((p) => `${PHARMACY_CHALLAN}/${p.id}/create-grn`, "POST");

export const useChallanList = (
  filters: FilterValues,
  page: number,
  limit: number,
) => {
  return useQuery<
    PaginatedResponse<PharmacyChallanType>,
    AxiosError<ApiResponse<null>>,
    PaginatedResponse<PharmacyChallanType>,
    [string, FilterValues, number, number]
  >({
    queryKey: ["challans", filters, page, limit],
    queryFn: () =>
      getChallans({
        pageParam: page,
        params: {
          limit,
          ...(filters.createdAt && { createdAt: filters.createdAt }),
          ...(filters.name && { search: filters.name }),
          ...(filters.supplierId && { supplierId: Number(filters.supplierId) }),
          ...(filters.withoutGrn !== undefined && {
            withoutGrn: Boolean(filters.withoutGrn),
          }),
        },
      }),
  });
};

export const useGetChallan = (id?: string) => {
  return useQuery<
    ApiResponse<PharmacyChallanType>,
    AxiosError<ApiResponse<null>>,
    PharmacyChallanType,
    [string, string | undefined]
  >({
    queryKey: ["challan", id],
    queryFn: () =>
      getChallan({
        urlHelpers: {
          id: id as string,
        },
      }),
    select: (data) => data.data,
    enabled: !!id,
  });
};

export const useCreateChallan = () => {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation<
    ApiResponse<PharmacyChallanType>,
    AxiosError<ApiResponse<null>>,
    challanValidatorType
  >({
    mutationKey: ["create-challan"],
    mutationFn: (data) => createChallan({ body: data }),
    onSuccess: () => {
      toast.success("Challan Created Successfully");
      queryClient.invalidateQueries({
        queryKey: ["challans"],
      });
      queryClient.invalidateQueries({
        queryKey: ["inventory-items"],
      });
      router.back();
    },
    onError: showError,
  });
};

export const useCreateGrnFromChallan = () => {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation<
    ApiResponse<PharmacyGrnType>,
    AxiosError<ApiResponse<null>>,
    { challanId: number }
  >({
    mutationKey: ["create-grn-from-challan"],
    mutationFn: ({ challanId }) =>
      createGrnFromChallan({
        urlHelpers: {
          id: String(challanId),
        },
      }),
    onSuccess: (data) => {
      toast.success("GRN Created Successfully");
      queryClient.invalidateQueries({
        queryKey: ["challans"],
      });
      queryClient.invalidateQueries({
        queryKey: ["grns"],
      });
      router.push(`/pharmacy/grn/print/${data.data.id}`);
    },
    onError: showError,
  });
};
