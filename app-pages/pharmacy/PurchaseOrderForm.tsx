"use client";

import CustomButton from "@/components/common/CustomButton";
import CustomLayout from "@/components/common/CustomLayout";
import NoPermission from "@/components/common/NoPermission";
import FormField from "@/components/form-inputs/FormField";
import { FormInfiniteSelect } from "@/components/form-inputs/FormInfiniteSelect";
import CreateSupplierModal from "@/components/pharmacy/CreateSupplierModal";
import { Form } from "@/components/ui/form";
import {
  DrugBillingCategory,
  DrugSupplier,
} from "@/generated/prisma/client";
import { ActionType, ModuleType, Status } from "@/generated/prisma/enums";
import { useProfile } from "@/hooks/query/auth";
import { useInfiniteDrugList } from "@/hooks/query/drug";
import { useInfiniteDrugBillingCategoryList } from "@/hooks/query/drugBillingCategory";
import { useInfiniteDrugSupplierList } from "@/hooks/query/drugSupplier";
import { useInfiniteHsnSacList } from "@/hooks/query/hsnSac";
import {
  useCreatePurchaseOrder,
  useGetPurchaseOrder,
  useUpdatePurchaseOrder,
} from "@/hooks/query/pharmacyPurchaseOrder";
import {
  calculatePurchaseOrderLine,
  calculatePurchaseOrderSummary,
} from "@/lib/pharmacyPurchaseOrder";
import {
  HsnSacType,
  PaginatedResponse,
  PharmacyDrugType,
  PharmacyPurchaseOrderType,
} from "@/lib/type";
import { hasActionPermission } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoaderIcon, PlusIcon, Trash2 } from "lucide-react";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Path,
  useFieldArray,
  useForm,
  UseFormReturn,
  useWatch,
} from "react-hook-form";
import {
  purchaseOrderValidator,
  purchaseOrderValidatorType,
} from "@/validators/api/masters/pharmacyPurchase";

type PurchaseOrderData = PharmacyPurchaseOrderType;

type PurchaseOrderItemForm = purchaseOrderValidatorType["items"][number];

const normalizeItems = (items: purchaseOrderValidatorType["items"] = []) =>
  items.map((item) => ({
    quantity: Number(item?.quantity || 0),
    rate: Number(item?.rate || 0),
    discountPercentage: Number(item?.discountPercentage || 0),
    hsnSac: item?.hsnSac
      ? {
          cGstPercentage: Number(item.hsnSac.cGstPercentage || 0),
          sGstPercentage: Number(item.hsnSac.sGstPercentage || 0),
          iGstPercentage: Number(item.hsnSac.iGstPercentage || 0),
        }
      : undefined,
  }));

const money = (value: number) => Number(value || 0).toFixed(2);

const getEmptyItem = (): PurchaseOrderItemForm => ({
  quantity: 1,
  discountPercentage: 0,
  rate: 0,
  total: 0,
  hsnSacCode: undefined,
  drug: {
    id: undefined as unknown as number,
    name: "",
  },
  hsnSac: undefined,
  category: undefined,
});

const getInitialValues = (
  data?: PurchaseOrderData,
): purchaseOrderValidatorType => ({
  supplier: data?.supplier ?? { id: undefined as unknown as number },
  orderDate: data?.orderDate ?? new Date(),
  remarks: data?.remarks ?? "",
  termsAndConditions: data?.termsAndConditions ?? "",
  packingForwarding: data?.packingForwarding ?? 0,
  tcsAmount: data?.tcsAmount ?? 0,
  roundOffAmount: data?.roundOffAmount ?? 0,
  items: data?.items?.length
    ? data.items.map((item) => ({
        quantity: item.quantity,
        discountPercentage: item.discountPercentage,
        rate: item.rate,
        total: item.total,
        hsnSacCode: item.hsnSacCode ?? undefined,
        drug: {
          id: item.drug.id,
          name: item.drug.name,
        },
        hsnSac: item.hsnSac ?? undefined,
        category: item.category ?? undefined,
      }))
    : [getEmptyItem()],
});

const SummaryField = ({ label, value }: { label: string; value: string }) => (
  <div className="grid grid-cols-[1fr_120px] border-b border-black/15 last:border-b-0">
    <div className="border-r border-black/15 px-2 py-1 text-tiny font-medium">
      {label}
    </div>
    <div className="bg-white px-2 py-1 text-right text-tiny">{value}</div>
  </div>
);

