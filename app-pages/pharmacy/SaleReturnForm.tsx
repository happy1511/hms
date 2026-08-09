"use client";

import CustomButton from "@/components/common/CustomButton";
import CustomLayout from "@/components/common/CustomLayout";
import NoPermission from "@/components/common/NoPermission";
import { FormCheckbox } from "@/components/form-inputs/FormCheckBox";
import FormField from "@/components/form-inputs/FormField";
import PharmacySummaryRow from "@/components/pharmacy/PharmacySummaryRow";
import { SaleReturnFormValues } from "@/components/pharmacy/sale-bill/types";
import { Form } from "@/components/ui/form";
import { ActionType, ModuleType, PaymentMode } from "@/generated/prisma/enums";
import { useProfile } from "@/hooks/query/auth";
import { useGetSaleBill } from "@/hooks/query/pharmacySaleBill";
import { useCreateSaleReturn } from "@/hooks/query/pharmacySaleReturn";
import { getNetInvoicePaidAmount } from "@/lib/invoiceTransactions";
import { PharmacySaleBillType } from "@/lib/type";
import { fullName, hasActionPermission } from "@/lib/utils";
import { format } from "date-fns";
import { LoaderIcon } from "lucide-react";
import { useParams } from "next/navigation";
import { useEffect, useMemo } from "react";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";

const round2 = (value: number) => Number(value.toFixed(2));

const toPieces = (
  quantity: number,
  isLooseQuantity: boolean,
  packSize: number,
) =>
  isLooseQuantity ? Number(quantity || 0) : Number(quantity || 0) * packSize;

const formatQty = ({
  pieces,
  packSize,
}: {
  pieces: number;
  packSize: number;
}) => {
  if (pieces <= 0) return "0";
  const packs = Math.floor(pieces / packSize);
  const loose = pieces % packSize;
  if (!loose) return `${packs} pack`;
  if (!packs) return `${loose} pcs`;
  return `${packs} pack + ${loose} pcs`;
};

const getPatientDisplayName = (
  patient?: {
    title: string;
    firstName: string;
    lastName: string;
  } | null,
) =>
  patient
    ? [`${patient.title}.`, patient.firstName, patient.lastName].join(" ")
    : "";

const getInitialValues = (
  bill?: PharmacySaleBillType,
): SaleReturnFormValues => {
  if (!bill) {
    return {
      returnDate: new Date(),
      billNumber: "",
      customerName: "",
      originalBillDate: "",
      doctorName: "",
      patientDisplay: "",
      refundMode: PaymentMode.CASH,
      remarks: "",
      items: [],
    };
  }

  return {
    returnDate: new Date(),
    billNumber: `#${bill.id}`,
    customerName: bill.customer?.name ?? bill.name,
    originalBillDate: format(new Date(bill.invoice.createdAt), "dd/MM/yyyy"),
    doctorName: bill.doctor ? fullName(bill.doctor) : "-",
    patientDisplay: bill.patient
      ? `${bill.patient.uhid || "-"} | ${getPatientDisplayName(bill.patient)}`
      : "-",
    refundMode: PaymentMode.CASH,
    remarks: "",
    items: bill.saleItems.map((item) => {
      const packSize = Math.max(
        Number(item.inventoryItem.itemsPerPack || 1),
        1,
      );
      const soldPieces = toPieces(
        Number(item.quantity || 0),
        Boolean(item.isLooseQuantity),
        packSize,
      );
      const returnedPieces = bill.saleReturns
        .flatMap((saleReturn) => saleReturn.items)
        .filter((returnItem) => returnItem.drugSaleItemId === item.id)
        .reduce(
          (sum, returnItem) =>
            sum +
            toPieces(
              Number(returnItem.quantity || 0),
              Boolean(returnItem.isLooseQuantity),
              packSize,
            ),
          0,
        );
      const remainingPieces = Math.max(soldPieces - returnedPieces, 0);
      const forceLoose =
        Boolean(bill.isLooseBill) ||
        Boolean(item.isLooseQuantity) ||
        remainingPieces < packSize;

      return {
        saleItemId: item.id,
        inventoryItem: item.inventoryItem,
        soldQuantity: Number(item.quantity || 0),
        soldIsLooseQuantity: Boolean(item.isLooseQuantity),
        returnedQuantity: returnedPieces,
        remainingPieces,
        quantity: 0,
        isLooseQuantity: forceLoose,
        rate: 0,
        taxableAmount: 0,
        gstAmount: 0,
        cGstAmount: 0,
        sGstAmount: 0,
        iGstAmount: 0,
        total: 0,
      };
    }),
  };
};

