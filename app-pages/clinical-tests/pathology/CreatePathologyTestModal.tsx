import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  pathologyTestValidator,
  PathologyTestValidatorType,
} from "@/validators/api/masters/pathologyTest";
import { useCreatePathologyTest } from "@/hooks/query/pathology";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import CustomLayout from "@/components/common/CustomLayout";
import { Form } from "@/components/ui/form";
import FormField from "@/components/form-inputs/FormField";
import { FormInfiniteSelect } from "@/components/form-inputs/FormInfiniteSelect";
import { useInfiniteBillingSectionsList } from "@/hooks/query/bllingSection";
import { BillingSection } from "@/generated/prisma/client";
import { PaginatedResponse } from "@/lib/type";
import {
  ContainerType,
  PathologyTestSection,
  SampleType,
  Status,
} from "@/generated/prisma/enums";
import CustomButton from "@/components/common/CustomButton";

import { useState } from "react";

interface Props {
  trigger: React.ReactNode;
}

const CreatePathologyTestModal = ({ trigger }: Props) => {
  const [open, setOpen] = useState(false);
  const { mutateAsync, isPending } = useCreatePathologyTest();
  const [billingSectionSearch, setBillingSectionSearch] = useState("");
  const billingSectionQuery = useInfiniteBillingSectionsList(
    { name: billingSectionSearch, status: Status.active },
    15,
  );

  const form = useForm<PathologyTestValidatorType>({
    resolver: zodResolver(pathologyTestValidator),
  });

  const handleSubmit = async (values: PathologyTestValidatorType) => {
    await mutateAsync(values);
    form.reset();
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent
        showCloseButton={false}
        className="max-w-4xl! border-secondary border-4 bg-white p-0 gap-0"
      >
        <DialogHeader>
          <DialogTitle className="sr-only"></DialogTitle>
          <DialogDescription className="sr-only">
            This action cannot be undone. This will permanently delete your
            account and remove your data from our servers.
          </DialogDescription>
        </DialogHeader>
        <CustomLayout title="Create Pathology Test">
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
                PathologyTestValidatorType
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
              />
              <FormField
                label="Rate"
                type="number"
                control={form.control}
                name="price"
                required
              />

              <div className="col-span-2">
                <CustomButton isLoading={isPending} type="submit">
                  Create
                </CustomButton>
              </div>
            </form>
          </Form>
        </CustomLayout>
      </DialogContent>
    </Dialog>
  );
};

export default CreatePathologyTestModal;
