import React, { useEffect, useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { PlusIcon } from "lucide-react";
import {
  addOpdBillItemValidator,
  addOpdBillItemValidatorType,
} from "@/validators/api/opd/opd";
import { zodResolver } from "@hookform/resolvers/zod";
import { useInfiniteBillingSectionsList } from "@/hooks/query/bllingSection";
import { useInfiniteServicesList } from "@/hooks/query/service";
import { useForm } from "react-hook-form";
import { Form } from "../ui/form";
import CustomButton from "../common/CustomButton";
import FormField from "../form-inputs/FormField";
import { DiscountType } from "@/generated/prisma/enums";
import { useCreateOpdBillingItem } from "@/hooks/query/opd";
import AddPaymentModal from "./AddPayment";

interface Props {
  billId: number;
  billTotal: number;
  billPaid: number;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger?: React.ReactNode;
}

const AddInvoiceItemModal = ({
  billId,
  billTotal,
  billPaid,
  open,
  onOpenChange,
  trigger,
}: Props) => {
  const [billingItemSearch, setBillingItemSearch] = useState("");
  const [serviceSearch, setServiceSearch] = useState("");

  const { mutateAsync, isPending } = useCreateOpdBillingItem();

  const billingItemForm = useForm<addOpdBillItemValidatorType>({
    defaultValues: {
      billId: billId,
    },
    resolver: zodResolver(addOpdBillItemValidator),
  });

  const billingSectionId = billingItemForm.watch("billingSectionId");
  const serviceId = billingItemForm.watch("serviceId");
  const quantity = billingItemForm.watch("quantity");
  const rate = billingItemForm.watch("rate");
  const discountValue = billingItemForm.watch("discountValue");
  const discountType = billingItemForm.watch("discountType");

  const {
    data: billingItems,
    isFetchingNextPage: isFetchingNextPageBillingItems,
    hasNextPage: hasNextPageBillingItems,
    fetchNextPage: fetchNextPageBillingItems,
  } = useInfiniteBillingSectionsList({ name: billingItemSearch }, 10);

  const {
    data: services,
    isFetchingNextPage: isFetchingNextPageServices,
    hasNextPage: hasNextPageServices,
    fetchNextPage: fetchNextPageServices,
  } = useInfiniteServicesList(
    { name: serviceSearch, billingSectionId: billingSectionId as string },
    10,
  );

  const flatBillingItems = useMemo(
    () =>
      billingItems?.pages.flatMap((p) =>
        p.data.flatMap((f) => ({ label: f.name, value: f.id })),
      ),
    [billingItems],
  );

  const flatServices = useMemo(
    () =>
      services?.pages.flatMap((p) =>
        p.data.flatMap((f) => ({ ...f, label: f.name, value: f.id })),
      ),
    [services],
  );

  const onSubmit = (values: addOpdBillItemValidatorType) => {
    mutateAsync(values);
  };

  useEffect(() => {
    if (serviceId) {
      const service = flatServices?.find((s) => s.id === serviceId);
      if (!service) {
        billingItemForm.setValue("rate", 0);
        billingItemForm.setValue("discountValue", 0);
        billingItemForm.setValue("discountType", DiscountType["VALUE"]);
        billingItemForm.setValue("total", 0);
        billingItemForm.setValue("maxDiscount", 0);
        billingItemForm.setValue("quantity", 0);
      } else {
        billingItemForm.setValue("rate", service.price);
        billingItemForm.setValue("discountValue", 0);
        billingItemForm.setValue("discountType", DiscountType["VALUE"]);
        billingItemForm.setValue("total", service.price);
        billingItemForm.setValue("quantity", 1);
        billingItemForm.setValue("maxDiscount", service.maxDiscount);
      }
    } else {
      billingItemForm.setValue("rate", 0);
      billingItemForm.setValue("discountValue", 0);
      billingItemForm.setValue("discountType", DiscountType["VALUE"]);
      billingItemForm.setValue("total", 0);
      billingItemForm.setValue("quantity", 0);
      billingItemForm.setValue("maxDiscount", 0);
    }
  }, [serviceId, billingItemForm, flatServices]);

  useEffect(() => {
    if (serviceId) {
      const gross = Number(quantity) * Number(rate);
      const total =
        discountType === "PERCENTAGE"
          ? (gross * Number(discountValue)) / 100
          : gross - Number(discountValue);
      billingItemForm.setValue("total", total);
    } else {
      billingItemForm.setValue("quantity", 0);
    }
  }, [quantity, serviceId, billingItemForm, rate, discountType, discountValue]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button
            variant="outline"
            className="h-auto shadow-none p-1 cursor-pointer"
          >
            <PlusIcon className="size-2.5 text-destructive" />
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="max-w-3xl! border-secondary border-4 bg-white">
        <DialogHeader>
          <DialogTitle className="text-black/60 text-sm">
            Add Invoice Item
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 max-h-[70dvh] overflow-y-auto text-tiny">
          <Form {...billingItemForm}>
            <form onSubmit={billingItemForm.handleSubmit(onSubmit)}>
              <>
                <FormField
                  control={billingItemForm.control}
                  label="Date"
                  name="createdAt"
                  type="date"
                  required
                />

                <FormField
                  control={billingItemForm.control}
                  label="Billing Section"
                  name="billingSectionId"
                  type="infiniteSelect"
                  fetchNextPage={fetchNextPageBillingItems}
                  hasNextPage={hasNextPageBillingItems}
                  isFetchingNextPage={isFetchingNextPageBillingItems}
                  options={flatBillingItems || []}
                  onSearch={setBillingItemSearch}
                  required
                />
                <div className="col-span-2">
                  <FormField
                    control={billingItemForm.control}
                    label="Service"
                    name="serviceId"
                    type="infiniteSelect"
                    fetchNextPage={fetchNextPageServices}
                    hasNextPage={hasNextPageServices}
                    isFetchingNextPage={isFetchingNextPageServices}
                    options={flatServices || []}
                    onSearch={setServiceSearch}
                    required
                  />
                </div>
                <div className="col-span-2 grid grid-cols-5 space-x-2">
                  <FormField
                    control={billingItemForm.control}
                    label="Qty"
                    name="quantity"
                    type="number"
                    required
                  />
                  <FormField
                    control={billingItemForm.control}
                    label="Rate"
                    name="rate"
                    type="number"
                    required
                  />
                  <FormField
                    control={billingItemForm.control}
                    label="Discount Type"
                    name="discountType"
                    type="select"
                    options={Object.values(DiscountType).map((d) => ({
                      value: d,
                      label: d,
                    }))}
                    required
                  />
                  <FormField
                    control={billingItemForm.control}
                    label="Discount Value"
                    name="discountValue"
                    type="number"
                    required
                  />
                  <FormField
                    control={billingItemForm.control}
                    label="Total"
                    name="total"
                    type="number"
                    required
                    readOnly
                  />
                </div>
                <div className="col-span-2 space-x-2">
                  <div className="w-full flex justify-end gap-2">
                    <CustomButton
                      disabled={isPending}
                      type="submit"
                      className="self-end"
                    >
                      Save
                    </CustomButton>
                    <AddPaymentModal
                      billId={billId}
                      trigger={
                        <CustomButton type="button" className="self-end">
                          Payment Transaction
                        </CustomButton>
                      }
                    />
                  </div>
                </div>
              </>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddInvoiceItemModal;
