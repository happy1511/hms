import { PHARMACY_GRN } from "@/lib/apiDefinations";
import {
  ApiResponse,
  FilterValues,
  PaginatedResponse,
  PharmacyGrnType,
} from "@/lib/type";
import { showError } from "@/lib/utils";
import { createRequest } from "@/services/apiRequest";
import { grnValidatorType } from "@/validators/api/masters/pharmacyGRN";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

const createGRN = createRequest<
  ApiResponse<PharmacyGrnType>
>(PHARMACY_GRN, "POST");

const getGrns = createRequest<
  PaginatedResponse<PharmacyGrnType>,
  {
    limit: number;
    name?: string;
    createdAt?: string | { from?: Date; to?: Date };
    status?: string;
  }
>(PHARMACY_GRN, "GET");

const getGrn = createRequest<ApiResponse<PharmacyGrnType>, undefined, { id: string }>(
  (p) => `${PHARMACY_GRN}/${p.id}`,
  "GET",
);

export const useGrnList = (
  filters: FilterValues,
  page: number,
  limit: number,
) => {
  return useQuery<
    PaginatedResponse<PharmacyGrnType>,
    AxiosError<ApiResponse<null>>,
    PaginatedResponse<PharmacyGrnType>,
    [string, FilterValues, number, number]
  >({
    queryKey: ["grns", filters, page, limit],
    queryFn: () =>
      getGrns({
        pageParam: page,
        params: {
          limit,
          ...(filters.createdAt && { createdAt: filters.createdAt }),
          ...(filters.name && { search: filters.name }),
        },
      }),
  });
};

export const useCreateGrn = () => {
  const queryClient = useQueryClient();
  const router = useRouter();
  return useMutation<
    ApiResponse<PharmacyGrnType>,
    AxiosError<ApiResponse<null>>,
    grnValidatorType
  >({
    mutationKey: ["create-grn"],
    mutationFn: (data) => createGRN({ body: data }),
    onSuccess: () => {
      toast.success("Grn Created Successfully");
      queryClient.invalidateQueries({
        queryKey: ["grns"],
      });
      queryClient.invalidateQueries({
        queryKey: ["purchase-orders"],
      });
      router.back();
    },
    onError: showError,
  });
};

export const useGetGrn = (id?: string) => {
  return useQuery<
    ApiResponse<PharmacyGrnType>,
    AxiosError<ApiResponse<null>>,
    PharmacyGrnType,
    [string, string | undefined]
  >({
    queryKey: ["grn", id],
    queryFn: () =>
      getGrn({
        urlHelpers: {
          id: id as string,
        },
      }),
    select: (data) => data.data,
    enabled: !!id,
  });
};
