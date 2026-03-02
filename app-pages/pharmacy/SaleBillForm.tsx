"use client";

import CustomButton from "@/components/common/CustomButton";
import FormField from "@/components/form-inputs/FormField";
import { FormInfiniteSelect } from "@/components/form-inputs/FormInfiniteSelect";
import { Form } from "@/components/ui/form";
import { DiscountType, PaymentCategory, PaymentMode } from "@/generated/prisma/enums";
import { InventoryItemsGetPayload } from "@/generated/prisma/models";
import { useInfiniteDoctorList } from "@/hooks/query/doctor";
import { useInfiniteInventoryItems } from "@/hooks/query/pharmacyInventory";
import { useInfinitePatientsList } from "@/hooks/query/patient";
import {
  useCreateSaleBill,
  useGetSaleBill,
  useUpdateSaleBill,
} from "@/hooks/query/pharmacySaleBill";
import { Doctor, FilterValues, PaginatedResponse, PatientType } from "@/lib/type";
import { LoaderIcon, PlusIcon, Trash2 } from "lucide-react";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  Path,
  useFieldArray,
  useForm,
  UseFormReturn,
  useWatch,
} from "react-hook-form";
import { toast } from "sonner";

type InventoryItem = InventoryItemsGetPayload<{
  include: {
    drug: true;
    supplier: true;
  };
}>;

type SaleBillFormValues = {
  name: string;
  patient?: PatientType | null;
  doctor?: Doctor | null;
  billingType: PaymentCategory;
  discountType: DiscountType;
  discountValue: number;
  isFree: boolean;
  createdAt: Date;
  items: {
    inventoryItem?: InventoryItem | null;
    quantity: number;
    rate: number;
    discountType: DiscountType;
    discountValue: number;
    taxableAmount?: number;
    gstAmount?: number;
    total: number;
  }[];
  transactions: {
    amount: number;
    mode: PaymentMode;
    remarks?: string | null;
  }[];
};

const toValidDate = (value: unknown) => {
  if (value instanceof Date && !Number.isNaN(value.getTime())) return value;
  if (typeof value === "string" || typeof value === "number") {
    const parsed = new Date(value);
    if (!Number.isNaN(parsed.getTime())) return parsed;
  }
  return new Date();
};

const getInitialValues = (
  data?: any,
): SaleBillFormValues => {
  if (!data) {
    return {
      name: "",
      patient: null,
      doctor: null,
      billingType: PaymentCategory.SELF_PAY,
      discountType: DiscountType.VALUE,
      discountValue: 0,
      isFree: false,
      createdAt: new Date(),
      items: [],
      transactions: [],
    };
  }

  return {
    name: data.name,
    patient: data.patient ?? null,
    doctor: data.doctor ?? null,
    billingType: data.invoice?.billingType ?? PaymentCategory.SELF_PAY,
    discountType: data.invoice?.discountType ?? DiscountType.VALUE,
    discountValue: data.invoice?.discountValue ?? 0,
    isFree: data.invoice?.isFree ?? false,
    createdAt: toValidDate(data.invoice?.createdAt),
    items:
      data.saleItems?.map((item: any) => ({
        inventoryItem: item.inventoryItem,
        quantity: item.quantity,
        rate: item.rate,
        discountType: item.discountType,
        discountValue: item.discountValue,
        taxableAmount: item.taxableAmount,
        gstAmount: item.gstAmount,
        total: item.total,
      })) ?? [],
    transactions:
      data.invoice?.transactions?.map((t: any) => ({
        amount: t.amount,
        mode: t.mode,
        remarks: t.remarks,
      })) ?? [],
  };
};

