"use client";

import CustomButton from "@/components/common/CustomButton";
import CustomLayout from "@/components/common/CustomLayout";
import NoPermission from "@/components/common/NoPermission";
import FormField from "@/components/form-inputs/FormField";
import { FormInfiniteSelect } from "@/components/form-inputs/FormInfiniteSelect";
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
import { useGetChallan } from "@/hooks/query/pharmacyChallan";
import { useCreateGrn } from "@/hooks/query/pharmacyGrn";
import { useGetPurchaseOrder } from "@/hooks/query/pharmacyPurchaseOrder";
import { calculateGrnSummary } from "@/lib/pharmacyGrn";
import {
  HsnSacType,
  PaginatedResponse,
  PharmacyChallanType,
  PharmacyDrugType,
  PharmacyPurchaseOrderType,
} from "@/lib/type";
import { hasActionPermission } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoaderIcon, PlusIcon } from "lucide-react";
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
  grnValidator,
  grnValidatorType,
} from "@/validators/api/masters/pharmacyGRN";

type GrnOrderData = PharmacyPurchaseOrderType;
type GrnChallanData = PharmacyChallanType;
type GrnSourceData = GrnOrderData | GrnChallanData;
type GrnSourceType = "po" | "challan";

type GrnItemForm = grnValidatorType["grnItems"][number];

type RowProps = {
  index: number;
  form: UseFormReturn<grnValidatorType>;
  readonlyFromSource: boolean;
  lineTotal: number;
};

const money = (value: number) => Number(value || 0).toFixed(2);

const getEmptyItem = (): GrnItemForm => ({
  category: undefined,
  drug: {
    id: undefined as unknown as number,
    name: "",
  },
  hsnSac: undefined,
  hsnSacId: 0,
  batchNo: 0,
  expiryDate: new Date(),
  manufacturingDate: new Date(),
  quantity: 1,
  freeQuantity: 0,
  itemsPerPack: 1,
  purchasePrice: 0,
  mrp: 0,
  sellingPrice: 0,
  wholeSalePrice: 0,
});

const normalizeItems = (items: grnValidatorType["grnItems"]) =>
  items.map((item) => ({
    quantity: Number(item.quantity || 0),
    freeQuantity: Number(item.freeQuantity || 0),
    purchasePrice: Number(item.purchasePrice || 0),
    hsnSac: item.hsnSac
      ? {
          cGstPercentage: Number(item.hsnSac.cGstPercentage || 0),
          sGstPercentage: Number(item.hsnSac.sGstPercentage || 0),
          iGstPercentage: Number(item.hsnSac.iGstPercentage || 0),
        }
      : undefined,
  }));

