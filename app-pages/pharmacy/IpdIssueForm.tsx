"use client";

import CustomButton from "@/components/common/CustomButton";
import CustomLayout from "@/components/common/CustomLayout";
import NoPermission from "@/components/common/NoPermission";
import { FormInfiniteSelect } from "@/components/form-inputs/FormInfiniteSelect";
import { FormCheckbox } from "@/components/form-inputs/FormCheckBox";
import FormField from "@/components/form-inputs/FormField";
import SelectDischargedIpdModal from "@/components/pharmacy/SelectDischargedIpdModal";
import PharmacySummaryRow from "@/components/pharmacy/PharmacySummaryRow";
import { Form } from "@/components/ui/form";
import { ActionType, ModuleType } from "@/generated/prisma/enums";
import { useProfile } from "@/hooks/query/auth";
import { useInfiniteInventoryItems } from "@/hooks/query/pharmacyInventory";
import {
  useCreateIpdIssue,
  useInfinitePharmacyIpdPatients,
} from "@/hooks/query/pharmacyIpdBill";
import {
  FilterValues,
  IPDType,
  PaginatedResponse,
  PharmacyInventoryItemType,
} from "@/lib/type";
import { hasActionPermission } from "@/lib/utils";
import { format } from "date-fns";
import { PlusIcon, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Path, useFieldArray, useForm, useWatch, UseFormReturn } from "react-hook-form";
import { toast } from "sonner";

const PHARMACY_IPD_ISSUE_MODULE = "PHARMACY_IPD_ISSUE" as ModuleType;

type IssueFormItem = {
  inventoryItem?: PharmacyInventoryItemType | null;
  quantity: number;
  isLooseQuantity: boolean;
  rate: number;
  taxableAmount: number;
  cGstAmount: number;
  sGstAmount: number;
  iGstAmount: number;
  total: number;
};

type IssueFormValues = {
  issueDate: Date;
  ipd?: IPDType | null;
  discountAmount: number;
  roundOffAmount: number;
  items: IssueFormItem[];
};

const defaultItem = (): IssueFormItem => ({
  inventoryItem: null,
  quantity: 1,
  isLooseQuantity: false,
  rate: 0,
  taxableAmount: 0,
  cGstAmount: 0,
  sGstAmount: 0,
  iGstAmount: 0,
  total: 0,
});

const emptyValues = (): IssueFormValues => ({
  issueDate: new Date(),
  ipd: null,
  discountAmount: 0,
  roundOffAmount: 0,
  items: [defaultItem()],
});

const patientLabel = (ipd?: IPDType | null) =>
  ipd
    ? [
        `IPD ${ipd.id}`,
        [ipd.patient.firstName, ipd.patient.middleName, ipd.patient.lastName]
          .filter(Boolean)
          .join(" "),
        format(new Date(ipd.ipdDateTime), "dd/MM/yyyy"),
        ipd.isDischarged ? "Discharged" : "Current",
      ].join(" | ")
    : "";

const money = (value: number) => Number(value || 0).toFixed(2);

