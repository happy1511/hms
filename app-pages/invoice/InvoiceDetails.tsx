"use client";

import CustomActionDropdown from "@/components/common/CustomActionDropdown";
import CustomButton from "@/components/common/CustomButton";
import TransactionsModal from "@/components/common/TransactionsModal";
import { FormInfiniteSelect } from "@/components/form-inputs/FormInfiniteSelect";
import FormField from "@/components/form-inputs/FormField";
import AddPaymentModal from "@/components/opd/AddPayment";
import ViewInvoiceModal from "@/components/opd/ViewInvoiceModal";
import DaywiseDateModal from "@/components/opd/DaywiseDateModal";
import InvoicePreviewModal from "@/components/opd/InvoicePreviewModal";
import SectionPickerModal from "@/components/opd/SectionPickerModal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  ActionType,
  DiscountType,
  ModuleType,
  Status,
} from "@/generated/prisma/enums";
import { useProfile } from "@/hooks/query/auth";
import { useInvoiceDetails, useUpdateInvoice } from "@/hooks/query/invoice";
import { useInfiniteServicesList } from "@/hooks/query/service";
import { InvoiceBillingItem } from "@/lib/type";
import { getDiscountTypeOptions, hasActionPermission } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import {
  ChevronDown,
  ChevronUp,
  FilePenLine,
  LoaderIcon,
  Plus,
  User,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrayPath,
  Path,
  useFieldArray,
  useForm,
  useWatch,
  UseFormReturn,
  Controller,
} from "react-hook-form";
import { toast } from "sonner";
import {
  billingItemValidatorType,
  updateInvoiceValidator,
  updateInvoiceValidatorType,
} from "@/validators/api/invoice/invoice";

type BillingItemSnapshot = {
  itemId?: number;
  billingSectionId?: number;
  serviceId?: number;
  quantity: number;
  rate: number;
  discountType: DiscountType;
  discountValue: number;
  total: number;
};

const roundAmount = (value: number) => Number(value.toFixed(2));

const formatCurrency = (value: number) =>
  `Rs. ${roundAmount(value).toFixed(2)}`;

const getDiscountAmount = (
  amount: number,
  discountType: DiscountType,
  discountValue: number,
) => {
  return discountType === DiscountType.PERCENTAGE
    ? (amount * discountValue) / 100
    : discountValue;
};

const getBillingItemLiveTotal = (
  item:
    | Partial<billingItemValidatorType>
    | {
        total?: unknown;
        quantity?: unknown;
        rate?: unknown;
        discountType?: unknown;
        discountValue?: unknown;
      }
    | null
    | undefined,
) => {
  const quantity = Number(item?.quantity || 0);
  const rate = Number(item?.rate || 0);
  const gross = quantity * rate;

  if (gross > 0 || quantity > 0 || rate > 0) {
    const discount = getDiscountAmount(
      gross,
      (item?.discountType as DiscountType) || DiscountType.VALUE,
      Number(item?.discountValue || 0),
    );

    return roundAmount(Math.max(gross - discount, 0));
  }

  return roundAmount(Number(item?.total || 0));
};

const getBillingItemSnapshot = (
  item?: Partial<billingItemValidatorType> | null,
): BillingItemSnapshot => ({
  itemId: item?.itemId ? Number(item.itemId) : undefined,
  billingSectionId: item?.billingSection?.id
    ? Number(item.billingSection.id)
    : undefined,
  serviceId: item?.service?.id ? Number(item.service.id) : undefined,
  quantity: Number(item?.quantity || 0),
  rate: Number(item?.rate || 0),
  discountType: (item?.discountType || DiscountType.VALUE) as DiscountType,
  discountValue: Number(item?.discountValue || 0),
  total: Number(item?.total || 0),
});

const hasBillingItemChanged = (
  currentItem: Partial<billingItemValidatorType> | null | undefined,
  initialItem?: BillingItemSnapshot,
) => {
  if (!initialItem || !currentItem?.itemId) {
    return false;
  }

  const currentSnapshot = getBillingItemSnapshot(currentItem);

  return (
    initialItem.billingSectionId !== currentSnapshot.billingSectionId ||
    initialItem.serviceId !== currentSnapshot.serviceId ||
    initialItem.quantity !== currentSnapshot.quantity ||
    initialItem.rate !== currentSnapshot.rate ||
    initialItem.discountType !== currentSnapshot.discountType ||
    initialItem.discountValue !== currentSnapshot.discountValue ||
    initialItem.total !== currentSnapshot.total
  );
};

