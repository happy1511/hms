import { COMPANY } from "@/lib/apiDefinations";
import { ApiResponse } from "@/lib/type";
import { showError } from "@/lib/utils";
import { createRequest } from "@/services/apiRequest";
import { companyDetailsUpdateValidatorType } from "@/validators/api/company/company";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { toast } from "sonner";

export type CompanyDetails = {
  id: number;
  name: string;
  address: string;
  mobile: string;
  createdAt: string | Date;
  updatedAt: string | Date;
};

const getCompany = createRequest<ApiResponse<CompanyDetails>>(COMPANY, "GET");
const updateCompany = createRequest<ApiResponse<CompanyDetails>>(COMPANY, "PUT");

export const useCompanyDetails = () => {
  return useQuery<
    ApiResponse<CompanyDetails>,
    AxiosError<ApiResponse<null>>,
    CompanyDetails,
    [string]
  >({
    queryKey: ["company-details"],
    queryFn: () => getCompany({}),
    select: (data) => data.data,
  });
};

export const useUpdateCompanyDetails = () => {
  const queryClient = useQueryClient();

  return useMutation<
    ApiResponse<CompanyDetails>,
    AxiosError<ApiResponse<null>>,
    companyDetailsUpdateValidatorType
  >({
    mutationKey: ["update-company-details"],
    mutationFn: (data) => updateCompany({ body: data }),
    onSuccess: () => {
      toast.success("Company details updated successfully");
      queryClient.invalidateQueries({ queryKey: ["company-details"] });
    },
    onError: showError,
  });
};

