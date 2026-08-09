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
import { useCreateChallan } from "@/hooks/query/pharmacyChallan";
import { calculateGrnSummary } from "@/lib/pharmacyGrn";
import {
  HsnSacType,
  PaginatedResponse,
  PharmacyDrugType,
} from "@/lib/type";
import { hasActionPermission } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { PlusIcon } from "lucide-react";
import { useEffect, useState } from "react";
import {
  Path,
  useFieldArray,
  useForm,
  UseFormReturn,
  useWatch,
} from "react-hook-form";
import {
  challanValidator,
  challanValidatorType,
} from "@/validators/api/masters/pharmacyChallan";

type ChallanItemForm = challanValidatorType["challanItems"][number];

type RowProps = {
  index: number;
  form: UseFormReturn<challanValidatorType>;
  lineTotal: number;
};

const money = (value: number) => Number(value || 0).toFixed(2);
const getDefaultExpiryDate = () =>
  new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1);

const getEmptyItem = (): ChallanItemForm => ({
  category: undefined,
  drug: {
    id: undefined as unknown as number,
    name: "",
  },
  hsnSac: undefined,
  hsnSacId: 0,
  batchNo: "",
  expiryDate: getDefaultExpiryDate(),
  manufacturingDate: new Date(),
  quantity: 1,
  freeQuantity: 0,
  itemsPerPack: 1,
  purchasePrice: 0,
  mrp: 0,
  sellingPrice: 0,
  wholeSalePrice: 0,
});

const normalizeItems = (items: challanValidatorType["challanItems"]) =>
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

const getInitialValues = (): challanValidatorType => ({
  supplier: { id: undefined as unknown as number },
  challanNumber: "",
  invoiceNumber: "",
  invoiceDate: new Date(),
  discountAmount: 0,
  tcsAmount: 0,
  packingForwarding: 0,
  roundOffAmount: 0,
  cnAmount: 0,
  cnRef: "",
  challanItems: [getEmptyItem()],
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
  type = "number",
}: {
  label: string;
  name: Path<challanValidatorType>;
  form: UseFormReturn<challanValidatorType>;
  type?: "number" | "text";
}) => (
  <div className="grid grid-cols-[1fr_120px] border-b border-black/15 last:border-b-0">
    <div className="border-r border-black/15 px-2 py-1 text-tiny font-medium">
      {label}
    </div>
    <div className="bg-white px-1 py-1">
      <FormField<challanValidatorType>
        type={type}
        name={name}
        control={form.control}
        hideError
        className="h-6 px-1 text-right shadow-none"
      />
    </div>
  </div>
);

