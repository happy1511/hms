"use client";

import { amount, cn, lineNet } from "@/lib/utils";
import CustomerInfo from "./CustomerInfo";
import InvoiceTable from "./InvoiceTable";
import { InvoiceGroupedBySection, InvoiceItem } from "@/lib/type";
import InvoicePaymentSummary from "./InvoicePaymentSummary";
import InvoicePaymentHistory from "./InvoicePaymentHistory";
import { format } from "date-fns";
import CompanyPrintHeader from "@/components/common/CompanyPrintHeader";

interface Props {
  data: InvoiceGroupedBySection;
  includePaymentHistory?: boolean;
  includeRemarks?: boolean;
  layoutClassName?: string;
  hideCustomerInfo?: boolean;
}

const InvoicePrintDetails = ({
  includePaymentHistory = false,
  includeRemarks = false,
  layoutClassName = "",
  hideCustomerInfo = false,
  data,
}: Props) => {
  const patient = data.opd?.patient || data.ipd?.patient;
  const patientAge = patient?.dob
    ? String(
        Math.max(
          0,
          new Date().getFullYear() - new Date(patient.dob).getFullYear(),
        ),
      )
    : "";
  const patientGender = patient?.gender ? String(patient.gender) : "";
  const patientRelation = patient?.relations?.[0]
    ? `${String(patient.relations[0].type).replaceAll("_", " ")} ${patient.relations[0].name}`
    : "";
  const consultantName =
    data.opd?.consultantDoctor?.user?.name ||
    data.ipd?.consultantDoctor?.user?.name ||
    "";
  const referredByName =
    data.opd?.referringDoctor?.user?.name ||
    data.ipd?.referringDoctor?.user?.name ||
    "";
  const opdOrIpdNumber = data.opd?.id || data.ipd?.id;

  const sectionsWithTotals = data.sections.map((section, idx) => {
    const items: InvoiceItem[] = section.invoiceBillingItems.map((item) => {
      const discountAmount =
        item.discountType === "PERCENTAGE"
          ? (item.quantity * item.rate * item.discountValue) / 100
          : item.discountValue;
      const discountLabel =
        item.discountType === "PERCENTAGE"
          ? `${item.discountValue}% (₹${discountAmount.toFixed(2)})`
          : `${discountAmount.toFixed(2)}`;

      return {
        description: item.service.name,
        qty: item.quantity,
        price: item.rate,
        date: format(item.createdAt, "dd/MM/yyyy"),
        discount: discountAmount,
        discountLabel,
      };
    });

    const subtotal = items.reduce((sum, item) => sum + lineNet(item), 0);
    const sectionDiscount =
      section.discountType === "PERCENTAGE"
        ? (subtotal * section.discountValue) / 100
        : section.discountValue;
    const total = Math.max(subtotal - sectionDiscount, 0);

    return {
      name: section.name || `Section ${idx + 1}`,
      items,
      subtotal,
      discount: sectionDiscount || 0,
      total,
    };
  });

  const visibleSectionsWithTotals = sectionsWithTotals.filter(
    (section) => section.items.length > 0,
  );

  const discount =
    data.discountType === "PERCENTAGE"
      ? (data.rate * data.discountValue) / 100
      : data.discountValue;

  const paid = data.transactions.reduce(
    (sum, transaction) => sum + transaction.amount,
    0,
  );

  return (
    <div className="bg-white text-black overflow-auto">
      <div
        className={cn(
          "mx-auto w-full min-w-200 max-w-275 bg-white p-6 print:max-w-none print:border-0 print:p-0",
          layoutClassName,
        )}
      >
        <CompanyPrintHeader className="mb-3" />
        {!hideCustomerInfo && (
          <CustomerInfo
            customer={{
              name: `${patient?.firstName} ${patient?.lastName}`,
              uhid: patient?.uhid || "",
              age: patientAge,
              gender: patientGender,
              relation: patientRelation,
              address: patient?.addresses?.[0]
                ? [
                    patient.addresses[0].addressLineOne,
                    patient.addresses[0].addressLineTwo,
                    patient.addresses[0].addressLineThree,
                    patient.addresses[0].location?.city,
                    patient.addresses[0].location?.state,
                    patient.addresses[0].location?.postcode,
                  ]
                    .filter(Boolean)
                    .join(", ")
                : "",
              phone: patient?.contacts?.[0]?.value || "",
            }}
            invoice={{
              number: `INV-${data.id}`,
              date: format(new Date(data.createdAt), "dd/MM/yyyy hh:mm a"),
              opdNumber: opdOrIpdNumber ? String(opdOrIpdNumber) : "",
              consultant: consultantName,
              referredBy: referredByName,
              status: data.isPaid ? "Paid" : "Pending",
            }}
          />
        )}

        <div className="mt-4 space-y-3">
          {visibleSectionsWithTotals.map((section) => (
            <div key={section.name} className="overflow-hidden">
              <InvoiceTable<InvoiceItem>
                emptyMessage="No Items"
                data={section.items}
                columns={[
                  {
                    key: "no",
                    title: "No.",
                    className: "w-2",
                    render: (_: InvoiceItem, index: number) => `${index + 1}.`,
                  },
                  {
                    key: "date",
                    title: "Date",
                    className: "w-5",
                    render: (item: InvoiceItem) => item.date,
                  },
                  {
                    key: "Item",
                    title: section.name,
                    className: "w-60",
                    render: (item: InvoiceItem) => item.description,
                  },
                  {
                    key: "qty",
                    title: "Qty",
                    className: "w-3",
                    render: (item: InvoiceItem) => item.qty,
                  },
                  {
                    key: "rate",
                    title: "Rate",
                    className: "w-10",
                    render: (item: InvoiceItem) => amount(item.price),
                  },
                  {
                    key: "discount",
                    title: "Discount",
                    className: "w-10",
                    render: (item: InvoiceItem) =>
                      item.discountLabel
                        ? item.discountLabel
                        : item.discount
                          ? amount(item.discount)
                          : "0.00",
                  },
                  {
                    key: "total",
                    title: "Total",
                    className: "w-10",
                    render: (item: InvoiceItem) => amount(lineNet(item)),
                  },
                ]}
              />
            </div>
          ))}

          {includePaymentHistory && (
            <InvoicePaymentHistory
              includeRemarks={includeRemarks}
              transactions={data.transactions.map((txn) => ({
                date: format(new Date(txn.createdAt), "dd/MM/yyyy hh:mm a"),
                mode: String(txn.mode),
                amount: txn.amount,
                remarks: txn.remarks || "",
                receivedBy: txn.receivedBy?.name || "-",
              }))}
            />
          )}

          <InvoicePaymentSummary
            sectionsWithTotals={visibleSectionsWithTotals}
            paid={paid}
            discount={discount}
          />
        </div>
      </div>
    </div>
  );
};

export default InvoicePrintDetails;