const SaleItemRow = ({
  index,
  form,
}: {
  index: number;
  form: UseFormReturn<SaleBillFormValues>;
}) => {
  const [inventorySearch, setInventorySearch] = useState("");
  const inventoryQuery = useInfiniteInventoryItems(
    { name: inventorySearch } as FilterValues,
    10,
  );
  const { control, setValue, getValues } = form;
  const { remove } = useFieldArray({
    control,
    name: "items",
  });

  const rowPath = `items.${index}` as Path<SaleBillFormValues>;
  const inventoryItem = useWatch({
    control,
    name: `${rowPath}.inventoryItem` as Path<SaleBillFormValues>,
  }) as InventoryItem | null | undefined;
  const quantity = useWatch({
    control,
    name: `${rowPath}.quantity` as Path<SaleBillFormValues>,
  });
  const rate = useWatch({
    control,
    name: `${rowPath}.rate` as Path<SaleBillFormValues>,
  });
  const discountType = useWatch({
    control,
    name: `${rowPath}.discountType` as Path<SaleBillFormValues>,
  });
  const discountValue = useWatch({
    control,
    name: `${rowPath}.discountValue` as Path<SaleBillFormValues>,
  });
  const gstAmount = Number(
    useWatch({
      control,
      name: `${rowPath}.gstAmount` as Path<SaleBillFormValues>,
    }) || 0,
  );
  const rowTotal = Number(
    useWatch({
      control,
      name: `${rowPath}.total` as Path<SaleBillFormValues>,
    }) || 0,
  );
  const isOverStock =
    inventoryItem && Number(quantity || 0) > Number(inventoryItem.quantityInStock);

  useEffect(() => {
    if (!inventoryItem) return;
    const currentRate = Number(
      getValues(`${rowPath}.rate` as Path<SaleBillFormValues>),
    );
    const currentQty = Number(
      getValues(`${rowPath}.quantity` as Path<SaleBillFormValues>),
    );

    if (!currentRate) {
      setValue(
        `${rowPath}.rate` as Path<SaleBillFormValues>,
        inventoryItem.sellingPrice as never,
      );
    }
    if (!currentQty) {
      setValue(`${rowPath}.quantity` as Path<SaleBillFormValues>, 1 as never);
    }
  }, [inventoryItem, getValues, rowPath, setValue]);

  useEffect(() => {
    const q = Number(quantity) || 0;
    const r = Number(rate) || 0;
    const d = Number(discountValue) || 0;
    const gross = q * r;
    const discount =
      discountType === DiscountType.PERCENTAGE ? (gross * d) / 100 : d;
    const net = Math.max(Number((gross - discount).toFixed(2)), 0);
    const gstPct = Number(inventoryItem?.drug?.gstPercentage ?? 0);
    const cPct = Number(inventoryItem?.drug?.cGstPercentage ?? 0);
    const sPct = Number(inventoryItem?.drug?.sGstPercentage ?? 0);
    const iPct = Number(inventoryItem?.drug?.iGstPercentage ?? 0);
    const explicitTax = (net * cPct) / 100 + (net * sPct) / 100 + (net * iPct) / 100;
    const fallbackTax = (net * gstPct) / 100;
    const tax = Number((explicitTax > 0 ? explicitTax : fallbackTax).toFixed(2));
    const finalTotal = Number((net + tax).toFixed(2));

    const currentTaxable = Number(
      getValues(`${rowPath}.taxableAmount` as Path<SaleBillFormValues>),
    );
    if (currentTaxable !== net) {
      setValue(`${rowPath}.taxableAmount` as Path<SaleBillFormValues>, net as never, {
        shouldValidate: false,
        shouldDirty: true,
      });
    }
    const currentTax = Number(
      getValues(`${rowPath}.gstAmount` as Path<SaleBillFormValues>),
    );
    if (currentTax !== tax) {
      setValue(`${rowPath}.gstAmount` as Path<SaleBillFormValues>, tax as never, {
        shouldValidate: false,
        shouldDirty: true,
      });
    }

    const currentTotal = Number(
      getValues(`${rowPath}.total` as Path<SaleBillFormValues>),
    );
    if (currentTotal !== finalTotal) {
      setValue(`${rowPath}.total` as Path<SaleBillFormValues>, finalTotal as never, {
        shouldValidate: false,
        shouldDirty: true,
      });
    }
  }, [
    quantity,
    rate,
    discountType,
    discountValue,
    inventoryItem,
    getValues,
    rowPath,
    setValue,
  ]);

  return (
    <tr className="border-t align-top">
      <td>
        <div className="px-2 py-2">{index + 1}</div>
      </td>
      <td>
        <div className="px-2 py-1">
          <FormInfiniteSelect<
            InventoryItem,
            PaginatedResponse<InventoryItem>,
            string,
            SaleBillFormValues
          >
            control={control}
            name={`${rowPath}.inventoryItem` as Path<SaleBillFormValues>}
            query={inventoryQuery}
            getItems={(p) => p?.data}
            valueKey={(i) => String(i.id)}
            labelKey={(i) =>
              `${i.drug.name} | Batch ${i.batchNo} | Stock ${i.quantityInStock}`
            }
            search={inventorySearch}
            onSearchChange={setInventorySearch}
            placeholder="Select Inventory Drug"
            hideError
          />
          {inventoryItem && (
            <div className="text-[10px] text-muted-foreground mt-1">
              Stock: {inventoryItem.quantityInStock} | Supplier:{" "}
              {inventoryItem.supplier.name}
            </div>
          )}
          {inventoryItem && (
            <div className="text-[10px] text-muted-foreground">
              GST: {inventoryItem.drug.gstPercentage}% | CGST:{" "}
              {inventoryItem.drug.cGstPercentage}% | SGST:{" "}
              {inventoryItem.drug.sGstPercentage}% | IGST:{" "}
              {inventoryItem.drug.iGstPercentage}%
            </div>
          )}
          {isOverStock && (
            <div className="text-[10px] text-destructive mt-1">
              Quantity exceeds available stock
            </div>
          )}
        </div>
      </td>
      <td>
        <div className="px-2 py-1">
          <FormField
            type="number"
            name={`${rowPath}.quantity` as Path<SaleBillFormValues>}
            control={control}
            hideError
          />
        </div>
      </td>
      <td>
        <div className="px-2 py-1">
          <FormField
            type="number"
            name={`${rowPath}.rate` as Path<SaleBillFormValues>}
            control={control}
            hideError
          />
        </div>
      </td>
      <td>
        <div className="px-2 py-1">
          <FormField
            type="select"
            options={Object.values(DiscountType).map((d) => ({
              value: d,
              label: d,
            }))}
            name={`${rowPath}.discountType` as Path<SaleBillFormValues>}
            control={control}
            hideError
          />
        </div>
      </td>
      <td>
        <div className="px-2 py-1">
          <FormField
            type="number"
            name={`${rowPath}.discountValue` as Path<SaleBillFormValues>}
            control={control}
            hideError
          />
        </div>
      </td>
      <td className="font-medium">
        <div className="px-2 py-2 text-center">
          Rs. {gstAmount.toFixed(2)}
        </div>
      </td>
      <td className="font-semibold">
        <div className="px-2 py-2 text-center">
          Rs. {rowTotal.toFixed(2)}
        </div>
      </td>
      <td className="w-10">
        <div className="px-2 py-2">
          <button type="button" onClick={() => remove(index)}>
            <Trash2 className="size-2 text-destructive" />
          </button>
        </div>
      </td>
    </tr>
  );
};

