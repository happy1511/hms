import { GRNGetPayload } from "@/generated/prisma/models";
import { PHARMACY_GRN } from "@/lib/apiDefinations";
import { ApiResponse, FilterValues, PaginatedResponse } from "@/lib/type";
import { showError } from "@/lib/utils";
import { createRequest } from "@/services/apiRequest";
import { grnValidatorType } from "@/validators/api/masters/pharmacyGRN";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

const createGRN = createRequest<
  ApiResponse<
    GRNGetPayload<{
      include: {
        order: { include: { supplier: true } };
        grnItems: true;
      };
    }>
  >
>(PHARMACY_GRN, "POST");

const getGrns = createRequest<
  PaginatedResponse<
    GRNGetPayload<{
      include: {
        order: { include: { supplier: true } };
        grnItems: true;
      };
    }>
  >,
  { limit: number; name?: string; createdAt?: string; status?: string }
>(PHARMACY_GRN, "GET");

export const useGrnList = (
  filters: FilterValues,
  page: number,
  limit: number,
) => {
  return useQuery<
    PaginatedResponse<
      GRNGetPayload<{
        include: {
          order: { include: { supplier: true } };
          grnItems: true;
        };
      }>
    >,
    AxiosError<ApiResponse<null>>,
    PaginatedResponse<
      GRNGetPayload<{
        include: {
          order: { include: { supplier: true } };
          grnItems: true;
        };
      }>
    >,
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
    ApiResponse<
      GRNGetPayload<{
        include: {
          order: { include: { supplier: true } };
          grnItems: true;
        };
      }>
    >,
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
      router.back();
    },
    onError: showError,
  });
};
