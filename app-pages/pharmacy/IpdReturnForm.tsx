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
import {
  useCreateIpdReturn,
  useInfinitePharmacyIpdPatients,
  useIpdIssueList,
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

const PHARMACY_IPD_RETURN_MODULE = "PHARMACY_IPD_RETURN" as ModuleType;

type ReturnOption = {
  issueItemId: number;
  issueId: number;
  inventoryItem: PharmacyInventoryItemType;
  quantity: number;
  isLooseQuantity: boolean;
  remainingPieces: number;
  rate: number;
  taxableAmount: number;
  gstAmount: number;
  cGstAmount: number;
  sGstAmount: number;
  iGstAmount: number;
  total: number;
};

type ReturnFormItem = {
  issueItemId?: number | string;
  inventoryItem?: PharmacyInventoryItemType | null;
  quantity: number;
  isLooseQuantity: boolean;
  remainingPieces: number;
  rate: number;
  taxableAmount: number;
  cGstAmount: number;
  sGstAmount: number;
  iGstAmount: number;
  total: number;
};

type ReturnFormValues = {
  returnDate: Date;
  ipd?: IPDType | null;
  discountAmount: number;
  roundOffAmount: number;
  items: ReturnFormItem[];
};

const defaultItem = (): ReturnFormItem => ({
  issueItemId: undefined,
  inventoryItem: null,
  quantity: 1,
  isLooseQuantity: false,
  remainingPieces: 0,
  rate: 0,
  taxableAmount: 0,
  cGstAmount: 0,
  sGstAmount: 0,
  iGstAmount: 0,
  total: 0,
});

const emptyValues = (): ReturnFormValues => ({
  returnDate: new Date(),
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
const toPieces = (quantity: number, isLooseQuantity: boolean, packSize: number) =>
  isLooseQuantity ? Number(quantity || 0) : Number(quantity || 0) * packSize;
const formatRemaining = (pieces: number, packSize: number) => {
  if (pieces <= 0) return "0";
  if (pieces < packSize) return `${pieces} pcs`;
  const packs = Math.floor(pieces / packSize);
  const loose = pieces % packSize;
  if (!loose) return `${packs} pack`;
  return `${packs} pack + ${loose} pcs`;
};

const ReturnItemRow = ({
  form,
  index,
  options,
  onRemove,
}: {
  form: UseFormReturn<ReturnFormValues>;
  index: number;
  options: ReturnOption[];
  onRemove: () => void;
}) => {
  const rowPath = `items.${index}` as Path<ReturnFormValues>;
  const item = useWatch({
    control: form.control,
    name: rowPath,
  }) as ReturnFormItem;

  useEffect(() => {
    const selectedOption = options.find(
      (option) => option.issueItemId === Number(item?.issueItemId),
    );
    if (!selectedOption) return;

    const packSize = Math.max(Number(selectedOption.inventoryItem.itemsPerPack || 1), 1);
    const requestedPieces = toPieces(
      Number(item.quantity || 0),
      Boolean(item.isLooseQuantity),
      packSize,
    );
    const issuedPieces = toPieces(
      Number(selectedOption.quantity || 0),
      Boolean(selectedOption.isLooseQuantity),
      packSize,
    );
    const ratio = issuedPieces > 0 ? requestedPieces / issuedPieces : 0;
    const pieceRate = Boolean(selectedOption.isLooseQuantity)
      ? Number(selectedOption.rate || 0)
      : Number(selectedOption.rate || 0) / packSize;
    const rate = Boolean(item.isLooseQuantity) ? pieceRate : pieceRate * packSize;

    const nextValues: Array<[Path<ReturnFormValues>, unknown]> = [
      [`${rowPath}.inventoryItem` as Path<ReturnFormValues>, selectedOption.inventoryItem],
      [`${rowPath}.remainingPieces` as Path<ReturnFormValues>, selectedOption.remainingPieces],
      [`${rowPath}.rate` as Path<ReturnFormValues>, Number(rate.toFixed(2))],
      [
        `${rowPath}.taxableAmount` as Path<ReturnFormValues>,
        Number((selectedOption.taxableAmount * ratio).toFixed(2)),
      ],
      [
        `${rowPath}.cGstAmount` as Path<ReturnFormValues>,
        Number((selectedOption.cGstAmount * ratio).toFixed(2)),
      ],
      [
        `${rowPath}.sGstAmount` as Path<ReturnFormValues>,
        Number((selectedOption.sGstAmount * ratio).toFixed(2)),
      ],
      [
        `${rowPath}.iGstAmount` as Path<ReturnFormValues>,
        Number((selectedOption.iGstAmount * ratio).toFixed(2)),
      ],
      [
        `${rowPath}.total` as Path<ReturnFormValues>,
        Number((selectedOption.total * ratio).toFixed(2)),
      ],
    ];

    nextValues.forEach(([path, value]) => {
      if (form.getValues(path) !== value) {
        form.setValue(path, value as never, { shouldDirty: true });
      }
    });
  }, [form, item?.issueItemId, item?.isLooseQuantity, item?.quantity, options, rowPath]);

  const selectedOption = options.find(
    (option) => option.issueItemId === Number(item?.issueItemId),
  );
  const inventory = selectedOption?.inventoryItem || item?.inventoryItem;
  const packSize = Math.max(Number(inventory?.itemsPerPack || 1), 1);
  const maxPacks = Math.floor(Number(item?.remainingPieces || 0) / packSize);

  return (
    <tr className="border-t align-middle">
      <td className="px-2 py-1.5">{index + 1}</td>
      <td className="px-2 py-1.5 min-w-72">
        <FormField
          label=""
          type="select"
          control={form.control}
          name={`${rowPath}.issueItemId` as Path<ReturnFormValues>}
          hideError
          placeholder="Select item"
          options={options.map((option) => ({
            value: String(option.issueItemId),
            label: [
              option.inventoryItem.drug.name,
              `Issue ISS-${option.issueId}`,
              `Batch ${option.inventoryItem.batchNo}`,
              `Remain ${formatRemaining(
                option.remainingPieces,
                Math.max(Number(option.inventoryItem.itemsPerPack || 1), 1),
              )}`,
            ].join(" | "),
          }))}
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
          name={`${rowPath}.isLooseQuantity` as Path<ReturnFormValues>}
          hideError
          hideLabel
          formItemClassName="items-center justify-center"
        />
      </td>
      <td className="px-2 py-1.5 min-w-20">
        <FormField
          type="number"
          control={form.control}
          name={`${rowPath}.quantity` as Path<ReturnFormValues>}
          hideError
        />
      </td>
      <td className="px-2 py-1.5">{money(item?.rate || 0)}</td>
      <td className="px-2 py-1.5 whitespace-nowrap">
        {inventory
          ? item?.isLooseQuantity
            ? `${Number(item?.remainingPieces || 0)} pcs`
            : `${maxPacks} packs`
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

const IpdReturnForm = () => {
  const { data: profile } = useProfile(false);
  const { mutateAsync: createReturn, isPending } = useCreateIpdReturn();
  const [ipdSearch, setIpdSearch] = useState("");
  const currentIpdQuery = useInfinitePharmacyIpdPatients(
    { isDischarged: false, isDayCare: false, name: ipdSearch } as FilterValues,
    20,
  );
  const form = useForm<ReturnFormValues>({
    defaultValues: emptyValues(),
  });
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  });
  const selectedIpd = form.watch("ipd");
  const issueListQuery = useIpdIssueList(
    { ipdId: selectedIpd?.id } as FilterValues,
    1,
    200,
    { enabled: Boolean(selectedIpd?.id) },
  );
  const watchedItems = useWatch({
    control: form.control,
    name: "items",
  });
  const discountAmount = Number(form.watch("discountAmount") || 0);
  const roundOffAmount = Number(form.watch("roundOffAmount") || 0);

  const options = useMemo<ReturnOption[]>(() => {
    return (issueListQuery.data?.data || []).flatMap((issue) =>
      issue.items
        .map((item) => {
          const packSize = Math.max(Number(item.inventoryItem.itemsPerPack || 1), 1);
          const issuedPieces = toPieces(
            Number(item.quantity || 0),
            Boolean(item.isLooseQuantity),
            packSize,
          );
          const returnedPieces = item.returnItems.reduce(
            (sum, returnItem) =>
              sum +
              toPieces(
                Number(returnItem.quantity || 0),
                Boolean(returnItem.isLooseQuantity),
                packSize,
              ),
            0,
          );
          return {
            issueItemId: item.id,
            issueId: issue.id,
            inventoryItem: item.inventoryItem,
            quantity: Number(item.quantity || 0),
            isLooseQuantity: Boolean(item.isLooseQuantity),
            remainingPieces: Math.max(issuedPieces - returnedPieces, 0),
            rate: Number(item.rate || 0),
            taxableAmount: Number(item.taxableAmount || 0),
            gstAmount: Number(item.gstAmount || 0),
            cGstAmount: Number(item.cGstAmount || 0),
            sGstAmount: Number(item.sGstAmount || 0),
            iGstAmount: Number(item.iGstAmount || 0),
            total: Number(item.total || 0),
          };
        })
        .filter((item) => item.remainingPieces > 0),
    );
  }, [issueListQuery.data?.data]);

  const subtotal = useMemo(
    () => (watchedItems || []).reduce((sum, item) => sum + Number(item.total || 0), 0),
    [watchedItems],
  );
  const total = useMemo(
    () => Number((subtotal - discountAmount + roundOffAmount).toFixed(2)),
    [discountAmount, roundOffAmount, subtotal],
  );

  const onSubmit = async (values: ReturnFormValues) => {
    if (!values.ipd?.id) {
      toast.error("Select an IPD patient");
      return;
    }

    const validItems = values.items.filter(
      (item) => item.issueItemId && item.inventoryItem?.id,
    );
    if (!validItems.length) {
      toast.error("Add at least one return item");
      return;
    }

    const hasOverReturn = validItems.some((item) => {
      const packSize = Math.max(Number(item.inventoryItem?.itemsPerPack || 1), 1);
      const requestedPieces = toPieces(
        Number(item.quantity || 0),
        Boolean(item.isLooseQuantity),
        packSize,
      );
      return requestedPieces > Number(item.remainingPieces || 0);
    });

    if (hasOverReturn) {
      toast.error("One or more rows exceed returnable quantity");
      return;
    }

    if (discountAmount > subtotal) {
      toast.error("Discount cannot exceed subtotal");
      return;
    }

    await createReturn({
      ipdId: values.ipd.id,
      createdAt: values.returnDate,
      discountAmount,
      roundOffAmount,
      items: validItems.map((item) => ({
        issueItemId: Number(item.issueItemId),
        inventoryItemId: Number(item.inventoryItem?.id),
        quantity: Number(item.quantity || 0),
        isLooseQuantity: Boolean(item.isLooseQuantity),
      })),
    });
  };

  if (!profile) return <div />;

  const canCreate = hasActionPermission(
    profile.data,
    PHARMACY_IPD_RETURN_MODULE,
    ActionType.CREATE,
  );

  if (!canCreate) {
    return (
      <CustomLayout title="New IPD Return">
        <NoPermission />
      </CustomLayout>
    );
  }

  return (
    <CustomLayout title="New IPD Return">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            <FormField
              type="date"
              control={form.control}
              name="returnDate"
              label="Date"
            />
            <FormInfiniteSelect<
              IPDType,
              PaginatedResponse<IPDType>,
              string,
              ReturnFormValues
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
                    <th className="border-r border-black/20 px-2 py-2">Returnable</th>
                    <th className="border-r border-black/20 px-2 py-2">CGST</th>
                    <th className="border-r border-black/20 px-2 py-2">SGST</th>
                    <th className="border-r border-black/20 px-2 py-2">IGST</th>
                    <th className="border-r border-black/20 px-2 py-2">Total</th>
                    <th className="px-2 py-2" />
                  </tr>
                </thead>
                <tbody>
                  {fields.map((field, index) => (
                    <ReturnItemRow
                      key={field.id}
                      form={form}
                      index={index}
                      options={options}
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
              Save IPD Return
            </CustomButton>
          </div>
        </form>
      </Form>
    </CustomLayout>
  );
};

export default IpdReturnForm;
