"use client";

import CustomButton from "@/components/common/CustomButton";
import CustomLayout from "@/components/common/CustomLayout";
import { CustomTable } from "@/components/common/CustomTable";
import NoPermission from "@/components/common/NoPermission";
import PharmacySummaryRow from "@/components/pharmacy/PharmacySummaryRow";
import { SortableHeader } from "@/components/common/SortableHeader";
import { FormCheckbox } from "@/components/form-inputs/FormCheckBox";
import FormField from "@/components/form-inputs/FormField";
import { FormInfiniteSelect } from "@/components/form-inputs/FormInfiniteSelect";
import { Form } from "@/components/ui/form";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { DrugSupplier } from "@/generated/prisma/client";
import { ActionType, ModuleType, Status } from "@/generated/prisma/enums";
import { useProfile } from "@/hooks/query/auth";
import { useInfiniteDrugSupplierList } from "@/hooks/query/drugSupplier";
import { useInfiniteInventoryItems } from "@/hooks/query/pharmacyInventory";
import {
  useCreateSupplierReturn,
  useSupplierReturnList,
} from "@/hooks/query/pharmacySupplierReturn";
import {
  ColumnDefWithClass,
  FilterValues,
  PaginatedResponse,
  PharmacyInventoryItemType,
  PharmacySupplierReturnType,
} from "@/lib/type";
import { hasActionPermission } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { PlusIcon, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import {
  Path,
  useFieldArray,
  useForm,
  UseFormReturn,
  useWatch,
} from "react-hook-form";
import { toast } from "sonner";
import z from "zod";
import {
  supplierReturnValidator,
  supplierReturnValidatorType,
} from "@/validators/api/masters/pharmacySupplierReturn";

type SupplierReturnItemForm = {
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

type SupplierReturnFormValues = {
  returnDate: Date;
  supplier?: DrugSupplier | null;
  returnReason?: string | null;
  items: SupplierReturnItemForm[];
};

const supplierReturnFormValidator: z.ZodType<SupplierReturnFormValues> = z.object({
  returnDate: z.coerce.date(),
  supplier: z
    .custom<DrugSupplier | null | undefined>()
    .refine((value) => Boolean(value && Number(value.id) > 0), {
      message: "Supplier is required",
    }),
  returnReason: z.string().trim().max(1000).nullable().optional(),
  items: z.array(
    z.object({
      inventoryItem: z.custom<PharmacyInventoryItemType | null | undefined>(),
      quantity: z.coerce.number().int().min(1, "Quantity must be at least 1"),
      isLooseQuantity: z.coerce.boolean(),
      rate: z.coerce.number(),
      taxableAmount: z.coerce.number(),
      cGstAmount: z.coerce.number(),
      sGstAmount: z.coerce.number(),
      iGstAmount: z.coerce.number(),
      total: z.coerce.number(),
    }),
  ),
});

const money = (value: number) => Number(value || 0).toFixed(2);

const defaultItem = (): SupplierReturnItemForm => ({
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

const PreviousReturnsDialog = ({
  supplierId,
  supplierName,
}: {
  supplierId?: number;
  supplierName?: string;
}) => {
  const [open, setOpen] = useState(false);
  const { data, isLoading, isError, error } = useSupplierReturnList(
    { supplierId },
    1,
    20,
  );

  const columns: ColumnDefWithClass<PharmacySupplierReturnType>[] = [
    {
      accessorKey: "returnDate",
      header: ({ column }) => (
        <SortableHeader<PharmacySupplierReturnType>
          label="Date"
          column={column}
        />
      ),
      cell: ({ row }) => format(row.original.returnDate, "dd/MM/yyyy"),
      headerClassName: "min-w-24",
      cellClassName: "min-w-24",
    },
    {
      accessorKey: "supplier",
      header: ({ column }) => (
        <SortableHeader<PharmacySupplierReturnType>
          label="Supplier"
          column={column}
        />
      ),
      cell: ({ row }) => row.original.supplier.name,
      headerClassName: "min-w-40",
      cellClassName: "min-w-40",
    },
    {
      accessorKey: "returnReason",
      header: ({ column }) => (
        <SortableHeader<PharmacySupplierReturnType>
          label="Return Reason"
          column={column}
        />
      ),
      cell: ({ row }) => row.original.returnReason || "-",
      headerClassName: "min-w-48",
      cellClassName: "min-w-48",
    },
    {
      accessorKey: "total",
      header: ({ column }) => (
        <SortableHeader<PharmacySupplierReturnType>
          label="Total"
          column={column}
        />
      ),
      cell: ({ row }) => money(row.original.total),
      headerClassName: "min-w-24",
      cellClassName: "min-w-24",
    },
  ];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <CustomButton type="button" variant="secondary" disabled={!supplierId}>
          Previous Returns
        </CustomButton>
      </DialogTrigger>
      <DialogContent className="max-w-4xl! border-4 border-secondary bg-white">
        <DialogHeader>
          <DialogTitle className="text-sm text-black/70">
            Previous Returns {supplierName ? `for ${supplierName}` : ""}
          </DialogTitle>
        </DialogHeader>
        <CustomTable
          columns={columns}
          data={data?.data || []}
          isLoading={isLoading}
          isError={isError}
          error={error}
          getRowId={(row) => String(row.id)}
        />
      </DialogContent>
    </Dialog>
  );
};

const SupplierReturnRow = ({
  index,
  form,
  supplierId,
  onRemove,
}: {
  index: number;
  form: UseFormReturn<SupplierReturnFormValues>;
  supplierId?: number;
  onRemove: () => void;
}) => {
  const [inventorySearch, setInventorySearch] = useState("");
  const inventoryQuery = useInfiniteInventoryItems(
    { name: inventorySearch, supplierId } as FilterValues,
    20,
  );

  const rowPath = `items.${index}` as Path<SupplierReturnFormValues>;
  const inventoryPath =
    `${rowPath}.inventoryItem` as Path<SupplierReturnFormValues>;
  const item = useWatch({
    control: form.control,
    name: rowPath,
  }) as SupplierReturnItemForm;

  useEffect(() => {
    const inventory = item?.inventoryItem;
    if (!inventory) return;

    const packSize = Math.max(Number(inventory.itemsPerPack || 1), 1);
    const quantity = Math.max(Number(item.quantity || 1), 1);
    const packageRate = Number(inventory.purchasePrice || 0);
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

    const nextValues: Array<[Path<SupplierReturnFormValues>, number]> = [
      [
        `${rowPath}.rate` as Path<SupplierReturnFormValues>,
        Number(rate.toFixed(2)),
      ],
      [
        `${rowPath}.taxableAmount` as Path<SupplierReturnFormValues>,
        taxableAmount,
      ],
      [`${rowPath}.cGstAmount` as Path<SupplierReturnFormValues>, cGstAmount],
      [`${rowPath}.sGstAmount` as Path<SupplierReturnFormValues>, sGstAmount],
      [`${rowPath}.iGstAmount` as Path<SupplierReturnFormValues>, iGstAmount],
      [`${rowPath}.total` as Path<SupplierReturnFormValues>, total],
    ];

    nextValues.forEach(([path, value]) => {
      if (form.getValues(path) !== value) {
        form.setValue(path, value, { shouldDirty: true });
      }
    });
  }, [
    form,
    item?.inventoryItem,
    item?.isLooseQuantity,
    item?.quantity,
    rowPath,
  ]);

  return (
    <tr className="border-t align-middle">
      <td className="px-2 py-1.5">{index + 1}</td>
      <td className="px-2 py-1.5 min-w-72">
        <FormInfiniteSelect<
          PharmacyInventoryItemType,
          PaginatedResponse<PharmacyInventoryItemType>,
          string,
          SupplierReturnFormValues
        >
          key={`inventory-${supplierId ?? "none"}-${index}`}
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
              `Rate ${money(row.purchasePrice)}`,
            ].join(" | ")
          }
          search={inventorySearch}
          onSearchChange={setInventorySearch}
          placeholder={supplierId ? "Select item" : "Select supplier first"}
          hideError
        />
      </td>
      <td className="px-2 py-1.5">
        {item?.inventoryItem?.drug.manufacturer || "-"}
      </td>
      <td className="px-2 py-1.5">
        {item?.inventoryItem?.hsnSac?.code || "-"}
      </td>
      <td className="px-2 py-1.5">{item?.inventoryItem?.batchNo || "-"}</td>
      <td className="px-2 py-1.5">
        {item?.inventoryItem?.expiryDate
          ? format(new Date(item.inventoryItem.expiryDate), "MM/yy")
          : "-"}
      </td>
      <td className="px-2 py-1.5">
        {item?.inventoryItem?.itemsPerPack || "-"}
      </td>
      <td className="px-2 py-1.5 min-w-16 text-center">
        <FormCheckbox<SupplierReturnFormValues>
          name={`${rowPath}.isLooseQuantity` as Path<SupplierReturnFormValues>}
          control={form.control}
          label=""
          hideLabel
          hideError
          className="mx-auto mt-0"
          formItemClassName="justify-center pb-0"
        />
      </td>
      <td className="px-2 py-1.5 min-w-20">
        <FormField<SupplierReturnFormValues>
          type="number"
          name={`${rowPath}.quantity` as Path<SupplierReturnFormValues>}
          control={form.control}
          hideError
        />
      </td>
      <td className="px-2 py-1.5 whitespace-nowrap">
        {item?.inventoryItem
          ? item.isLooseQuantity
            ? `${Number(item.inventoryItem.quantityInStock || 0)} pcs`
            : `${Math.floor(
                Number(item.inventoryItem.quantityInStock || 0) /
                  Math.max(Number(item.inventoryItem.itemsPerPack || 1), 1),
              )} packs`
          : "-"}
      </td>
      <td className="px-2 py-1.5">{money(item?.rate || 0)}</td>
      <td className="px-2 py-1.5">{money(item?.cGstAmount || 0)}</td>
      <td className="px-2 py-1.5">{money(item?.sGstAmount || 0)}</td>
      <td className="px-2 py-1.5">{money(item?.iGstAmount || 0)}</td>
      <td className="px-2 py-1.5 font-semibold">{money(item?.total || 0)}</td>
      <td className="px-2 py-1.5">
        <button type="button" onClick={onRemove}>
          <Trash2 className="size-3 text-destructive" />
        </button>
      </td>
    </tr>
  );
};

const SupplierReturnForm = () => {
  const [supplierSearch, setSupplierSearch] = useState("");
  const { data: profile } = useProfile(false);
  const { mutateAsync: createSupplierReturn, isPending } =
    useCreateSupplierReturn();
  const supplierQuery = useInfiniteDrugSupplierList(
    { name: supplierSearch, status: Status.active },
    20,
  );

  const form = useForm<SupplierReturnFormValues>({
    defaultValues: {
      returnDate: new Date(),
      supplier: null,
      returnReason: "",
      items: [defaultItem()],
    },
    resolver: zodResolver(supplierReturnFormValidator as any) as any,
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  });

  const supplier = useWatch({
    control: form.control,
    name: "supplier",
  }) as DrugSupplier | null | undefined;
  const items = useWatch({
    control: form.control,
    name: "items",
  });

  useEffect(() => {
    form.setValue("items", [defaultItem()], { shouldDirty: true });
  }, [form, supplier?.id]);

  const summary = useMemo(
    () =>
      (items || []).reduce(
        (acc, item) => {
          acc.taxableAmount += Number(item.taxableAmount || 0);
          acc.cGstAmount += Number(item.cGstAmount || 0);
          acc.sGstAmount += Number(item.sGstAmount || 0);
          acc.iGstAmount += Number(item.iGstAmount || 0);
          acc.total += Number(item.total || 0);
          return acc;
        },
        {
          taxableAmount: 0,
          cGstAmount: 0,
          sGstAmount: 0,
          iGstAmount: 0,
          total: 0,
        },
      ),
    [items],
  );

  const onSubmit = async (values: SupplierReturnFormValues) => {
    if (!supplier?.id) {
      toast.error("Select supplier");
      return;
    }

    const validItems = values.items.filter((item) => item.inventoryItem?.id);
    if (!validItems.length) {
      toast.error("Add at least one inventory item");
      return;
    }

    const hasOverStock = validItems.some((item) => {
      const packSize = Math.max(
        Number(item.inventoryItem?.itemsPerPack || 1),
        1,
      );
      const requestedPieces = item.isLooseQuantity
        ? Number(item.quantity || 0)
        : Number(item.quantity || 0) * packSize;
      return requestedPieces > Number(item.inventoryItem?.quantityInStock || 0);
    });

    if (hasOverStock) {
      toast.error("One or more rows exceed available stock");
      return;
    }

    await createSupplierReturn({
      supplierId: supplier.id,
      returnDate: values.returnDate,
      returnReason: values.returnReason || undefined,
      items: validItems.map((item) => ({
        inventoryItem: { id: Number(item.inventoryItem?.id) },
        quantity: Number(item.quantity || 0),
        isLooseQuantity: Boolean(item.isLooseQuantity),
      })),
    } satisfies supplierReturnValidatorType);
  };

  if (!profile) {
    return <div />;
  }

  console.log(form.formState.errors);

  const canCreate = hasActionPermission(
    profile.data,
    ModuleType.PHARMACY_SUPPLIER_RETURN,
    ActionType.CREATE,
  );

  if (!canCreate) {
    return (
      <CustomLayout title="Supplier Return">
        <NoPermission />
      </CustomLayout>
    );
  }

  return (
    <CustomLayout title="Supplier Return">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
          <div className="space-y-4">
            <div className="grid gap-3 md:grid-cols-3">
              <FormField<SupplierReturnFormValues>
                label="Date"
                type="date"
                name="returnDate"
                control={form.control}
                required
              />
              <FormInfiniteSelect<
                DrugSupplier,
                PaginatedResponse<DrugSupplier>,
                string,
                SupplierReturnFormValues
              >
                label="Supplier"
                name="supplier"
                control={form.control}
                query={supplierQuery}
                getItems={(page) => page?.data}
                valueKey={(item) => String(item.id)}
                labelKey={(item) => item.name}
                search={supplierSearch}
                onSearchChange={setSupplierSearch}
                required
              />
              <FormField<SupplierReturnFormValues>
                label="Return Reason"
                type="text"
                name="returnReason"
                control={form.control}
              />
            </div>

            <div className="flex justify-end">
              <PreviousReturnsDialog
                supplierId={supplier?.id}
                supplierName={supplier?.name}
              />
            </div>

            <div className="rounded-sm border border-black/20">
              <div className="overflow-x-auto overflow-y-hidden">
                <table className="w-full min-w-[1450px] border-collapse text-tiny">
                  <thead className="bg-muted">
                    <tr>
                      <th className="border-r border-black/20 px-2 py-2 text-left">
                        No.
                      </th>
                      <th className="border-r border-black/20 px-2 py-2 text-left">
                        Item
                      </th>
                      <th className="border-r border-black/20 px-2 py-2 text-left">
                        Mfg
                      </th>
                      <th className="border-r border-black/20 px-2 py-2 text-left">
                        HSN
                      </th>
                      <th className="border-r border-black/20 px-2 py-2 text-left">
                        Batch
                      </th>
                      <th className="border-r border-black/20 px-2 py-2 text-left">
                        Exp
                      </th>
                      <th className="border-r border-black/20 px-2 py-2 text-left">
                        Pack
                      </th>
                      <th className="border-r border-black/20 px-2 py-2 text-left">
                        Loose
                      </th>
                      <th className="border-r border-black/20 px-2 py-2 text-left">
                        Qty
                      </th>
                      <th className="border-r border-black/20 px-2 py-2 text-left">
                        Stock
                      </th>
                      <th className="border-r border-black/20 px-2 py-2 text-left">
                        Rate
                      </th>
                      <th className="border-r border-black/20 px-2 py-2 text-left">
                        CGST
                      </th>
                      <th className="border-r border-black/20 px-2 py-2 text-left">
                        SGST
                      </th>
                      <th className="border-r border-black/20 px-2 py-2 text-left">
                        IGST
                      </th>
                      <th className="px-2 py-2 text-left">Total</th>
                      <th className="px-2 py-2" />
                    </tr>
                  </thead>
                  <tbody>
                    {fields.map((field, index) => (
                      <SupplierReturnRow
                        key={`${field.id}-${supplier?.id ?? "none"}`}
                        index={index}
                        form={form}
                        supplierId={supplier?.id}
                        onRemove={() => remove(index)}
                      />
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="border-t border-black/20 px-3 py-2">
                <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                  <button
                    className="inline-flex items-center gap-1 rounded-sm border border-black/20 bg-white px-3 py-1 text-tiny transition hover:bg-slate-50"
                    type="button"
                    onClick={() => append(defaultItem())}
                  >
                    <PlusIcon className="size-3" />
                    Add Inventory Item
                  </button>

                  <div className="w-full max-w-[260px] overflow-hidden rounded-sm border border-black/20 bg-background/50 md:ml-auto">
                    <PharmacySummaryRow
                      label="Taxable Amount"
                      value={money(summary.taxableAmount)}
                    />
                    <PharmacySummaryRow
                      label="CGST"
                      value={money(summary.cGstAmount)}
                    />
                    <PharmacySummaryRow
                      label="SGST"
                      value={money(summary.sGstAmount)}
                    />
                    <PharmacySummaryRow
                      label="IGST"
                      value={money(summary.iGstAmount)}
                    />
                    <PharmacySummaryRow
                      label="Total"
                      value={money(summary.total)}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <CustomButton disabled={isPending} type="submit">
                Save Supplier Return
              </CustomButton>
            </div>
          </div>
        </form>
      </Form>
    </CustomLayout>
  );
};

export default SupplierReturnForm;