const getSectionTotal = ({
  items,
  discountType,
  discountValue,
}: {
  items: Array<{
    total?: unknown;
    quantity?: unknown;
    rate?: unknown;
    discountType?: unknown;
    discountValue?: unknown;
  }>;
  discountType: DiscountType;
  discountValue: number;
}) => {
  const sectionSubtotal = items.reduce((sum, item) => {
    return sum + getBillingItemLiveTotal(item);
  }, 0);
  const discount = getDiscountAmount(
    sectionSubtotal,
    discountType,
    Number(discountValue || 0),
  );

  return Math.max(sectionSubtotal - discount, 0);
};

const getSectionAmounts = ({
  items,
  discountType,
  discountValue,
}: {
  items: Array<{
    total?: unknown;
    quantity?: unknown;
    rate?: unknown;
    discountType?: unknown;
    discountValue?: unknown;
  }>;
  discountType: DiscountType;
  discountValue: number;
}) => {
  const subtotal = roundAmount(
    items.reduce((sum, item) => sum + getBillingItemLiveTotal(item), 0),
  );
  const discount = roundAmount(
    Math.min(
      getDiscountAmount(subtotal, discountType, Number(discountValue || 0)),
      subtotal,
    ),
  );
  const total = roundAmount(Math.max(subtotal - discount, 0));

  return { subtotal, discount, total };
};

const getInvoiceAmounts = ({
  billingSections,
  discountType,
  discountValue,
  isFree,
  transactions,
}: {
  billingSections: updateInvoiceValidatorType["billingSections"];
  discountType: DiscountType;
  discountValue: number;
  isFree: boolean;
  transactions?: updateInvoiceValidatorType["transactions"];
}) => {
  const subtotal = roundAmount(
    (billingSections || []).reduce((sum, section) => {
      const sectionAmounts = getSectionAmounts({
        items: (section?.billingItems || []) as Array<{
          total?: unknown;
          quantity?: unknown;
          rate?: unknown;
          discountType?: unknown;
          discountValue?: unknown;
        }>,
        discountType: (section?.discountType ||
          DiscountType.VALUE) as DiscountType,
        discountValue: Number(section?.discountValue || 0),
      });

      return sum + sectionAmounts.total;
    }, 0),
  );

  const invoiceDiscount = roundAmount(
    Math.min(
      getDiscountAmount(subtotal, discountType, Number(discountValue || 0)),
      subtotal,
    ),
  );
  const total = isFree
    ? 0
    : roundAmount(Math.max(subtotal - invoiceDiscount, 0));
  const paid = roundAmount(
    (transactions || []).reduce(
      (sum, transaction) => sum + Number(transaction?.amount || 0),
      0,
    ),
  );
  const due = roundAmount(Math.max(total - paid, 0));

  return { subtotal, invoiceDiscount, total, paid, due };
};

type TableProps = {
  form: UseFormReturn<updateInvoiceValidatorType>;
  selectedIndex: number;
  data: InvoiceBillingItem;
  initialItemsMap: Map<number, BillingItemSnapshot>;
  canUpdateInvoice: boolean;
};

type ServiceRowProps = {
  index: number;
  form: UseFormReturn<updateInvoiceValidatorType>;
  fieldName: Path<updateInvoiceValidatorType>;
  initialItemsMap: Map<number, BillingItemSnapshot>;
};

