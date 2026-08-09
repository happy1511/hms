import { BillingSection } from "@/generated/prisma/client";
import { DiscountType, Status } from "@/generated/prisma/enums";
import { useInfiniteBillingSectionsList } from "@/hooks/query/bllingSection";
import { useCreateInvoiceBillingItem } from "@/hooks/query/invoice";
import { useInfiniteServicesList } from "@/hooks/query/service";
import { PaginatedResponse, ServiceDataType } from "@/lib/type";
import { getDiscountTypeOptions } from "@/lib/utils";
import {
  addInvoiceBillItemValidator,
  addInvoiceBillItemValidatorType,
} from "@/validators/api/invoice/invoice";
import { zodResolver } from "@hookform/resolvers/zod";
import { PlusIcon } from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import CustomButton from "../common/CustomButton";
import FormField from "../form-inputs/FormField";
import { FormInfiniteSelect } from "../form-inputs/FormInfiniteSelect";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Form } from "../ui/form";
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

  const { mutateAsync, isPending } = useCreateInvoiceBillingItem();

  const billingItemForm = useForm<addInvoiceBillItemValidatorType>({
    defaultValues: {
      id: billId,
      createdAt: new Date(),
    },
    resolver: zodResolver(addInvoiceBillItemValidator),
  });

  const selectedBillingSection = billingItemForm.watch("billingSection");
  const billingSectionId = selectedBillingSection?.id;

  const service = billingItemForm.watch("service");
  const serviceId = service?.id;

  const quantity = billingItemForm.watch("quantity");
  const rate = billingItemForm.watch("rate");
  const discountValue = billingItemForm.watch("discountValue");
  const discountType = billingItemForm.watch("discountType");

  const billingItemQuery = useInfiniteBillingSectionsList(
    { name: billingItemSearch, status: Status["active"] },
    20,
  );

  const servicesQuery = useInfiniteServicesList(
    {
      name: serviceSearch,
      status: Status["active"],
      billingSectionId: billingSectionId ? String(billingSectionId) : undefined,
    },
    20,
  );

  const flatServices = useMemo(
    () =>
      servicesQuery.data?.pages.flatMap((p) =>
        p.data.flatMap((f) => ({
          ...f,
          isEditableRate: Boolean(f.isEditableRate),
          label: f.name,
          value: f.id,
        })),
      ),
    [servicesQuery.data],
  );

  const existingService = useMemo(
    () => flatServices?.find((s) => s.id === Number(serviceId)),
    [flatServices, serviceId],
  );

  const canEditRate = Boolean(service?.isEditableRate ?? existingService?.isEditableRate);

  const onSubmit = async (values: addInvoiceBillItemValidatorType) => {
    await mutateAsync(values);
    billingItemForm.reset();
    onOpenChange?.(false);
  };

  useEffect(() => {
    const setIfChanged = (
      name: keyof addInvoiceBillItemValidatorType,
      value: any,
    ) => {
      if (billingItemForm.getValues(name) !== value) {
        billingItemForm.setValue(name, value);
      }
    };

    if (!serviceId) {
      setIfChanged("rate", 0);
      setIfChanged("discountValue", 0);
      setIfChanged("discountType", DiscountType["VALUE"]);
      setIfChanged("total", 0);
      setIfChanged("quantity", 0);
      return;
    }

    if (existingService) {
      setIfChanged("rate", existingService.price);
      setIfChanged("discountValue", 0);
      setIfChanged("discountType", DiscountType["VALUE"]);
      const qty = Number(billingItemForm.getValues("quantity")) || 1;
      setIfChanged("quantity", qty);
      setIfChanged("total", existingService.price * qty);
    }
  }, [serviceId, existingService]);

  useEffect(() => {
    if (!serviceId) return;

    const gross = Number(quantity) * Number(rate);

    const total =
      discountType === "PERCENTAGE"
        ? (gross * Number(discountValue)) / 100
        : gross - Number(discountValue);

    if (billingItemForm.getValues("total") !== total) {
      billingItemForm.setValue("total", total);
    }
  }, [quantity, rate, discountType, discountValue, serviceId]);


  return (
    <Dialog open={open} onOpenChange={onOpenChange} modal={false}>
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
      {open && (
        <div
          data-state="open"
          data-slot="dialog-overlay"
          className="data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/50"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              onOpenChange?.(false);
            }
          }}
        />
      )}
      <DialogContent
        onPointerDownOutside={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
        className="max-w-3xl! border-secondary border-4 bg-white"
      >
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

                <FormInfiniteSelect<
                  BillingSection,
                  PaginatedResponse<BillingSection>,
                  string,
                  addInvoiceBillItemValidatorType
                >
                  control={billingItemForm.control}
                  label="Billing Section"
                  name="billingSection"
                  query={billingItemQuery}
                  getItems={(p) => p?.data}
                  valueKey={(i) => String(i?.id)}
                  labelKey={(i) => i?.name}
                  placeholder="billing section"
                  searchValue={billingItemSearch}
                  onSearchChange={setBillingItemSearch}
                  storeObject
                  required
                />
                <div className="col-span-2">
                  <FormInfiniteSelect<
                    ServiceDataType,
                    PaginatedResponse<ServiceDataType>,
                    string,
                    addInvoiceBillItemValidatorType
                  >
                    control={billingItemForm.control}
                    label="Service"
                    name="service"
                    query={servicesQuery}
                    getItems={(p) => p?.data}
                    valueKey={(i) => String(i?.id)}
                    labelKey={(i) => i?.name}
                    placeholder="Select Services"
                    searchValue={serviceSearch}
                    onSearchChange={setServiceSearch}
                    storeObject
                    required
                  />
                </div>
                <div className="col-span-2 grid grid-cols-2 md:grid-cols-5 space-x-2">
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
                    disabled={!canEditRate}
                  />
                  <FormField
                    control={billingItemForm.control}
                    label="Discount Type"
                    name="discountType"
                    type="select"
                    options={getDiscountTypeOptions()}
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
                      isLoading={isPending}
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
