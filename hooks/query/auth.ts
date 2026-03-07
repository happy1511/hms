import {
  CHANGE_PASSWORD,
  LOGIN,
  LOGOUT,
  PROFILE,
} from "@/lib/apiDefinations";
import { ApiResponse, User } from "@/lib/type";
import { showError } from "@/lib/utils";
import { createRequest } from "@/services/apiRequest";
import { AuthValidatorType } from "@/validators/api/auth/auth";
import {
  ChangePasswordValidatorType,
  ProfileUpdateValidatorType,
} from "@/validators/api/auth/profile";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

const login = createRequest<ApiResponse<null>>(LOGIN, "POST");
const logout = createRequest<ApiResponse<null>>(LOGOUT, "POST");
const profile = createRequest<ApiResponse<User>>(PROFILE, "POST");
const updateProfile = createRequest<
  ApiResponse<User>,
  undefined,
  undefined,
  ProfileUpdateValidatorType
>(PROFILE, "PUT");
const changePassword = createRequest<
  ApiResponse<null>,
  undefined,
  undefined,
  ChangePasswordValidatorType
>(CHANGE_PASSWORD, "POST");

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

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  return useMutation<
    ApiResponse<User>,
    AxiosError<ApiResponse<null>>,
    ProfileUpdateValidatorType
  >({
    mutationKey: ["update-profile"],
    mutationFn: (data) => updateProfile({ body: data }),
    onSuccess: () => {
      toast.success("Profile updated successfully");
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["doctors"] });
    },
    onError: showError,
  });
};

export const useChangePassword = () => {
  return useMutation<
    ApiResponse<null>,
    AxiosError<ApiResponse<null>>,
    ChangePasswordValidatorType
  >({
    mutationKey: ["change-password"],
    mutationFn: (data) => changePassword({ body: data }),
    onSuccess: () => {
      toast.success("Password changed successfully");
    },
    onError: showError,
  });
};
