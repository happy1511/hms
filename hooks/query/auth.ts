import { LOGIN } from "@/lib/apiDefinations";
import { ApiResponse } from "@/lib/type";
import { createRequest } from "@/services/apiRequest";
import { AuthValidatorType } from "@/validators/api/auth/auth";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

const login = createRequest<ApiResponse<null>>(LOGIN, "POST");

export const useLogin = () => {
  const router = useRouter();
  return useMutation<ApiResponse<null>, Error, AuthValidatorType>({
    mutationKey: ["login"],
    mutationFn: (data) => login({ body: data }),
    onSuccess: () => {
      router.push("/");
      toast.success("Logged In Successfully");
    },
    onError: (data) => {
      toast.error(data.message || "Something went wrong");
    },
  });
};