const getInitialValues = (
  data?: GrnSourceData,
  source: GrnSourceType = "po",
): grnValidatorType => {
  if (source === "challan") {
    const challan = data as GrnChallanData | undefined;

    return {
      supplier: challan?.supplier ?? { id: undefined as unknown as number },
      challanId: challan?.id,
      invoiceNumber: challan?.invoiceNumber ?? "",
      invoiceDate: challan?.invoiceDate ? new Date(challan.invoiceDate) : new Date(),
      discountAmount: Number(challan?.discountAmount || 0),
      tcsAmount: Number(challan?.tcsAmount || 0),
      packingForwarding: Number(challan?.packingForwarding || 0),
      roundOffAmount: Number(challan?.roundOffAmount || 0),
      cnAmount: Number(challan?.cnAmount || 0),
      cnRef: challan?.cnRef ?? "",
      grnItems: challan?.items?.length
        ? challan.items.map((item) => ({
            id: item.id,
            drug: {
              id: item.drug.id,
              name: item.drug.name,
            },
            hsnSac: item.hsnSac ?? undefined,
            category: item.category ?? undefined,
            hsnSacId: item.hsnSacId ?? item.hsnSac?.id ?? 0,
            batchNo: item.batchNo,
            expiryDate: item.expiryDate ? new Date(item.expiryDate) : new Date(),
            manufacturingDate: item.manufacturingDate
              ? new Date(item.manufacturingDate)
              : new Date(),
            quantity: Number(item.quantity || 0),
            freeQuantity: Number(item.freeQuantity || 0),
            itemsPerPack: Number(item.itemsPerPack || 1),
            purchasePrice: Number(item.purchasePrice || 0),
            mrp: Number(item.mrp || 0),
            sellingPrice: Number(item.sellingPrice || 0),
            wholeSalePrice: Number(item.wholeSalePrice || 0),
          }))
        : [getEmptyItem()],
    };
  }

  const order = data as GrnOrderData | undefined;

  return {
    supplier: order?.supplier ?? { id: undefined as unknown as number },
    orderId: order?.id,
    invoiceNumber: "",
    invoiceDate: new Date(),
    discountAmount: 0,
    tcsAmount: 0,
    packingForwarding: 0,
    roundOffAmount: 0,
    cnAmount: 0,
    cnRef: "",
    grnItems: order?.items?.length
      ? order.items.map((item) => ({
          id: item.id,
          drug: {
            id: item.drug.id,
            name: item.drug.name,
          },
          hsnSac: item.hsnSac ?? undefined,
          category: item.category ?? undefined,
          hsnSacId: item.hsnSacId ?? item.hsnSac?.id ?? 0,
          batchNo: 0,
          expiryDate: new Date(),
          manufacturingDate: new Date(),
          quantity: item.quantity,
          freeQuantity: 0,
          itemsPerPack: 1,
          purchasePrice: item.rate,
          mrp: 0,
          sellingPrice: 0,
          wholeSalePrice: 0,
        }))
      : [getEmptyItem()],
  };
};

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
  type = "number",
}: {
  label: string;
  name: Path<grnValidatorType>;
  form: UseFormReturn<grnValidatorType>;
  type?: "number" | "text";
}) => (
  <div className="grid grid-cols-[1fr_120px] border-b border-black/15 last:border-b-0">
    <div className="border-r border-black/15 px-2 py-1 text-tiny font-medium">
      {label}
    </div>
    <div className="bg-white px-1 py-1">
      <FormField<grnValidatorType>
        type={type}
        name={name}
        control={form.control}
        hideError
        className="h-6 px-1 text-right shadow-none"
      />
    </div>
  </div>
);

