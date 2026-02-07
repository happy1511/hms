import { PERMISSION } from "@/lib/apiDefinations";
import { ApiResponse, User } from "@/lib/type";
import { createRequest } from "@/services/apiRequest";
import { UserValidatorType } from "@/validators/api/masters/user";
import { useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";

const getPermissions = createRequest<ApiResponse<User["permissions"]>>(
  PERMISSION,
  "GET",
);

export const usePermissionsList = (enabled?: boolean) => {
  return useQuery<
    ApiResponse<User["permissions"]>,
    AxiosError<ApiResponse<null>>,
    UserValidatorType["permissions"],
    [string]
  >({
    queryKey: ["permissions"],
    queryFn: () => getPermissions({}),
    select: (data) =>
      data.data.map((p) => ({
        module: { ...p.module, id: p.module.id.toString() },
        actions: p.actions.map((a) => ({
          ...a,
          name: a.name,
          id: a.id.toString(),
          assigned: false as boolean,
        })),
      })),
    staleTime: Infinity,
    enabled: !!enabled,
  });
};
