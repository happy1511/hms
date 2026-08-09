"use client";

import { useState } from "react";
import CustomButton from "@/components/common/CustomButton";
import FormField from "@/components/form-inputs/FormField";
import { FormInfiniteSelect } from "@/components/form-inputs/FormInfiniteSelect";
import { Form } from "@/components/ui/form";
import {
  ContainerType,
  PathologyTestSection,
  SampleType,
  Status,
} from "@/generated/prisma/enums";
import { useInfiniteBillingSectionsList } from "@/hooks/query/bllingSection";
import { useUpdatePathologyTest } from "@/hooks/query/pathology";
import { BillingSection } from "@/generated/prisma/client";
import { PathologyTestDataType, PaginatedResponse } from "@/lib/type";
import {
  partialPathologyTestValidator,
  PartialPathologyTestValidatorType,
} from "@/validators/api/masters/pathologyTest";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

export const PathologyTestInfoForm = ({
  data,
}: {
  data: PathologyTestDataType;
}) => {
  const { mutateAsync, isPending } = useUpdatePathologyTest();
  const { alias, container, footerNotes, name, price, sampleType, section } =
    data;

  const [billingSectionSearch, setBillingSectionSearch] = useState("");
  const billingSectionQuery = useInfiniteBillingSectionsList(
    { name: billingSectionSearch, status: Status.active },
    15,
  );

  const initialBillingSectionId = data.services?.[0]?.service?.billingSectionId;

  const initialBillingSection = data.services?.[0]?.service?.billingSection;

  const form = useForm<PartialPathologyTestValidatorType>({
    defaultValues: {
      alias,
      container,
      footerNotes,
      name,
      price,
      sampleType,
      section,
      billingSectionId: initialBillingSectionId,
      testId: data.id,
    },
    resolver: zodResolver(partialPathologyTestValidator),
  });

  const handleSubmit = (values: PartialPathologyTestValidatorType) => {
    mutateAsync(values);
  };

  return (
    <Form {...form}>
      <form
        className="grid grid-cols-2 space-x-2"
        onSubmit={form.handleSubmit(handleSubmit)}
      >
        <FormField
          label="Name"
          type="text"
          control={form.control}
          name="name"
          placeholder="Enter Name"
          required
        />
        <FormField
          label="Alias"
          type="text"
          control={form.control}
          placeholder="Enter Alias"
          name="alias"
          required
        />
        <FormField
          label="Section"
          type="select"
          control={form.control}
          name="section"
          options={Object.values(PathologyTestSection).map((s) => ({
            value: s,
            label: s,
          }))}
          required
        />
        <FormField
          label="Vial"
          type="select"
          control={form.control}
          name="container"
          options={Object.values(ContainerType).map((s) => ({
            value: s,
            label: s,
          }))}
          required
        />
        <FormField
          label="Sample Type"
          type="select"
          control={form.control}
          name="sampleType"
          options={Object.values(SampleType).map((s) => ({
            value: s,
            label: s,
          }))}
          required
        />
        <FormInfiniteSelect<
          BillingSection,
          PaginatedResponse<BillingSection>,
          string,
          PartialPathologyTestValidatorType
        >
          label="Billing Section"
          control={form.control}
          name="billingSectionId"
          placeholder="Select Billing Section"
          required
          query={billingSectionQuery}
          searchValue={billingSectionSearch}
          getItems={(data) => data?.data}
          onSearchChange={setBillingSectionSearch}
          valueKey={(i) => String(i?.id)}
          labelKey={(i) => i?.name}
          selectedItem={initialBillingSection as any}
        />
        <FormField
          label="Rate"
          type="number"
          control={form.control}
          name="price"
          required
        />
        <div className="col-span-2">
          <FormField
            label="Footer Notes"
            type="richText"
            control={form.control}
            name="footerNotes"
          />
        </div>

        <div className="col-span-2">
          <CustomButton disabled={isPending} type="submit">
            Save
          </CustomButton>
        </div>
      </form>
    </Form>
  );
};

export default PathologyTestInfoForm;
