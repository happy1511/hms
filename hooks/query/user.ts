import { USERS } from "@/lib/apiDefinations";
import { ApiResponse, PaginatedResponse, User, FilterValues } from "@/lib/type";
import { showError } from "@/lib/utils";
import { createRequest } from "@/services/apiRequest";
import {
  PartialUserValidatorType,
  UserValidatorType,
} from "@/validators/api/masters/user";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

const createUser = createRequest<ApiResponse<User>>(USERS, "POST");
const updateUser = createRequest<ApiResponse<User>, undefined, { id: string }>(
  (p) => `${USERS}/${p.id}`,
  "PUT",
);
const deleteUser = createRequest<ApiResponse<null>, undefined, { id: string }>(
  (p) => `${USERS}/${p.id}`,
  "DELETE",
);
const getUser = createRequest<ApiResponse<User>, undefined, { id: string }>(
  (p) => `${USERS}/${p.id}`,
  "GET",
);

const getUsers = createRequest<
  PaginatedResponse<User>,
  {
    limit: number;
    name?: string;
    createdAt?: string | { from?: Date; to?: Date };
    status?: string;
  }
>(USERS, "GET");

export const useUsersList = (
  filters: FilterValues,
  page: number,
  limit: number,
) => {
  return useQuery<
    PaginatedResponse<User>,
    AxiosError<ApiResponse<null>>,
    PaginatedResponse<User>,
    [string, FilterValues, number, number]
  >({
    queryKey: ["users", filters, page, limit],
    queryFn: () =>
      getUsers({
        pageParam: page,
        params: {
          limit,
          ...(filters.createdAt && { createdAt: filters.createdAt }),
          ...(filters.name && { search: filters.name }),
          ...(filters.status && { status: filters.status }),
        },
      }),
  });
};

export const useGetUser = (id?: string) => {
  return useQuery<
    ApiResponse<User>,
    AxiosError<ApiResponse<null>>,
    User,
    [string, string | undefined]
  >({
    queryKey: ["get-users", id],
    queryFn: () =>
      getUser({
        urlHelpers: {
          id: id as string,
        },
      }),
    select: (data) => data.data,
    enabled: !!id,
  });
};

export const useCreateUser = () => {
  const queryClient = useQueryClient();
  const router = useRouter();
  return useMutation<
    ApiResponse<User>,
    AxiosError<ApiResponse<null>>,
    UserValidatorType
  >({
    mutationKey: ["create-user"],
    mutationFn: (data) => createUser({ body: data }),
    onSuccess: () => {
      toast.success("User Created Successfully");
      queryClient.invalidateQueries({
        queryKey: ["users"],
      });
      router.back();
    },
    onError: showError,
  });
};

export const useUpdateUser = () => {
  const queryClient = useQueryClient();
  const router = useRouter();
  return useMutation<
    ApiResponse<User>,
    AxiosError<ApiResponse<null>>,
    PartialUserValidatorType
  >({
    mutationKey: ["update-user"],
    mutationFn: (data) =>
      updateUser({ body: data, urlHelpers: { id: data.id.toString() } }),
    onSuccess: (_, variables) => {
      toast.success("User Updated Successfully");
      queryClient.invalidateQueries({
        queryKey: ["get-users", variables.id],
      });
      queryClient.invalidateQueries({
        queryKey: ["users"],
      });
      router.back();
    },
    onError: showError,
  });
};

export const useDeleteUser = () => {
  const queryClient = useQueryClient();

  return useMutation<
    ApiResponse<null>,
    AxiosError<ApiResponse<null>>,
    PartialUserValidatorType
  >({
    mutationKey: ["delete-user"],
    mutationFn: (data) =>
      deleteUser({ urlHelpers: { id: data.id.toString() } }),
    onSuccess: () => {
      toast.success("User Deleted Successfully");
      queryClient.invalidateQueries({
        queryKey: ["users"],
      });
    },
    onError: showError,
  });
};
