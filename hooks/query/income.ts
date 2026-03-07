import { Income } from "@/generated/prisma/client";
import { INCOME } from "@/lib/apiDefinations";
import { ApiResponse, FilterValues, PaginatedResponse } from "@/lib/type";
import { showError } from "@/lib/utils";
import { createRequest } from "@/services/apiRequest";
import {
  IncomeValidatorType,
  PartialIncomeValidatorType,
} from "@/validators/api/finance/income";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export type IncomeWithCollector = Income & {
  collectedBy?: {
    id: number;
    name?: string | null;
    loginId?: string | null;
  };
};

const createIncome = createRequest<ApiResponse<IncomeWithCollector>>(INCOME, "POST");
const updateIncome = createRequest<
  ApiResponse<IncomeWithCollector>,
  undefined,
  { id: string }
>((p) => `${INCOME}/${p.id}`, "PUT");
const deleteIncome = createRequest<ApiResponse<null>, undefined, { id: string }>(
  (p) => `${INCOME}/${p.id}`,
  "DELETE",
);
const getIncome = createRequest<
  ApiResponse<IncomeWithCollector>,
  undefined,
  { id: string }
>((p) => `${INCOME}/${p.id}`, "GET");
const getIncomes = createRequest<
  PaginatedResponse<IncomeWithCollector>,
  { limit: number; name?: string; createdAt?: string | { from?: Date; to?: Date } }
>(INCOME, "GET");

export const useIncomeList = (
  filters: FilterValues,
  page: number,
  limit: number,
) => {
  return useQuery<
    PaginatedResponse<IncomeWithCollector>,
    AxiosError<ApiResponse<null>>,
    PaginatedResponse<IncomeWithCollector>,
    [string, FilterValues, number, number]
  >({
    queryKey: ["incomes", filters, page, limit],
    queryFn: () =>
      getIncomes({
        pageParam: page,
        params: {
          limit,
          ...(filters.createdAt && { createdAt: filters.createdAt }),
          ...(filters.name && { search: filters.name }),
        },
      }),
  });
};

export const useGetIncome = (id?: string) => {
  return useQuery<
    ApiResponse<IncomeWithCollector>,
    AxiosError<ApiResponse<null>>,
    IncomeWithCollector,
    [string, string | undefined]
  >({
    queryKey: ["get-income", id],
    queryFn: () =>
      getIncome({
        urlHelpers: {
          id: id as string,
        },
      }),
    select: (data) => data.data,
    enabled: !!id,
  });
};

export const useCreateIncome = () => {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation<
    ApiResponse<IncomeWithCollector>,
    AxiosError<ApiResponse<null>>,
    IncomeValidatorType
  >({
    mutationKey: ["create-income"],
    mutationFn: (data) => createIncome({ body: data }),
    onSuccess: () => {
      toast.success("Income created successfully");
      queryClient.invalidateQueries({ queryKey: ["incomes"] });
      router.back();
    },
    onError: showError,
  });
};

export const useUpdateIncome = () => {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation<
    ApiResponse<IncomeWithCollector>,
    AxiosError<ApiResponse<null>>,
    PartialIncomeValidatorType
  >({
    mutationKey: ["update-income"],
    mutationFn: (data) =>
      updateIncome({
        body: data,
        urlHelpers: { id: String(data.incomeId) },
      }),
    onSuccess: () => {
      toast.success("Income updated successfully");
      queryClient.invalidateQueries({ queryKey: ["incomes"] });
      router.back();
    },
    onError: showError,
  });
};

export const useDeleteIncome = () => {
  const queryClient = useQueryClient();

  return useMutation<
    ApiResponse<null>,
    AxiosError<ApiResponse<null>>,
    PartialIncomeValidatorType
  >({
    mutationKey: ["delete-income"],
    mutationFn: (data) =>
      deleteIncome({
        urlHelpers: { id: String(data.incomeId) },
      }),
    onSuccess: () => {
      toast.success("Income deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["incomes"] });
    },
    onError: showError,
  });
};

