import { Department } from "@/generated/prisma/client";
import { DEPARTMENTS } from "@/lib/apiDefinations";
import { ApiResponse, FilterValues, PaginatedResponse } from "@/lib/type";
import { showError } from "@/lib/utils";
import { createRequest } from "@/services/apiRequest";
import {
  departmentValidatorType,
  partialDepartmentValidatorType,
} from "@/validators/api/masters/department";
import {
  InfiniteData,
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { AxiosError } from "axios";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

const createDepartment = createRequest<ApiResponse<Department>>(
  DEPARTMENTS,
  "POST",
);
const updateDepartment = createRequest<
  ApiResponse<Department>,
  undefined,
  { id: string }
>((p) => `${DEPARTMENTS}/${p.id}`, "PUT");
const deleteDepartment = createRequest<
  ApiResponse<null>,
  undefined,
  { id: string }
>((p) => `${DEPARTMENTS}/${p.id}`, "DELETE");
const getDepartment = createRequest<
  ApiResponse<Department>,
  undefined,
  { id: string }
>((p) => `${DEPARTMENTS}/${p.id}`, "GET");

const getDepartments = createRequest<
  PaginatedResponse<Department>,
  {
    limit: number;
    name?: string;
    createdAt?: string | { from?: Date; to?: Date };
    status?: string;
  }
>(DEPARTMENTS, "GET");

export const useDepartmentsList = (
  filters: FilterValues,
  page: number,
  limit: number,
) => {
  return useQuery<
    PaginatedResponse<Department>,
    AxiosError<ApiResponse<null>>,
    PaginatedResponse<Department>,
    [string, FilterValues, number, number]
  >({
    queryKey: ["departments", filters, page, limit],
    queryFn: () =>
      getDepartments({
        pageParam: page,
        params: {
          limit,
          ...(filters.createdAt && { createdAt: filters.createdAt }),
          ...(filters.name && { search: filters.name }),
          ...(filters.status && { status: filters.status }),
          ...(filters.doctorType && { doctorType: filters.doctorType }),
        },
      }),
  });
};

export const useInfiniteDepartmentsList = (
  filters: FilterValues,
  limit: number,
) => {
  return useInfiniteQuery<
    PaginatedResponse<Department>,
    AxiosError<ApiResponse<null>>,
    InfiniteData<PaginatedResponse<Department>>,
    [string, FilterValues, number]
  >({
    queryKey: ["departments", filters, limit],

    queryFn: ({ pageParam = 1 }) =>
      getDepartments({
        pageParam: pageParam as number,
        params: {
          limit,
          ...(filters.createdAt && { createdAt: filters.createdAt }),
          ...(filters.name && { search: filters.name }),
          ...(filters.status && { status: filters.status }),
          ...(filters.doctorType && { doctorType: filters.doctorType }),
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

export const useGetDepartment = (id?: string) => {
  return useQuery<
    ApiResponse<Department>,
    AxiosError<ApiResponse<null>>,
    Department,
    [string, string | undefined]
  >({
    queryKey: ["get-departments", id],
    queryFn: () =>
      getDepartment({
        urlHelpers: {
          id: id as string,
        },
      }),
    select: (data) => data.data,
    enabled: !!id,
  });
};

export const useCreateDepartment = () => {
  const queryClient = useQueryClient();
  const router = useRouter();
  return useMutation<
    ApiResponse<Department>,
    AxiosError<ApiResponse<null>>,
    departmentValidatorType
  >({
    mutationKey: ["create-department"],
    mutationFn: (data) => createDepartment({ body: data }),
    onSuccess: () => {
      toast.success("Department Created Successfully");
      queryClient.invalidateQueries({
        queryKey: ["departments"],
      });
      router.back();
    },
    onError: showError,
  });
};

export const useUpdateDepartment = () => {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation<
    ApiResponse<Department>,
    AxiosError<ApiResponse<null>>,
    partialDepartmentValidatorType
  >({
    mutationKey: ["update-department"],
    mutationFn: (data) =>
      updateDepartment({
        body: data,
        urlHelpers: { id: data.departmentId.toString() },
      }),
    onSuccess: () => {
      toast.success("Department Updated Successfully");
      queryClient.invalidateQueries({
        queryKey: ["departments"],
      });
      router.back();
    },
    onError: showError,
  });
};

export const useDeleteDepartment = () => {
  const queryClient = useQueryClient();

  return useMutation<
    ApiResponse<null>,
    AxiosError<ApiResponse<null>>,
    partialDepartmentValidatorType
  >({
    mutationKey: ["delete-department"],
    mutationFn: (data) =>
      deleteDepartment({ urlHelpers: { id: data.departmentId.toString() } }),
    onSuccess: () => {
      toast.success("Department Deleted Successfully");
      queryClient.invalidateQueries({
        queryKey: ["departments"],
      });
    },
    onError: showError,
  });
};
