import { DrugSupplier } from "@/generated/prisma/client";
import { DRUG_SUPPLIER } from "@/lib/apiDefinations";
import { ApiResponse, FilterValues, PaginatedResponse } from "@/lib/type";
import { showError } from "@/lib/utils";
import { createRequest } from "@/services/apiRequest";
import {
  partialSupplierValidatorType,
  supplierValidatorType,
} from "@/validators/api/masters/supplier";
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

const createDrugSupplier = createRequest<ApiResponse<DrugSupplier>>(
  DRUG_SUPPLIER,
  "POST",
);
const updateDrugSupplier = createRequest<
  ApiResponse<DrugSupplier>,
  undefined,
  { id: string }
>((p) => `${DRUG_SUPPLIER}/${p.id}`, "PUT");
const deleteDrugSupplier = createRequest<
  ApiResponse<null>,
  undefined,
  { id: string }
>((p) => `${DRUG_SUPPLIER}/${p.id}`, "DELETE");
const getDrugSupplier = createRequest<
  ApiResponse<DrugSupplier>,
  undefined,
  { id: string }
>((p) => `${DRUG_SUPPLIER}/${p.id}`, "GET");

const getDrugSuppliers = createRequest<
  PaginatedResponse<DrugSupplier>,
  {
    limit: number;
    name?: string;
    createdAt?: string | { from?: Date; to?: Date };
    status?: string;
  }
>(DRUG_SUPPLIER, "GET");

export const useDrugSupplierList = (
  filters: FilterValues,
  page: number,
  limit: number,
) => {
  return useQuery<
    PaginatedResponse<DrugSupplier>,
    AxiosError<ApiResponse<null>>,
    PaginatedResponse<DrugSupplier>,
    [string, FilterValues, number, number]
  >({
    queryKey: ["drug-suppliers", filters, page, limit],
    queryFn: () =>
      getDrugSuppliers({
        pageParam: page,
        params: {
          limit,
          ...(filters.createdAt && { createdAt: filters.createdAt }),
          ...(filters.name && { search: filters.name }),
        },
      }),
  });
};

export const useGetDrugSupplier = (id?: string) => {
  return useQuery<
    ApiResponse<DrugSupplier>,
    AxiosError<ApiResponse<null>>,
    DrugSupplier,
    [string, string | undefined]
  >({
    queryKey: ["drug", id],
    queryFn: () =>
      getDrugSupplier({
        urlHelpers: {
          id: id as string,
        },
      }),
    select: (data) => data.data,
    enabled: !!id,
  });
};

export const useCreateDrugSupplier = () => {
  const queryClient = useQueryClient();
  const router = useRouter();
  return useMutation<
    ApiResponse<DrugSupplier>,
    AxiosError<ApiResponse<null>>,
    supplierValidatorType
  >({
    mutationKey: ["create-drug-supplier"],
    mutationFn: (data) => createDrugSupplier({ body: data }),
    onSuccess: () => {
      toast.success("Drug Supplier Created Successfully");
      queryClient.invalidateQueries({
        queryKey: ["drug-suppliers"],
      });
      router.back();
    },
    onError: showError,
  });
};

export const useUpdateDrugSupplier = () => {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation<
    ApiResponse<DrugSupplier>,
    AxiosError<ApiResponse<null>>,
    partialSupplierValidatorType
  >({
    mutationKey: ["update-drug-supplier"],
    mutationFn: (data) =>
      updateDrugSupplier({
        body: data,
        urlHelpers: { id: String(data.supplierId) },
      }),
    onSuccess: () => {
      toast.success("Drug Supplier Updated Successfully");
      queryClient.invalidateQueries({
        queryKey: ["drug-suppliers"],
      });
      router.back();
    },
    onError: showError,
  });
};

export const useDeleteDrugSupplier = () => {
  const queryClient = useQueryClient();

  return useMutation<
    ApiResponse<null>,
    AxiosError<ApiResponse<null>>,
    partialSupplierValidatorType
  >({
    mutationKey: ["delete-drug-supplier"],
    mutationFn: (data) =>
      deleteDrugSupplier({ urlHelpers: { id: String(data.supplierId) } }),
    onSuccess: () => {
      toast.success("Drug Supplier Deleted Successfully");
      queryClient.invalidateQueries({
        queryKey: ["drug-suppliers"],
      });
    },
    onError: showError,
  });
};

export const useInfiniteDrugSupplierList = (
  filters: FilterValues,
  limit: number,
) => {
  return useInfiniteQuery<
    PaginatedResponse<DrugSupplier>,
    AxiosError<ApiResponse<null>>,
    InfiniteData<PaginatedResponse<DrugSupplier>>,
    [string, FilterValues, number]
  >({
    queryKey: ["drug-supplier-infinite", filters, limit],

    queryFn: ({ pageParam = 1 }) =>
      getDrugSuppliers({
        pageParam: pageParam as number,
        params: {
          limit,
          ...(filters.createdAt && { createdAt: filters.createdAt }),
          ...(filters.name && { search: filters.name }),
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
