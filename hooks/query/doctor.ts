import { DOCTORS } from "@/lib/apiDefinations";
import {
  ApiResponse,
  Doctor,
  DoctorFilterValues,
  PaginatedResponse,
} from "@/lib/type";
import { createRequest } from "@/services/apiRequest";
import {
  DoctorValidatorType,
  PartialDoctorValidatorType,
} from "@/validators/api/masters/doctor";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

const createDoctor = createRequest<ApiResponse<Doctor>>(DOCTORS, "POST");
const updateDoctor = createRequest<
  ApiResponse<Doctor>,
  undefined,
  { id: string }
>((p) => `${DOCTORS}/${p.id}`, "PUT");
const getDoctor = createRequest<ApiResponse<Doctor>, undefined, { id: string }>(
  (p) => `${DOCTORS}/${p.id}`,
  "GET",
);

const getDoctors = createRequest<
  PaginatedResponse<Doctor>,
  { limit: number; name?: string; createdAt?: string; status?: string }
>(DOCTORS, "GET");

export const useDoctorsList = (
  filters: DoctorFilterValues,
  page: number,
  limit: number,
) => {
  return useQuery<
    PaginatedResponse<Doctor>,
    Error,
    PaginatedResponse<Doctor>,
    [string, DoctorFilterValues, number, number]
  >({
    queryKey: ["doctors", filters, page, limit],
    queryFn: () =>
      getDoctors({
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

export const useGetDoctor = (id?: string) => {
  return useQuery<
    ApiResponse<Doctor>,
    Error,
    Doctor,
    [string, string | undefined]
  >({
    queryKey: ["get-doctors", id],
    queryFn: () =>
      getDoctor({
        urlHelpers: {
          id: id as string,
        },
      }),
    select: (data) => data.data,
    enabled: !!id,
  });
};

export const useCreateDoctor = () => {
  const router = useRouter();
  return useMutation<ApiResponse<Doctor>, Error, DoctorValidatorType>({
    mutationKey: ["create-doctor"],
    mutationFn: (data) => createDoctor({ body: data }),
    onSuccess: () => {
      toast.success("Doctor Created Successfully");
      router.back();
    },
    onError: (data) => {
      toast.error(data.message || "Something went wrong");
    },
  });
};

export const useUpdateDoctor = () => {
  const router = useRouter();
  return useMutation<ApiResponse<Doctor>, Error, PartialDoctorValidatorType>({
    mutationKey: ["update-doctor"],
    mutationFn: (data) =>
      updateDoctor({ body: data, urlHelpers: { id: data.userId.toString() } }),
    onSuccess: () => {
      toast.success("Doctor Updated Successfully");
      router.back();
    },
    onError: (data) => {
      toast.error(data.message || "Something went wrong");
    },
  });
};
