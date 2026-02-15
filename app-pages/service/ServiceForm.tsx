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
import { useInfinitePathologyTestsList } from "@/hooks/query/pathology";
import { useInfiniteRadiologyTestsList } from "@/hooks/query/radiology";
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
import { useMemo, useState } from "react";
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

  const form = useForm<ServiceValidatorType>({
    defaultValues: getInitialValues(data),
    resolver: zodResolver(serviceValidator),
  });

  const discountAvailable = form.watch("discountAvailable");
  const type = form.watch("type");

  const {
    data: pathologyTests,
    isFetchingNextPage: isFetchingPathologyNextPage,
    hasNextPage: hasPathologyNextPage,
    fetchNextPage: fetchPathologyNextPage,
  } = useInfinitePathologyTestsList(
    { name: pathologySearchValue },
    10,
    type === "LAB_TEST" || type === "CLINICAL_TEST",
  );
  const {
    data: radiologyTests,
    isFetchingNextPage: isFetchingRadiologyNextPage,
    hasNextPage: hasRadiologyNextPage,
    fetchNextPage: fetchRadiologyNextPage,
  } = useInfiniteRadiologyTestsList(
    { name: radiologySearchValue },
    10,
    type === "RADIOLOGY_TEST" || type === "CLINICAL_TEST",
  );

  const flatPathologyTests = useMemo(
    () =>
      pathologyTests?.pages.flatMap((p) =>
        p.data.flatMap((f) => ({ label: f.name, value: f.id })),
      ),
    [pathologyTests],
  );

  const flatRadiologyTests = useMemo(
    () =>
      radiologyTests?.pages.flatMap((p) =>
        p.data.flatMap((f) => ({ label: f.name, value: f.id })),
      ),
    [radiologyTests],
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

          <FormField<ServiceValidatorType>
            type="infiniteSelect"
            name="connectedLabTests"
            label="Pathology Tests"
            control={form.control}
            options={flatPathologyTests || []}
            fetchNextPage={fetchPathologyNextPage}
            hasNextPage={hasPathologyNextPage}
            isFetchingNextPage={isFetchingPathologyNextPage}
            onSearch={setPathologySearchValue}
            multiple
          />

          <FormField<ServiceValidatorType>
            type="infiniteSelect"
            name="connectedRadiologyTests"
            label="Radiology Tests"
            control={form.control}
            options={flatRadiologyTests || []}
            fetchNextPage={fetchRadiologyNextPage}
            hasNextPage={hasRadiologyNextPage}
            isFetchingNextPage={isFetchingRadiologyNextPage}
            onSearch={setRadiologySearchValue}
            multiple
          />

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