const ServiceRow = ({
  index,
  form,
  fieldName,
  initialItemsMap,
}: ServiceRowProps) => {
  const { control, watch, setValue, getValues } = form;
  const [reasonOpen, setReasonOpen] = useState(false);
  const [serviceSearch, setServiceSearch] = useState("");
  const previousServiceIdRef = useRef<number | null>(null);
  const servicesQuery = useInfiniteServicesList(
    { name: serviceSearch, status: Status.active },
    10,
  );

  const rowPath = `${fieldName}.${index}` as Path<updateInvoiceValidatorType>;

  const service = watch(
    `${rowPath}.service` as Path<updateInvoiceValidatorType>,
  ) as billingItemValidatorType["service"];
  const quantity = watch(
    `${rowPath}.quantity` as Path<updateInvoiceValidatorType>,
  );
  const rate = watch(`${rowPath}.rate` as Path<updateInvoiceValidatorType>);
  const discountType = watch(
    `${rowPath}.discountType` as Path<updateInvoiceValidatorType>,
  );
  const discountValue = watch(
    `${rowPath}.discountValue` as Path<updateInvoiceValidatorType>,
  );
  const maxDiscount = watch(
    `${rowPath}.maxDiscount` as Path<updateInvoiceValidatorType>,
  );
  const total = watch(`${rowPath}.total` as Path<updateInvoiceValidatorType>);
  const itemId = watch(`${rowPath}.itemId` as Path<updateInvoiceValidatorType>);
  const updateReason = watch(
    `${rowPath}.updateReason` as Path<updateInvoiceValidatorType>,
  );

  const flatServices = useMemo(
    () =>
      servicesQuery.data?.pages.flatMap((page) =>
        page.data.map((item) => ({
          id: item.id,
          name: item.name,
          price: item.price,
          maxDiscount: item.maxDiscount,
        })),
      ) || [],
    [servicesQuery.data],
  );

  useEffect(() => {
    const selectedServiceId = Number(service?.id || 0);

    if (!selectedServiceId) return;

    const existingService = flatServices.find(
      (item) => item.id === selectedServiceId,
    );
    if (!existingService) return;
    if (previousServiceIdRef.current === selectedServiceId) return;

    previousServiceIdRef.current = selectedServiceId;

    const currentServiceId = initialItemsMap.get(Number(itemId))?.serviceId;
    const shouldResetRow = !itemId || currentServiceId !== selectedServiceId;

    if (shouldResetRow) {
      setValue(
        `${rowPath}.rate` as Path<updateInvoiceValidatorType>,
        existingService.price,
      );
      setValue(`${rowPath}.quantity` as Path<updateInvoiceValidatorType>, 1);
      setValue(
        `${rowPath}.discountType` as Path<updateInvoiceValidatorType>,
        DiscountType.VALUE,
      );
      setValue(
        `${rowPath}.discountValue` as Path<updateInvoiceValidatorType>,
        0,
      );
    }

    setValue(
      `${rowPath}.maxDiscount` as Path<updateInvoiceValidatorType>,
      existingService.maxDiscount ?? 0,
    );
  }, [service, flatServices, itemId, initialItemsMap, rowPath, setValue]);

  useEffect(() => {
    const gross = Number(quantity) * Number(rate || 0);
    const discount =
      discountType === DiscountType.PERCENTAGE
        ? (gross * Number(discountValue)) / 100
        : Number(discountValue);
    const newTotal = Math.max(roundAmount(gross - discount), 0);

    if (
      getValues(`${rowPath}.total` as Path<updateInvoiceValidatorType>) !==
      newTotal
    ) {
      setValue(
        `${rowPath}.total` as Path<updateInvoiceValidatorType>,
        newTotal,
      );
    }
  }, [
    quantity,
    rate,
    discountType,
    discountValue,
    getValues,
    rowPath,
    setValue,
  ]);

  const gross = Number(quantity) * Number(rate);
  const maxAllowed =
    discountType === DiscountType.PERCENTAGE
      ? (gross * (Number(maxDiscount) || 0)) / 100
      : Number(maxDiscount || 0);
  const isInvalidDiscount = Number(discountValue) > Number(maxAllowed);
  const initialItem = initialItemsMap.get(Number(itemId));
  const isUpdatedRow = hasBillingItemChanged(
    getValues(
      rowPath as Path<updateInvoiceValidatorType>,
    ) as billingItemValidatorType,
    initialItem,
  );
  const hasUpdateReason = Boolean(String(updateReason ?? "").trim());

  return (
    <tr className="border-t align-top">
      <td>
        <div className="px-2 py-1">{index + 1}</div>
      </td>
      <td>
        {isUpdatedRow && (
          <Button
            type="button"
            variant={hasUpdateReason ? "outline" : "destructive"}
            className="aspect-square bg-transparent border-none text-destructive hover:text-white"
            onClick={() => setReasonOpen(true)}
          >
            <FilePenLine className="size-3" />
          </Button>
        )}

        <Dialog open={reasonOpen} onOpenChange={setReasonOpen}>
          <DialogContent className="max-w-lg! border-secondary border-4 bg-white">
            <DialogHeader>
              <DialogTitle className="text-sm text-black/60">
                Update Reason
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground">
                Add the reason for updating this invoice row.
              </p>
              <Textarea
                value={String(updateReason ?? "")}
                onChange={(event) =>
                  setValue(
                    `${rowPath}.updateReason` as Path<updateInvoiceValidatorType>,
                    event.target.value,
                    { shouldDirty: true, shouldValidate: true },
                  )
                }
                placeholder="Enter update reason"
                rows={5}
              />
            </div>
            <DialogFooter>
              <CustomButton type="button" onClick={() => setReasonOpen(false)}>
                Save Reason
              </CustomButton>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </td>
      <td>
        <div className="px-2 py-1 space-y-1">
          <div className="flex items-start gap-2">
            <div className="flex-1">
              <FormInfiniteSelect
                control={control}
                name={`${rowPath}.service` as Path<updateInvoiceValidatorType>}
                query={servicesQuery}
                getItems={(page) => page?.data}
                valueKey={(item) => String(item.id)}
                labelKey={(item) => item.name}
                search={serviceSearch}
                onSearchChange={setServiceSearch}
                placeholder="Service"
                hideError
              />
            </div>
          </div>
          {isUpdatedRow && !hasUpdateReason && (
            <p className="text-xs text-red-500">
              Reason is required for updates
            </p>
          )}
        </div>
      </td>
      <td>
        <div className="px-2 py-1">
          <Controller
            control={control}
            name={`${rowPath}.createdAt` as Path<updateInvoiceValidatorType>}
            render={({ field }) => {
              const value = field.value
                ? (() => {
                    const d = new Date(field.value as any);
                    return Number.isNaN(d.getTime())
                      ? ""
                      : d.toISOString().slice(0, 10);
                  })()
                : "";
              return (
                <input
                  type="date"
                  className="w-full rounded border px-2 py-1 text-xs"
                  value={value}
                  onChange={(e) =>
                    field.onChange(
                      e.target.value ? new Date(e.target.value) : null,
                    )
                  }
                  onBlur={field.onBlur}
                />
              );
            }}
          />
        </div>
      </td>
      <td>
        <div className="px-2 py-1">
          <FormField
            type="number"
            name={`${rowPath}.quantity` as Path<updateInvoiceValidatorType>}
            control={control}
            hideError
          />
        </div>
      </td>
      <td>
        <div className="px-2 py-1">
          <FormField
            type="number"
            name={`${rowPath}.rate` as Path<updateInvoiceValidatorType>}
            control={control}
            hideError
          />
        </div>
      </td>
      <td>
        <div className="px-2 py-1">
          <FormField
            type="select"
            name={`${rowPath}.discountType` as Path<updateInvoiceValidatorType>}
            control={control}
            options={getDiscountTypeOptions()}
            hideError
          />
        </div>
      </td>
      <td>
        <div className="px-2 py-1">
          <FormField
            type="number"
            name={
              `${rowPath}.discountValue` as Path<updateInvoiceValidatorType>
            }
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
      <td className="font-semibold w-30">
        <div className="px-2 py-1 text-center">
          Rs. {Number(total).toFixed(2)}
        </div>
      </td>
    </tr>
  );
};

