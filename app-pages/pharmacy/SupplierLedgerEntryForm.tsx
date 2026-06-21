"use client";

import CustomButton from "@/components/common/CustomButton";
import CustomLayout from "@/components/common/CustomLayout";
import NoPermission from "@/components/common/NoPermission";
import FormField from "@/components/form-inputs/FormField";
import { FormInfiniteSelect } from "@/components/form-inputs/FormInfiniteSelect";
import { Checkbox } from "@/components/ui/checkbox";
import { Form } from "@/components/ui/form";
import { DrugSupplier } from "@/generated/prisma/client";
import { ActionType, ModuleType, Status, SupplierPaymentType } from "@/generated/prisma/enums";
import { useProfile } from "@/hooks/query/auth";
import { useInfiniteDrugSupplierList } from "@/hooks/query/drugSupplier";
import {
  useCreateSupplierPayment,
  useSupplierDueGrns,
} from "@/hooks/query/pharmacySupplierPayment";
import {
  FilterValues,
  PaginatedResponse,
  PharmacySupplierDueGrnType,
} from "@/lib/type";
import { hasActionPermission } from "@/lib/utils";
import { useEffect, useMemo, useState } from "react";
import { Path, useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";

type DueRowForm = PharmacySupplierDueGrnType & {
  selected: boolean;
  adjustAmount: number;
};

type SupplierLedgerFormValues = {
  supplier?: DrugSupplier | null;
  paymentDate: Date;
  amount: number;
  reference: string;
  items: DueRowForm[];
};

type Props = {
  type: SupplierPaymentType;
  title: string;
  permissionModule: ModuleType;
  submitLabel: string;
  referenceLabel: string;
};

const money = (value: number) => Number(value || 0).toFixed(2);

const getDefaultValues = (): SupplierLedgerFormValues => ({
  supplier: null,
  paymentDate: new Date(),
  amount: 0,
  reference: "",
  items: [],
});

const SupplierLedgerEntryForm = ({
  type,
  title,
  permissionModule,
  submitLabel,
  referenceLabel,
}: Props) => {
  const [supplierSearch, setSupplierSearch] = useState("");
  const { data: profile } = useProfile(false);
  const { mutateAsync: createEntry, isPending } = useCreateSupplierPayment(type);
  const supplierQuery = useInfiniteDrugSupplierList(
    { name: supplierSearch, status: Status.active },
    20,
  );
  const form = useForm<SupplierLedgerFormValues>({
    defaultValues: getDefaultValues(),
  });

  const supplier = useWatch({
    control: form.control,
    name: "supplier",
  }) as DrugSupplier | null | undefined;
  const rows = (useWatch({
    control: form.control,
    name: "items",
  }) || []) as DueRowForm[];
  const dueGrnsQuery = useSupplierDueGrns(supplier?.id);

  const totalAdjustAmount = useMemo(
    () =>
      Number(
        rows.reduce((sum, row) => {
          if (!row.selected) return sum;
          return sum + Number(row.adjustAmount || 0);
        }, 0),
      ),
    [rows],
  );

  useEffect(() => {
    if (type !== SupplierPaymentType.DEBIT) {
      return;
    }

    form.setValue("items", [], {
      shouldDirty: false,
      shouldTouch: false,
    });
  }, [form, supplier?.id, type]);

  useEffect(() => {
    if (type !== SupplierPaymentType.DEBIT) {
      return;
    }

    const mappedRows = (dueGrnsQuery.data || []).map((row) => ({
      ...row,
      selected: false,
      adjustAmount: 0,
    }));

    form.setValue("items", mappedRows, {
      shouldDirty: false,
      shouldTouch: false,
    });
  }, [dueGrnsQuery.data, form, type]);

  useEffect(() => {
    if (type === SupplierPaymentType.DEBIT) {
      form.setValue("amount", Number(totalAdjustAmount.toFixed(2)), {
        shouldDirty: false,
        shouldTouch: false,
      });
    }
  }, [form, totalAdjustAmount, type]);

  if (!profile) {
    return <div />;
  }

  const canCreate = hasActionPermission(profile.data, permissionModule, ActionType.CREATE);

  if (!canCreate) {
    return (
      <CustomLayout title={title}>
        <NoPermission />
      </CustomLayout>
    );
  }

  const toggleRow = (index: number, checked: boolean) => {
    const row = rows[index];
    form.setValue(`items.${index}.selected`, checked, { shouldDirty: true });
    form.setValue(`items.${index}.adjustAmount`, checked ? row.adjustAmount || row.due : 0, {
      shouldDirty: true,
    });
  };

  const onSubmit = async (values: SupplierLedgerFormValues) => {
    if (!values.supplier?.id) {
      toast.error("Select supplier");
      return;
    }

    if (type === SupplierPaymentType.DEBIT) {
      const selectedRows = rows.filter((row) => row.selected);

      if (!selectedRows.length) {
        toast.error("Select at least one GRN");
        return;
      }

      const invalidRow = selectedRows.find(
        (row) =>
          Number(row.adjustAmount || 0) <= 0 ||
          Number(row.adjustAmount || 0) > Number(row.due || 0),
      );

      if (invalidRow) {
        toast.error(`Invalid adjust amount for invoice ${invalidRow.invoiceNumber}`);
        return;
      }

      await createEntry({
        supplierId: Number(values.supplier.id),
        paymentDate: values.paymentDate,
        amount: Number(totalAdjustAmount.toFixed(2)),
        reference: values.reference || undefined,
        type,
        allocations: selectedRows.map((row) => ({
          grnId: row.id,
          amount: Number(Number(row.adjustAmount || 0).toFixed(2)),
        })),
      });

      return;
    }

    if (Number(values.amount || 0) <= 0) {
      toast.error("Amount must be greater than 0");
      return;
    }

    await createEntry({
      supplierId: Number(values.supplier.id),
      paymentDate: values.paymentDate,
      amount: Number(Number(values.amount || 0).toFixed(2)),
      reference: values.reference || undefined,
      type,
      allocations: [],
    });
  };

  return (
    <CustomLayout title={title}>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid gap-3 md:grid-cols-4">
            <FormInfiniteSelect<
              DrugSupplier,
              PaginatedResponse<DrugSupplier>,
              string,
              SupplierLedgerFormValues
            >
              label="Supplier"
              name={"supplier" as Path<SupplierLedgerFormValues>}
              control={form.control}
              query={supplierQuery}
              getItems={(page) => page?.data}
              valueKey={(item) => String(item.id)}
              labelKey={(item) =>
                [item.name, item.phone || "No phone", item.gstIn || "No GST"].join(" | ")
              }
              search={supplierSearch}
              onSearchChange={setSupplierSearch}
              required
            />
            <FormField<SupplierLedgerFormValues>
              label="Date"
              type="date"
              name="paymentDate"
              control={form.control}
              required
            />
            <FormField<SupplierLedgerFormValues>
              label="Amount"
              type="number"
              name="amount"
              control={form.control}
              required
              readOnly={type === SupplierPaymentType.DEBIT}
            />
            <FormField<SupplierLedgerFormValues>
              label={referenceLabel}
              type="text"
              name="reference"
              control={form.control}
            />
          </div>

          {type === SupplierPaymentType.DEBIT && (
            <div className="rounded-sm border border-black/20">
              <div className="overflow-x-auto overflow-y-hidden">
                <table className="w-full min-w-[980px] border-collapse text-tiny">
                  <thead className="bg-muted">
                    <tr>
                      <th className="border-r border-black/20 px-2 py-2 text-left">Select</th>
                      <th className="border-r border-black/20 px-2 py-2 text-left">
                        Invoice Number
                      </th>
                      <th className="border-r border-black/20 px-2 py-2 text-left">Date</th>
                      <th className="border-r border-black/20 px-2 py-2 text-left">Total</th>
                      <th className="border-r border-black/20 px-2 py-2 text-left">Paid</th>
                      <th className="border-r border-black/20 px-2 py-2 text-left">Due</th>
                      <th className="px-2 py-2 text-left">Adjust Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row, index) => (
                      <tr key={row.id} className="border-t align-middle">
                        <td className="px-2 py-1.5">
                          <Checkbox
                            checked={Boolean(row.selected)}
                            onCheckedChange={(checked) => toggleRow(index, Boolean(checked))}
                          />
                        </td>
                        <td className="px-2 py-1.5">{row.invoiceNumber}</td>
                        <td className="px-2 py-1.5">
                          {new Date(row.invoiceDate).toLocaleDateString("en-GB")}
                        </td>
                        <td className="px-2 py-1.5">{money(row.total)}</td>
                        <td className="px-2 py-1.5">{money(row.paid)}</td>
                        <td className="px-2 py-1.5">{money(row.due)}</td>
                        <td className="px-2 py-1.5 min-w-28">
                          <FormField<SupplierLedgerFormValues>
                            type="number"
                            name={`items.${index}.adjustAmount` as Path<SupplierLedgerFormValues>}
                            control={form.control}
                            hideError
                            readOnly={!row.selected}
                            className={!row.selected ? "bg-muted/50" : ""}
                          />
                        </td>
                      </tr>
                    ))}
                    {!rows.length && (
                      <tr className="border-t">
                        <td colSpan={7} className="px-3 py-5 text-center text-muted-foreground">
                          {supplier?.id
                            ? dueGrnsQuery.isLoading
                              ? "Loading due GRNs..."
                              : "No due GRNs found for this supplier"
                            : "Select supplier to view due GRNs"}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <div className="flex justify-end">
            <CustomButton disabled={isPending} type="submit">
              {submitLabel}
            </CustomButton>
          </div>
        </form>
      </Form>
    </CustomLayout>
  );
};

export default SupplierLedgerEntryForm;