const GrnRow = ({ index, form, readonlyFromSource, lineTotal }: RowProps) => {
  const [drugSearch, setDrugSearch] = useState("");
  const [categorySearch, setCategorySearch] = useState("");
  const [hsnSacSearch, setHsnSacSearch] = useState("");
  const drugsQuery = useInfiniteDrugList(
    { name: drugSearch, status: Status.active },
    20,
  );
  const categoryQuery = useInfiniteDrugBillingCategoryList(
    { name: categorySearch, status: Status.active },
    20,
  );
  const hsnSacQuery = useInfiniteHsnSacList(
    { name: hsnSacSearch, status: Status.active },
    20,
  );

  const rowPath = `grnItems.${index}` as const;
  const selectedHsnSac = form.watch(
    `${rowPath}.hsnSac` as Path<grnValidatorType>,
  ) as HsnSacType | undefined;

  useEffect(() => {
    const currentHsnSacId = form.getValues(
      `${rowPath}.hsnSacId` as Path<grnValidatorType>,
    );

    if (
      (currentHsnSacId === undefined ||
        currentHsnSacId === null ||
        currentHsnSacId === 0) &&
      selectedHsnSac?.id
    ) {
      form.setValue(
        `${rowPath}.hsnSacId` as Path<grnValidatorType>,
        Number(selectedHsnSac.id),
        { shouldDirty: true, shouldValidate: false },
      );
    }
  }, [form, rowPath, selectedHsnSac?.id]);

  useEffect(() => {
    if (!selectedHsnSac) {
      return;
    }

    const currentCode = Number(
      form.getValues(`${rowPath}.hsnSacId` as Path<grnValidatorType>) || 0,
    );

    if (currentCode !== Number(selectedHsnSac.id)) {
      form.setValue(
        `${rowPath}.hsnSacId` as Path<grnValidatorType>,
        Number(selectedHsnSac.id),
        { shouldDirty: true, shouldValidate: false },
      );
    }
  }, [form, rowPath, selectedHsnSac]);

  return (
    <tr className="border-t border-black/20 bg-white align-top">
      <td className="border-r border-black/20 px-1 py-1 min-w-56">
        {readonlyFromSource ? (
          <FormField<grnValidatorType>
            type="text"
            name={`${rowPath}.drug.name` as Path<grnValidatorType>}
            control={form.control}
            hideError
            readOnly
          />
        ) : (
          <FormInfiniteSelect<
            PharmacyDrugType,
            PaginatedResponse<PharmacyDrugType>,
            string,
            grnValidatorType
          >
            name={`${rowPath}.drug` as Path<grnValidatorType>}
            control={form.control}
            query={drugsQuery}
            getItems={(page) => page?.data}
            valueKey={(item) => String(item.id)}
            labelKey={(item) => item.name}
            search={drugSearch}
            onSearchChange={setDrugSearch}
            placeholder="Select Item"
            hideError
          />
        )}
      </td>

      <td className="border-r border-black/20 px-1 py-1 min-w-36">
        {readonlyFromSource ? (
          <FormField<grnValidatorType>
            type="text"
            name={`${rowPath}.category.name` as Path<grnValidatorType>}
            control={form.control}
            hideError
            readOnly
          />
        ) : (
          <FormInfiniteSelect<
            DrugBillingCategory,
            PaginatedResponse<DrugBillingCategory>,
            string,
            grnValidatorType
          >
            name={`${rowPath}.category` as Path<grnValidatorType>}
            control={form.control}
            query={categoryQuery}
            getItems={(page) => page?.data}
            valueKey={(item) => String(item.id)}
            labelKey={(item) => item.name}
            search={categorySearch}
            onSearchChange={setCategorySearch}
            placeholder="Select Category"
            hideError
          />
        )}
      </td>

      <td className="border-r border-black/20 px-1 py-1 min-w-40">
        <FormInfiniteSelect<
          HsnSacType,
          PaginatedResponse<HsnSacType>,
          string,
          grnValidatorType
        >
          name={`${rowPath}.hsnSac` as Path<grnValidatorType>}
          control={form.control}
          query={hsnSacQuery}
          getItems={(page) => page?.data}
          valueKey={(item) => String(item.id)}
          labelKey={(item) =>
            `${item.code} | CGST ${item.cGstPercentage}% | SGST ${item.sGstPercentage}% | IGST ${item.iGstPercentage}%`
          }
          search={hsnSacSearch}
          onSearchChange={setHsnSacSearch}
          placeholder="Select HSN/SAC"
          hideError
        />
      </td>

      <td className="border-r border-black/20 px-1 py-1 min-w-20">
        <FormField<grnValidatorType>
          type="number"
          name={`${rowPath}.batchNo` as Path<grnValidatorType>}
          control={form.control}
          hideError
        />
      </td>

      <td className="border-r border-black/20 px-1 py-1 min-w-28">
        <FormField<grnValidatorType>
          type="monthYear"
          name={`${rowPath}.expiryDate` as Path<grnValidatorType>}
          control={form.control}
          placeholder="MMM YYYY"
          hideError
        />
      </td>

      <td className="border-r border-black/20 px-1 py-1 min-w-16">
        <FormField<grnValidatorType>
          type="number"
          name={`${rowPath}.quantity` as Path<grnValidatorType>}
          control={form.control}
          hideError
        />
      </td>

      <td className="border-r border-black/20 px-1 py-1 min-w-18">
        <FormField<grnValidatorType>
          type="number"
          name={`${rowPath}.freeQuantity` as Path<grnValidatorType>}
          control={form.control}
          hideError
        />
      </td>

      <td className="border-r border-black/20 px-1 py-1 min-w-20">
        <FormField<grnValidatorType>
          type="number"
          name={`${rowPath}.itemsPerPack` as Path<grnValidatorType>}
          control={form.control}
          hideError
        />
      </td>

      <td className="border-r border-black/20 px-1 py-1 min-w-20">
        <FormField<grnValidatorType>
          type="number"
          name={`${rowPath}.purchasePrice` as Path<grnValidatorType>}
          control={form.control}
          hideError
        />
      </td>

      <td className="border-r border-black/20 px-1 py-1 min-w-20">
        <FormField<grnValidatorType>
          type="number"
          name={`${rowPath}.mrp` as Path<grnValidatorType>}
          control={form.control}
          hideError
        />
      </td>

      <td className="border-r border-black/20 px-1 py-1 min-w-20">
        <FormField<grnValidatorType>
          type="number"
          name={`${rowPath}.sellingPrice` as Path<grnValidatorType>}
          control={form.control}
          hideError
        />
      </td>

      <td className="border-r border-black/20 px-1 py-1 min-w-20">
        <FormField<grnValidatorType>
          type="number"
          name={`${rowPath}.wholeSalePrice` as Path<grnValidatorType>}
          control={form.control}
          hideError
        />
      </td>

      <td className="border-r border-black/20 px-2 py-2 text-center min-w-20">
        {Number(selectedHsnSac?.cGstPercentage || 0)}%
      </td>

      <td className="border-r border-black/20 px-2 py-2 text-center min-w-20">
        {Number(selectedHsnSac?.sGstPercentage || 0)}%
      </td>

      <td className="border-r border-black/20 px-2 py-2 text-center min-w-20">
        {Number(selectedHsnSac?.iGstPercentage || 0)}%
      </td>

      <td className="px-2 py-2 text-right font-semibold min-w-24">
        {money(lineTotal)}
      </td>
    </tr>
  );
};