const SaleReturnForm = () => {
  const params: { billId: string } = useParams();
  const { data: profile } = useProfile(false);
  const { data, isLoading } = useGetSaleBill(params.billId);
  const { mutateAsync: createSaleReturn, isPending } = useCreateSaleReturn();

  const form = useForm<SaleReturnFormValues>({
    defaultValues: getInitialValues(),
  });

  useEffect(() => {
    form.reset(getInitialValues(data));
  }, [data, form]);

  const watchedItems = useWatch({
    control: form.control,
    name: "items",
  });

  const derivedRows = useMemo(() => {
    if (!data) return [];

    return (watchedItems || []).map((row) => {
      const saleItem = data.saleItems.find(
        (item) => item.id === row.saleItemId,
      );
      const packSize = Math.max(
        Number(row.inventoryItem?.itemsPerPack || 1),
        1,
      );
      const maxPackQty = Math.floor(
        Number(row.remainingPieces || 0) / packSize,
      );
      const requestedPieces = toPieces(
        Number(row.quantity || 0),
        Boolean(row.isLooseQuantity),
        packSize,
      );
      const soldPieces = saleItem
        ? toPieces(
            Number(saleItem.quantity || 0),
            Boolean(saleItem.isLooseQuantity),
            packSize,
          )
        : 0;
      const ratio = soldPieces > 0 ? requestedPieces / soldPieces : 0;
      const pieceRate = saleItem
        ? saleItem.isLooseQuantity
          ? Number(saleItem.rate || 0)
          : Number(saleItem.rate || 0) / packSize
        : 0;
      const rate = row.isLooseQuantity ? pieceRate : pieceRate * packSize;

      return {
        ...row,
        packSize,
        maxPackQty,
        requestedPieces,
        exceedsRemaining: requestedPieces > Number(row.remainingPieces || 0),
        rate: round2(rate),
        taxableAmount: round2(Number(saleItem?.taxableAmount || 0) * ratio),
        gstAmount: round2(Number(saleItem?.gstAmount || 0) * ratio),
        cGstAmount: round2(Number(saleItem?.cGstAmount || 0) * ratio),
        sGstAmount: round2(Number(saleItem?.sGstAmount || 0) * ratio),
        iGstAmount: round2(Number(saleItem?.iGstAmount || 0) * ratio),
        total: round2(Number(saleItem?.total || 0) * ratio),
      };
    });
  }, [data, watchedItems]);

  const refundAmount = useMemo(
    () =>
      round2(derivedRows.reduce((sum, row) => sum + Number(row.total || 0), 0)),
    [derivedRows],
  );
  const netPaid = useMemo(
    () => round2(getNetInvoicePaidAmount(data?.invoice.transactions || [])),
    [data?.invoice.transactions],
  );
  const hasAnyReturn = derivedRows.some((row) => Number(row.quantity || 0) > 0);
  const hasRowError = derivedRows.some((row) => row.exceedsRemaining);
  const refundExceedsPaid = refundAmount > netPaid;

  const onSubmit = async (values: SaleReturnFormValues) => {
    if (!data) return;

    const selectedRows = derivedRows.filter(
      (row) => Number(row.quantity || 0) > 0,
    );

    if (!selectedRows.length) {
      toast.error("Enter return quantity for at least one item");
      return;
    }

    if (selectedRows.some((row) => row.exceedsRemaining)) {
      toast.error("One or more rows exceed returnable quantity");
      return;
    }

    if (refundAmount <= 0) {
      toast.error("Refund amount must be greater than 0");
      return;
    }

    if (refundAmount > netPaid) {
      toast.error("Refund amount cannot exceed collected amount");
      return;
    }

    await createSaleReturn({
      drugBillId: data.id,
      createdAt: values.returnDate,
      refundMode: values.refundMode,
      remarks: values.remarks || undefined,
      items: selectedRows.map((row) => ({
        saleItemId: row.saleItemId,
        inventoryItemId: Number(row.inventoryItem?.id),
        quantity: Number(row.quantity || 0),
        isLooseQuantity: Boolean(row.isLooseQuantity),
      })),
    });
  };

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <LoaderIcon className="size-4 animate-spin" />
      </div>
    );
  }

  if (!data) {
    return <div />;
  }

  if (!profile) {
    return <div />;
  }

  const canCreate = hasActionPermission(
    profile.data,
    ModuleType.PHARMACY_SALE_RETURN,
    ActionType.CREATE,
  );

  if (!canCreate) {
    return (
      <CustomLayout title="Sale Return">
        <NoPermission />
      </CustomLayout>
    );
  }

  return (
    <CustomLayout title="Customer Sale Return">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
          <div className="space-y-4">
            <div className="grid gap-3 md:grid-cols-3">
              <div>
                <FormField<SaleReturnFormValues>
                  label="Return Date"
                  type="date"
                  name="returnDate"
                  control={form.control}
                  required
                />
              </div>
              <FormField<SaleReturnFormValues>
                label="Bill Number"
                type="text"
                name="billNumber"
                control={form.control}
                readOnly
              />
              <FormField<SaleReturnFormValues>
                label="Customer Name"
                type="text"
                name="customerName"
                control={form.control}
                readOnly
              />
            </div>

            <div className="grid gap-3 md:grid-cols-3">
              <FormField<SaleReturnFormValues>
                label="Original Bill Date"
                type="text"
                name="originalBillDate"
                control={form.control}
                readOnly
              />
              <FormField<SaleReturnFormValues>
                label="Doctor"
                type="text"
                name="doctorName"
                control={form.control}
                readOnly
              />
              <FormField<SaleReturnFormValues>
                label="Hospital Patient"
                type="text"
                name="patientDisplay"
                control={form.control}
                readOnly
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
                        Batch
                      </th>
                      <th className="border-r border-black/20 px-2 py-2 text-left">
                        Exp
                      </th>
                      <th className="border-r border-black/20 px-2 py-2 text-left">
                        Pack
                      </th>
                      <th className="border-r border-black/20 px-2 py-2 text-left">
                        Purchased
                      </th>
                      <th className="border-r border-black/20 px-2 py-2 text-left">
                        Returned
                      </th>
                      <th className="border-r border-black/20 px-2 py-2 text-left">
                        Returnable
                      </th>
                      <th className="border-r border-black/20 px-2 py-2 text-left">
                        Loose
                      </th>
                      <th className="border-r border-black/20 px-2 py-2 text-left">
                        Qty
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
                    </tr>
                  </thead>
                  <tbody>
                    {derivedRows.map((row, index) => {
                      const inventory = row.inventoryItem;
                      const forceLoose =
                        Boolean(data.isLooseBill) ||
                        row.remainingPieces < row.packSize;

                      return (
                        <tr
                          key={row.saleItemId}
                          className="border-t align-middle"
                        >
                          <td className="px-2 py-1.5">{index + 1}</td>
                          <td className="px-2 py-1.5 min-w-52 font-medium">
                            {inventory?.drug.name}
                          </td>
                          <td className="px-2 py-1.5">
                            {inventory?.drug.manufacturer || "-"}
                          </td>
                          <td className="px-2 py-1.5">{inventory?.batchNo}</td>
                          <td className="px-2 py-1.5">
                            {inventory?.expiryDate
                              ? format(new Date(inventory.expiryDate), "MM/yy")
                              : "-"}
                          </td>
                          <td className="px-2 py-1.5">{row.packSize}</td>
                          <td className="px-2 py-1.5 whitespace-nowrap">
                            {formatQty({
                              pieces: toPieces(
                                row.soldQuantity,
                                row.soldIsLooseQuantity,
                                row.packSize,
                              ),
                              packSize: row.packSize,
                            })}
                          </td>
                          <td className="px-2 py-1.5 whitespace-nowrap">
                            {formatQty({
                              pieces: row.returnedQuantity,
                              packSize: row.packSize,
                            })}
                          </td>
                          <td className="px-2 py-1.5 whitespace-nowrap">
                            <div>
                              {formatQty({
                                pieces: row.remainingPieces,
                                packSize: row.packSize,
                              })}
                            </div>
                            <div className="text-[10px] text-muted-foreground">
                              {row.isLooseQuantity
                                ? `Max ${row.remainingPieces} pcs`
                                : `Max ${row.maxPackQty} pack`}
                            </div>
                          </td>
                          <td className="px-2 py-1.5 text-center">
                            <FormCheckbox<SaleReturnFormValues>
                              control={form.control}
                              name={`items.${index}.isLooseQuantity`}
                              label=""
                              hideLabel
                              hideError
                              className="mx-auto mt-0"
                              formItemClassName="justify-center pb-0"
                            />
                          </td>
                          <td className="px-2 py-1.5 min-w-20">
                            <FormField<SaleReturnFormValues>
                              type="number"
                              name={`items.${index}.quantity`}
                              control={form.control}
                              hideError
                            />
                            {row.exceedsRemaining && (
                              <div className="mt-1 text-[10px] text-destructive">
                                Exceeds returnable quantity
                              </div>
                            )}
                          </td>
                          <td className="px-2 py-1.5">{row.rate.toFixed(2)}</td>
                          <td className="px-2 py-1.5">
                            {row.cGstAmount.toFixed(2)}
                          </td>
                          <td className="px-2 py-1.5">
                            {row.sGstAmount.toFixed(2)}
                          </td>
                          <td className="px-2 py-1.5">
                            {row.iGstAmount.toFixed(2)}
                          </td>
                          <td className="px-2 py-1.5 font-semibold">
                            {row.total.toFixed(2)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="border-t border-black/20 p-3">
                <div className="flex justify-end">
                  <div className="w-full max-w-[260px] space-y-3">
                    <div className="overflow-hidden rounded-sm border border-black/20 bg-background/50">
                      <PharmacySummaryRow
                        label="Bill Total"
                        value={Number(data.invoice.total || 0).toFixed(2)}
                      />
                      <PharmacySummaryRow
                        label="Collected"
                        value={netPaid.toFixed(2)}
                      />
                      <PharmacySummaryRow
                        label="Refund"
                        value={refundAmount.toFixed(2)}
                      />
                      <PharmacySummaryRow
                        label="Balance"
                        value={Math.max(netPaid - refundAmount, 0).toFixed(2)}
                      />
                    </div>

                    <div className="overflow-hidden rounded-sm border border-black/20 bg-background/50">
                      <PharmacySummaryRow
                        label="Amount"
                        value={
                          <div className="text-right text-sm font-semibold">
                            {refundAmount.toFixed(2)}
                          </div>
                        }
                      />
                      <PharmacySummaryRow
                        label="Mode"
                        value={
                          <FormField<SaleReturnFormValues>
                            type="select"
                            name="refundMode"
                            control={form.control}
                            options={Object.values(PaymentMode).map((mode) => ({
                              label: mode,
                              value: mode,
                            }))}
                            className="h-7 border-0 px-0 text-right shadow-none focus-visible:ring-0"
                          />
                        }
                      />
                      <PharmacySummaryRow
                        label="Remarks"
                        value={
                          <FormField<SaleReturnFormValues>
                            type="text"
                            name="remarks"
                            control={form.control}
                            className="h-7 border-0 px-0 text-right shadow-none focus-visible:ring-0"
                          />
                        }
                      />
                    </div>

                    {refundExceedsPaid && (
                      <div className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
                        Refund exceeds collected amount. Reduce return quantity
                        before saving.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <CustomButton
                disabled={
                  isPending || !hasAnyReturn || hasRowError || refundExceedsPaid
                }
                type="submit"
              >
                Refund Payment & Save Return Bill
              </CustomButton>
            </div>
          </div>
        </form>
      </Form>
    </CustomLayout>
  );
};

export default SaleReturnForm;
