"use client";

import CustomActionDropdown from "@/components/common/CustomActionDropdown";
import CustomButton from "@/components/common/CustomButton";
import NoPermission from "@/components/common/NoPermission";
import TransactionsModal from "@/components/common/TransactionsModal";
import { FormCreatableSelect } from "@/components/form-inputs/FormCreatableSelect";
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
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
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
import {
  getInvoiceDueAmount,
  getNetInvoicePaidAmount,
} from "@/lib/invoiceTransactions";
import { InvoiceBillingItem } from "@/lib/type";
import { getDiscountTypeOptions, hasActionPermission } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import {
  ChevronDown,
  ChevronUp,
  FilePenLine,
  LoaderIcon,
  Menu,
  Plus,
  Trash2Icon,
  User,
} from "lucide-react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrayPath,
  Path,
  useFieldArray,
  useForm,
  useWatch,
  UseFormReturn,
  Controller,
  UseFieldArrayRemove,
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
  serviceName?: string;
  quantity: number;
  rate: number;
  discountType: DiscountType;
  discountValue: number;
  total: number;
};

const roundAmount = (value: number) => Number(value.toFixed(2));

const formatCurrency = (value: number) =>
  `Rs. ${roundAmount(value).toFixed(2)}`;

const getDiscountTypeLabel = (discountType: DiscountType) =>
  discountType === DiscountType.PERCENTAGE ? "%" : "Rs.";

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
  serviceName: String(item?.manualServiceName || item?.service?.name || ""),
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
    initialItem.serviceName !== currentSnapshot.serviceName ||
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
  const paid = getNetInvoicePaidAmount(transactions || []);
  const due = getInvoiceDueAmount({
    total,
    transactions: transactions || [],
  });

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
  remove?: UseFieldArrayRemove;
};