const GrnItemsTable = ({
  form,
  readonlyFromSource,
}: {
  form: UseFormReturn<grnValidatorType>;
  readonlyFromSource: boolean;
}) => {
  const { fields, append } = useFieldArray({
    control: form.control,
    name: "grnItems",
  });

  const items = (useWatch({
    control: form.control,
    name: "grnItems",
  }) || []) as grnValidatorType["grnItems"];
  const discountAmount = useWatch({
    control: form.control,
    name: "discountAmount",
  });
  const tcsAmount = useWatch({
    control: form.control,
    name: "tcsAmount",
  });
  const packingForwarding = useWatch({
    control: form.control,
    name: "packingForwarding",
  });
  const roundOffAmount = useWatch({
    control: form.control,
    name: "roundOffAmount",
  });
  const cnAmount = useWatch({
    control: form.control,
    name: "cnAmount",
  });
  const summary = calculateGrnSummary(normalizeItems(items), {
    discountAmount: Number(discountAmount || 0),
    tcsAmount: Number(tcsAmount || 0),
    packingForwarding: Number(packingForwarding || 0),
    roundOffAmount: Number(roundOffAmount || 0),
    cnAmount: Number(cnAmount || 0),
  });

  return (
    <div className="rounded-sm border border-black/20">
      <div className="overflow-x-auto">
        <table className="min-w-[1850px] w-full text-tiny">
          <thead className="bg-background/50">
            <tr className="border-b border-black/20 text-left">
              <th className="border-r border-black/20 px-2 py-2">Item</th>
              <th className="border-r border-black/20 px-2 py-2">Category</th>
              <th className="border-r border-black/20 px-2 py-2">HSNSAC</th>
              <th className="border-r border-black/20 px-2 py-2">Batch</th>
              <th className="border-r border-black/20 px-2 py-2">Expiry</th>
              <th className="border-r border-black/20 px-2 py-2">Qty.</th>
              <th className="border-r border-black/20 px-2 py-2">Free. Qty.</th>
              <th className="border-r border-black/20 px-2 py-2">
                Items/Pack.
              </th>
              <th className="border-r border-black/20 px-2 py-2">Rate</th>
              <th className="border-r border-black/20 px-2 py-2">MRP</th>
              <th className="border-r border-black/20 px-2 py-2">S.R.</th>
              <th className="border-r border-black/20 px-2 py-2">W.R.</th>
              <th className="border-r border-black/20 px-2 py-2">CGST%</th>
              <th className="border-r border-black/20 px-2 py-2">SGST%</th>
              <th className="border-r border-black/20 px-2 py-2">IGST%</th>
              <th className="px-2 py-2 text-right">Total</th>
            </tr>
          </thead>

          <tbody>
            {fields.map((field, index) => (
              <GrnRow
                key={field.id}
                index={index}
                form={form}
                readonlyFromSource={readonlyFromSource}
                lineTotal={summary.lines[index]?.lineTotal ?? 0}
              />
            ))}
          </tbody>

          <tfoot className="bg-background/50">
            <tr className="border-t border-black/20 font-semibold">
              <td colSpan={15} className="px-3 py-2 text-right">
                Totals: {summary.itemCount} Items / Qty {summary.quantityTotal}
              </td>
              <td className="px-3 py-2 text-right">
                {money(summary.itemsTotal)}
              </td>
            </tr>
          </tfoot>
        </table>

        {!readonlyFromSource && (
          <div className="border-t border-black/20 px-3 py-2">
            <button
              className="inline-flex items-center gap-1 rounded-sm border border-black/20 bg-white px-3 py-1 text-tiny transition hover:bg-slate-50"
              type="button"
              onClick={() => append(getEmptyItem())}
            >
              <PlusIcon className="size-3" />
              Add New GRN Item
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

const UpdateCreateForm = ({
  data,
  source,
}: {
  data?: GrnSourceData;
  source: GrnSourceType;
}) => {
  const [supplierSearch, setSupplierSearch] = useState("");
  const supplierQuery = useInfiniteDrugSupplierList(
    { name: supplierSearch, status: Status.active },
    20,
  );
  const { mutateAsync: create, isPending: creating } = useCreateGrn();
  const readonlyFromSource = Boolean(data);

  const form = useForm<grnValidatorType>({
    defaultValues: getInitialValues(data, source),
    resolver: zodResolver(grnValidator),
  });

  useEffect(() => {
    form.reset(getInitialValues(data, source));
  }, [data, form, source]);

  const items = (useWatch({
    control: form.control,
    name: "grnItems",
  }) || []) as grnValidatorType["grnItems"];
  const discountAmount = useWatch({
    control: form.control,
    name: "discountAmount",
  });
  const tcsAmount = useWatch({
    control: form.control,
    name: "tcsAmount",
  });
  const packingForwarding = useWatch({
    control: form.control,
    name: "packingForwarding",
  });
  const roundOffAmount = useWatch({
    control: form.control,
    name: "roundOffAmount",
  });
  const cnAmount = useWatch({
    control: form.control,
    name: "cnAmount",
  });
  const summary = calculateGrnSummary(normalizeItems(items), {
    discountAmount: Number(discountAmount || 0),
    tcsAmount: Number(tcsAmount || 0),
    packingForwarding: Number(packingForwarding || 0),
    roundOffAmount: Number(roundOffAmount || 0),
    cnAmount: Number(cnAmount || 0),
  });

  const onSubmit = (values: grnValidatorType) => {
    create(values);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid gap-3 md:grid-cols-3">
          {!readonlyFromSource && (
            <FormInfiniteSelect<
              DrugSupplier,
              PaginatedResponse<DrugSupplier>,
              string,
              grnValidatorType
            >
              label="Supplier"
              control={form.control}
              name="supplier"
              query={supplierQuery}
              getItems={(page) => page?.data}
              valueKey={(item) => String(item.id)}
              labelKey={(item) => item.name}
              search={supplierSearch}
              onSearchChange={setSupplierSearch}
              required
            />
          )}
          <FormField
            label="Invoice Number"
            control={form.control}
            name="invoiceNumber"
            type="text"
            required
          />
          <FormField
            label="Invoice Date"
            control={form.control}
            name="invoiceDate"
            type="date"
            required
          />
        </div>

        <GrnItemsTable form={form} readonlyFromSource={readonlyFromSource} />

        <div className="grid gap-3 lg:grid-cols-[1fr_260px]">
          <div />

          <div className="overflow-hidden rounded-sm border border-black/20 bg-background/50">
            <SummaryInput label="Discount" name="discountAmount" form={form} />
            <SummaryField
              label="Taxable Amt."
              value={money(summary.taxableAmount)}
            />
            <SummaryField label="CGST Amt." value={money(summary.cGstAmount)} />
            <SummaryField label="SGST Amt." value={money(summary.sGstAmount)} />
            <SummaryField label="IGST Amt." value={money(summary.iGstAmount)} />
            <SummaryInput label="TCS Amt." name="tcsAmount" form={form} />
            <SummaryInput
              label="PNF Amt."
              name="packingForwarding"
              form={form}
            />
            <SummaryInput
              label="Rounding Amt."
              name="roundOffAmount"
              form={form}
            />
            <SummaryField label="Total." value={money(summary.grandTotal)} />
            <SummaryInput label="CN Amount" name="cnAmount" form={form} />
            <SummaryInput
              label="CN Ref."
              name="cnRef"
              form={form}
              type="text"
            />
          </div>
        </div>

        <div className="flex justify-end">
          <CustomButton disabled={creating} type="submit">
            {creating ? "Saving..." : "Save"}
          </CustomButton>
        </div>
      </form>
    </Form>
  );
};

const GrnForm = ({ source = "po" }: { source?: GrnSourceType }) => {
  const params = useParams<{ orderId?: string; challanId?: string }>();
  const orderId = source === "po" ? params?.orderId : undefined;
  const challanId = source === "challan" ? params?.challanId : undefined;
  const isNewGrn = source === "po" && orderId === "new";
  const { data: profile } = useProfile(false);
  const { data: order, isLoading: isOrderLoading } = useGetPurchaseOrder(
    source === "po" && !isNewGrn ? orderId : undefined,
  );
  const { data: challan, isLoading: isChallanLoading } = useGetChallan(
    source === "challan" ? challanId : undefined,
  );
  const isLoading = source === "challan" ? isChallanLoading : isOrderLoading;
  const sourceData = source === "challan" ? challan : !isNewGrn ? order : undefined;

  if (isLoading && ((source === "po" && orderId && !isNewGrn) || (source === "challan" && challanId))) {
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

  if ((source === "po" && !isNewGrn && orderId && !order) || (source === "challan" && challanId && !challan)) {
    return <div />;
  }

  if (!profile) {
    return <div />;
  }

  const canCreate = hasActionPermission(
    profile.data,
    ModuleType.PHARMACY_GRN,
    ActionType.CREATE,
  );

  if (!canCreate) {
    return (
      <CustomLayout title={source === "challan" ? "Create GRN via Challan" : "Create GRN"}>
        <NoPermission />
      </CustomLayout>
    );
  }

  return (
    <CustomLayout title={source === "challan" ? "Create GRN via Challan" : "Create GRN"}>
      <UpdateCreateForm data={sourceData} source={source} />
    </CustomLayout>
  );
};

export default GrnForm;
