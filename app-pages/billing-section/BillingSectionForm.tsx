"use client";

import CustomButton from "@/components/common/CustomButton";
import CustomLayout from "@/components/common/CustomLayout";
import NoPermission from "@/components/common/NoPermission";
import FormField from "@/components/form-inputs/FormField";
import { Form } from "@/components/ui/form";
import { BillingSection } from "@/generated/prisma/client";
import { ActionType, ModuleType, Status } from "@/generated/prisma/enums";
import { useProfile } from "@/hooks/query/auth";
import {
  useCreateBillingSection,
  useGetBillingSection,
  useUpdateBillingSection,
} from "@/hooks/query/bllingSection";
import { hasActionPermission } from "@/lib/utils";
import {
  billingSectionValidator,
  BillingSectionValidatorType,
} from "@/validators/api/masters/billingSection";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoaderIcon } from "lucide-react";
import { useParams } from "next/navigation";
import { useForm } from "react-hook-form";

const getInitialValues = (
  data?: BillingSection,
): BillingSectionValidatorType => ({
  name: data?.name ?? "",
  description: data?.description ?? "",
  isOtherCharges: data?.isOtherCharges ?? false,
  status: data?.status ?? Status["active"],
});

const UpdateCreateForm = ({ data }: { data?: BillingSection }) => {
  const { mutateAsync: create, isPending: creating } =
    useCreateBillingSection();
  const { mutateAsync: update, isPending: updating } =
    useUpdateBillingSection();

  const form = useForm<BillingSectionValidatorType>({
    defaultValues: getInitialValues(data),
    resolver: zodResolver(billingSectionValidator),
  });

  const onSubmit = (values: BillingSectionValidatorType) => {
    if (data) {
      update({ sectionId: Number(data.id), ...values });
    } else {
      create(values);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className="grid grid-cols-2 gap-x-2">
          <FormField<BillingSectionValidatorType>
            label="Name"
            type="text"
            name="name"
            control={form.control}
            required
          />

          <FormField<BillingSectionValidatorType>
            label="Status"
            type="select"
            name="status"
            options={Object.values(Status).map((s) => ({ value: s, label: s }))}
            control={form.control}
          />

          <FormField<BillingSectionValidatorType>
            label="Other Charges Section"
            type="checkbox"
            name="isOtherCharges"
            control={form.control}
          />

          <div className="col-span-2">
            <FormField<BillingSectionValidatorType>
              label="Description"
              type="textarea"
              name="description"
              control={form.control}
              required
            />
          </div>
        </div>
        <CustomButton disabled={creating || updating} type="submit">
          Submit
        </CustomButton>
      </form>
    </Form>
  );
};

const BillingSectionForm = () => {
  const { sectionId }: { sectionId?: string } = useParams();
  const { data: profile } = useProfile(false);

  const { data, isLoading: fetchingSection } = useGetBillingSection(sectionId);

  if (fetchingSection) {
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

  if (sectionId && !data) {
    return <div />;
  }

  if (!profile) {
    return <div />;
  }

  const canCreate = hasActionPermission(
    profile.data,
    ModuleType.BILLING_SECTION_MASTER,
    ActionType.CREATE,
  );
  const canUpdate = hasActionPermission(
    profile.data,
    ModuleType.BILLING_SECTION_MASTER,
    ActionType.UPDATE,
  );

  if ((sectionId && !canUpdate) || (!sectionId && !canCreate)) {
    return (
      <CustomLayout
        title={sectionId ? "Edit Billing Section" : "Create Billing Section"}
      >
        <NoPermission />
      </CustomLayout>
    );
  }

  return (
    <CustomLayout
      title={sectionId ? "Edit Billing Section" : "Create Billing Section"}
    >
      {sectionId ? <UpdateCreateForm data={data} /> : <UpdateCreateForm />}
    </CustomLayout>
  );
};

export default BillingSectionForm;
