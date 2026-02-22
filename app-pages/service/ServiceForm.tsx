"use client";

import CustomButton from "@/components/common/CustomButton";
import CustomLayout from "@/components/common/CustomLayout";
import FormField from "@/components/form-inputs/FormField";
import { FormInfiniteSelect } from "@/components/form-inputs/FormInfiniteSelect";
import { Form } from "@/components/ui/form";
import { RadiologyTest } from "@/generated/prisma/client";
import {
  ServiceApplicableOn,
  ServiceType,
  Status,
} from "@/generated/prisma/enums";
import { useInfinitePathologyTestsList } from "@/hooks/query/pathology";
import { useInfiniteRadiologyTestsList } from "@/hooks/query/radiology";
import {
  useCreateService,
  useGetService,
  useUpdateService,
} from "@/hooks/query/service";
import {
  PaginatedResponse,
  PathologyTestDataType,
  ServiceDataType,
} from "@/lib/type";
import {
  serviceValidator,
  ServiceValidatorType,
} from "@/validators/api/masters/service";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoaderIcon } from "lucide-react";
import { useParams } from "next/navigation";
import { useState } from "react";
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
  connectedLabTests: data?.pathologyTests?.map((t) => t.testId) ?? undefined,
  connectedRadiologyTests:
    data?.radiologyTests?.map((t) => t.testId) ?? undefined,
});

const UpdateCreateForm = ({ data }: { data?: ServiceDataType }) => {
  const [pathologySearchValue, setPathologySearchValue] = useState("");
  const [radiologySearchValue, setRadiologySearchValue] = useState("");
  const { mutateAsync: create, isPending: creating } = useCreateService();
  const { mutateAsync: update, isPending: updating } = useUpdateService();

  const defaultValues = getInitialValues(data);

  const form = useForm<ServiceValidatorType>({
    defaultValues,
    resolver: zodResolver(serviceValidator),
  });

  const discountAvailable = form.watch("discountAvailable");
  const type = form.watch("type");

  const pathologyQuery = useInfinitePathologyTestsList(
    {
      name: pathologySearchValue,
      defaultSelectedIds: defaultValues.connectedLabTests as number[],
    },
    10,
    type === "LAB_TEST" || type === "CLINICAL_TEST",
  );
  const radiologyQuery = useInfiniteRadiologyTestsList(
    {
      name: radiologySearchValue,
      defaultSelectedIds: defaultValues.connectedRadiologyTests as number[],
    },
    10,
    type === "RADIOLOGY_TEST" || type === "CLINICAL_TEST",
  );

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

          {(type === ServiceType["LAB_TEST"] ||
            type === ServiceType["CLINICAL_TEST"]) && (
            <FormInfiniteSelect<
              PathologyTestDataType,
              PaginatedResponse<PathologyTestDataType>,
              string,
              ServiceValidatorType
            >
              name="connectedLabTests"
              label="Pathology Tests"
              control={form.control}
              query={pathologyQuery}
              getItems={(p) => p?.data}
              valueKey={(i) => String(i?.id)}
              labelKey={(i) => i?.name}
              search={pathologySearchValue}
              onSearchChange={setPathologySearchValue}
              required
              multiple
            />
          )}
          {(type === ServiceType["RADIOLOGY_TEST"] ||
            type === ServiceType["CLINICAL_TEST"]) && (
            <FormInfiniteSelect<
              RadiologyTest,
              PaginatedResponse<RadiologyTest>,
              string,
              ServiceValidatorType
            >
              name="connectedRadiologyTests"
              label="Radiology Tests"
              control={form.control}
              query={radiologyQuery}
              getItems={(p) => p?.data}
              valueKey={(i) => String(i?.id)}
              labelKey={(i) => i?.name}
              search={radiologySearchValue}
              onSearchChange={setRadiologySearchValue}
              required
              multiple
            />
          )}

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
    return <div />;
  }

  return (
    <CustomLayout title={serviceId ? "Edit Service" : "Create Service"}>
      {serviceId ? <UpdateCreateForm data={data} /> : <UpdateCreateForm />}
    </CustomLayout>
  );
};

export default ServiceForm;
