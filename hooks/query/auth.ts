import { LOGIN, PROFILE } from "@/lib/apiDefinations";
import { ApiResponse, User } from "@/lib/type";
import { createRequest } from "@/services/apiRequest";
import { AuthValidatorType } from "@/validators/api/auth/auth";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

const login = createRequest<ApiResponse<null>>(LOGIN, "POST");
const profile = createRequest<ApiResponse<User>>(PROFILE, "POST");

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

export const useProfile = (enabled: boolean = true) => {
  return useQuery<ApiResponse<User>, Error, ApiResponse<User>, [string]>({
    queryKey: ["profile"],
    queryFn: () => profile({}),
    enabled: enabled,
  });
};
