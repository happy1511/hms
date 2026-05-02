"use client";

import CustomButton from "@/components/common/CustomButton";
import CustomLayout from "@/components/common/CustomLayout";
import NoPermission from "@/components/common/NoPermission";
import FormField from "@/components/form-inputs/FormField";
import { Form } from "@/components/ui/form";
import { ActionType, ModuleType } from "@/generated/prisma/enums";
import { useProfile } from "@/hooks/query/auth";
import { hasActionPermission } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoaderIcon } from "lucide-react";
import { useParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { DrugSupplier } from "@/generated/prisma/client";
import {
  useCreateDrugSupplier,
  useGetDrugSupplier,
  useUpdateDrugSupplier,
} from "@/hooks/query/drugSupplier";
import {
  supplierValidator,
  supplierValidatorType,
} from "@/validators/api/masters/supplier";

const getInitialValues = (data?: DrugSupplier): supplierValidatorType => ({
  name: data?.name ?? "",
  gstIn: data?.gstIn ?? "",
  email: data?.email ?? "",
  phone: data?.phone ? String(data.phone) : "",
});

const UpdateCreateForm = ({ data }: { data?: DrugSupplier }) => {
  const { mutateAsync: create, isPending: creating } = useCreateDrugSupplier();
  const { mutateAsync: update, isPending: updating } = useUpdateDrugSupplier();

  const form = useForm<supplierValidatorType>({
    defaultValues: getInitialValues(data),
    resolver: zodResolver(supplierValidator),
  });

  const onSubmit = (values: supplierValidatorType) => {
    if (data) {
      update({ supplierId: Number(data.id), ...values });
    } else {
      create(values);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className="grid grid-cols-2 gap-x-2">
          <FormField<supplierValidatorType>
            label="Name"
            type="text"
            name="name"
            control={form.control}
            required
          />

          <FormField<supplierValidatorType>
            label="GSTIN"
            type="text"
            name="gstIn"
            control={form.control}
          />

          <FormField<supplierValidatorType>
            label="Email"
            type="text"
            name="email"
            control={form.control}
          />

          <FormField<supplierValidatorType>
            label="Phone Number"
            type="text"
            name="phone"
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

const DrugSupplierForm = () => {
  const { supplierId }: { supplierId?: string } = useParams();
  const { data: profile } = useProfile(false);

  const { data, isLoading: fetchingRoomType } = useGetDrugSupplier(supplierId);

  if (fetchingRoomType) {
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

  if (supplierId && !data) {
    return <div />;
  }

  if (!profile) {
    return <div />;
  }

  const canCreate = hasActionPermission(
    profile.data,
    ModuleType.PHARMACY_SUPPLIER,
    ActionType.CREATE,
  );
  const canUpdate = hasActionPermission(
    profile.data,
    ModuleType.PHARMACY_SUPPLIER,
    ActionType.UPDATE,
  );

  if ((supplierId && !canUpdate) || (!supplierId && !canCreate)) {
    return (
      <CustomLayout title={supplierId ? "Edit Drug Supplier" : "Create Drug Supplier"}>
        <NoPermission />
      </CustomLayout>
    );
  }

  return (
    <CustomLayout
      title={supplierId ? "Edit Drug Supplier" : "Create Drug Supplier"}
    >
      {supplierId ? <UpdateCreateForm data={data} /> : <UpdateCreateForm />}
    </CustomLayout>
  );
};

export default DrugSupplierForm;
