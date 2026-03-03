import {
  INVOICE,
  INVOICE_BILLING_ITEM,
  INVOICE_TRANSACTION,
} from "@/lib/apiDefinations";
import {
  ApiResponse,
  FilterValues,
  InvoiceGroupedBySection,
  InvoiceType,
} from "@/lib/type";
import { showError } from "@/lib/utils";
import { createRequest } from "@/services/apiRequest";
import {
  addInvoiceBillItemValidatorType,
  addInvoiceTransactionValidatorType,
  updateInvoiceValidatorType,
} from "@/validators/api/invoice/invoice";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { toast } from "sonner";

const createBillingItem = createRequest<ApiResponse<InvoiceType>>(
  INVOICE_BILLING_ITEM,
  "POST",
);
const createTransaction = createRequest<ApiResponse<InvoiceType>>(
  INVOICE_TRANSACTION,
  "POST",
);
const updateInvoiceDetails = createRequest<
  ApiResponse<InvoiceGroupedBySection>
>(INVOICE, "PUT");
const getInvoiceDetails = createRequest<
  ApiResponse<InvoiceGroupedBySection>,
  { id?: string }
>(INVOICE, "GET");

export const useInvoiceDetails = (filters: FilterValues) => {
  return useQuery<
    ApiResponse<InvoiceGroupedBySection>,
    AxiosError<ApiResponse<null>>,
    InvoiceGroupedBySection,
    [string, FilterValues]
  >({
    queryKey: ["invoice-details", filters],
    queryFn: () =>
      getInvoiceDetails({
        params: {
          ...(filters.invoiceId && {
            id: String(filters.invoiceId),
          }),
        },
      }),
    select: (data) => data.data,
    enabled: !!filters.invoiceId,
  });
};

export const useCreateInvoiceTransaction = () => {
  const queryClient = useQueryClient();
  return useMutation<
    ApiResponse<InvoiceType>,
    AxiosError<ApiResponse<null>>,
    addInvoiceTransactionValidatorType
  >({
    mutationKey: ["create-invoice-transaction"],
    mutationFn: (data) => createTransaction({ body: data }),
    onSuccess: () => {
      toast.success("Transaction Created Successfully");
      queryClient.invalidateQueries({
        queryKey: ["opds"],
      });
      queryClient.invalidateQueries({
        queryKey: ["ipds"],
      });
    },
    onError: showError,
  });
};

export const useCreateInvoiceBillingItem = () => {
  const queryClient = useQueryClient();
  return useMutation<
    ApiResponse<InvoiceType>,
    AxiosError<ApiResponse<null>>,
    addInvoiceBillItemValidatorType
  >({
    mutationKey: ["create-invoice-billing-item"],
    mutationFn: (data) => createBillingItem({ body: data }),
    onSuccess: () => {
      toast.success("Billing Item Created Successfully");
      queryClient.invalidateQueries({
        queryKey: ["opds"],
      });
      queryClient.invalidateQueries({
        queryKey: ["itpds"],
      });
    },
    onError: showError,
  });
};

export const useUpdateInvoice = () => {
  return useMutation<
    ApiResponse<InvoiceGroupedBySection>,
    AxiosError<ApiResponse<null>>,
    updateInvoiceValidatorType
  >({
    mutationKey: ["update-invoice"],
    mutationFn: (data) =>
      updateInvoiceDetails({
        body: data,
      }),
    onSuccess: () => {
      toast.success("Invoice Updated Successfully");
    },
    onError: showError,
  });
};
