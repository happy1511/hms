import { Expense, FinanceCategory } from "@/generated/prisma/client";
import { EXPENSE } from "@/lib/apiDefinations";
import { ApiResponse, FilterValues, PaginatedResponse } from "@/lib/type";
import { showError } from "@/lib/utils";
import { createRequest } from "@/services/apiRequest";
import {
  ExpenseValidatorType,
  PartialExpenseValidatorType,
} from "@/validators/api/finance/expense";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export type ExpenseWithCategory = Expense & {
  category?: Pick<FinanceCategory, "id" | "name" | "type">;
};

const createExpense = createRequest<ApiResponse<ExpenseWithCategory>>(EXPENSE, "POST");
const updateExpense = createRequest<
  ApiResponse<ExpenseWithCategory>,
  undefined,
  { id: string }
>((p) => `${EXPENSE}/${p.id}`, "PUT");
const deleteExpense = createRequest<ApiResponse<null>, undefined, { id: string }>(
  (p) => `${EXPENSE}/${p.id}`,
  "DELETE",
);
const getExpense = createRequest<ApiResponse<ExpenseWithCategory>, undefined, { id: string }>(
  (p) => `${EXPENSE}/${p.id}`,
  "GET",
);
const getExpenses = createRequest<
  PaginatedResponse<ExpenseWithCategory>,
  { limit: number; name?: string; createdAt?: string | { from?: Date; to?: Date } }
>(EXPENSE, "GET");

export const useExpenseList = (
  filters: FilterValues,
  page: number,
  limit: number,
) => {
  return useQuery<
    PaginatedResponse<ExpenseWithCategory>,
    AxiosError<ApiResponse<null>>,
    PaginatedResponse<ExpenseWithCategory>,
    [string, FilterValues, number, number]
  >({
    queryKey: ["expenses", filters, page, limit],
    queryFn: () =>
      getExpenses({
        pageParam: page,
        params: {
          limit,
          ...(filters.createdAt && { createdAt: filters.createdAt }),
          ...(filters.name && { search: filters.name }),
        },
      }),
  });
};

export const useGetExpense = (id?: string) => {
  return useQuery<
    ApiResponse<ExpenseWithCategory>,
    AxiosError<ApiResponse<null>>,
    ExpenseWithCategory,
    [string, string | undefined]
  >({
    queryKey: ["get-expense", id],
    queryFn: () =>
      getExpense({
        urlHelpers: {
          id: id as string,
        },
      }),
    select: (data) => data.data,
    enabled: !!id,
  });
};

export const useCreateExpense = () => {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation<
    ApiResponse<ExpenseWithCategory>,
    AxiosError<ApiResponse<null>>,
    ExpenseValidatorType
  >({
    mutationKey: ["create-expense"],
    mutationFn: (data) => createExpense({ body: data }),
    onSuccess: () => {
      toast.success("Expense created successfully");
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      router.back();
    },
    onError: showError,
  });
};

export const useUpdateExpense = () => {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation<
    ApiResponse<ExpenseWithCategory>,
    AxiosError<ApiResponse<null>>,
    PartialExpenseValidatorType
  >({
    mutationKey: ["update-expense"],
    mutationFn: (data) =>
      updateExpense({
        body: data,
        urlHelpers: { id: String(data.expenseId) },
      }),
    onSuccess: () => {
      toast.success("Expense updated successfully");
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      router.back();
    },
    onError: showError,
  });
};

export const useDeleteExpense = () => {
  const queryClient = useQueryClient();

  return useMutation<
    ApiResponse<null>,
    AxiosError<ApiResponse<null>>,
    PartialExpenseValidatorType
  >({
    mutationKey: ["delete-expense"],
    mutationFn: (data) =>
      deleteExpense({
        urlHelpers: { id: String(data.expenseId) },
      }),
    onSuccess: () => {
      toast.success("Expense deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
    },
    onError: showError,
  });
};
