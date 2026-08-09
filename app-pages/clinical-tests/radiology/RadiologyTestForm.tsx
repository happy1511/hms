import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { RadiologySection, Status } from "@/generated/prisma/enums";
import CustomButton from "@/components/common/CustomButton";
import { RadiologyTest } from "@/generated/prisma/client";
import {
  radiologyTestValidator,
  RadiologyTestValidatorType,
} from "@/validators/api/masters/radiologyTest";
import {
  useCreateRadiologyTest,
  useUpdateRadiologyTest,
} from "@/hooks/query/radiology";

import { useState } from "react";

interface Props {
  trigger: React.ReactNode;
  data?: RadiologyTest;
}

const RadiologyTestForm = ({ trigger, data }: Props) => {
  const [open, setOpen] = useState(false);
  const { mutateAsync: create, isPending: creating } = useCreateRadiologyTest();
  const { mutateAsync: update, isPending: updating } = useUpdateRadiologyTest();

  const [billingSectionSearch, setBillingSectionSearch] = useState("");
  const billingSectionQuery = useInfiniteBillingSectionsList(
    { name: billingSectionSearch, status: Status.active },
    15,
  );

  const form = useForm<RadiologyTestValidatorType>({
    defaultValues: {
      alias: data?.alias || "",
      name: data?.name || "",
      price: data?.price || 0,
      section: data?.section,
      status: data?.status || Status["active"],
      billingSectionId:
        (data as any)?.billingSectionId ||
        (data as any)?.radiologyTestServices?.[0]?.service?.billingSectionId,
    },
    resolver: zodResolver(radiologyTestValidator),
  });

  const handleSubmit = async (values: RadiologyTestValidatorType) => {
    if (data) {
      await update({ ...values, testId: data.id });
    } else {
      await create(values);
    }
    form.reset();
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen} modal={false}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      {open && (
        <div
          data-state="open"
          data-slot="dialog-overlay"
          className="data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/50"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setOpen(false);
            }
          }}
        />
      )}
      <DialogContent
        onPointerDownOutside={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
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
        <CustomLayout
          title={data ? "Edit Radiology Test" : "Create Radiology Test"}
        >
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
                options={Object.values(RadiologySection).map((s) => ({
                  value: s,
                  label: s,
                }))}
                required
              />
              <FormInfiniteSelect<
                BillingSection,
                PaginatedResponse<BillingSection>,
                string,
                RadiologyTestValidatorType
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
                selectedItem={
                  ((data as any)?.billingSection ||
                    (data as any)?.radiologyTestServices?.[0]?.service
                      ?.billingSection) as any
                }
              />
              <FormField
                label="Rate"
                type="number"
                control={form.control}
                name="price"
                required
              />

              <div className="col-span-2">
                <CustomButton isLoading={creating || updating} type="submit">
                  {data ? "Update" : "Create"}
                </CustomButton>
              </div>
            </form>
          </Form>
        </CustomLayout>
      </DialogContent>
    </Dialog>
  );
};

export default RadiologyTestForm;
