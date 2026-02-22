"use client";

import { Form } from "@/components/ui/form";
import { useOpdInvoiceDetails, useUpdateOpdInvoice } from "@/hooks/query/opd";
import { useInfiniteServicesList } from "@/hooks/query/service";
import { InvoiceBillingItem } from "@/lib/type";
import {
  billingItemValidatorType,
  opdInvoiceValidator,
  opdInvoiceValidatorType,
} from "@/validators/api/opd/opd";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoaderIcon, PlusIcon, Trash2, User } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  ArrayPath,
  Path,
  useFieldArray,
  useForm,
  UseFormReturn,
} from "react-hook-form";

import { FormInfiniteSelect } from "@/components/form-inputs/FormInfiniteSelect";
import FormField from "@/components/form-inputs/FormField";
import { DiscountType } from "@/generated/prisma/enums";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import CustomButton from "@/components/common/CustomButton";
import { format } from "date-fns";
import CustomActionDropdown from "@/components/common/CustomActionDropdown";
import TransactionsModal from "@/components/common/TransactionsModal";
import AddPaymentModal from "@/components/opd/AddPayment";

const getSumOfBillingItem = (item: InvoiceBillingItem) => {
  return item.opdBillingItems.reduce((sum, item) => sum + item.total, 0);
};

type Props = {
  form: UseFormReturn<opdInvoiceValidatorType>;
  selectedIndex: number;
  data: InvoiceBillingItem;
};

type ServiceRowProps = {
  index: number;
  form: UseFormReturn<opdInvoiceValidatorType>;
  fieldName: Path<opdInvoiceValidatorType>;
  remove: (index: number) => void;
};

const ServiceRow = ({ index, form, fieldName, remove }: ServiceRowProps) => {
  const { control, watch, setValue, getValues } = form;
  const [serviceSearch, setServiceSearch] = useState("");
  const servicesQuery = useInfiniteServicesList({ name: serviceSearch }, 10);

  const rowPath = `${fieldName}.${index}` as Path<opdInvoiceValidatorType>;

  const service = watch(
    `${rowPath}.service` as Path<opdInvoiceValidatorType>,
  ) as billingItemValidatorType["service"];
  const quantity = watch(
    `${rowPath}.quantity` as Path<opdInvoiceValidatorType>,
  );
  const rate = watch(`${rowPath}.rate` as Path<opdInvoiceValidatorType>);
  const discountType = watch(
    `${rowPath}.discountType` as Path<opdInvoiceValidatorType>,
  );
  const discountValue = watch(
    `${rowPath}.discountValue` as Path<opdInvoiceValidatorType>,
  );
  const maxDiscount = watch(
    `${rowPath}.maxDiscount` as Path<opdInvoiceValidatorType>,
  );
  const total = watch(`${rowPath}.total` as Path<opdInvoiceValidatorType>);

  const flatServices = useMemo(
    () =>
      servicesQuery.data?.pages.flatMap((p) =>
        p.data.map((s) => ({
          id: s.id,
          name: s.name,
          price: s.price,
          maxDiscount: s.maxDiscount,
        })),
      ) || [],
    [servicesQuery.data],
  );

  useEffect(() => {
    const existingService = flatServices.find(
      (s) => s.id === Number(service?.id),
    );

    if (!existingService) return;

    setValue(
      `${rowPath}.rate` as Path<opdInvoiceValidatorType>,
      existingService.price,
    );
    setValue(`${rowPath}.quantity` as Path<opdInvoiceValidatorType>, 1);
    setValue(
      `${rowPath}.discountType` as Path<opdInvoiceValidatorType>,
      DiscountType.VALUE,
    );
    setValue(`${rowPath}.discountValue` as Path<opdInvoiceValidatorType>, 0);
    setValue(
      `${rowPath}.maxDiscount` as Path<opdInvoiceValidatorType>,
      existingService.maxDiscount ?? 0,
    );
  }, [service, flatServices]);

  useEffect(() => {
    const gross = Number(quantity) * Number(rate);

    const discount =
      discountType === "PERCENTAGE"
        ? (gross * Number(discountValue)) / 100
        : Number(discountValue);

    const newTotal = gross - discount;

    if (
      getValues(`${rowPath}.total` as Path<opdInvoiceValidatorType>) !==
      newTotal
    ) {
      setValue(`${rowPath}.total` as Path<opdInvoiceValidatorType>, newTotal);
    }
  }, [quantity, rate, discountType, discountValue]);

  const gross = Number(quantity) * Number(rate);
  const maxAllowed =
    discountType === "PERCENTAGE"
      ? (gross * (Number(maxDiscount) || 0)) / 100
      : maxDiscount || 0;

  const isInvalidDiscount = Number(discountValue) > Number(maxAllowed);

  return (
    <tr className="border-t align-top">
      <td>
        <div className="px-2 py-1">{index + 1}</div>
      </td>

      {/* SERVICE */}
      <td>
        <div className="px-2 py-1">
          <FormInfiniteSelect
            control={control}
            name={`${rowPath}.service` as Path<opdInvoiceValidatorType>}
            query={servicesQuery}
            getItems={(p) => p?.data}
            valueKey={(i) => String(i.id)}
            labelKey={(i) => i.name}
            search={serviceSearch}
            onSearchChange={setServiceSearch}
            placeholder="Service"
            hideError
          />
        </div>
      </td>

      {/* QTY */}
      <td>
        <div className="px-2 py-1">
          <FormField
            type="number"
            name={`${rowPath}.quantity` as Path<opdInvoiceValidatorType>}
            control={control}
            hideError
          />
        </div>
      </td>

      {/* RATE */}
      <td>
        <div className="px-2 py-1">
          <FormField
            type="number"
            name={`${rowPath}.rate` as Path<opdInvoiceValidatorType>}
            control={control}
            hideError
          />
        </div>
      </td>

      {/* DISC TYPE */}
      <td>
        <div className="px-2 py-1">
          <FormField
            type="select"
            name={`${rowPath}.discountType` as Path<opdInvoiceValidatorType>}
            control={control}
            options={Object.keys(DiscountType).map((t) => ({
              label: t,
              value: t,
            }))}
            hideError
          />
        </div>
      </td>

      {/* DISC VALUE */}
      <td>
        <div className="px-2 py-1">
          <FormField
            type="number"
            name={`${rowPath}.discountValue` as Path<opdInvoiceValidatorType>}
            control={control}
            hideError
          />
        </div>
        {isInvalidDiscount && (
          <p className="text-xs text-red-500">
            Exceeds max ({Number(maxDiscount)})
          </p>
        )}
      </td>

      {/* TOTAL */}
      <td className="font-semibold w-30">
        <div className="px-2 py-1 text-center">₹ {Number(total)}</div>
      </td>

      {/* REMOVE */}
      <td className="w-10">
        <div className="px-2 py-1">
          <button type="button" onClick={() => remove(index)}>
            <Trash2 className="size-2 text-destructive" />
          </button>
        </div>
      </td>
    </tr>
  );
};

