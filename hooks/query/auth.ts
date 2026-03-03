import { LOGIN, LOGOUT, PROFILE } from "@/lib/apiDefinations";
import { ApiResponse, User } from "@/lib/type";
import { showError } from "@/lib/utils";
import { createRequest } from "@/services/apiRequest";
import { AuthValidatorType } from "@/validators/api/auth/auth";
import { useMutation, useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

const login = createRequest<ApiResponse<null>>(LOGIN, "POST");
const logout = createRequest<ApiResponse<null>>(LOGOUT, "POST");
const profile = createRequest<ApiResponse<User>>(PROFILE, "POST");

export const useLogin = () => {
  const router = useRouter();
  return useMutation<
    ApiResponse<null>,
    AxiosError<ApiResponse<null>>,
    AuthValidatorType
  >({
    mutationKey: ["login"],
    mutationFn: (data) => login({ body: data }),
    onSuccess: () => {
      router.push("/");
      toast.success("Logged In Successfully");
    },
    onError: showError,
  });
};

export const useLogout = () => {
  const router = useRouter();
  return useMutation<ApiResponse<null>, AxiosError<ApiResponse<null>>>({
    mutationKey: ["logout"],
    mutationFn: () => logout({}),
    onSuccess: () => {
      router.push("/login");
      toast.success("Logged Out Successfully");
    },
    onError: showError,
  });
};

export const useProfile = (enabled: boolean = true) => {
  return useQuery<
    ApiResponse<User>,
    AxiosError<ApiResponse<null>>,
    ApiResponse<User>,
    [string]
  >({
    queryKey: ["profile"],
    queryFn: () => profile({}),
    enabled: enabled,
  });
};
