import {
  PHARMACY_CUSTOMER_LEDGER,
  PHARMACY_SUPPLIER_LEDGER,
} from "@/lib/apiDefinations";
import {
  ApiResponse,
  CustomerLedgerRowType,
  FilterValues,
  PaginatedResponse,
  SupplierLedgerDetailType,
} from "@/lib/type";
import { createRequest } from "@/services/apiRequest";
import { useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { DrugSupplier } from "@/generated/prisma/client";

const getSupplierLedgerList = createRequest<
  PaginatedResponse<DrugSupplier>,
  {
    limit: number;
    search?: string;
    createdAt?: string | { from?: Date; to?: Date };
  }
>(PHARMACY_SUPPLIER_LEDGER, "GET");

const getSupplierLedgerDetails = createRequest<
  ApiResponse<SupplierLedgerDetailType>,
  undefined,
  { supplierId: string }
>((p) => `${PHARMACY_SUPPLIER_LEDGER}/${p.supplierId}`, "GET");

const getCustomerLedger = createRequest<
  PaginatedResponse<CustomerLedgerRowType>,
  {
    limit: number;
    search?: string;
    createdAt?: string | { from?: Date; to?: Date };
  }
>(PHARMACY_CUSTOMER_LEDGER, "GET");

export const useSupplierLedgerList = (
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
    queryKey: ["supplier-ledgers", filters, page, limit],
    queryFn: () =>
      getSupplierLedgerList({
        pageParam: page,
        params: {
          limit,
          ...(filters.name && { search: filters.name }),
          ...(filters.createdAt && { createdAt: filters.createdAt }),
        },
      }),
  });
};

export const useGetSupplierLedgerDetails = (supplierId?: string) => {
  return useQuery<
    ApiResponse<SupplierLedgerDetailType>,
    AxiosError<ApiResponse<null>>,
    SupplierLedgerDetailType,
    [string, string | undefined]
  >({
    queryKey: ["supplier-ledger", supplierId],
    queryFn: () =>
      getSupplierLedgerDetails({
        urlHelpers: {
          supplierId: supplierId as string,
        },
      }),
    select: (data) => data.data,
    enabled: Boolean(supplierId),
  });
};

export const useCustomerLedgerList = (
  filters: FilterValues,
  page: number,
  limit: number,
) => {
  return useQuery<
    PaginatedResponse<CustomerLedgerRowType>,
    AxiosError<ApiResponse<null>>,
    PaginatedResponse<CustomerLedgerRowType>,
    [string, FilterValues, number, number]
  >({
    queryKey: ["customer-ledgers", filters, page, limit],
    queryFn: () =>
      getCustomerLedger({
        pageParam: page,
        params: {
          limit,
          ...(filters.name && { search: filters.name }),
          ...(filters.createdAt && { createdAt: filters.createdAt }),
        },
      }),
  });
};