const SummaryInput = ({
  label,
  name,
  form,
}: {
  label: string;
  name: Path<purchaseOrderValidatorType>;
  form: UseFormReturn<purchaseOrderValidatorType>;
}) => (
  <div className="grid grid-cols-[1fr_120px] border-b border-black/15 last:border-b-0">
    <div className="border-r border-black/15 px-2 py-1 text-tiny font-medium">
      {label}
    </div>
    <div className="bg-white px-1 py-1">
      <FormField<purchaseOrderValidatorType>
        type="number"
        name={name}
        control={form.control}
        hideError
        className="h-6 px-1 text-right shadow-none"
      />
    </div>
  </div>
);

const PurchaseOrderRow = ({
  index,
  form,
  onRemove,
}: {
  index: number;
  form: UseFormReturn<purchaseOrderValidatorType>;
  onRemove: (index: number) => void;
}) => {
  const [drugSearch, setDrugSearch] = useState("");
  const [categorySearch, setCategorySearch] = useState("");
  const [hsnSacSearch, setHsnSacSearch] = useState("");
  const drugsQuery = useInfiniteDrugList(
    { name: drugSearch, status: Status.active },
    10,
  );
  const categoryQuery = useInfiniteDrugBillingCategoryList(
    { name: categorySearch, status: Status.active },
    10,
  );
  const hsnSacQuery = useInfiniteHsnSacList(
    { name: hsnSacSearch, status: Status.active },
    10,
  );

  const rowPath = `items.${index}` as const;
  const item = useWatch({
    control: form.control,
    name: rowPath as Path<purchaseOrderValidatorType>,
  }) as PurchaseOrderItemForm | undefined;
  const line = calculatePurchaseOrderLine(
    normalizeItems(item ? [item] : [])[0] || {},
  );

  useEffect(() => {
    const currentHsnSacCode = form.getValues(
      `${rowPath}.hsnSacCode` as Path<purchaseOrderValidatorType>,
    );

    if (
      (currentHsnSacCode === undefined ||
        currentHsnSacCode === null ||
        currentHsnSacCode === 0) &&
      item?.hsnSac?.code
    ) {
      form.setValue(
        `${rowPath}.hsnSacCode` as Path<purchaseOrderValidatorType>,
        Number(item.hsnSac.code),
        { shouldDirty: true, shouldValidate: false },
      );
    }
  }, [form, item?.hsnSac?.code, rowPath]);

  useEffect(() => {
    const selectedHsnSac = item?.hsnSac;
    if (!selectedHsnSac) {
      return;
    }

    const currentCode = Number(
      form.getValues(`${rowPath}.hsnSacCode` as Path<purchaseOrderValidatorType>) || 0,
    );

    if (currentCode !== Number(selectedHsnSac.code)) {
      form.setValue(
        `${rowPath}.hsnSacCode` as Path<purchaseOrderValidatorType>,
        Number(selectedHsnSac.code),
        { shouldDirty: true, shouldValidate: false },
      );
    }
  }, [form, item?.hsnSac, rowPath]);

  useEffect(() => {
    const currentTotal = Number(
      form.getValues(`${rowPath}.total` as Path<purchaseOrderValidatorType>) ||
        0,
    );

    if (currentTotal !== line.lineTotal) {
      form.setValue(
        `${rowPath}.total` as Path<purchaseOrderValidatorType>,
        line.lineTotal,
        { shouldDirty: true, shouldValidate: false },
      );
    }
  }, [form, line.lineTotal, rowPath]);

  return (
    <tr className="border-t border-black/20 bg-white align-top">
      <td className="border-r border-black/20 px-2 py-1 min-w-22">
        <div className="flex items-center gap-2">
          <span className="inline-flex min-w-5 items-center justify-center rounded-sm border border-black/15 px-1 py-0.5 text-[11px] font-semibold">
            {index + 1}
          </span>
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-sm border border-destructive/20 p-1 text-destructive transition hover:bg-destructive/5"
            onClick={() => onRemove(index)}
            aria-label={`Remove item ${index + 1}`}
          >
            <Trash2 className="size-3" />
          </button>
        </div>
      </td>

      <td className="border-r border-black/20 px-1 py-1 min-w-56">
        <FormInfiniteSelect<
          PharmacyDrugType,
          PaginatedResponse<PharmacyDrugType>,
          string,
          purchaseOrderValidatorType
        >
          name={`${rowPath}.drug` as Path<purchaseOrderValidatorType>}
          control={form.control}
          query={drugsQuery}
          getItems={(page) => page?.data}
          valueKey={(drug) => String(drug.id)}
          labelKey={(drug) => drug.name}
          search={drugSearch}
          onSearchChange={setDrugSearch}
          placeholder="Select Item"
          hideError
        />
      </td>

      <td className="border-r border-black/20 px-1 py-1 min-w-36">
        <FormInfiniteSelect<
          DrugBillingCategory,
          PaginatedResponse<DrugBillingCategory>,
          string,
          purchaseOrderValidatorType
        >
          name={`${rowPath}.category` as Path<purchaseOrderValidatorType>}
          control={form.control}
          query={categoryQuery}
          getItems={(page) => page?.data}
          valueKey={(category) => String(category.id)}
          labelKey={(category) => category.name}
          search={categorySearch}
          onSearchChange={setCategorySearch}
          placeholder="Select Category"
          hideError
        />
      </td>

      <td className="border-r border-black/20 px-1 py-1 min-w-40">
        <FormInfiniteSelect<
          HsnSacType,
          PaginatedResponse<HsnSacType>,
          string,
          purchaseOrderValidatorType
        >
          name={`${rowPath}.hsnSac` as Path<purchaseOrderValidatorType>}
          control={form.control}
          query={hsnSacQuery}
          getItems={(page) => page?.data}
          valueKey={(hsnSac) => String(hsnSac.id)}
          labelKey={(hsnSac) =>
            `${hsnSac.code} | CGST ${hsnSac.cGstPercentage}% | SGST ${hsnSac.sGstPercentage}% | IGST ${hsnSac.iGstPercentage}%`
          }
          search={hsnSacSearch}
          onSearchChange={setHsnSacSearch}
          placeholder="Select HSN/SAC"
          hideError
        />
      </td>

      <td className="border-r border-black/20 px-1 py-1 min-w-18">
        <FormField<purchaseOrderValidatorType>
          type="number"
          name={`${rowPath}.quantity` as Path<purchaseOrderValidatorType>}
          control={form.control}
          hideError
        />
      </td>

      <td className="border-r border-black/20 px-1 py-1 min-w-24">
        <FormField<purchaseOrderValidatorType>
          type="number"
          name={`${rowPath}.rate` as Path<purchaseOrderValidatorType>}
          control={form.control}
          hideError
        />
      </td>

      <td className="border-r border-black/20 px-1 py-1 min-w-20">
        <FormField<purchaseOrderValidatorType>
          type="number"
          name={
            `${rowPath}.discountPercentage` as Path<purchaseOrderValidatorType>
          }
          control={form.control}
          hideError
        />
      </td>

      <td className="border-r border-black/20 px-2 py-2 text-center min-w-18">
        {Number(item?.hsnSac?.cGstPercentage || 0)}%
      </td>

      <td className="border-r border-black/20 px-2 py-2 text-center min-w-18">
        {Number(item?.hsnSac?.sGstPercentage || 0)}%
      </td>

      <td className="border-r border-black/20 px-2 py-2 text-center min-w-18">
        {Number(item?.hsnSac?.iGstPercentage || 0)}%
      </td>

      <td className="border-r border-black/20 px-2 py-2 text-right min-w-24">
        {money(line.taxableAmount)}
      </td>

      <td className="px-2 py-2 text-right font-semibold min-w-24">
        {money(line.lineTotal)}
      </td>
    </tr>
  );
};