const InvoiceBillingTable = ({
  form,
  selectedIndex,
  data,
  initialItemsMap,
  canUpdateInvoice,
}: TableProps) => {
  const { control } = form;
  const sectionPath =
    `billingSections.${selectedIndex}` as Path<updateInvoiceValidatorType>;
  const fieldName =
    `billingSections.${selectedIndex}.billingItems` as ArrayPath<updateInvoiceValidatorType>;

  const { fields, append } = useFieldArray({
    control,
    name: fieldName,
  });
  const watchedBillingItems = useWatch({
    control,
    name: fieldName,
  });
  const watchedSectionDiscountType = useWatch({
    control,
    name: `${sectionPath}.discountType` as Path<updateInvoiceValidatorType>,
  });
  const watchedSectionDiscountValue = useWatch({
    control,
    name: `${sectionPath}.discountValue` as Path<updateInvoiceValidatorType>,
  });
  const sectionAmounts = getSectionAmounts({
    items: (watchedBillingItems || []) as Array<{
      total?: unknown;
      quantity?: unknown;
      rate?: unknown;
      discountType?: unknown;
      discountValue?: unknown;
    }>,
    discountType: (watchedSectionDiscountType ||
      DiscountType.VALUE) as DiscountType,
    discountValue: Number(watchedSectionDiscountValue || 0),
  });

  return (
    <div className="flex h-full flex-col bg-white">
      <div className="flex w-full justify-between items-center">
        <div className="px-3 py-3">
          <p className="text-sm font-medium capitalize">{data.name}</p>
          <p className="text-xs text-muted-foreground">
            Manage item-wise charges and section-level discount here.
          </p>
        </div>
        <div className="px-3">
          {canUpdateInvoice && (
            <CustomButton
              type="button"
              onClick={() =>
                append({
                  quantity: 1,
                  discountType: DiscountType.VALUE,
                  discountValue: 0,
                  total: 0,
                  billingSection: { id: data.id, name: data.name },
                  createdAt: new Date(),
                } as billingItemValidatorType)
              }
            >
              <Plus className="size-3" />
              <p>Add New Item</p>
            </CustomButton>
          )}
        </div>
      </div>

      <div className="w-full flex-1 overflow-auto px-3 pb-3">
        <table className="w-full border text-tiny">
          <thead className="bg-muted">
            <tr>
              <th>
                <div className="px-2 py-1">#</div>
              </th>
              <th></th>
              <th className="w-62.5">
                <div className="px-2 py-1">Service</div>
              </th>
              <th className="w-28">
                <div className="px-2 py-1">Date</div>
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
            </tr>
          </thead>
          <tbody>
            {fields.map((field, index) => (
              <ServiceRow
                key={field.id}
                index={index}
                form={form}
                fieldName={fieldName}
                initialItemsMap={initialItemsMap}
              />
            ))}
          </tbody>
        </table>

        <div className="border-t border-border bg-white mt-2">
          <div className="rounded-md border border-dashed border-border bg-muted/30 p-3 grid grid-cols-2">
            <div className="grid gap-3 sm:grid-cols-[140px_120px]">
              <FormField
                control={control}
                hideError
                name={
                  `${sectionPath}.discountType` as Path<updateInvoiceValidatorType>
                }
                options={getDiscountTypeOptions()}
                type="select"
              />
              <FormField
                control={control}
                hideError
                name={
                  `${sectionPath}.discountValue` as Path<updateInvoiceValidatorType>
                }
                type="number"
              />
            </div>
            <div className="grid rounded-md border border-secondary/20 bg-secondary/5 p-2 text-tiny">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground text-tiny">
                  Section Subtotal
                </span>
                <span className="font-medium text-tiny">
                  {formatCurrency(sectionAmounts.subtotal)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground text-tiny">
                  After Discount
                </span>
                <span className="font-semibold text-tiny">
                  {formatCurrency(sectionAmounts.total)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const InvoiceDetails = () => {
  const [transactionsOpen, setTransactionsOpen] = useState(false);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [previewInvoiceOpen, setPreviewInvoiceOpen] = useState(false);
  const [dayWiseModalOpen, setDayWiseModalOpen] = useState(false);
  const [dayWiseDate, setDayWiseDate] = useState<string>(() =>
    format(new Date(), "yyyy-MM-dd"),
  );
  const [printPreviewSrc, setPrintPreviewSrc] = useState<string | null>(null);
  const [printPreviewOpen, setPrintPreviewOpen] = useState<boolean>(false);
  const [previewMode, setPreviewMode] = useState<
    "summary" | "details" | "dayWise" | "compact" | null
  >(null);
  const [previewDate, setPreviewDate] = useState<string | null>(null);
  const [selectedSectionIds, setSelectedSectionIds] = useState<string[] | null>(
    null,
  );
  const [summaryCollapsed, setSummaryCollapsed] = useState(false);
  const [sectionPickerOpen, setSectionPickerOpen] = useState(false);
  const { invoiceId }: { invoiceId: string } = useParams();
  const { data, isLoading } = useInvoiceDetails({
    invoiceId: Number(invoiceId),
  });
  const { data: profile } = useProfile(false);
  const { mutateAsync, isPending } = useUpdateInvoice();
  const router = useRouter();

  const form = useForm<updateInvoiceValidatorType>({
    resolver: zodResolver(updateInvoiceValidator),
  });

  const watchedSections = useWatch({
    control: form.control,
    name: "billingSections",
  });
  const watchedDiscountType = useWatch({
    control: form.control,
    name: "discountType",
  });
  const watchedDiscountValue = useWatch({
    control: form.control,
    name: "discountValue",
  });
  const watchedIsFree = useWatch({
    control: form.control,
    name: "isFree",
  });
  const watchedTransactions = useWatch({
    control: form.control,
    name: "transactions",
  });

  const invoiceAmounts = useMemo(
    () =>
      getInvoiceAmounts({
        billingSections: watchedSections,
        discountType: (watchedDiscountType ||
          DiscountType.VALUE) as DiscountType,
        discountValue: Number(watchedDiscountValue || 0),
        isFree: Boolean(watchedIsFree),
        transactions: watchedTransactions,
      }),
    [
      watchedDiscountType,
      watchedDiscountValue,
      watchedIsFree,
      watchedSections,
      watchedTransactions,
    ],
  );
  const isFormInitialized =
    !!data &&
    watchedDiscountType !== undefined &&
    watchedDiscountValue !== undefined &&
    watchedIsFree !== undefined &&
    (watchedSections?.length ?? 0) === data.sections.length;

  const liveSections = useMemo(
    () =>
      data?.sections.map((section, index) => {
        const watchedSection = watchedSections?.[index];
        const liveItems =
          watchedSection?.billingItems || section.invoiceBillingItems;
        const liveDiscountType =
          (watchedSection?.discountType as DiscountType) ||
          section.discountType ||
          DiscountType.VALUE;
        const liveDiscountValue = Number(
          watchedSection?.discountValue ?? section.discountValue ?? 0,
        );

        return {
          ...section,
          liveItemCount: liveItems.length,
          liveTotal: roundAmount(
            getSectionTotal({
              items: liveItems as Array<{
                total?: unknown;
                quantity?: unknown;
                rate?: unknown;
                discountType?: unknown;
                discountValue?: unknown;
              }>,
              discountType: liveDiscountType,
              discountValue: liveDiscountValue,
            }),
          ),
        };
      }) || [],
    [data?.sections, watchedSections],
  );

  const initialItemsMap = useMemo(
    () =>
      new Map(
        (data?.sections || []).flatMap((section) =>
          section.invoiceBillingItems.map((item) => [
            item.id,
            {
              itemId: item.id,
              billingSectionId: section.id,
              serviceId: item.service.id,
              quantity: item.quantity,
              rate: item.rate,
              discountType: item.discountType,
              discountValue: item.discountValue,
              total: item.total,
            } satisfies BillingItemSnapshot,
          ]),
        ),
      ),
    [data],
  );

  const updatedRowsMissingReasons = useMemo(
    () =>
      watchedSections?.flatMap((section, sectionIndex) =>
        (section?.billingItems || []).flatMap((item, itemIndex) => {
          if (
            !hasBillingItemChanged(
              item,
              initialItemsMap.get(Number(item?.itemId)),
            )
          ) {
            return [];
          }

          if (String(item.updateReason ?? "").trim()) {
            return [];
          }

          return [{ sectionIndex, itemIndex }];
        }),
      ) || [],
    [initialItemsMap, watchedSections],
  );

  const onSubmit = (values: updateInvoiceValidatorType) => {
    if (updatedRowsMissingReasons.length) {
      updatedRowsMissingReasons.forEach(({ sectionIndex, itemIndex }) => {
        form.setError(
          `billingSections.${sectionIndex}.billingItems.${itemIndex}.updateReason`,
          {
            type: "required",
            message: "Update reason is required",
          },
        );
      });
      toast.error("Add a reason for each updated invoice row before saving");
      return;
    }

    mutateAsync(values);
  };

  useEffect(() => {
    if (!data) return;

    form.reset({
      billingSections: data.sections.map((section) => ({
        id: section.id,
        invoiceBillingSectionId: section.invoiceBillingSectionId ?? undefined,
        discountType: section.discountType ?? DiscountType.VALUE,
        discountValue: section.discountValue ?? 0,
        billingItems: section.invoiceBillingItems.map((item) => ({
          quantity: item.quantity,
          total: item.total,
          discountType: item.discountType,
          discountValue: item.discountValue,
          service: {
            ...item.service,
            maxDiscount: item.service.maxDiscount ?? 0,
          },
          rate: item.rate,
          billingSection: { id: section.id, name: section.name },
          createdAt: new Date(item.createdAt),
          itemId: item.id,
          updateReason:
            (item as { updateReason?: string | null }).updateReason ?? null,
        })),
      })),
      transactions: data.transactions,
      rate: data.rate,
      discountType: data.discountType,
      discountValue: data.discountValue,
      billingType: data.billingType,
      isFree: data.isFree,
      total: data.total,
      isPaid: data.isPaid,
      id: data.id,
    });
  }, [data, form]);

  useEffect(() => {
    form.setValue("rate", invoiceAmounts.subtotal);
    form.setValue("total", invoiceAmounts.total);
  }, [form, invoiceAmounts.subtotal, invoiceAmounts.total]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <LoaderIcon className="animate-spin size-4" />
      </div>
    );
  }

  if (!data || !profile) return <div />;

  if (!isFormInitialized) {
    return (
      <div className="flex justify-center items-center h-full">
        <LoaderIcon className="animate-spin size-4" />
      </div>
    );
  }

  const permissionModule = data.opd
    ? ModuleType.OPD_BILL
    : data.ipd
      ? ModuleType.IPD_BILL
      : undefined;

  if (!permissionModule) return <div />;

  const canViewInvoice = hasActionPermission(
    profile.data,
    permissionModule,
    ActionType.VIEW,
  );
  const canUpdateInvoice = hasActionPermission(
    profile.data,
    permissionModule,
    ActionType.UPDATE,
  );
  const canPrintInvoice = hasActionPermission(
    profile.data,
    permissionModule,
    ActionType.PRINT,
  );

  if (!canViewInvoice) {
    return <div />;
  }

  return (
    <>
      <Form {...form}>
        <form
          onSubmit={
            canUpdateInvoice
              ? form.handleSubmit(onSubmit)
              : (event) => event.preventDefault()
          }
          className="h-full"
        >
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
                      ...(canUpdateInvoice
                        ? [
                            {
                              label: "Add Transaction",
                              onClick: () => setPaymentModalOpen(true),
                            },
                          ]
                        : []),
                    ],
                  },
                ]}
                align="start"
                triggerLabel="Payment"
              />
              {canPrintInvoice && (
                <CustomActionDropdown
                  triggerLabel="Print"
                  align="start"
                  groups={[
                    {
                      label: "Invoice",
                      items: [
                        {
                          label: "Summary",
                          onClick: () => {
                            setPreviewMode("summary");
                            setPrintPreviewOpen(true);
                          },
                        },
                        {
                          label: "Detailed Invoice",
                          onClick: () => {
                            setPreviewMode("details");
                            setPrintPreviewOpen(true);
                          },
                        },
                        {
                          label: "Day Wise",
                          onClick: () => setDayWiseModalOpen(true),
                        },
                        {
                          label: "Invoice Sections",
                          onClick: () => setSectionPickerOpen(true),
                        },
                        {
                          label: "Payment Receipts",
                          onClick: () => setTransactionsOpen(true),
                        },
                        {
                          label: "Invoice Compact",
                          onClick: () => {
                            setPreviewMode("compact");
                            setPrintPreviewOpen(true);
                          },
                        },
                      ],
                    },
                  ]}
                />
              )}
              {canUpdateInvoice && (
                <CustomButton
                  disabled={isPending || updatedRowsMissingReasons.length > 0}
                  type="submit"
                >
                  Save Invoice
                </CustomButton>
              )}
              {canPrintInvoice && (
                <CustomButton
                  type="button"
                  onClick={() => setPreviewInvoiceOpen(true)}
                >
                  Preview Invoice
                </CustomButton>
              )}
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
                {data.opd?.patient.firstName} {data.opd?.patient.lastName}
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
            defaultValue={String(data.sections[0]?.id)}
            className="flex h-[calc(100%-52px)] overflow-hidden bg-white"
            orientation="vertical"
          >
            <div className="h-full border-r">
              <TabsList className="flex flex-col w-56 rounded-none p-0 items-stretch justify-start overflow-x-hidden overflow-y-auto">
                {liveSections.map((item) => {
                  return (
                    <TabsTrigger
                      key={item.id}
                      value={String(item.id)}
                      className="flex w-full m-0 border-none items-start justify-between text-left rounded-none border-b px-3 py-2 text-tiny font-bold uppercase bg-white data-[state=active]:bg-secondary data-[state=active]:text-white data-[state=active]:shadow-none whitespace-normal h-auto"
                    >
                      <div className="flex w-full flex-col gap-0.5 text-left">
                        <span className="text-tiny font-bold">{item.name}</span>
                        <span className="text-tiny opacity-80">
                          {formatCurrency(item.liveTotal)}
                        </span>
                      </div>
                      <Badge
                        variant="secondary"
                        className="text-tiny! h-4 min-w-4 px-1 rounded-full ml-1 shrink-0 bg-background text-black"
                      >
                        {item.liveItemCount}
                      </Badge>
                    </TabsTrigger>
                  );
                })}
              </TabsList>
            </div>

            <div className="flex-1 overflow-hidden">
              {data.sections.map((item, index) => (
                <TabsContent
                  key={item.id}
                  value={String(item.id)}
                  className="h-full"
                >
                  <InvoiceBillingTable
                    form={form}
                    data={item}
                    selectedIndex={index}
                    initialItemsMap={initialItemsMap}
                    canUpdateInvoice={Boolean(canUpdateInvoice)}
                  />
                </TabsContent>
              ))}
            </div>
          </Tabs>
          {canUpdateInvoice && updatedRowsMissingReasons.length > 0 && (
            <div className="border-t bg-white px-3 py-2 text-xs text-red-500">
              Add a reason for each updated row before saving the invoice.
            </div>
          )}
          <div className="fixed right-4 bottom-4 z-40 w-[min(360px,calc(100vw-2rem))]">
            <div className="overflow-hidden rounded-xl border border-secondary/20 bg-white shadow-2xl">
              <button
                type="button"
                className="flex w-full items-center justify-between bg-secondary px-4 py-3 text-left text-white"
                onClick={() => setSummaryCollapsed((value) => !value)}
              >
                <div>
                  <p className="text-tiny uppercase tracking-[0.2em] text-white/70">
                    Invoice Summary
                  </p>
                  <p className="text-tiny font-semibold">
                    {formatCurrency(invoiceAmounts.total)}
                  </p>
                </div>
                {summaryCollapsed ? (
                  <ChevronUp className="size-4" />
                ) : (
                  <ChevronDown className="size-4" />
                )}
              </button>

              {!summaryCollapsed && (
                <div className="grid gap-3 p-4 text-tiny">
                  <div className="flex items-center justify-between gap-3 rounded-lg border border-border bg-muted/30 px-3 py-2">
                    <span className="text-muted-foreground">Discount</span>
                    <div className="grid grid-cols-[72px_92px] gap-2">
                      <FormField
                        type="select"
                        name={
                          "discountType" as Path<updateInvoiceValidatorType>
                        }
                        control={form.control}
                        options={getDiscountTypeOptions()}
                        hideError
                      />
                      <FormField
                        type="number"
                        name={
                          "discountValue" as Path<updateInvoiceValidatorType>
                        }
                        control={form.control}
                        hideError
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">
                      Invoice Subtotal
                    </span>
                    <span className="font-medium">
                      {formatCurrency(invoiceAmounts.subtotal)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">
                      Discount Amount
                    </span>
                    <span className="font-medium">
                      {formatCurrency(invoiceAmounts.invoiceDiscount)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Paid</span>
                    <span className="font-medium">
                      {formatCurrency(invoiceAmounts.paid)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between border-t pt-3">
                    <span className="font-semibold">Total</span>
                    <span className="text-base font-semibold">
                      {formatCurrency(invoiceAmounts.total)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between rounded-lg bg-muted px-3 py-2">
                    <span className="font-semibold">Due</span>
                    <span className="text-base font-semibold text-destructive">
                      {formatCurrency(invoiceAmounts.due)}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </form>
      </Form>

      <DaywiseDateModal
        open={dayWiseModalOpen}
        onOpenChange={setDayWiseModalOpen}
        defaultDate={dayWiseDate}
        onConfirm={(date) => {
          setDayWiseDate(date);
          setPreviewDate(date);
          setPreviewMode("dayWise");
          setPrintPreviewOpen(true);
        }}
      />

      <TransactionsModal
        billId={data.id}
        open={transactionsOpen}
        onOpenChange={setTransactionsOpen}
        patientName={`${data.opd?.patient.firstName} ${data.opd?.patient.lastName}`}
        data={data.transactions || []}
        printModule={
          data.opd
            ? ModuleType.OPD_BILL
            : data.ipd
              ? ModuleType.IPD_BILL
              : undefined
        }
        trigger={<div />}
      />
      <AddPaymentModal
        open={paymentModalOpen}
        onOpenChange={setPaymentModalOpen}
        billId={data.id}
        trigger={<div />}
      />
      <InvoicePreviewModal
        open={printPreviewOpen && previewMode !== null}
        onOpenChange={(open) => {
          setPrintPreviewOpen(open);
          if (!open) {
            setPrintPreviewSrc(null);
            setPreviewMode(null);
            setPreviewDate(null);
          }
        }}
        data={data}
        mode={previewMode || "details"}
        targetDay={
          previewDate || new Date(data.createdAt).toISOString().slice(0, 10)
        }
        sectionIds={
          selectedSectionIds ? new Set(selectedSectionIds) : undefined
        }
        printUrl={
          previewMode === "summary"
            ? `/invoice/summary/${data.id}`
            : previewMode === "details"
              ? `/invoice/print/${data.id}${
                  selectedSectionIds && selectedSectionIds.length
                    ? `?sectionIds=${selectedSectionIds.join(",")}`
                    : ""
                }`
              : previewMode === "compact"
                ? `/invoice/compact/${data.id}${
                    selectedSectionIds && selectedSectionIds.length
                      ? `?sectionIds=${selectedSectionIds.join(",")}`
                      : ""
                  }`
                : previewMode === "dayWise"
                  ? `/invoice/daywise/${data.id}?date=${
                      previewDate ||
                      new Date(data.createdAt).toISOString().slice(0, 10)
                    }${
                      selectedSectionIds && selectedSectionIds.length
                        ? `&sectionIds=${selectedSectionIds.join(",")}`
                        : ""
                    }`
                  : printPreviewSrc
        }
      />
      <SectionPickerModal
        open={sectionPickerOpen}
        onOpenChange={setSectionPickerOpen}
        sections={data.sections}
        onConfirm={(ids) => {
          setSelectedSectionIds(ids);
          setPreviewMode("details");
          setPrintPreviewOpen(true);
        }}
      />
      {canPrintInvoice && (
        <ViewInvoiceModal
          invoiceId={data.id}
          open={previewInvoiceOpen}
          onOpenChange={setPreviewInvoiceOpen}
          trigger={<div />}
        />
      )}
    </>
  );
};

export default InvoiceDetails;
