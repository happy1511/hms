import { PHARMACY_SALE_RETURN } from "@/lib/apiDefinations";
import { ApiResponse, PharmacySaleReturnType } from "@/lib/type";
import { showError } from "@/lib/utils";
import { createRequest } from "@/services/apiRequest";
import { saleReturnValidatorType } from "@/validators/api/masters/pharmacySaleReturn";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

const createSaleReturn = createRequest<ApiResponse<PharmacySaleReturnType>>(
  PHARMACY_SALE_RETURN,
  "POST",
);

export const useCreateSaleReturn = () => {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation<
    ApiResponse<PharmacySaleReturnType>,
    AxiosError<ApiResponse<null>>,
    saleReturnValidatorType
  >({
    mutationKey: ["create-sale-return"],
    mutationFn: (data) => createSaleReturn({ body: data }),
    onSuccess: (_, variables) => {
      toast.success("Sale return created successfully");
      queryClient.invalidateQueries({ queryKey: ["sale-bills"] });
      queryClient.invalidateQueries({
        queryKey: ["sale-bill", String(variables.drugBillId)],
      });
      router.push("/pharmacy/sale-bill");
    },
    onError: showError,
  });
};
