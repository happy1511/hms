import { PHARMACY_SUPPLIER_RETURN } from "@/lib/apiDefinations";
import {
  ApiResponse,
  FilterValues,
  PaginatedResponse,
  PharmacySupplierReturnType,
} from "@/lib/type";
import { showError } from "@/lib/utils";
import { createRequest } from "@/services/apiRequest";
import { supplierReturnValidatorType } from "@/validators/api/masters/pharmacySupplierReturn";
import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { AxiosError } from "axios";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

const createSupplierReturn = createRequest<
  ApiResponse<PharmacySupplierReturnType>
>(PHARMACY_SUPPLIER_RETURN, "POST");

const getSupplierReturns = createRequest<
  PaginatedResponse<PharmacySupplierReturnType>,
  {
    limit: number;
    search?: string;
    createdAt?: string | { from?: Date; to?: Date };
    supplierId?: number;
  }
>(PHARMACY_SUPPLIER_RETURN, "GET");

export const useSupplierReturnList = (
  filters: FilterValues,
  page: number,
  limit: number,
) => {
  return useQuery<
    PaginatedResponse<PharmacySupplierReturnType>,
    AxiosError<ApiResponse<null>>,
    PaginatedResponse<PharmacySupplierReturnType>,
    [string, FilterValues, number, number]
  >({
    queryKey: ["supplier-returns", filters, page, limit],
    queryFn: () =>
      getSupplierReturns({
        pageParam: page,
        params: {
          limit,
          ...(filters.name && { search: filters.name }),
          ...(filters.createdAt && { createdAt: filters.createdAt }),
          ...(filters.supplierId && { supplierId: filters.supplierId }),
        },
      }),
  });
};

export const useCreateSupplierReturn = () => {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation<
    ApiResponse<PharmacySupplierReturnType>,
    AxiosError<ApiResponse<null>>,
    supplierReturnValidatorType
  >({
    mutationKey: ["create-supplier-return"],
    mutationFn: (data) => createSupplierReturn({ body: data }),
    onSuccess: () => {
      toast.success("Supplier return created successfully");
      queryClient.invalidateQueries({ queryKey: ["supplier-returns"] });
      queryClient.invalidateQueries({ queryKey: ["inventory-items"] });
      queryClient.invalidateQueries({ queryKey: ["inventory-items-infinite"] });
      router.push("/pharmacy/supplier-return");
    },
    onError: showError,
  });
};
