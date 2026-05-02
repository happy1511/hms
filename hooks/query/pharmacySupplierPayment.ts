import {
  PHARMACY_SUPPLIER_CREDIT_NOTE,
  PHARMACY_SUPPLIER_PAYMENT,
  PHARMACY_SUPPLIER_PAYMENT_DUE_GRN,
} from "@/lib/apiDefinations";
import {
  ApiResponse,
  FilterValues,
  PaginatedResponse,
  PharmacySupplierCreditNoteType,
  PharmacySupplierDueGrnType,
  PharmacySupplierPaymentType,
} from "@/lib/type";
import { showError } from "@/lib/utils";
import { createRequest } from "@/services/apiRequest";
import { supplierPaymentValidatorType } from "@/validators/api/masters/pharmacySupplierPayment";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { SupplierPaymentType } from "@/generated/prisma/enums";
import { AxiosError } from "axios";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

const createSupplierPayment = createRequest<
  ApiResponse<PharmacySupplierPaymentType>
>(PHARMACY_SUPPLIER_PAYMENT, "POST");

const getSupplierPayments = createRequest<
  PaginatedResponse<PharmacySupplierPaymentType>,
  {
    limit: number;
    search?: string;
    createdAt?: string | { from?: Date; to?: Date };
    supplierId?: number;
  }
>(PHARMACY_SUPPLIER_PAYMENT, "GET");

const createSupplierCreditNote = createRequest<
  ApiResponse<PharmacySupplierCreditNoteType>
>(PHARMACY_SUPPLIER_CREDIT_NOTE, "POST");

const getSupplierCreditNotes = createRequest<
  PaginatedResponse<PharmacySupplierCreditNoteType>,
  {
    limit: number;
    search?: string;
    createdAt?: string | { from?: Date; to?: Date };
    supplierId?: number;
  }
>(PHARMACY_SUPPLIER_CREDIT_NOTE, "GET");

const getSupplierDueGrns = createRequest<
  ApiResponse<PharmacySupplierDueGrnType[]>,
  { supplierId: number }
>(PHARMACY_SUPPLIER_PAYMENT_DUE_GRN, "GET");

export const useSupplierPaymentList = (
  filters: FilterValues,
  page: number,
  limit: number,
  type: SupplierPaymentType,
) => {
  return useQuery<
    PaginatedResponse<PharmacySupplierPaymentType>,
    AxiosError<ApiResponse<null>>,
    PaginatedResponse<PharmacySupplierPaymentType>,
    [string, SupplierPaymentType, FilterValues, number, number]
  >({
    queryKey: ["supplier-payments", type, filters, page, limit],
    queryFn: () =>
      (type === SupplierPaymentType.CREDIT
        ? getSupplierCreditNotes
        : getSupplierPayments)({
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

export const useCreateSupplierPayment = (
  type: SupplierPaymentType,
  navigateOnSuccess = true,
) => {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation<
    ApiResponse<PharmacySupplierPaymentType>,
    AxiosError<ApiResponse<null>>,
    supplierPaymentValidatorType
  >({
    mutationKey: ["create-supplier-payment", type],
    mutationFn: (data) =>
      (type === SupplierPaymentType.CREDIT
        ? createSupplierCreditNote
        : createSupplierPayment)({ body: data }),
    onSuccess: () => {
      toast.success(
        type === SupplierPaymentType.CREDIT
          ? "Supplier credit note created successfully"
          : "Supplier payment created successfully",
      );
      queryClient.invalidateQueries({ queryKey: ["supplier-payments"] });
      queryClient.invalidateQueries({ queryKey: ["supplier-due-grns"] });
      queryClient.invalidateQueries({ queryKey: ["supplier-ledger"] });
      if (navigateOnSuccess) {
        router.push(
          type === SupplierPaymentType.CREDIT
            ? "/pharmacy/supplier-credit-note"
            : "/pharmacy/supplier-payment",
        );
      }
    },
    onError: showError,
  });
};

export const useSupplierDueGrns = (supplierId?: number) => {
  return useQuery<
    ApiResponse<PharmacySupplierDueGrnType[]>,
    AxiosError<ApiResponse<null>>,
    PharmacySupplierDueGrnType[],
    [string, number | undefined]
  >({
    queryKey: ["supplier-due-grns", supplierId],
    queryFn: () =>
      getSupplierDueGrns({
        params: {
          supplierId: Number(supplierId),
        },
      }),
    select: (data) => data.data,
    enabled: Boolean(supplierId),
  });
};
