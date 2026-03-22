"use client";

import CustomButton from "@/components/common/CustomButton";
import CustomLayout from "@/components/common/CustomLayout";
import NoPermission from "@/components/common/NoPermission";
import FormField from "@/components/form-inputs/FormField";
import { Form } from "@/components/ui/form";
import { Department } from "@/generated/prisma/client";
import { ActionType, ModuleType, Status } from "@/generated/prisma/enums";
import { useProfile } from "@/hooks/query/auth";
import {
  useCreateDepartment,
  useGetDepartment,
  useUpdateDepartment,
} from "@/hooks/query/department";
import { hasActionPermission } from "@/lib/utils";
import {
  departmentValidator,
  departmentValidatorType,
} from "@/validators/api/masters/department";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoaderIcon } from "lucide-react";
import { useParams } from "next/navigation";
import { useForm } from "react-hook-form";

const getInitialValues = (data?: Department): departmentValidatorType => ({
  name: data?.name ?? "",
  description: data?.description ?? null,
  status: data?.status ?? Status["active"],
});

const UpdateCreateForm = ({ data }: { data?: Department }) => {
  const { mutateAsync: create, isPending: creating } = useCreateDepartment();
  const { mutateAsync: update, isPending: updating } = useUpdateDepartment();

  const form = useForm<departmentValidatorType>({
    defaultValues: getInitialValues(data),
    resolver: zodResolver(departmentValidator),
  });

  const onSubmit = (values: departmentValidatorType) => {
    if (data) {
      update({ departmentId: Number(data.id), ...values });
    } else {
      create(values);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className="grid grid-cols-2 gap-x-2">
          <FormField<departmentValidatorType>
            label="Name"
            type="text"
            name="name"
            control={form.control}
            required
          />

          <FormField<departmentValidatorType>
            label="Status"
            type="select"
            name="status"
            options={Object.values(Status).map((s) => ({ value: s, label: s }))}
            control={form.control}
            required
          />
          <FormField<departmentValidatorType>
            label="Description"
            type="textarea"
            name="description"
            control={form.control}
            required
          />
        </div>
        <CustomButton disabled={creating || updating} type="submit">
          Submit
        </CustomButton>
      </form>
    </Form>
  );
};

const DepartmentForm = () => {
  const { departmentId }: { departmentId?: string } = useParams();
  const { data: profile } = useProfile(false);

  const { data, isLoading: fetchingFloor } = useGetDepartment(departmentId);

  if (fetchingFloor) {
    return (
      <div className="flex justify-center items-center h-full">
        <LoaderIcon
          role="status"
          aria-label="Loading"
          className="size-4 animate-spin"
        />
      </div>
    );
  }

  if (departmentId && !data) {
    return <div />;
  }

  if (!profile) {
    return <div />;
  }

  const canCreate = hasActionPermission(
    profile.data,
    ModuleType.DEPARTMENT_MASTER,
    ActionType.CREATE,
  );
  const canUpdate = hasActionPermission(
    profile.data,
    ModuleType.DEPARTMENT_MASTER,
    ActionType.UPDATE,
  );

  if ((departmentId && !canUpdate) || (!departmentId && !canCreate)) {
    return (
      <CustomLayout title={departmentId ? "Edit Department" : "Create Department"}>
        <NoPermission />
      </CustomLayout>
    );
  }

  return (
    <CustomLayout
      title={departmentId ? "Edit Department" : "Create Department"}
    >
      {departmentId ? <UpdateCreateForm data={data} /> : <UpdateCreateForm />}
    </CustomLayout>
  );
};

export default DepartmentForm;
