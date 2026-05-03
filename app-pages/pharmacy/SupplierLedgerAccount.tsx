"use client";

import CustomTabs from "@/components/common/CustomTabs";
import CustomButton from "@/components/common/CustomButton";
import CustomLayout from "@/components/common/CustomLayout";
import { CustomTable } from "@/components/common/CustomTable";
import NoPermission from "@/components/common/NoPermission";
import { SortableHeader } from "@/components/common/SortableHeader";
import FormField from "@/components/form-inputs/FormField";
import { Form } from "@/components/ui/form";
import { ActionType, ModuleType, SupplierPaymentType } from "@/generated/prisma/enums";
import { useProfile } from "@/hooks/query/auth";
import { useGetSupplierLedgerDetails } from "@/hooks/query/pharmacyLedger";
import { useCreateSupplierPayment } from "@/hooks/query/pharmacySupplierPayment";
import {
  ColumnDefWithClass,
  SupplierLedgerTransactionType,
  SupplierPendingInvoiceType,
} from "@/lib/type";
import { hasActionPermission } from "@/lib/utils";
import { format } from "date-fns";
import { LoaderIcon } from "lucide-react";
import { useParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

const money = (value: number) => Number(value || 0).toFixed(2);

const SummaryCard = ({ label, value }: { label: string; value: string }) => (
  <div className="rounded-sm border border-black/15 bg-white p-3">
    <div className="text-[11px] uppercase tracking-wide text-black/55">{label}</div>
    <div className="mt-1 text-lg font-semibold text-black">{value}</div>
  </div>
);

type SupplierLedgerTransactionFormValues = {
  date: Date;
  creditAmount: number;
  debitAmount: number;
  reference: string;
};

const getDefaultValues = (): SupplierLedgerTransactionFormValues => ({
  date: new Date(),
  creditAmount: 0,
  debitAmount: 0,
  reference: "",
});

const SupplierLedgerAccount = () => {
  const { supplierId }: { supplierId?: string } = useParams();
  const { data: profile } = useProfile(false);
  const { data, isLoading, isError, error } = useGetSupplierLedgerDetails(supplierId);
  const { mutateAsync: createDebitEntry, isPending: creatingDebit } =
    useCreateSupplierPayment(SupplierPaymentType.DEBIT, false);
  const { mutateAsync: createCreditEntry, isPending: creatingCredit } =
    useCreateSupplierPayment(SupplierPaymentType.CREDIT, false);
  const form = useForm<SupplierLedgerTransactionFormValues>({
    defaultValues: getDefaultValues(),
  });

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <LoaderIcon className="size-4 animate-spin" />
      </div>
    );
  }

  if (!profile) {
    return <div />;
  }

  const canView = hasActionPermission(
    profile.data,
    ModuleType.PHARMACY_SUPPLIER_LEDGER,
    ActionType.VIEW,
  );
  const canCreateDebit = hasActionPermission(
    profile.data,
    ModuleType.PHARMACY_SUPPLIER_PAYMENT,
    ActionType.CREATE,
  );
  const canCreateCredit = hasActionPermission(
    profile.data,
    ModuleType.PHARMACY_SUPPLIER_CREDIT_NOTE,
    ActionType.CREATE,
  );

  if (!canView) {
    return (
      <CustomLayout title="Supplier Ledger">
        <NoPermission />
      </CustomLayout>
    );
  }

  if (!data) {
    return <div />;
  }

  const onSubmit = async (values: SupplierLedgerTransactionFormValues) => {
    const creditAmount = Number(values.creditAmount || 0);
    const debitAmount = Number(values.debitAmount || 0);

    if (creditAmount <= 0 && debitAmount <= 0) {
      toast.error("Enter credit or debit amount");
      return;
    }

    if (debitAmount > 0 && !canCreateDebit) {
      toast.error("You do not have permission to create supplier debit entries");
      return;
    }

    if (creditAmount > 0 && !canCreateCredit) {
      toast.error("You do not have permission to create supplier credit entries");
      return;
    }

    if (debitAmount > 0) {
      await createDebitEntry({
        supplierId: data.supplier.id,
        paymentDate: values.date,
        amount: Number(debitAmount.toFixed(2)),
        reference: values.reference || undefined,
        type: SupplierPaymentType.DEBIT,
        allocations: [],
      });
    }

    if (creditAmount > 0) {
      await createCreditEntry({
        supplierId: data.supplier.id,
        paymentDate: values.date,
        amount: Number(creditAmount.toFixed(2)),
        reference: values.reference || undefined,
        type: SupplierPaymentType.CREDIT,
        allocations: [],
      });
    }

    form.reset(getDefaultValues());
  };

  const transactionColumns: ColumnDefWithClass<SupplierLedgerTransactionType>[] = [
    {
      accessorKey: "date",
      header: ({ column }) => (
        <SortableHeader<SupplierLedgerTransactionType> label="Date" column={column} />
      ),
      cell: ({ row }) => format(row.original.date, "dd/MM/yyyy"),
      headerClassName: "min-w-24",
      cellClassName: "min-w-24",
    },
    {
      accessorKey: "reference",
      header: ({ column }) => (
        <SortableHeader<SupplierLedgerTransactionType>
          label="Reference"
          column={column}
        />
      ),
      cell: ({ row }) => row.original.reference,
      headerClassName: "min-w-52",
      cellClassName: "min-w-52",
    },
    {
      accessorKey: "credit",
      header: ({ column }) => (
        <SortableHeader<SupplierLedgerTransactionType> label="Credit" column={column} />
      ),
      cell: ({ row }) =>
        Number(row.original.credit || 0) > 0 ? money(row.original.credit) : "-",
      headerClassName: "min-w-24",
      cellClassName: "min-w-24",
    },
    {
      accessorKey: "debit",
      header: ({ column }) => (
        <SortableHeader<SupplierLedgerTransactionType> label="Debit" column={column} />
      ),
      cell: ({ row }) =>
        Number(row.original.debit || 0) > 0 ? money(row.original.debit) : "-",
      headerClassName: "min-w-24",
      cellClassName: "min-w-24",
    },
    {
      accessorKey: "balance",
      header: ({ column }) => (
        <SortableHeader<SupplierLedgerTransactionType> label="Balance" column={column} />
      ),
      cell: ({ row }) => money(row.original.balance),
      headerClassName: "min-w-24",
      cellClassName: "min-w-24",
    },
  ];

  const pendingInvoiceColumns: ColumnDefWithClass<SupplierPendingInvoiceType>[] = [
    {
      accessorKey: "invoiceNumber",
      header: ({ column }) => (
        <SortableHeader<SupplierPendingInvoiceType>
          label="Invoice Number"
          column={column}
        />
      ),
      cell: ({ row }) => row.original.invoiceNumber,
      headerClassName: "min-w-32",
      cellClassName: "min-w-32",
    },
    {
      accessorKey: "date",
      header: ({ column }) => (
        <SortableHeader<SupplierPendingInvoiceType> label="Date" column={column} />
      ),
      cell: ({ row }) => format(row.original.date, "dd/MM/yyyy"),
      headerClassName: "min-w-24",
      cellClassName: "min-w-24",
    },
    {
      accessorKey: "total",
      header: ({ column }) => (
        <SortableHeader<SupplierPendingInvoiceType> label="Total" column={column} />
      ),
      cell: ({ row }) => money(row.original.total),
      headerClassName: "min-w-24",
      cellClassName: "min-w-24",
    },
    {
      accessorKey: "paid",
      header: ({ column }) => (
        <SortableHeader<SupplierPendingInvoiceType> label="Paid" column={column} />
      ),
      cell: ({ row }) => money(row.original.paid),
      headerClassName: "min-w-24",
      cellClassName: "min-w-24",
    },
    {
      accessorKey: "due",
      header: ({ column }) => (
        <SortableHeader<SupplierPendingInvoiceType> label="Due" column={column} />
      ),
      cell: ({ row }) => money(row.original.due),
      headerClassName: "min-w-24",
      cellClassName: "min-w-24",
    },
  ];

  return (
    <CustomLayout
      title=""
      contentClassName="space-y-4"
    >
      <div className="text-xl font-bold text-black">
        {`Ledger Transactions: ${data.supplier.name}`}
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <SummaryCard label="Phone" value={data.supplier.phone || "-"} />
        <SummaryCard label="GSTIN" value={data.supplier.gstIn || "-"} />
        <SummaryCard label="Current Balance" value={money(data.summary.balance)} />
        <SummaryCard
          label="Pending Invoices"
          value={String(data.summary.pendingInvoiceCount)}
        />
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <SummaryCard label="Total Credit" value={money(data.summary.totalCredit)} />
        <SummaryCard label="Total Debit" value={money(data.summary.totalDebit)} />
        <SummaryCard label="Email" value={data.supplier.email || "-"} />
      </div>

      {!data.transactions.length && !data.pendingInvoices.length && (
        <div className="rounded-sm border border-dashed border-black/20 bg-white px-4 py-6 text-center text-sm text-black/60">
          No ledger activity is available for this supplier yet. You can still add a
          manual transaction from this page.
        </div>
      )}

      {(canCreateDebit || canCreateCredit) && (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="rounded-sm border border-black/20 bg-white p-3">
            <div className="mb-3 border border-black/15 bg-background/40 px-3 py-2 text-tiny font-medium">
              Manually add transaction to this ledger
            </div>
            <div className="grid gap-3 md:grid-cols-4">
              <FormField<SupplierLedgerTransactionFormValues>
                label="Date"
                type="date"
                name="date"
                control={form.control}
                required
              />
              <FormField<SupplierLedgerTransactionFormValues>
                label="Credit Amount"
                type="number"
                name="creditAmount"
                control={form.control}
                readOnly={!canCreateCredit}
              />
              <FormField<SupplierLedgerTransactionFormValues>
                label="Debit Amount"
                type="number"
                name="debitAmount"
                control={form.control}
                readOnly={!canCreateDebit}
              />
              <FormField<SupplierLedgerTransactionFormValues>
                label="Reference"
                type="text"
                name="reference"
                control={form.control}
              />
            </div>
            <div className="mt-3 flex justify-end">
              <CustomButton
                type="submit"
                disabled={creatingDebit || creatingCredit}
              >
                Add Transaction
              </CustomButton>
            </div>
          </form>
        </Form>
      )}

      <CustomTabs
        defaultValue="transactions"
        tabs={[
          {
            value: "transactions",
            name: "Ledger Transactions",
            content: (
              <CustomTable
                columns={transactionColumns}
                data={data.transactions}
                isLoading={isLoading}
                isError={isError}
                error={error}
                getRowId={(row) => `${row.reference}-${row.date}`}
                enableSorting
              />
            ),
          },
          {
            value: "pending",
            name: "Pending Invoices",
            content: (
              <CustomTable
                columns={pendingInvoiceColumns}
                data={data.pendingInvoices}
                isLoading={isLoading}
                isError={isError}
                error={error}
                getRowId={(row) => `${row.invoiceNumber}-${row.date}`}
                enableSorting
              />
            ),
          },
        ]}
      />
    </CustomLayout>
  );
};

export default SupplierLedgerAccount;