const IssueItemRow = ({
  form,
  index,
  onRemove,
}: {
  form: UseFormReturn<IssueFormValues>;
  index: number;
  onRemove: () => void;
}) => {
  const [inventorySearch, setInventorySearch] = useState("");
  const inventoryQuery = useInfiniteInventoryItems(
    { name: inventorySearch } as FilterValues,
    20,
  );
  const rowPath = `items.${index}` as Path<IssueFormValues>;
  const inventoryPath = `${rowPath}.inventoryItem` as Path<IssueFormValues>;
  const item = useWatch({
    control: form.control,
    name: rowPath,
  }) as IssueFormItem;

  useEffect(() => {
    const inventory = item?.inventoryItem;
    if (!inventory) return;

    const packSize = Math.max(Number(inventory.itemsPerPack || 1), 1);
    const quantity = Math.max(Number(item.quantity || 1), 1);
    const packageRate = Number(inventory.sellingPrice || 0);
    const pieceRate = packageRate / packSize;
    const rate = item.isLooseQuantity ? pieceRate : packageRate;
    const taxableAmount = Number((rate * quantity).toFixed(2));
    const cGstAmount = Number(
      (
        (taxableAmount * Number(inventory.hsnSac?.cGstPercentage || 0)) /
        100
      ).toFixed(2),
    );
    const sGstAmount = Number(
      (
        (taxableAmount * Number(inventory.hsnSac?.sGstPercentage || 0)) /
        100
      ).toFixed(2),
    );
    const iGstAmount = Number(
      (
        (taxableAmount * Number(inventory.hsnSac?.iGstPercentage || 0)) /
        100
      ).toFixed(2),
    );
    const total = Number(
      (taxableAmount + cGstAmount + sGstAmount + iGstAmount).toFixed(2),
    );

    const nextValues: Array<[Path<IssueFormValues>, number | boolean | PharmacyInventoryItemType | null]> =
      [
        [`${rowPath}.quantity` as Path<IssueFormValues>, quantity],
        [`${rowPath}.rate` as Path<IssueFormValues>, Number(rate.toFixed(2))],
        [`${rowPath}.taxableAmount` as Path<IssueFormValues>, taxableAmount],
        [`${rowPath}.cGstAmount` as Path<IssueFormValues>, cGstAmount],
        [`${rowPath}.sGstAmount` as Path<IssueFormValues>, sGstAmount],
        [`${rowPath}.iGstAmount` as Path<IssueFormValues>, iGstAmount],
        [`${rowPath}.total` as Path<IssueFormValues>, total],
      ];

    nextValues.forEach(([path, value]) => {
      if (form.getValues(path) !== value) {
        form.setValue(path, value as never, { shouldDirty: true });
      }
    });
  }, [form, item?.inventoryItem, item?.isLooseQuantity, item?.quantity, rowPath]);

  const inventory = item?.inventoryItem;
  const packSize = Math.max(Number(inventory?.itemsPerPack || 1), 1);
  const availablePacks = Math.floor(Number(inventory?.quantityInStock || 0) / packSize);

  return (
    <tr className="border-t align-middle">
      <td className="px-2 py-1.5">{index + 1}</td>
      <td className="px-2 py-1.5 min-w-72">
        <FormInfiniteSelect<
          PharmacyInventoryItemType,
          PaginatedResponse<PharmacyInventoryItemType>,
          string,
          IssueFormValues
        >
          control={form.control}
          name={inventoryPath}
          query={inventoryQuery}
          getItems={(page) => page?.data}
          valueKey={(row) => String(row.id)}
          labelKey={(row) =>
            [
              row.drug.name,
              `Batch ${row.batchNo}`,
              `Stock ${row.quantityInStock} pcs`,
              `Pack ${row.itemsPerPack}`,
              `Price ${Number(row.sellingPrice || 0).toFixed(2)}`,
              `Exp ${format(new Date(row.expiryDate), "MM/yy")}`,
            ].join(" | ")
          }
          search={inventorySearch}
          onSearchChange={setInventorySearch}
          placeholder="Select item"
          hideError
        />
      </td>
      <td className="px-2 py-1.5">{inventory?.drug.manufacturer || "-"}</td>
      <td className="px-2 py-1.5">{inventory?.hsnSac?.code || "-"}</td>
      <td className="px-2 py-1.5">{inventory?.batchNo || "-"}</td>
      <td className="px-2 py-1.5">
        {inventory ? format(new Date(inventory.expiryDate), "MM/yy") : "-"}
      </td>
      <td className="px-2 py-1.5">{inventory?.itemsPerPack || "-"}</td>
      <td className="px-2 py-1.5 min-w-16">
        <FormCheckbox
          label=""
          control={form.control}
          name={`${rowPath}.isLooseQuantity` as Path<IssueFormValues>}
          hideError
          hideLabel
          formItemClassName="items-center justify-center"
        />
      </td>
      <td className="px-2 py-1.5 min-w-20">
        <FormField
          type="number"
          control={form.control}
          name={`${rowPath}.quantity` as Path<IssueFormValues>}
          hideError
        />
      </td>
      <td className="px-2 py-1.5">{money(item?.rate || 0)}</td>
      <td className="px-2 py-1.5 whitespace-nowrap">
        {inventory
          ? item?.isLooseQuantity
            ? `${Number(inventory.quantityInStock || 0)} pcs`
            : `${availablePacks} packs`
          : "-"}
      </td>
      <td className="px-2 py-1.5">{inventory?.hsnSac?.cGstPercentage || 0}%</td>
      <td className="px-2 py-1.5">{inventory?.hsnSac?.sGstPercentage || 0}%</td>
      <td className="px-2 py-1.5">{inventory?.hsnSac?.iGstPercentage || 0}%</td>
      <td className="px-2 py-1.5 font-semibold">{money(item?.total || 0)}</td>
      <td className="px-2 py-1.5">
        <button type="button" onClick={onRemove}>
          <Trash2 className="size-3 text-destructive" />
        </button>
      </td>
    </tr>
  );
};

