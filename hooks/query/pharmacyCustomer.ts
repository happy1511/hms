import { PHARMACY_CUSTOMER } from "@/lib/apiDefinations";
import {
  ApiResponse,
  FilterValues,
  PaginatedResponse,
  PharmacyCustomerType,
} from "@/lib/type";
import { showError } from "@/lib/utils";
import { createRequest } from "@/services/apiRequest";
import { pharmacyCustomerValidatorType } from "@/validators/api/masters/pharmacyCustomer";
import {
  InfiniteData,
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { AxiosError } from "axios";
import { toast } from "sonner";

const createPharmacyCustomer = createRequest<ApiResponse<PharmacyCustomerType>>(
  PHARMACY_CUSTOMER,
  "POST",
);

const getPharmacyCustomers = createRequest<
  PaginatedResponse<PharmacyCustomerType>,
  { limit: number; search?: string }
>(PHARMACY_CUSTOMER, "GET");

const getPharmacyCustomer = createRequest<
  ApiResponse<PharmacyCustomerType>,
  undefined,
  { id: string }
>((p) => `${PHARMACY_CUSTOMER}/${p.id}`, "GET");

export const useInfinitePharmacyCustomers = (
  filters: FilterValues,
  limit: number,
) => {
  return useInfiniteQuery<
    PaginatedResponse<PharmacyCustomerType>,
    AxiosError<ApiResponse<null>>,
    InfiniteData<PaginatedResponse<PharmacyCustomerType>>,
    [string, FilterValues, number]
  >({
    queryKey: ["pharmacy-customers-infinite", filters, limit],
    queryFn: ({ pageParam = 1 }) =>
      getPharmacyCustomers({
        pageParam: pageParam as number,
        params: {
          limit,
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

export const useGetPharmacyCustomer = (id?: string) => {
  return useQuery<
    ApiResponse<PharmacyCustomerType>,
    AxiosError<ApiResponse<null>>,
    PharmacyCustomerType,
    [string, string | undefined]
  >({
    queryKey: ["pharmacy-customer", id],
    queryFn: () =>
      getPharmacyCustomer({
        urlHelpers: {
          id: id as string,
        },
      }),
    select: (data) => data.data,
    enabled: !!id,
  });
};

export const useCreatePharmacyCustomer = () => {
  const queryClient = useQueryClient();

  return useMutation<
    ApiResponse<PharmacyCustomerType>,
    AxiosError<ApiResponse<null>>,
    pharmacyCustomerValidatorType
  >({
    mutationKey: ["create-pharmacy-customer"],
    mutationFn: (data) => createPharmacyCustomer({ body: data }),
    onSuccess: () => {
      toast.success("Pharmacy customer created successfully");
      queryClient.invalidateQueries({
        queryKey: ["pharmacy-customers-infinite"],
      });
    },
    onError: showError,
  });
};
