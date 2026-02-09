"use client";

import CustomButton from "@/components/common/CustomButton";
import CustomLayout from "@/components/common/CustomLayout";
import FormField from "@/components/form-inputs/FormField";
import { Form } from "@/components/ui/form";
import {
  ServiceApplicableOn,
  ServiceType,
  Status,
} from "@/generated/prisma/enums";
import {
  useCreateService,
  useGetService,
  useUpdateService,
} from "@/hooks/query/service";
import { ServiceDataType } from "@/lib/type";
import {
  serviceValidator,
  ServiceValidatorType,
} from "@/validators/api/masters/service";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoaderIcon } from "lucide-react";
import { useParams } from "next/navigation";
import { useForm } from "react-hook-form";

const getInitialValues = (data?: ServiceDataType): ServiceValidatorType => ({
  name: data?.name ?? "",
  description: data?.description ?? "",
  type: data?.type ?? ServiceType["LAB_TEST"],
  status: data?.status ?? Status["active"],
  maxDiscount: data?.maxDiscount ?? 0,
  discountAvailable: data?.discountAvailable ?? false,
  price: data?.price ?? 0,
  applicableOn: data?.applicableOn ?? ServiceApplicableOn["BOTH"],
});

const UpdateCreateForm = ({ data }: { data?: ServiceDataType }) => {
  const { mutateAsync: create, isPending: creating } = useCreateService();
  const { mutateAsync: update, isPending: updating } = useUpdateService();

  const form = useForm<ServiceValidatorType>({
    defaultValues: getInitialValues(data),
    resolver: zodResolver(serviceValidator),
  });

  const discountAvailable = form.watch("discountAvailable");

  const onSubmit = (values: ServiceValidatorType) => {
    if (data) {
      update({ serviceId: Number(data.id), ...values });
    } else {
      create(values);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className="grid grid-cols-2 gap-x-2">
          <FormField<ServiceValidatorType>
            label="Name"
            type="text"
            name="name"
            control={form.control}
            required
          />

          <FormField<ServiceValidatorType>
            label="Type"
            type="select"
            name="type"
            options={Object.values(ServiceType).map((s) => ({
              value: s,
              label: s,
            }))}
            control={form.control}
            required
          />

          <FormField<ServiceValidatorType>
            label="Applicable On"
            type="select"
            name="applicableOn"
            options={Object.values(ServiceApplicableOn).map((s) => ({
              value: s,
              label: s,
            }))}
            control={form.control}
            required
          />

          <FormField<ServiceValidatorType>
            label="Price"
            type="number"
            name="price"
            control={form.control}
            required
          />

          <div className="col-span-2 grid grid-cols-2 gap-x-2">
            <FormField<ServiceValidatorType>
              label="Status"
              type="select"
              name="status"
              options={Object.values(Status).map((s) => ({
                value: s,
                label: s,
              }))}
              control={form.control}
              required
            />

            {discountAvailable && (
              <FormField<ServiceValidatorType>
                label="Max Discount"
                type="number"
                name="maxDiscount"
                control={form.control}
                required
              />
            )}
          </div>

          <div className="col-span-2">
            <FormField<ServiceValidatorType>
              label="Description"
              type="textarea"
              name="description"
              control={form.control}
              required
            />
          </div>

          <FormField<ServiceValidatorType>
            label="Discount Available"
            type="checkbox"
            name="discountAvailable"
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

const ServiceForm = () => {
  const { serviceId }: { serviceId?: string } = useParams();

  const { data, isLoading: fetchingService } = useGetService(serviceId);

  if (fetchingService) {
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

  if (serviceId && !data) {
    return <></>;
  }

  return (
    <CustomLayout title={serviceId ? "Edit Service" : "Create Service"}>
      {serviceId ? <UpdateCreateForm data={data} /> : <UpdateCreateForm />}
    </CustomLayout>
  );
};

export default ServiceForm;