const ServiceRow = ({
  index,
  form,
  fieldName,
  initialItemsMap,
  remove,
}: ServiceRowProps) => {
  const { control, watch, setValue, getValues } = form;
  const [reasonOpen, setReasonOpen] = useState(false);
  const [serviceSearch, setServiceSearch] = useState("");
  const previousServiceIdRef = useRef(0);
  const rowPath = `${fieldName}.${index}` as Path<updateInvoiceValidatorType>;

  const service = watch(
    `${rowPath}.service` as Path<updateInvoiceValidatorType>,
  ) as billingItemValidatorType["service"];
  const billingSection = watch(
    `${rowPath}.billingSection` as Path<updateInvoiceValidatorType>,
  ) as billingItemValidatorType["billingSection"];
  const manualServiceName = watch(
    `${rowPath}.manualServiceName` as Path<updateInvoiceValidatorType>,
  );
  const isLocked = Boolean(
    watch(`${rowPath}.isLocked` as Path<updateInvoiceValidatorType>),
  );
  const isNewlyAdded = Boolean(
    watch(`${rowPath}.isNewlyAdded` as Path<updateInvoiceValidatorType>),
  );
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
  const isEditableRate = Boolean(
    (
      watch(
        `${rowPath}.service` as Path<updateInvoiceValidatorType>,
      ) as billingItemValidatorType["service"]
    )?.isEditableRate,
  );
  const total = watch(`${rowPath}.total` as Path<updateInvoiceValidatorType>);
  const itemId = watch(`${rowPath}.itemId` as Path<updateInvoiceValidatorType>);
  const updateReason = watch(
    `${rowPath}.updateReason` as Path<updateInvoiceValidatorType>,
  );

  const servicesQuery = useInfiniteServicesList(
    {
      name: serviceSearch,
      status: Status.active,
      billingSectionId: billingSection?.id
        ? String(billingSection.id)
        : undefined,
    },
    20,
  );

  const isOtherCharges = Boolean(billingSection?.isOtherCharges);
  const flatServices = useMemo(
    () =>
      servicesQuery.data?.pages.flatMap((page) =>
        page.data.map((item) => ({
          id: item.id,
          name: item.name,
          price: item.price,
          maxDiscount: item.maxDiscount,
          isEditableRate: Boolean(item.isEditableRate),
        })),
      ) || [],
    [servicesQuery.data],
  );

  useEffect(() => {
    const selectedServiceId = Number(service?.id || 0);

    if (isOtherCharges && String(manualServiceName || "").trim()) {
      setValue(
        `${rowPath}.maxDiscount` as Path<updateInvoiceValidatorType>,
        100,
      );
      return;
    }

    if (!selectedServiceId) return;

    const existingService = flatServices.find(
      (item) => item.id === selectedServiceId,
    );
    if (!existingService) return;
    if (previousServiceIdRef.current === selectedServiceId) return;

    if (previousServiceIdRef.current !== selectedServiceId) {
      previousServiceIdRef.current = selectedServiceId;
    }

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
  }, [
    service,
    flatServices,
    itemId,
    initialItemsMap,
    isOtherCharges,
    manualServiceName,
    rowPath,
    setValue,
  ]);

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
  const canEditRate =
    !isLocked &&
    (Boolean(isEditableRate) ||
      (isOtherCharges && Boolean(String(manualServiceName || "").trim())));
  const maxAllowed =
    isOtherCharges && String(manualServiceName || "").trim()
      ? gross
      : discountType === DiscountType.PERCENTAGE
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
        {isUpdatedRow && !isLocked && (
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
                disabled={isLocked}
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
              {isLocked ? (
                <div className="rounded border px-2 py-1 text-xs bg-muted/30">
                  {String(manualServiceName || service?.name || "--")}
                </div>
              ) : (
                <div className="space-y-2">
                  {isOtherCharges && (
                    <FormCreatableSelect
                      control={control}
                      name={
                        `${rowPath}.service` as Path<updateInvoiceValidatorType>
                      }
                      items={flatServices}
                      valueKey={(item) => String(item.id)}
                      labelKey={(item) => item.name}
                      placeholder="Select or create charge"
                      hideError
                      inputValue={serviceSearch}
                      onInputChange={setServiceSearch}
                      onReachEnd={() => {
                        if (servicesQuery.hasNextPage) {
                          servicesQuery.fetchNextPage();
                        }
                      }}
                      createdLabel={String(manualServiceName || "")}
                      onCreatedLabelChange={(value) =>
                        setValue(
                          `${rowPath}.manualServiceName` as Path<updateInvoiceValidatorType>,
                          value ?? "",
                          { shouldDirty: true, shouldValidate: true },
                        )
                      }
                      onSelectedItemChange={(item) => {
                        setValue(
                          `${rowPath}.service` as Path<updateInvoiceValidatorType>,
                          item as never,
                          { shouldDirty: true, shouldValidate: true },
                        );
                      }}
                      isLoading={servicesQuery.isFetching}
                    />
                  )}

                  {!isOtherCharges && (
                    <FormInfiniteSelect
                      control={control}
                      name={
                        `${rowPath}.service` as Path<updateInvoiceValidatorType>
                      }
                      query={servicesQuery}
                      getItems={(page) => page?.data}
                      valueKey={(item) => String(item.id)}
                      labelKey={(item) => item.name}
                      search={serviceSearch}
                      onSearchChange={setServiceSearch}
                      placeholder="Service"
                      hideError
                    />
                  )}
                </div>
              )}
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
              const today = format(new Date(), "yyyy-MM-dd");
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
                  disabled={isLocked}
                  value={value}
                  max={today}
                  onChange={(e) =>
                    field.onChange(
                      e.target.value
                        ? new Date(
                            e.target.value > today ? today : e.target.value,
                          )
                        : null,
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
            disabled={isLocked}
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
            disabled={!canEditRate}
            hideError
          />
        </div>
      </td>
      <td>
        <div className="px-2 py-1">
          {isLocked ? (
            <div className="rounded border px-2 py-1 text-xs bg-muted/30">
              {getDiscountTypeLabel(
                (discountType || DiscountType.VALUE) as DiscountType,
              )}
            </div>
          ) : (
            <FormField
              type="select"
              name={
                `${rowPath}.discountType` as Path<updateInvoiceValidatorType>
              }
              control={control}
              options={getDiscountTypeOptions()}
              hideError
            />
          )}
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
            disabled={isLocked}
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
      <td className="font-semibold">
        <div className="px-2 py-1 flex justify-end">
          {isNewlyAdded && (
            <button
              onClick={() => remove?.(index)}
              className="px-2 py-1 cursor-pointer bg-red-100 mx-2 border-red-500 rounded text-red-500 hover:bg-red-500 hover:text-white disabled:cursor-not-allowed disabled:bg-red-100 disabled:text-red-500 disabled:hover:bg-red-100 disabled:hover:text-red-500"
              disabled={!remove || isLocked}
            >
              <Trash2Icon className="size-3" />
            </button>
          )}
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

  const { fields, append, remove } = useFieldArray({
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
                  isNewlyAdded: true,
                  discountType: DiscountType.VALUE,
                  discountValue: 0,
                  total: 0,
                  billingSection: {
                    id: data.id,
                    name: data.name,
                    isOtherCharges: Boolean(data.isOtherCharges),
                  },
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
                <div className="px-2 py-1 min-w-40">Service</div>
              </th>
              <th className="w-28">
                <div className="px-2 py-1">Date</div>
              </th>
              <th>
                <div className="px-2 py-1 min-w-20">Qty</div>
              </th>
              <th>
                <div className="px-2 py-1 min-w-20">Rate</div>
              </th>
              <th>
                <div className="px-2 py-1 min-w-20">Disc Type</div>
              </th>
              <th>
                <div className="px-2 py-1 min-w-20">Discount</div>
              </th>
              <th>
                <div className="px-2 py-1 min-w-20">Total</div>
              </th>
              <th>
                <div className="px-2 py-1"></div>
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
                remove={canUpdateInvoice ? remove : undefined}
              />
            ))}
          </tbody>
        </table>

        <div className="border-t border-border bg-white mt-2">
          <div className="rounded-md border border-dashed border-border bg-muted/30 p-3 grid grid-cols-1 gap-2 md:grid-cols-2">
            <div className="grid gap-3 grid-cols-2 sm:grid-cols-[140px_120px]">
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
  const searchParams = useSearchParams();
  const initialModal = searchParams.get("modal");
  const [transactionsOpen, setTransactionsOpen] = useState(
    initialModal === "transactions",
  );
  const [paymentModalOpen, setPaymentModalOpen] = useState(
    initialModal === "payment",
  );
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
  const [activeSectionId, setActiveSectionId] = useState("");
  const [summaryCollapsed, setSummaryCollapsed] = useState(
    typeof window !== "undefined" ? window.innerWidth < 1024 : false,
  );
  const [sectionsMenuOpen, setSectionsMenuOpen] = useState(false);
  const [sectionPickerOpen, setSectionPickerOpen] = useState(false);
  const { invoiceId }: { invoiceId: string } = useParams();
  const { data, isLoading } = useInvoiceDetails({
    invoiceId: Number(invoiceId),
  });
  const { data: profile } = useProfile(true);
  const { mutateAsync, isPending } = useUpdateInvoice();
  const router = useRouter();

  useEffect(() => {
    const focus = searchParams.get("focus");

    if (focus === "items") {
      const target = document.getElementById("invoice-items");
      target?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [searchParams]);

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

  const apiPaidAmount = useMemo(
    () => getNetInvoicePaidAmount(data?.transactions || []),
    [data?.transactions],
  );

  const invoiceAmounts = useMemo(() => {
    const amounts = getInvoiceAmounts({
      billingSections: watchedSections,
      discountType: (watchedDiscountType || DiscountType.VALUE) as DiscountType,
      discountValue: Number(watchedDiscountValue || 0),
      isFree: Boolean(watchedIsFree),
      transactions: [],
    });

    return {
      ...amounts,
      paid: apiPaidAmount,
      due: getInvoiceDueAmount({
        total: amounts.total,
        transactions: data?.transactions || [],
      }),
    };
  }, [
    apiPaidAmount,
    data?.transactions,
    watchedDiscountType,
    watchedDiscountValue,
    watchedIsFree,
    watchedSections,
  ]);
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
              serviceName: item.service.name,
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
          if (item?.isLocked) {
            return [];
          }

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
          isLocked: Boolean((item as { isLocked?: boolean }).isLocked),
          quantity: item.quantity,
          total: item.total,
          discountType: item.discountType,
          discountValue: item.discountValue,
          service: {
            ...item.service,
            maxDiscount: item.service.maxDiscount ?? 0,
            isEditableRate: Boolean(item.service.isEditableRate),
          },
          manualServiceName: null,
          rate: item.rate,
          billingSection: {
            id: section.id,
            name: section.name,
            isOtherCharges: Boolean(section.isOtherCharges),
          },
          maxDiscount: item.service.maxDiscount ?? 0,
          isEditableRate: Boolean(item.service.isEditableRate),
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
    return <NoPermission />;
  }

  const renderInvoiceSummary = () => (
    <div className="border-t bg-white">
      <div className="flex w-full items-center justify-between bg-secondary px-4 py-3 text-left text-white">
        <div>
          <p className="text-tiny uppercase tracking-[0.2em] text-white/70">
            Invoice Summary
          </p>
          <p className="text-tiny font-semibold">
            {formatCurrency(invoiceAmounts.total)}
          </p>
        </div>
        <button
          type="button"
          className="inline-flex items-center justify-center rounded-sm p-1 text-white transition hover:bg-white/10"
          onClick={() => setSummaryCollapsed((value) => !value)}
          aria-expanded={!summaryCollapsed}
          aria-label={
            summaryCollapsed
              ? "Expand invoice summary"
              : "Collapse invoice summary"
          }
        >
          {summaryCollapsed ? (
            <ChevronUp className="size-4" />
          ) : (
            <ChevronDown className="size-4" />
          )}
        </button>
      </div>

      {!summaryCollapsed && (
        <div className="grid gap-3 p-4 text-tiny">
          <div className="flex items-center justify-between gap-3 rounded-lg border border-border bg-muted/30 px-3 py-2">
            <span className="text-muted-foreground">Discount</span>
            <div className="grid grid-cols-[72px_92px] gap-2">
              <FormField
                type="select"
                name={"discountType" as Path<updateInvoiceValidatorType>}
                control={form.control}
                options={getDiscountTypeOptions()}
                hideError
              />
              <FormField
                type="number"
                name={"discountValue" as Path<updateInvoiceValidatorType>}
                control={form.control}
                hideError
              />
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Invoice Subtotal</span>
            <span className="font-medium">
              {formatCurrency(invoiceAmounts.subtotal)}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Discount Amount</span>
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
  );

  const renderSectionsSidebar = () => (
    <div className="flex h-full w-full min-h-0 flex-col bg-white">
      <div className="min-h-0 flex-1 overflow-y-auto bg-white">
        <TabsList className="flex h-auto w-full flex-col items-stretch justify-start rounded-none p-0">
          {liveSections.map((item) => {
            return (
              <TabsTrigger
                key={item.id}
                value={String(item.id)}
                onClick={() => setSectionsMenuOpen(false)}
                className="m-0 border-none flex h-auto w-full items-start justify-between bg-white rounded-none border-b border-border px-3 py-2 text-left text-tiny font-bold uppercase whitespace-normal data-[state=active]:bg-secondary data-[state=active]:text-white data-[state=active]:shadow-none"
              >
                <div className="flex w-full flex-col gap-0.5 text-left">
                  <span className="text-tiny font-bold">{item.name}</span>
                  <span className="text-tiny opacity-80">
                    {formatCurrency(item.liveTotal)}
                  </span>
                </div>
                <Badge
                  variant="secondary"
                  className="text-tiny! ml-1 h-4 min-w-4 shrink-0 rounded-full bg-background px-1 text-black"
                >
                  {item.liveItemCount}
                </Badge>
              </TabsTrigger>
            );
          })}
        </TabsList>
      </div>
    </div>
  );

  return (
    <>
      <Form {...form}>
        <form
          onSubmit={
            canUpdateInvoice
              ? form.handleSubmit(onSubmit)
              : (event) => event.preventDefault()
          }
          className="flex grow min-h-0 flex-col"
        >
          <div className="flex w-full flex-wrap items-start justify-between gap-3 border bg-white px-2 py-2">
            <div className="flex flex-wrap gap-2">
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
            <div className="flex flex-wrap gap-2">
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
            id="invoice-items"
            value={activeSectionId || String(data.sections[0]?.id || "")}
            onValueChange={setActiveSectionId}
            className="grid min-h-0 flex-1 grid-cols-1 overflow-hidden bg-white lg:grid-cols-[320px_minmax(0,1fr)]"
            orientation="vertical"
          >
            <aside className="hidden min-h-0 min-w-0 border-r bg-muted/20 lg:block">
              <div className="min-w-[320px]">{renderSectionsSidebar()}</div>
            </aside>

            <div className="flex min-h-0 min-w-0 flex-col overflow-hidden">
              <div className="flex items-center justify-between gap-2 border-b bg-white px-3 py-2 lg:hidden">
                <button
                  type="button"
                  className="inline-flex items-center gap-2 rounded-md border border-border px-3 py-2 text-xs font-medium"
                  onClick={() => setSectionsMenuOpen(true)}
                >
                  <Menu className="size-4" />
                  Billing Sections
                </button>
                <div className="text-right text-xs">
                  <p className="font-semibold">
                    {formatCurrency(invoiceAmounts.total)}
                  </p>
                  <p className="text-muted-foreground">
                    Due {formatCurrency(invoiceAmounts.due)}
                  </p>
                </div>
              </div>

              <Sheet open={sectionsMenuOpen} onOpenChange={setSectionsMenuOpen}>
                <SheetContent
                  side="left"
                  className="w-[320px] p-0 sm:max-w-[320px]"
                >
                  <SheetHeader className="sr-only">
                    <SheetTitle>Billing Sections</SheetTitle>
                    <SheetDescription>
                      Select an invoice billing section from the left sidebar.
                    </SheetDescription>
                  </SheetHeader>
                  <Tabs
                    value={
                      activeSectionId || String(data.sections[0]?.id || "")
                    }
                    onValueChange={setActiveSectionId}
                    orientation="vertical"
                    className="h-full"
                  >
                    {renderSectionsSidebar()}
                  </Tabs>
                </SheetContent>
              </Sheet>

              <div className="min-h-0 min-w-0 overflow-auto border-b lg:border-b-0">
                <div className="min-w-[720px]">
                  {data.sections.map((item, index) => (
                    <TabsContent
                      key={item.id}
                      value={String(item.id)}
                      className="mt-0 h-full"
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
              </div>
            </div>
          </Tabs>
          <div className="pointer-events-none fixed right-4 bottom-4 z-40 hidden w-[min(360px,calc(100vw-2rem))] lg:block">
            <div className="pointer-events-auto overflow-hidden rounded-xl border border-secondary/20 bg-white shadow-2xl">
              {renderInvoiceSummary()}
            </div>
          </div>
          <div className="pointer-events-none fixed inset-x-0 bottom-0 z-40 px-3 pb-3 lg:hidden">
            <div className="pointer-events-auto overflow-hidden rounded-t-xl border border-secondary/20 bg-white shadow-2xl">
              {renderInvoiceSummary()}
            </div>
          </div>
          {canUpdateInvoice && updatedRowsMissingReasons.length > 0 && (
            <div className="border-t bg-white px-3 py-2 text-xs text-red-500 lg:pr-[392px]">
              Add a reason for each updated row before saving the invoice.
            </div>
          )}
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
        dueAmount={invoiceAmounts.due}
        paidAmount={invoiceAmounts.paid}
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
