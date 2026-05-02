"use client";

import CustomButton from "@/components/common/CustomButton";
import CustomLayout from "@/components/common/CustomLayout";
import NoPermission from "@/components/common/NoPermission";
import FormField from "@/components/form-inputs/FormField";
import { FormInfiniteSelect } from "@/components/form-inputs/FormInfiniteSelect";
import { Form } from "@/components/ui/form";
import { ActionType, ModuleType, Status } from "@/generated/prisma/enums";
import { useProfile } from "@/hooks/query/auth";
import { useInfiniteDrugList } from "@/hooks/query/drug";
import {
  useInventoryItemsList,
  useUpdateInventoryStockCorrection,
} from "@/hooks/query/pharmacyInventory";
import {
  FilterValues,
  PaginatedResponse,
  PharmacyDrugType,
  PharmacyInventoryItemType,
} from "@/lib/type";
import { hasActionPermission } from "@/lib/utils";
import { format } from "date-fns";
import { useEffect, useMemo, useState } from "react";
import { Path, useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";

type StockCorrectionFormValues = {
  drug?: PharmacyDrugType | null;
  itemName: string;
  batchNo: number;
  expiryDate: Date;
  mrp: number;
  quantityInStock: number;
  sellingPrice: number;
  itemsPerPack: number;
};

const getDefaultValues = (): StockCorrectionFormValues => ({
  drug: null,
  itemName: "",
  batchNo: 0,
  expiryDate: new Date(),
  mrp: 0,
  quantityInStock: 0,
  sellingPrice: 0,
  itemsPerPack: 1,
});

const money = (value: number) => Number(value || 0).toFixed(2);

const StockCorrection = () => {
  const [drugSearch, setDrugSearch] = useState("");
  const [selectedInventoryItem, setSelectedInventoryItem] =
    useState<PharmacyInventoryItemType | null>(null);
  const { data: profile } = useProfile(false);
  const { mutateAsync: updateStock, isPending } = useUpdateInventoryStockCorrection();
  const drugQuery = useInfiniteDrugList(
    { name: drugSearch, status: Status.active },
    10,
  );
  const form = useForm<StockCorrectionFormValues>({
    defaultValues: getDefaultValues(),
  });

  const selectedDrug = useWatch({
    control: form.control,
    name: "drug",
  }) as PharmacyDrugType | null | undefined;

  const inventoryQuery = useInventoryItemsList(
    {
      drugId: selectedDrug?.id,
      includeZeroStock: true,
    } as FilterValues,
    1,
    100,
  );

  useEffect(() => {
    setSelectedInventoryItem(null);
    form.setValue("itemName", "", { shouldDirty: false });
    form.setValue("batchNo", 0, { shouldDirty: false });
    form.setValue("mrp", 0, { shouldDirty: false });
    form.setValue("quantityInStock", 0, { shouldDirty: false });
    form.setValue("sellingPrice", 0, { shouldDirty: false });
    form.setValue("itemsPerPack", 1, { shouldDirty: false });
    form.setValue("expiryDate", new Date(), { shouldDirty: false });
  }, [form, selectedDrug?.id]);

  const inventoryRows = useMemo(
    () => inventoryQuery.data?.data || [],
    [inventoryQuery.data?.data],
  );

  if (!profile) {
    return <div />;
  }

  const canView = hasActionPermission(
    profile.data,
    ModuleType.PHARMACY_STOCK_CORRECTION,
    ActionType.VIEW,
  );
  const canUpdate = hasActionPermission(
    profile.data,
    ModuleType.PHARMACY_STOCK_CORRECTION,
    ActionType.UPDATE,
  );

  const onSelectInventoryItem = (item: PharmacyInventoryItemType) => {
    setSelectedInventoryItem(item);
    form.setValue("itemName", item.drug.name, { shouldDirty: false });
    form.setValue("batchNo", Number(item.batchNo || 0), { shouldDirty: false });
    form.setValue("expiryDate", new Date(item.expiryDate), { shouldDirty: false });
    form.setValue("mrp", Number(item.mrp || 0), { shouldDirty: false });
    form.setValue("quantityInStock", Number(item.quantityInStock || 0), {
      shouldDirty: false,
    });
    form.setValue("sellingPrice", Number(item.sellingPrice || 0), {
      shouldDirty: false,
    });
    form.setValue("itemsPerPack", Number(item.itemsPerPack || 1), {
      shouldDirty: false,
    });
  };

  const onSubmit = async (values: StockCorrectionFormValues) => {
    if (!selectedInventoryItem?.id) {
      toast.error("Select inventory stock to correct");
      return;
    }

    await updateStock({
      inventoryItemId: selectedInventoryItem.id,
      batchNo: Number(values.batchNo || 0),
      expiryDate: values.expiryDate,
      mrp: Number(values.mrp || 0),
      quantityInStock: Number(values.quantityInStock || 0),
      sellingPrice: Number(values.sellingPrice || 0),
      itemsPerPack: Number(values.itemsPerPack || 1),
    });
  };

  return (
    <CustomLayout title="Stock Correction">
      {!canView ? (
        <NoPermission />
      ) : (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormInfiniteSelect<
              PharmacyDrugType,
              PaginatedResponse<PharmacyDrugType>,
              string,
              StockCorrectionFormValues
            >
              label="Item Name"
              name={"drug" as Path<StockCorrectionFormValues>}
              control={form.control}
              query={drugQuery}
              getItems={(page) => page?.data}
              valueKey={(item) => String(item.id)}
              labelKey={(item) => item.name}
              search={drugSearch}
              onSearchChange={setDrugSearch}
              required
            />

            <div className="grid gap-4 xl:grid-cols-[1fr_320px]">
              <div className="overflow-x-auto rounded-sm border border-black/20">
                <table className="w-full min-w-[780px] text-tiny">
                  <thead className="bg-white">
                    <tr className="border-b border-black/30 text-primary">
                      <th className="h-6 min-w-40 px-2 text-left">Item</th>
                      <th className="h-6 min-w-16 px-2 text-left">Batch</th>
                      <th className="h-6 min-w-18 px-2 text-left">Expiry</th>
                      <th className="h-6 min-w-18 px-2 text-left">MRP</th>
                      <th className="h-6 min-w-22 px-2 text-left">Current Stock</th>
                      <th className="h-6 min-w-20 px-2 text-left">Sale Rate</th>
                      <th className="h-6 min-w-20 px-2 text-left">Items/Pack</th>
                    </tr>
                  </thead>
                  <tbody>
                    {inventoryQuery.isLoading ? (
                      <tr>
                        <td className="px-2 py-3 text-center" colSpan={7}>
                          Loading...
                        </td>
                      </tr>
                    ) : inventoryQuery.isError ? (
                      <tr>
                        <td className="px-2 py-3 text-center text-destructive" colSpan={7}>
                          {inventoryQuery.error?.response?.data?.message ||
                            inventoryQuery.error?.message ||
                            "Unable to load stock rows"}
                        </td>
                      </tr>
                    ) : inventoryRows.length ? (
                      inventoryRows.map((row) => (
                        <tr
                          key={row.id}
                          className={`cursor-pointer border-t border-primary/20 ${
                            row.id === selectedInventoryItem?.id
                              ? "bg-primary/10"
                              : "bg-white hover:bg-primary/5"
                          }`}
                          onClick={() => onSelectInventoryItem(row)}
                        >
                          <td className="px-2 py-1.5">{row.drug.name}</td>
                          <td className="px-2 py-1.5">{row.batchNo}</td>
                          <td className="px-2 py-1.5">
                            {format(row.expiryDate, "MM/yy")}
                          </td>
                          <td className="px-2 py-1.5">{money(row.mrp)}</td>
                          <td className="px-2 py-1.5">{row.quantityInStock}</td>
                          <td className="px-2 py-1.5">{money(row.sellingPrice)}</td>
                          <td className="px-2 py-1.5">{row.itemsPerPack}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td className="px-2 py-3 text-center text-muted-foreground" colSpan={7}>
                          {selectedDrug?.id
                            ? "No stock rows found for the selected drug"
                            : "Please search stock item for stock correction"}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div className="rounded-sm border border-black/20 bg-white p-3">
                <div className="space-y-3">
                  <FormField<StockCorrectionFormValues>
                    label="Item"
                    type="text"
                    name="itemName"
                    control={form.control}
                    readOnly
                  />
                  <FormField<StockCorrectionFormValues>
                    label="Batch"
                    type="number"
                    name="batchNo"
                    control={form.control}
                    readOnly={!canUpdate || !selectedInventoryItem}
                  />
                  <FormField<StockCorrectionFormValues>
                    label="Expiry"
                    type="date"
                    name="expiryDate"
                    control={form.control}
                    disabled={!canUpdate || !selectedInventoryItem}
                  />
                  <FormField<StockCorrectionFormValues>
                    label="MRP"
                    type="number"
                    name="mrp"
                    control={form.control}
                    readOnly={!canUpdate || !selectedInventoryItem}
                  />
                  <FormField<StockCorrectionFormValues>
                    label="Current Stock"
                    type="number"
                    name="quantityInStock"
                    control={form.control}
                    readOnly={!canUpdate || !selectedInventoryItem}
                  />
                  <FormField<StockCorrectionFormValues>
                    label="Sale Rate"
                    type="number"
                    name="sellingPrice"
                    control={form.control}
                    readOnly={!canUpdate || !selectedInventoryItem}
                  />
                  <FormField<StockCorrectionFormValues>
                    label="Items/Pack"
                    type="number"
                    name="itemsPerPack"
                    control={form.control}
                    readOnly={!canUpdate || !selectedInventoryItem}
                  />
                </div>

                <div className="mt-4 flex gap-2">
                  <CustomButton
                    disabled={!canUpdate || !selectedInventoryItem || isPending}
                    type="submit"
                  >
                    Save
                  </CustomButton>
                  <CustomButton
                    type="button"
                    variant="secondary"
                    onClick={() => {
                      setSelectedInventoryItem(null);
                      form.reset({
                        ...getDefaultValues(),
                        drug: selectedDrug ?? null,
                      });
                    }}
                  >
                    Cancel
                  </CustomButton>
                </div>
              </div>
            </div>
          </form>
        </Form>
      )}
    </CustomLayout>
  );
};

export default StockCorrection;