const IpdIssueForm = () => {
  const { data: profile } = useProfile(false);
  const { mutateAsync: createIssue, isPending } = useCreateIpdIssue();
  const [ipdSearch, setIpdSearch] = useState("");
  const currentIpdQuery = useInfinitePharmacyIpdPatients(
    { isDischarged: false, isDayCare: false, name: ipdSearch } as FilterValues,
    20,
  );
  const form = useForm<IssueFormValues>({
    defaultValues: emptyValues(),
  });
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  });

  const watchedItems = useWatch({
    control: form.control,
    name: "items",
  });
  const discountAmount = Number(form.watch("discountAmount") || 0);
  const roundOffAmount = Number(form.watch("roundOffAmount") || 0);

  const subtotal = useMemo(
    () => (watchedItems || []).reduce((sum, item) => sum + Number(item.total || 0), 0),
    [watchedItems],
  );
  const total = useMemo(
    () => Number((subtotal - discountAmount + roundOffAmount).toFixed(2)),
    [discountAmount, roundOffAmount, subtotal],
  );

  const onSubmit = async (values: IssueFormValues) => {
    if (!values.ipd?.id) {
      toast.error("Select an IPD patient");
      return;
    }

    const validItems = values.items.filter((item) => item.inventoryItem?.id);
    if (!validItems.length) {
      toast.error("Add at least one issue item");
      return;
    }

    const hasOverStock = validItems.some((item) => {
      const packSize = Math.max(Number(item.inventoryItem?.itemsPerPack || 1), 1);
      const requestedPieces = item.isLooseQuantity
        ? Number(item.quantity || 0)
        : Number(item.quantity || 0) * packSize;
      return requestedPieces > Number(item.inventoryItem?.quantityInStock || 0);
    });

    if (hasOverStock) {
      toast.error("One or more rows exceed available stock");
      return;
    }

    if (discountAmount > subtotal) {
      toast.error("Discount cannot exceed subtotal");
      return;
    }

    await createIssue({
      ipdId: values.ipd.id,
      createdAt: values.issueDate,
      discountAmount,
      roundOffAmount,
      items: validItems.map((item) => ({
        inventoryItem: { id: Number(item.inventoryItem?.id) },
        quantity: Number(item.quantity || 0),
        isLooseQuantity: Boolean(item.isLooseQuantity),
      })),
    });
  };

  if (!profile) return <div />;

  const canCreate = hasActionPermission(
    profile.data,
    PHARMACY_IPD_ISSUE_MODULE,
    ActionType.CREATE,
  );

  if (!canCreate) {
    return (
      <CustomLayout title="New IPD Issue">
        <NoPermission />
      </CustomLayout>
    );
  }

  return (
    <CustomLayout title="New IPD Issue">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            <FormField
              type="date"
              control={form.control}
              name="issueDate"
              label="Date"
            />
            <FormInfiniteSelect<
              IPDType,
              PaginatedResponse<IPDType>,
              string,
              IssueFormValues
            >
              label="IPD Patient"
              control={form.control}
              name="ipd"
              query={currentIpdQuery}
              getItems={(page) => page?.data}
              valueKey={(row) => String(row.id)}
              labelKey={(row) => patientLabel(row)}
              search={ipdSearch}
              onSearchChange={setIpdSearch}
              required
            />
            <div className="flex items-end">
              <SelectDischargedIpdModal
                onSelect={(ipd) => form.setValue("ipd", ipd, { shouldDirty: true })}
              />
            </div>
          </div>

          <div className="rounded-sm border border-black/20">
            <div className="overflow-auto">
              <table className="w-full min-w-[1450px] border-collapse text-tiny">
                <thead className="bg-muted">
                  <tr>
                    <th className="border-r border-black/20 px-2 py-2">No.</th>
                    <th className="border-r border-black/20 px-2 py-2">Item</th>
                    <th className="border-r border-black/20 px-2 py-2">Mfg</th>
                    <th className="border-r border-black/20 px-2 py-2">HSN</th>
                    <th className="border-r border-black/20 px-2 py-2">Batch</th>
                    <th className="border-r border-black/20 px-2 py-2">Exp</th>
                    <th className="border-r border-black/20 px-2 py-2">Pack</th>
                    <th className="border-r border-black/20 px-2 py-2">Loose</th>
                    <th className="border-r border-black/20 px-2 py-2">Qty</th>
                    <th className="border-r border-black/20 px-2 py-2">Rate</th>
                    <th className="border-r border-black/20 px-2 py-2">Stock</th>
                    <th className="border-r border-black/20 px-2 py-2">CGST</th>
                    <th className="border-r border-black/20 px-2 py-2">SGST</th>
                    <th className="border-r border-black/20 px-2 py-2">IGST</th>
                    <th className="border-r border-black/20 px-2 py-2">Total</th>
                    <th className="px-2 py-2" />
                  </tr>
                </thead>
                <tbody>
                  {fields.map((field, index) => (
                    <IssueItemRow
                      key={field.id}
                      form={form}
                      index={index}
                      onRemove={() => remove(index)}
                    />
                  ))}
                </tbody>
              </table>
            </div>
            <div className="border-t border-black/20 p-3">
              <button
                className="inline-flex items-center gap-1 rounded-sm border border-black/20 bg-white px-3 py-1 text-tiny transition hover:bg-slate-50"
                type="button"
                onClick={() => append(defaultItem())}
              >
                <PlusIcon className="size-3" />
                Add Item
              </button>
            </div>
          </div>

          <div className="grid gap-3 lg:grid-cols-[1fr_260px]">
            <div />
            <div className="overflow-hidden rounded-sm border border-black/20 bg-background/50">
              <PharmacySummaryRow
                label="Discount"
                value={
                  <FormField
                    type="number"
                    control={form.control}
                    name="discountAmount"
                    hideError
                  />
                }
              />
              <PharmacySummaryRow
                label="Round Off"
                value={
                  <FormField
                    type="number"
                    control={form.control}
                    name="roundOffAmount"
                    hideError
                  />
                }
              />
              <PharmacySummaryRow
                label="Total"
                value={money(total)}
                valueClassName="text-xl"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <CustomButton type="submit" disabled={isPending}>
              Save IPD Issue
            </CustomButton>
          </div>
        </form>
      </Form>
    </CustomLayout>
  );
};

export default IpdIssueForm;
