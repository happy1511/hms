"use client";

import { DiscountType } from "@/generated/prisma/enums";
import { useInfiniteInventoryItems } from "@/hooks/query/pharmacyInventory";
import { FilterValues, PaginatedResponse } from "@/lib/type";
import { Checkbox } from "@/components/ui/checkbox";
import { FormControl, FormField as UiFormField } from "@/components/ui/form";
import { format } from "date-fns";
import { PlusIcon, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Path, useFieldArray, useWatch, UseFormReturn } from "react-hook-form";
import { FormInfiniteSelect } from "@/components/form-inputs/FormInfiniteSelect";
import FormField from "@/components/form-inputs/FormField";
import { SaleBillFormValues, SaleBillInventoryItem } from "./types";

const defaultRow = () => ({
  inventoryItem: null,
  quantity: 1,
  isLooseQuantity: false,
  rate: 0,
  discountType: DiscountType.VALUE,
  discountValue: 0,
  taxableAmount: 0,
  gstAmount: 0,
  cGstAmount: 0,
  sGstAmount: 0,
  iGstAmount: 0,
  total: 0,
});

const SaleBillItemRow = ({
  index,
  form,
  isWholesaleBill,
  isLooseBill,
}: {
  index: number;
  form: UseFormReturn<SaleBillFormValues>;
  isWholesaleBill: boolean;
  isLooseBill: boolean;
}) => {
  const [inventorySearch, setInventorySearch] = useState("");
  const inventoryQuery = useInfiniteInventoryItems(
    { name: inventorySearch } as FilterValues,
    10,
  );
  const { remove } = useFieldArray({
    control: form.control,
    name: "items",
  });

  const rowPath = `items.${index}` as Path<SaleBillFormValues>;
  const inventoryItemPath =
    `${rowPath}.inventoryItem` as Path<SaleBillFormValues>;
  const quantityPath = `${rowPath}.quantity` as Path<SaleBillFormValues>;
  const isLooseQuantityPath =
    `${rowPath}.isLooseQuantity` as Path<SaleBillFormValues>;
  const ratePath = `${rowPath}.rate` as Path<SaleBillFormValues>;
  const discountTypePath =
    `${rowPath}.discountType` as Path<SaleBillFormValues>;
  const discountValuePath =
    `${rowPath}.discountValue` as Path<SaleBillFormValues>;
  const taxableAmountPath =
    `${rowPath}.taxableAmount` as Path<SaleBillFormValues>;
  const gstAmountPath = `${rowPath}.gstAmount` as Path<SaleBillFormValues>;
  const cGstAmountPath = `${rowPath}.cGstAmount` as Path<SaleBillFormValues>;
  const sGstAmountPath = `${rowPath}.sGstAmount` as Path<SaleBillFormValues>;
  const iGstAmountPath = `${rowPath}.iGstAmount` as Path<SaleBillFormValues>;
  const totalPath = `${rowPath}.total` as Path<SaleBillFormValues>;
  const item = useWatch({
    control: form.control,
    name: rowPath,
  }) as SaleBillFormValues["items"][number];

  useEffect(() => {
    const inventory = item?.inventoryItem;
    if (!inventory) return;

    const setIfChanged = (
      path: Path<SaleBillFormValues>,
      nextValue: number | DiscountType,
    ) => {
      const currentValue = form.getValues(path);
      if (currentValue !== nextValue) {
        form.setValue(path, nextValue as never, { shouldDirty: true });
      }
    };

    const selectedRate = isWholesaleBill
      ? Number(inventory.wholeSalePrice || 0)
      : Number(inventory.sellingPrice || 0);
    const perPieceRate =
      selectedRate / Math.max(Number(inventory.itemsPerPack || 1), 1);
    const isLooseQuantity = Boolean(item?.isLooseQuantity);
    const resolvedRate = isLooseQuantity ? perPieceRate : selectedRate;
    const quantity = Math.max(Number(item?.quantity || 1), 1);
    const taxableAmount = Number((quantity * resolvedRate).toFixed(2));
    const cGstAmount = Number(
      ((taxableAmount * Number(inventory.hsnSac?.cGstPercentage || 0)) / 100).toFixed(
        2,
      ),
    );
    const sGstAmount = Number(
      ((taxableAmount * Number(inventory.hsnSac?.sGstPercentage || 0)) / 100).toFixed(
        2,
      ),
    );
    const iGstAmount = Number(
      ((taxableAmount * Number(inventory.hsnSac?.iGstPercentage || 0)) / 100).toFixed(
        2,
      ),
    );
    const gstAmount = cGstAmount + sGstAmount + iGstAmount;
    const total = Number((taxableAmount + gstAmount).toFixed(2));

    setIfChanged(quantityPath, quantity);
    setIfChanged(ratePath, Number(resolvedRate.toFixed(2)));
    setIfChanged(discountTypePath, DiscountType.VALUE);
    setIfChanged(discountValuePath, 0);
    setIfChanged(taxableAmountPath, taxableAmount);
    setIfChanged(cGstAmountPath, cGstAmount);
    setIfChanged(sGstAmountPath, sGstAmount);
    setIfChanged(iGstAmountPath, iGstAmount);
    setIfChanged(gstAmountPath, gstAmount);
    setIfChanged(totalPath, total);
  }, [
    cGstAmountPath,
    discountTypePath,
    discountValuePath,
    form,
    gstAmountPath,
    iGstAmountPath,
    isWholesaleBill,
    item?.inventoryItem,
    item?.isLooseQuantity,
    item?.quantity,
    isLooseBill,
    quantityPath,
    ratePath,
    sGstAmountPath,
    taxableAmountPath,
    totalPath,
  ]);

  const inventory = item?.inventoryItem;

  useEffect(() => {
    if (!inventory) {
      return;
    }

    if (isLooseBill && !item?.isLooseQuantity) {
      form.setValue(isLooseQuantityPath, true, { shouldDirty: true });
    }
  }, [form, inventory, isLooseBill, isLooseQuantityPath, item?.isLooseQuantity]);

  return (
    <tr className="border-t align-middle">
      <td className="px-2 py-1.5">{index + 1}</td>
      <td className="px-2 py-1.5 min-w-72">
        <FormInfiniteSelect<
          SaleBillInventoryItem,
          PaginatedResponse<SaleBillInventoryItem>,
          string,
          SaleBillFormValues
        >
          control={form.control}
          name={inventoryItemPath}
          query={inventoryQuery}
          getItems={(page) => page?.data}
          valueKey={(row) => String(row.id)}
          labelKey={(row) =>
            [
              row.drug.name,
              `Batch ${row.batchNo}`,
              `Stock ${row.quantityInStock} pcs`,
              `Pack ${row.itemsPerPack}`,
              `MRP ${Number(row.mrp).toFixed(2)}`,
              `Price ${Number(
                isWholesaleBill ? row.wholeSalePrice : row.sellingPrice,
              ).toFixed(2)}`,
              `Exp ${format(new Date(row.expiryDate), "MM/yy")}`,
              "Discount 0",
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
      <td className="px-2 py-1.5 min-w-16 text-center">
        <UiFormField
          control={form.control}
          name={isLooseQuantityPath}
          render={({ field }) => (
            <FormControl>
              <Checkbox
                checked={Boolean(field.value)}
                onCheckedChange={field.onChange}
                className="mx-auto"
              />
            </FormControl>
          )}
        />
      </td>
      <td className="px-2 py-1.5 min-w-20">
        <FormField
          type="number"
          name={quantityPath}
          control={form.control}
          hideError
        />
      </td>
      <td className="px-2 py-1.5">{Number(item?.rate || 0).toFixed(2)}</td>
      <td className="px-2 py-1.5 whitespace-nowrap">
        {inventory
          ? Boolean(item?.isLooseQuantity)
            ? `${Number(inventory.quantityInStock || 0)} pcs`
            : `${Math.floor(
                Number(inventory.quantityInStock || 0) /
                  Math.max(Number(inventory.itemsPerPack || 1), 1),
              )} packs`
          : "-"}
      </td>
      <td className="px-2 py-1.5">{inventory?.hsnSac?.cGstPercentage || 0}%</td>
      <td className="px-2 py-1.5">{inventory?.hsnSac?.sGstPercentage || 0}%</td>
      <td className="px-2 py-1.5">{inventory?.hsnSac?.iGstPercentage || 0}%</td>
      <td className="px-2 py-1.5">{Number(item?.discountValue || 0).toFixed(2)}</td>
      <td className="px-2 py-1.5 font-semibold">
        {Number(item?.total || 0).toFixed(2)}
      </td>
      <td className="px-2 py-1.5">
        <button type="button" onClick={() => remove(index)}>
          <Trash2 className="size-3 text-destructive" />
        </button>
      </td>
    </tr>
  );
};

const SaleBillItemsTable = ({
  form,
  isWholesaleBill,
  isLooseBill,
}: {
  form: UseFormReturn<SaleBillFormValues>;
  isWholesaleBill: boolean;
  isLooseBill: boolean;
}) => {
  const { fields, append } = useFieldArray({
    control: form.control,
    name: "items",
  });

  return (
    <div className="rounded-sm border border-black/20">
      <div className="overflow-auto">
        <table className="w-full min-w-[1500px] border-collapse text-tiny">
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
              <th className="border-r border-black/20 px-2 py-2">Dis</th>
              <th className="border-r border-black/20 px-2 py-2">Total</th>
              <th className="px-2 py-2" />
            </tr>
          </thead>
          <tbody>
            {fields.map((field, index) => (
              <SaleBillItemRow
                key={field.id}
                index={index}
                form={form}
                isWholesaleBill={isWholesaleBill}
                isLooseBill={isLooseBill}
              />
            ))}
          </tbody>
        </table>
        <div className="border-t border-black/20 px-3 py-2">
          <button
            className="inline-flex items-center gap-1 rounded-sm border border-black/20 bg-white px-3 py-1 text-tiny transition hover:bg-slate-50"
            type="button"
            onClick={() =>
              append({
                ...defaultRow(),
                isLooseQuantity: isLooseBill,
              })
            }
          >
            <PlusIcon className="size-3" />
            Add Drug Item
          </button>
        </div>
      </div>
    </div>
  );
};

export default SaleBillItemsTable;