const PurchaseOrderItemsTable = ({
  form,
}: {
  form: UseFormReturn<purchaseOrderValidatorType>;
}) => {
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  });

  const items = (useWatch({
    control: form.control,
    name: "items",
  }) || []) as purchaseOrderValidatorType["items"];
  const packingForwarding = useWatch({
    control: form.control,
    name: "packingForwarding",
  });
  const tcsAmount = useWatch({
    control: form.control,
    name: "tcsAmount",
  });
  const roundOffAmount = useWatch({
    control: form.control,
    name: "roundOffAmount",
  });
  const normalizedItems = normalizeItems(items);
  const summary = calculatePurchaseOrderSummary(normalizedItems, {
    packingForwarding: Number(packingForwarding || 0),
    tcsAmount: Number(tcsAmount || 0),
    roundOffAmount: Number(roundOffAmount || 0),
  });

  return (
    <div className="rounded-sm border border-black/20">
      <div className="overflow-x-auto">
        <table className="min-w-[1680px] w-full text-tiny">
          <thead className="bg-background/50">
            <tr className="border-b border-black/20 text-left">
              <th className="border-r border-black/20 px-2 py-2">Actions</th>
              <th className="border-r border-black/20 px-2 py-2">Item</th>
              <th className="border-r border-black/20 px-2 py-2">Category</th>
              <th className="border-r border-black/20 px-2 py-2">HSN/SAC</th>
              <th className="border-r border-black/20 px-2 py-2">Qty.</th>
              <th className="border-r border-black/20 px-2 py-2">Rate</th>
              <th className="border-r border-black/20 px-2 py-2">Disc. %</th>
              <th className="border-r border-black/20 px-2 py-2">CGST%</th>
              <th className="border-r border-black/20 px-2 py-2">SGST%</th>
              <th className="border-r border-black/20 px-2 py-2">IGST%</th>
              <th className="border-r border-black/20 px-2 py-2 text-right">
                Taxable
              </th>
              <th className="px-2 py-2 text-right">Total</th>
            </tr>
          </thead>

          <tbody>
            {fields.map((field, index) => (
              <PurchaseOrderRow
                key={field.id}
                index={index}
                form={form}
                onRemove={remove}
              />
            ))}
          </tbody>

          <tfoot className="bg-background/50">
            <tr className="border-t border-black/20 font-semibold">
              <td colSpan={11} className="px-3 py-2 text-right">
                Totals: {summary.itemCount} Items / Qty {summary.quantityTotal}
              </td>
              <td className="px-3 py-2 text-right">
                {money(summary.itemsTotal)}
              </td>
            </tr>
          </tfoot>
        </table>

        <div className="border-t border-black/20 px-3 py-2">
          <button
            className="inline-flex items-center gap-1 rounded-sm border border-black/20 bg-white px-3 py-1 text-tiny transition hover:bg-slate-50"
            type="button"
            onClick={() => append(getEmptyItem())}
          >
            <PlusIcon className="size-3" />
            Add New Item
          </button>
        </div>
      </div>
    </div>
  );
};

