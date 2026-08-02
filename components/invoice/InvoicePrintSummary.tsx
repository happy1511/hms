import { useMemo } from "react";
import InvoiceTable from "./InvoiceTable";
import InvoicePaymentHistory from "./InvoicePaymentHistory";
import InvoicePaymentSummary from "./InvoicePaymentSummary";
import { formatAddress } from "@/lib/address";
import { getNetInvoicePaidAmount } from "@/lib/invoiceTransactions";
import { amount, cn, formatAge, fullName } from "@/lib/utils";
import { InvoiceGroupedBySection, sectionsWithTotals } from "@/lib/type";
import { format } from "date-fns";
import CustomerInfo from "./CustomerInfo";
import CompanyPrintHeader from "@/components/common/CompanyPrintHeader";

interface Props {
  data: InvoiceGroupedBySection;
  layoutClassName?: string;
}

const InvoicePrintSummary = ({ data, layoutClassName = "" }: Props) => {
  const { sectionTotals, invoiceDiscount, paid } = useMemo(() => {
    const sectionTotals: sectionsWithTotals = data.sections.map(
      (section: any, idx: number) => {
        const subtotal = section.invoiceBillingItems.reduce(
          (sum: number, item: any) => sum + item.quantity * item.rate,
          0,
        );
        const discount =
          section.discountType === "PERCENTAGE"
            ? (subtotal * section.discountValue) / 100
            : section.discountValue;
        const total = Math.max(subtotal - discount, 0);

        return {
          name: section.name || `Section ${idx + 1}`,
          subtotal,
          discount,
          total,
          items: [],
        };
      },
    );

    const invoiceDiscount =
      data.discountType === "PERCENTAGE"
        ? (data.rate * data.discountValue) / 100
        : data.discountValue;
    const paid = getNetInvoicePaidAmount(data.transactions);

    return { sectionTotals, invoiceDiscount, paid };
  }, [data]);

  const patient = data.opd?.patient || data.ipd?.patient;

  const customer = {
    name: `${patient?.firstName || ""} ${patient?.lastName || ""}`.trim(),
    uhid: patient?.uhid || "-",
    gender: patient?.gender ? String(patient.gender) : "-",
    age: patient?.dob ? formatAge(patient.dob) : "-",
    relation: patient?.relations?.[0]
      ? `${String(patient.relations[0].type).replaceAll("_", " ")} ${patient.relations[0].name}`
      : "",
    address: patient?.addresses?.[0] ? formatAddress(patient.addresses[0]) : "",
    phone: patient?.contacts?.[0]?.value || "",
  };

  const invoice = {
    number: `INV-${data.id}`,
    date: format(new Date(data.createdAt), "dd/MM/yyyy hh:mm a"),
    opdNumber: data.opd?.id
      ? String(data.opd.id)
      : data.ipd?.id
        ? String(data.ipd.id)
        : "",
    consultant:
      data.opd?.consultantDoctor || data.ipd?.consultantDoctor
        ? fullName(
            (data.opd?.consultantDoctor || data.ipd?.consultantDoctor)!,
          )
        : "",
    referredBy:
      data.opd?.referringDoctor || data.ipd?.referringDoctor
        ? fullName(
            (data.opd?.referringDoctor || data.ipd?.referringDoctor)!,
          )
        : "",
    status: data.isPaid ? "Paid" : "Pending",
  };

  return (
    <div className="bg-white text-black overflow-auto">
      <div
        className={cn(
          "mx-auto w-full min-w-200 max-w-275 bg-white p-6 print:max-w-none print:border-0 print:p-0",
          layoutClassName,
        )}
      >
        <CompanyPrintHeader className="mb-3" />
        <CustomerInfo customer={customer} invoice={invoice} />
        <div className="my-4">
          <InvoiceTable
            emptyMessage="No Items"
            data={sectionTotals}
            columns={[
              {
                key: "no",
                title: "Sr No.",
                className: "w-5",
                render: (_item, index) => index + 1,
              },
              {
                key: "Item",
                title: "Type of charges",
                className: "w-90",
                render: (item) => item.name,
              },
              {
                key: "total",
                title: "Total",
                className: "w-5 text-right",
                render: (item) => amount(item.total),
              },
            ]}
          />
        </div>
        <InvoicePaymentHistory
          includeRemarks={false}
          transactions={data.transactions.map((txn) => ({
            date: format(new Date(txn.createdAt), "dd/MM/yyyy hh:mm a"),
            mode: String(txn.mode),
            transactionType: String(txn.transactionType),
            amount: txn.amount,
            remarks: txn.remarks || "",
            receivedBy: txn.receivedBy?.name || "-",
          }))}
        />

        <InvoicePaymentSummary
          sectionsWithTotals={sectionTotals}
          paid={paid}
          discount={invoiceDiscount}
        />
      </div>
    </div>
  );
};

export default InvoicePrintSummary;