const SaleItemsTable = ({ form }: { form: UseFormReturn<SaleBillFormValues> }) => {
  const { control } = form;
  const { fields, append } = useFieldArray({
    control,
    name: "items",
  });

  return (
    <div className="space-y-3 p-2 h-full flex flex-col">
      <div className="flex w-full justify-between items-center">
        <button
          className="flex gap-1 items-center text-tiny"
          type="button"
          onClick={() =>
            append({
              inventoryItem: null,
              quantity: 1,
              rate: 0,
              discountType: DiscountType.VALUE,
              discountValue: 0,
              taxableAmount: 0,
              gstAmount: 0,
              total: 0,
            })
          }
        >
          <PlusIcon className="size-2 text-black" />
          <p>Add Drug Item</p>
        </button>
      </div>

      <div className="w-full flex-1">
        <table className="w-full border text-tiny">
          <thead className="bg-muted">
            <tr>
              <th>
                <div className="px-2 py-1">#</div>
              </th>
              <th className="w-[380px]">
                <div className="px-2 py-1">Drug (Inventory)</div>
              </th>
              <th>
                <div className="px-2 py-1">Qty</div>
              </th>
              <th>
                <div className="px-2 py-1">Rate</div>
              </th>
              <th>
                <div className="px-2 py-1">Discount Type</div>
              </th>
              <th>
                <div className="px-2 py-1">Discount</div>
              </th>
              <th>
                <div className="px-2 py-1">Tax</div>
              </th>
              <th>
                <div className="px-2 py-1">Total</div>
              </th>
              <th />
            </tr>
          </thead>
          <tbody>
            {fields.map((field, index) => (
              <SaleItemRow key={field.id} index={index} form={form} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const TransactionRows = ({
  form,
}: {
  form: UseFormReturn<SaleBillFormValues>;
}) => {
  const { control } = form;
  const { fields, append, remove } = useFieldArray({
    control,
    name: "transactions",
  });

  return (
    <div className="space-y-2 p-2">
      <div className="flex justify-between items-center">
        <p className="text-sm font-medium">Transactions</p>
        <button
          className="flex gap-1 items-center text-tiny"
          type="button"
          onClick={() =>
            append({
              amount: 0,
              mode: PaymentMode.CASH,
              remarks: "",
            })
          }
        >
          <PlusIcon className="size-2 text-black" />
          <p>Add Transaction</p>
        </button>
      </div>
      {fields.map((field, index) => {
        const rowPath = `transactions.${index}` as Path<SaleBillFormValues>;
        return (
          <div key={field.id} className="grid grid-cols-12 gap-2 items-end">
            <div className="col-span-3">
              <FormField
                label="Amount"
                type="number"
                name={`${rowPath}.amount` as Path<SaleBillFormValues>}
                control={control}
              />
            </div>
            <div className="col-span-3">
              <FormField
                label="Mode"
                type="select"
                options={Object.values(PaymentMode).map((m) => ({
                  value: m,
                  label: m,
                }))}
                name={`${rowPath}.mode` as Path<SaleBillFormValues>}
                control={control}
              />
            </div>
            <div className="col-span-5">
              <FormField
                label="Remarks"
                type="text"
                name={`${rowPath}.remarks` as Path<SaleBillFormValues>}
                control={control}
              />
            </div>
            <div className="col-span-1 pb-2">
              <button type="button" onClick={() => remove(index)}>
                <Trash2 className="size-2 text-destructive" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};

const UpdateCreateForm = ({ data }: { data?: any }) => {
  const [doctorSearch, setDoctorSearch] = useState("");
  const [patientSearch, setPatientSearch] = useState("");
  const { mutateAsync: create, isPending: creating } = useCreateSaleBill();
  const { mutateAsync: update, isPending: updating } = useUpdateSaleBill();
  const params: { billId: string } = useParams();
  const doctorQuery = useInfiniteDoctorList({ name: doctorSearch }, 10);
  const patientQuery = useInfinitePatientsList({ name: patientSearch }, 10);

  const form = useForm<SaleBillFormValues>({
    defaultValues: getInitialValues(data),
  });

  useEffect(() => {
    if (data) {
      form.reset(getInitialValues(data));
    }
  }, [data, form]);

  const watchedItems = useWatch({
    control: form.control,
    name: "items",
  });
  const items = useMemo(() => watchedItems ?? [], [watchedItems]);
  const invoiceDiscountType = useWatch({
    control: form.control,
    name: "discountType",
  });
  const invoiceDiscountValue = Number(
    useWatch({
      control: form.control,
      name: "discountValue",
    }) || 0,
  );
  const isFree = Boolean(
    useWatch({
      control: form.control,
      name: "isFree",
    }),
  );

  const subTotal = useMemo(
    () => items.reduce((sum, item) => sum + Number(item.total || 0), 0),
    [items],
  );
  const taxableSubTotal = useMemo(
    () => items.reduce((sum, item) => sum + Number(item.taxableAmount || 0), 0),
    [items],
  );
  const taxTotal = useMemo(
    () => items.reduce((sum, item) => sum + Number(item.gstAmount || 0), 0),
    [items],
  );
  const invoiceDiscount =
    invoiceDiscountType === DiscountType.PERCENTAGE
      ? (subTotal * invoiceDiscountValue) / 100
      : invoiceDiscountValue;
  const grandTotal = isFree ? 0 : Math.max(subTotal - invoiceDiscount, 0);

  const onSubmit = (values: SaleBillFormValues) => {
    if (!values.items.length) {
      toast.error("Add at least one sale item");
      return;
    }

    const hasInvalidInventory = values.items.some((item) => !item.inventoryItem?.id);
    if (hasInvalidInventory) {
      toast.error("Select inventory item for all rows");
      return;
    }

    const hasOverStock = values.items.some(
      (item) => Number(item.quantity) > Number(item.inventoryItem?.quantityInStock ?? 0),
    );
    if (hasOverStock) {
      toast.error("One or more rows exceed available stock");
      return;
    }

    const payload = {
      name: values.name,
      patientId: values.patient?.id ? Number(values.patient.id) : undefined,
      doctorId: values.doctor?.userId ? Number(values.doctor.userId) : undefined,
      billingType: values.billingType,
      discountType: values.discountType,
      discountValue: Number(values.discountValue || 0),
      isFree: Boolean(values.isFree),
      createdAt: toValidDate(values.createdAt),
      items: values.items.map((item) => ({
        inventoryItem: { id: Number(item.inventoryItem?.id) },
        quantity: Number(item.quantity),
        rate: Number(item.rate),
        discountType: item.discountType,
        discountValue: Number(item.discountValue || 0),
        total: Number(item.total || 0),
      })),
      transactions: values.isFree
        ? []
        : values.transactions.map((t) => ({
            amount: Number(t.amount),
            mode: t.mode,
            remarks: t.remarks ?? null,
          })),
    };

    if (params?.billId) {
      update({
        billId: Number(params.billId),
        ...payload,
      });
    } else {
      create(payload);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
        <div className="grid grid-cols-3 gap-2">
          <FormField<SaleBillFormValues>
            label="Sale Bill Name"
            type="text"
            name="name"
            control={form.control}
            required
          />
          <FormField<SaleBillFormValues>
            label="Bill Date"
            type="date"
            name="createdAt"
            control={form.control}
            required
          />
          <FormField<SaleBillFormValues>
            label="Billing Type"
            type="select"
            options={Object.values(PaymentCategory).map((b) => ({
              value: b,
              label: b,
            }))}
            name="billingType"
            control={form.control}
            required
          />
          <FormInfiniteSelect<
            PatientType,
            PaginatedResponse<PatientType>,
            string,
            SaleBillFormValues
          >
            label="Patient (Optional)"
            name="patient"
            control={form.control}
            query={patientQuery}
            getItems={(p) => p?.data}
            valueKey={(i) => String(i.id)}
            labelKey={(i) => `${i.uhid} | ${i.firstName} ${i.lastName}`}
            search={patientSearch}
            onSearchChange={setPatientSearch}
            placeholder="Search patient by name/UHID"
          />
          <FormInfiniteSelect<
            Doctor,
            PaginatedResponse<Doctor>,
            string,
            SaleBillFormValues
          >
            label="Doctor (Optional)"
            name="doctor"
            control={form.control}
            query={doctorQuery}
            getItems={(p) => p?.data}
            valueKey={(i) => String(i.userId)}
            labelKey={(i) => i.user?.name ?? ""}
            search={doctorSearch}
            onSearchChange={setDoctorSearch}
          />
          <FormField<SaleBillFormValues>
            label="Free Bill"
            type="checkbox"
            name="isFree"
            control={form.control}
          />
        </div>

        <SaleItemsTable form={form} />

        <div className="grid grid-cols-5 gap-2">
          <FormField<SaleBillFormValues>
            label="Invoice Discount Type"
            type="select"
            options={Object.values(DiscountType).map((d) => ({
              value: d,
              label: d,
            }))}
            name="discountType"
            control={form.control}
          />
          <FormField<SaleBillFormValues>
            label="Invoice Discount Value"
            type="number"
            name="discountValue"
            control={form.control}
          />
          <div className="rounded border px-3 py-2 text-sm">
            <p className="text-muted-foreground">Taxable Subtotal</p>
            <p className="font-semibold">Rs. {taxableSubTotal.toFixed(2)}</p>
          </div>
          <div className="rounded border px-3 py-2 text-sm">
            <p className="text-muted-foreground">Tax Total</p>
            <p className="font-semibold">Rs. {taxTotal.toFixed(2)}</p>
          </div>
          <div className="rounded border px-3 py-2 text-sm">
            <p className="text-muted-foreground">Grand Total</p>
            <p className="font-semibold">Rs. {grandTotal.toFixed(2)}</p>
          </div>
        </div>

        {!isFree && <TransactionRows form={form} />}

        <CustomButton disabled={creating || updating} type="submit">
          {params?.billId ? "Update Sale Bill" : "Create Sale Bill"}
        </CustomButton>
      </form>
    </Form>
  );
};

const SaleBillForm = () => {
  const params: { billId: string } = useParams();
  const { data, isLoading } = useGetSaleBill(params?.billId);

  if (isLoading && params?.billId) {
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

  if (params?.billId && !data) {
    return <div />;
  }

  return <UpdateCreateForm data={data} />;
};

export default SaleBillForm;