const InvoiceBillingTable = ({ form, selectedIndex, data }: Props) => {
  const { control, watch } = form;

  const fieldName =
    `billingItem.${selectedIndex}.opdBillingItems` as ArrayPath<opdInvoiceValidatorType>;

  const { fields, append, remove } = useFieldArray({
    control,
    name: fieldName as ArrayPath<opdInvoiceValidatorType>,
  });

  if (selectedIndex === null) {
    return <div className="p-4 text-muted">Select billing section</div>;
  }

  return (
    <div className="space-y-3 p-2 h-full flex flex-col">
      {/* Add Row */}
      <div className="flex w-full justify-between items-center">
        <p className="text-sm font-medium capitalize">{data.name}</p>
        <button
          className="flex gap-1 items-center  text-tiny"
          type="button"
          onClick={() =>
            append({
              quantity: 1,
              discountType: "VALUE",
              discountValue: 0,
              total: 0,
              billingSection: { id: data.id, name: data.name },
              createdAt: new Date(),
            } as billingItemValidatorType)
          }
        >
          <PlusIcon className="size-2 text-black" /> <p>Add New Item</p>
        </button>
      </div>

      <div className="w-full overflow-auto flex-1">
        <table className="w-full border text-tiny">
          <thead className="bg-muted">
            <tr>
              <th>
                <div className="px-2 py-1">#</div>
              </th>
              <th className="w-62.5">
                <div className="px-2 py-1">Service</div>
              </th>
              <th>
                <div className="px-2 py-1">Qty</div>
              </th>
              <th>
                <div className="px-2 py-1">Rate</div>
              </th>
              <th>
                <div className="px-2 py-1">Disc Type</div>
              </th>
              <th>
                <div className="px-2 py-1">Discount</div>
              </th>
              <th>
                <div className="px-2 py-1">Total</div>
              </th>
              <th></th>
            </tr>
          </thead>

          <tbody>
            {fields.map((field, index) => (
              <ServiceRow
                key={field.id}
                index={index}
                form={form}
                fieldName={fieldName}
                remove={remove}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const InvoiceDetails = () => {
  const [transactionsOpen, setTransactionsOpen] = useState(false);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const { opdId }: { opdId: string } = useParams();
  const { data, isLoading } = useOpdInvoiceDetails({ opdId: Number(opdId) });
  const { mutateAsync, isPending } = useUpdateOpdInvoice();
  const router = useRouter();

  const form = useForm<opdInvoiceValidatorType>({
    resolver: zodResolver(opdInvoiceValidator),
  });

  const onSubmit = (values: opdInvoiceValidatorType) => {
    mutateAsync(values);
  };

  useEffect(() => {
    if (!data) return;

    form.reset({
      billingItem: data.billingItems.map((section) => ({
        id: section.id,
        opdBillingItems: section.opdBillingItems.map((item) => ({
          quantity: item.quantity,
          total: item.total,
          discountType: item.discountType,
          discountValue: item.discountValue,
          service: {
            ...item.service,
            maxDiscount: item.service.maxDiscount ?? 0,
          },
          rate: item.rate,
          billingSection: section,
          createdAt: new Date(),
        })),
      })),
      transactions: data.transactions,
      rate: data.rate,
      discountType: data.discountType,
      discountValue: data.discountValue,
      isFree: false,
      opdId: data.id,
    });
  }, [data]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <LoaderIcon className="animate-spin size-4" />
      </div>
    );
  }

  if (!data) return <div />;

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="h-full">
          <div className="w-full border flex items-center justify-between px-2 py-2 bg-white">
            <div className="flex gap-2">
              <CustomActionDropdown
                groups={[
                  {
                    label: "Transactions",
                    items: [
                      {
                        label: "Transaction History",
                        onClick: () => setTransactionsOpen(true),
                      },
                      {
                        label: "Add Transaction",
                        onClick: () => setPaymentModalOpen(true),
                      },
                    ],
                  },
                ]}
                align="start"
                triggerLabel="Payment"
              />
              <CustomButton disabled={isPending} type="submit">
                Save Invoice
              </CustomButton>
              <CustomButton
                type="button"
                onClick={() => router.push("/opd/patients")}
                className="bg-destructive"
              >
                Close
              </CustomButton>
            </div>
            <div className="flex gap-2">
              <Badge className="text-tiny! h-4 min-w-4 px-1 rounded-none bg-background text-black">
                <User className="fill-black size-2" />
                {data.patient?.firstName} {data.patient?.lastName}
              </Badge>

              <Badge className="text-tiny! h-4 min-w-4 px-1 rounded-none bg-secondary text-white">
                Invoice Number :{data.id}
              </Badge>

              <Badge
                variant="secondary"
                className="text-tiny! h-4 min-w-4 px-1 rounded-none bg-secondary text-white"
              >
                Invoice Date :{format(data.createdAt, "dd/MM/yyyy")}
              </Badge>
            </div>
          </div>
          <Tabs
            defaultValue={String(data.billingItems[0]?.id)}
            className="flex h-full overflow-hidden bg-white"
            orientation="vertical"
          >
            <div className="h-full border-r">
              <TabsList className="flex flex-col w-56 rounded-none p-0 items-stretch justify-start overflow-x-hidden overflow-y-auto">
                {data.billingItems.map((item) => (
                  <TabsTrigger
                    key={item.id}
                    value={String(item.id)}
                    className="flex w-full m-0 border-none items-start justify-between text-left rounded-none border-b px-3 py-2 text-tiny font-bold uppercase bg-white data-[state=active]:bg-secondary data-[state=active]:text-white data-[state=active]:shadow-none whitespace-normal h-auto"
                  >
                    <div className="flex w-full flex-col gap-0.5 text-left">
                      <span className="text-tiny font-bold">{item.name}</span>
                      <span className="text-tiny opacity-80">
                        ₹ {getSumOfBillingItem(item).toFixed(2)}
                      </span>
                    </div>
                    <Badge
                      variant="secondary"
                      className="text-tiny! h-4 min-w-4 px-1 rounded-full ml-1 shrink-0 bg-background text-black"
                    >
                      {item.opdBillingItems?.length}
                    </Badge>
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>

            {/* TAB CONTENT */}
            <div className="flex-1 overflow-hidden">
              {data.billingItems.map((item, index) => (
                <TabsContent
                  key={item.id}
                  value={String(item.id)}
                  className="h-full"
                >
                  <InvoiceBillingTable
                    form={form}
                    data={item}
                    selectedIndex={index}
                  />
                </TabsContent>
              ))}
            </div>
          </Tabs>
        </form>
      </Form>
      <TransactionsModal
        billId={data.id}
        open={transactionsOpen}
        onOpenChange={setTransactionsOpen}
        patientName={`${data.patient.firstName} ${data.patient.lastName}`}
        data={data.transactions || []}
        trigger={<div />}
      />
      <AddPaymentModal
        open={paymentModalOpen}
        onOpenChange={setPaymentModalOpen}
        billId={data.id}
        trigger={<div />}
      />
    </>
  );
};

export default InvoiceDetails;
