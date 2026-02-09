"use client";

import CustomButton from "@/components/common/CustomButton";
import CustomLayout from "@/components/common/CustomLayout";
import FormField from "@/components/form-inputs/FormField";
import { Form } from "@/components/ui/form";
import { Status } from "@/generated/prisma/enums";
import {
  useCreateBillingSection,
  useGetBillingSection,
  useUpdateBillingSection,
} from "@/hooks/query/bllingSection";
import { useInfiniteServicesList } from "@/hooks/query/service";
import { BillingSectionType } from "@/lib/type";
import {
  billingSectionValidator,
  BillingSectionValidatorType,
} from "@/validators/api/masters/billingSection";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoaderIcon } from "lucide-react";
import { useParams } from "next/navigation";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";

const getInitialValues = (
  data?: BillingSectionType,
): BillingSectionValidatorType => ({
  name: data?.name ?? "",
  description: data?.description ?? "",
  serviceIds: data?.services?.map((s) => s.service.id) ?? [],
  status: data?.status ?? Status["active"],
});

const UpdateCreateForm = ({ data }: { data?: BillingSectionType }) => {
  const [serviceSearchValue, setServiceSearchValue] = useState("");
  const { mutateAsync: create, isPending: creating } =
    useCreateBillingSection();
  const { mutateAsync: update, isPending: updating } =
    useUpdateBillingSection();

  const {
    data: services,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = useInfiniteServicesList(
    { doctorType: "consulting", name: serviceSearchValue },
    10,
  );

  const flatServices = useMemo(
    () =>
      services?.pages.flatMap((p) =>
        p.data.flatMap((f) => ({ label: f.name, value: f.id })),
      ),
    [services],
  );

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

  console.log(form.getValues());

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
            required
          />

          <FormField<BillingSectionValidatorType>
            type="infiniteSelect"
            name="serviceIds"
            label="Services"
            control={form.control}
            options={flatServices || []}
            fetchNextPage={fetchNextPage}
            hasNextPage={hasNextPage}
            isFetchingNextPage={isFetchingNextPage}
            onSearch={setServiceSearchValue}
            required
            multiple
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
    return <></>;
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