const UpdateCreateForm = ({ data }: { data?: PurchaseOrderData }) => {
  const [supplierSearchValue, setSupplierSearchValue] = useState("");
  const [supplierModalOpen, setSupplierModalOpen] = useState(false);
  const { data: profile } = useProfile(false);
  const { mutateAsync: create, isPending: creating } = useCreatePurchaseOrder();
  const { mutateAsync: update, isPending: updating } = useUpdatePurchaseOrder();
  const supplierQuery = useInfiniteDrugSupplierList(
    { name: supplierSearchValue, status: Status.active },
    10,
  );

  const form = useForm<purchaseOrderValidatorType>({
    defaultValues: getInitialValues(data),
    resolver: zodResolver(purchaseOrderValidator),
  });

  useEffect(() => {
    form.reset(getInitialValues(data));
  }, [data, form]);

  const items = (useWatch({
    control: form.control,
    name: "items",
  }) || []) as purchaseOrderValidatorType["items"];
  const packingForwarding = useWatch({
    control: form.control,
    name: "packingForwarding",
  });
  const tcsAmount = useWatch({
    control: form.control,
    name: "tcsAmount",
  });
  const roundOffAmount = useWatch({
    control: form.control,
    name: "roundOffAmount",
  });
  const summary = calculatePurchaseOrderSummary(normalizeItems(items), {
    packingForwarding: Number(packingForwarding || 0),
    tcsAmount: Number(tcsAmount || 0),
    roundOffAmount: Number(roundOffAmount || 0),
  });

  const canCreateSupplier = Boolean(
    profile?.data &&
    hasActionPermission(
      profile.data,
      ModuleType.PHARMACY_SUPPLIER,
      ActionType.CREATE,
    ),
  );

  const onSubmit = (values: purchaseOrderValidatorType) => {
    if (data) {
      update({ orderId: Number(data.id), ...values });
      return;
    }

    create(values);
  };

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid gap-3 md:grid-cols-2">
            <div className="space-y-1">
              <FormInfiniteSelect<
                DrugSupplier,
                PaginatedResponse<DrugSupplier>,
                string,
                purchaseOrderValidatorType
              >
                label="Supplier"
                name="supplier"
                control={form.control}
                query={supplierQuery}
                getItems={(page) => page?.data}
                valueKey={(supplier) => String(supplier.id)}
                labelKey={(supplier) => supplier.name}
                search={supplierSearchValue}
                onSearchChange={setSupplierSearchValue}
                required
              />
              {canCreateSupplier && (
                <button
                  type="button"
                  className="text-tiny border py-1 px-2 text-black/60 rounded-md font-medium transition hover:text-blue-700"
                  onClick={() => setSupplierModalOpen(true)}
                >
                  + Add New Supplier
                </button>
              )}
            </div>
            <div>
              <FormField<purchaseOrderValidatorType>
                label="PO Date"
                type="date"
                name="orderDate"
                control={form.control}
                required
              />
            </div>
          </div>

          <PurchaseOrderItemsTable form={form} />

          <div className="grid gap-3 lg:grid-cols-[1fr_260px]">
            <div className="space-y-3">
              <FormField<purchaseOrderValidatorType>
                label="Remarks"
                type="textarea"
                name="remarks"
                control={form.control}
              />
              <FormField<purchaseOrderValidatorType>
                label="Terms & Conditions"
                type="textarea"
                name="termsAndConditions"
                control={form.control}
              />
            </div>

            <div className="overflow-hidden rounded-sm border border-black/20 bg-background/50">
              <SummaryField
                label="Items Count"
                value={String(summary.itemCount)}
              />
              <SummaryField
                label="Total Qty."
                value={String(summary.quantityTotal)}
              />
              <SummaryField
                label="Taxable Amt."
                value={money(summary.taxableAmount)}
              />
              <SummaryInput
                label="P&F Amt."
                name="packingForwarding"
                form={form}
              />
              <SummaryField
                label="CGST Amt."
                value={money(summary.cGstAmount)}
              />
              <SummaryField
                label="SGST Amt."
                value={money(summary.sGstAmount)}
              />
              <SummaryField
                label="IGST Amt."
                value={money(summary.iGstAmount)}
              />
              <SummaryInput label="TCS Amt." name="tcsAmount" form={form} />
              <SummaryField
                label="Discount Amt."
                value={money(summary.discountAmount)}
              />
              <SummaryInput
                label="Round Off"
                name="roundOffAmount"
                form={form}
              />
              <SummaryField label="Total" value={money(summary.grandTotal)} />
            </div>
          </div>

          <div className="flex justify-end">
            <CustomButton disabled={creating || updating} type="submit">
              {creating || updating ? "Saving..." : "Save"}
            </CustomButton>
          </div>
        </form>
      </Form>

      <CreateSupplierModal
        open={supplierModalOpen}
        onOpenChange={setSupplierModalOpen}
        onCreated={(supplier) => {
          form.setValue("supplier", supplier, {
            shouldDirty: true,
            shouldValidate: true,
          });
          setSupplierSearchValue(supplier.name);
        }}
      />
    </>
  );
};

const PurchaseOrderForm = () => {
  const params: { orderId: string } = useParams();
  const { data: profile } = useProfile(false);
  const { data: order, isLoading } = useGetPurchaseOrder(params?.orderId);

  if (isLoading && params?.orderId) {
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

  if (params?.orderId && !order) {
    return <div />;
  }

  if (!profile) {
    return <div />;
  }

  const canCreate = hasActionPermission(
    profile.data,
    ModuleType.PHARMACY_PURCHASE_ORDER,
    ActionType.CREATE,
  );
  const canUpdate = hasActionPermission(
    profile.data,
    ModuleType.PHARMACY_PURCHASE_ORDER,
    ActionType.UPDATE,
  );

  if ((params?.orderId && !canUpdate) || (!params?.orderId && !canCreate)) {
    return (
      <CustomLayout title="PO">
        <NoPermission />
      </CustomLayout>
    );
  }

  return (
    <CustomLayout title="PO">
      {params?.orderId ? (
        <UpdateCreateForm data={order} />
      ) : (
        <UpdateCreateForm />
      )}
    </CustomLayout>
  );
};

export default PurchaseOrderForm;