const ChallanRow = ({ index, form, lineTotal }: RowProps) => {
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

  const rowPath = `challanItems.${index}` as const;
  const selectedHsnSac = form.watch(
    `${rowPath}.hsnSac` as Path<challanValidatorType>,
  ) as HsnSacType | undefined;

  useEffect(() => {
    const currentHsnSacId = form.getValues(
      `${rowPath}.hsnSacId` as Path<challanValidatorType>,
    );

    if (
      (currentHsnSacId === undefined ||
        currentHsnSacId === null ||
        currentHsnSacId === 0) &&
      selectedHsnSac?.id
    ) {
      form.setValue(
        `${rowPath}.hsnSacId` as Path<challanValidatorType>,
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
      form.getValues(`${rowPath}.hsnSacId` as Path<challanValidatorType>) || 0,
    );

    if (currentCode !== Number(selectedHsnSac.id)) {
      form.setValue(
        `${rowPath}.hsnSacId` as Path<challanValidatorType>,
        Number(selectedHsnSac.id),
        { shouldDirty: true, shouldValidate: false },
      );
    }
  }, [form, rowPath, selectedHsnSac]);

  return (
    <tr className="border-t border-black/20 bg-white align-top">
      <td className="border-r border-black/20 px-1 py-1 min-w-56">
        <FormInfiniteSelect<
          PharmacyDrugType,
          PaginatedResponse<PharmacyDrugType>,
          string,
          challanValidatorType
        >
          name={`${rowPath}.drug` as Path<challanValidatorType>}
          control={form.control}
          query={drugsQuery}
          getItems={(page) => page?.data}
          valueKey={(item) => String(item.id)}
          labelKey={(item) => item.name}
          searchValue={drugSearch}
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
          challanValidatorType
        >
          name={`${rowPath}.category` as Path<challanValidatorType>}
          control={form.control}
          query={categoryQuery}
          getItems={(page) => page?.data}
          valueKey={(item) => String(item.id)}
          labelKey={(item) => item.name}
          searchValue={categorySearch}
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
          challanValidatorType
        >
          name={`${rowPath}.hsnSac` as Path<challanValidatorType>}
          control={form.control}
          query={hsnSacQuery}
          getItems={(page) => page?.data}
          valueKey={(item) => String(item.id)}
          labelKey={(item) =>
            `${item.code} | CGST ${item.cGstPercentage}% | SGST ${item.sGstPercentage}% | IGST ${item.iGstPercentage}%`
          }
          searchValue={hsnSacSearch}
          onSearchChange={setHsnSacSearch}
          placeholder="Select HSN/SAC"
          hideError
        />
      </td>

      <td className="border-r border-black/20 px-1 py-1 min-w-20">
        <FormField<challanValidatorType>
          type="text"
          name={`${rowPath}.batchNo` as Path<challanValidatorType>}
          control={form.control}
          hideError
        />
      </td>

      <td className="border-r border-black/20 px-1 py-1 min-w-28">
        <FormField<challanValidatorType>
          type="monthYear"
          name={`${rowPath}.expiryDate` as Path<challanValidatorType>}
          control={form.control}
          placeholder="MMM YYYY"
          minDate={getDefaultExpiryDate()}
          allowFutureDates
          hideError
        />
      </td>

      <td className="border-r border-black/20 px-1 py-1 min-w-16">
        <FormField<challanValidatorType>
          type="number"
          name={`${rowPath}.quantity` as Path<challanValidatorType>}
          control={form.control}
          hideError
        />
      </td>

      <td className="border-r border-black/20 px-1 py-1 min-w-18">
        <FormField<challanValidatorType>
          type="number"
          name={`${rowPath}.freeQuantity` as Path<challanValidatorType>}
          control={form.control}
          hideError
        />
      </td>

      <td className="border-r border-black/20 px-1 py-1 min-w-20">
        <FormField<challanValidatorType>
          type="number"
          name={`${rowPath}.itemsPerPack` as Path<challanValidatorType>}
          control={form.control}
          hideError
        />
      </td>

      <td className="border-r border-black/20 px-1 py-1 min-w-20">
        <FormField<challanValidatorType>
          type="number"
          name={`${rowPath}.purchasePrice` as Path<challanValidatorType>}
          control={form.control}
          hideError
        />
      </td>

      <td className="border-r border-black/20 px-1 py-1 min-w-20">
        <FormField<challanValidatorType>
          type="number"
          name={`${rowPath}.mrp` as Path<challanValidatorType>}
          control={form.control}
          hideError
        />
      </td>

      <td className="border-r border-black/20 px-1 py-1 min-w-20">
        <FormField<challanValidatorType>
          type="number"
          name={`${rowPath}.sellingPrice` as Path<challanValidatorType>}
          control={form.control}
          hideError
        />
      </td>

      <td className="border-r border-black/20 px-1 py-1 min-w-20">
        <FormField<challanValidatorType>
          type="number"
          name={`${rowPath}.wholeSalePrice` as Path<challanValidatorType>}
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

const ChallanItemsTable = ({
  form,
}: {
  form: UseFormReturn<challanValidatorType>;
}) => {
  const { fields, append } = useFieldArray({
    control: form.control,
    name: "challanItems",
  });

  const items = (useWatch({
    control: form.control,
    name: "challanItems",
  }) || []) as challanValidatorType["challanItems"];
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
              <ChallanRow
                key={field.id}
                index={index}
                form={form}
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

        <div className="border-t border-black/20 px-3 py-2">
          <button
            className="inline-flex items-center gap-1 rounded-sm border border-black/20 bg-white px-3 py-1 text-tiny transition hover:bg-slate-50"
            type="button"
            onClick={() => append(getEmptyItem())}
          >
            <PlusIcon className="size-3" />
            Add New Challan Item
          </button>
        </div>
      </div>
    </div>
  );
};

const UpdateCreateForm = () => {
  const [supplierSearch, setSupplierSearch] = useState("");
  const supplierQuery = useInfiniteDrugSupplierList(
    { name: supplierSearch, status: Status.active },
    20,
  );
  const { mutateAsync: create, isPending: creating } = useCreateChallan();

  const form = useForm<challanValidatorType>({
    defaultValues: getInitialValues(),
    resolver: zodResolver(challanValidator),
  });

  const items = (useWatch({
    control: form.control,
    name: "challanItems",
  }) || []) as challanValidatorType["challanItems"];
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

  const onSubmit = (values: challanValidatorType) => {
    create(values);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid gap-3 md:grid-cols-4">
          <FormInfiniteSelect<
            DrugSupplier,
            PaginatedResponse<DrugSupplier>,
            string,
            challanValidatorType
          >
            label="Supplier"
            control={form.control}
            name="supplier"
            query={supplierQuery}
            getItems={(page) => page?.data}
            valueKey={(item) => String(item.id)}
            labelKey={(item) => item.name}
            searchValue={supplierSearch}
            onSearchChange={setSupplierSearch}
            required
          />
          <FormField
            label="Challan Number"
            control={form.control}
            name="challanNumber"
            type="text"
            required
          />
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

        <ChallanItemsTable form={form} />

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

const ChallanForm = () => {
  const { data: profile } = useProfile(false);

  if (!profile) {
    return <div />;
  }

  const canCreate = hasActionPermission(
    profile.data,
    ModuleType.PHARMACY_CHALLAN,
    ActionType.CREATE,
  );

  if (!canCreate) {
    return (
      <CustomLayout title="Create Challan">
        <NoPermission />
      </CustomLayout>
    );
  }

  return (
    <CustomLayout title="Create Challan">
      <UpdateCreateForm />
    </CustomLayout>
  );
};

export default ChallanForm;
