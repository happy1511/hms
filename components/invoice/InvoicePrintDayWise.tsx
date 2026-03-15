"use client";

import CustomerInfo from "@/components/invoice/CustomerInfo";
import InvoiceTable from "@/components/invoice/InvoiceTable";
import { BillingSections, InvoiceGroupedBySection } from "@/lib/type";
import { amount, cn } from "@/lib/utils";
import { format } from "date-fns";
import { useMemo } from "react";

type InvoicePrintDayWiseProps = {
  data: InvoiceGroupedBySection;
  targetDay: string;
  fontSize?: number;
  layoutClassName?: string;
};

export const InvoicePrintDayWise = ({
  data,
  targetDay,
  layoutClassName = "",
}: InvoicePrintDayWiseProps) => {
  const items: BillingSections["invoiceBillingItems"] = useMemo(
    () =>
      data.sections
        .flatMap(
          (section: BillingSections) => section.invoiceBillingItems || [],
        )
        .filter((item) => {
          const itemDay = new Date(item.createdAt).toISOString().slice(0, 10);
          return itemDay === targetDay;
        }),
    [data.sections, targetDay],
  );

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
  const opdOrIpdNumber = data.opd?.id || data.ipd?.id;
  const consultantName =
    data.opd?.consultantDoctor?.user?.name ||
    data.ipd?.consultantDoctor?.user?.name ||
    "";
  const referredByName =
    data.opd?.referringDoctor?.user?.name ||
    data.ipd?.referringDoctor?.user?.name ||
    "";

  return (
    <div className="bg-white text-black">
      <div
        className={cn(
          "mx-auto w-full max-w-275 bg-white p-6 print:max-w-none print:border-0 print:p-0",
          layoutClassName,
        )}
      >
        <CustomerInfo
          invoice={{
            number: `INV-${data.id}`,
            date: format(new Date(data.createdAt), "dd/MM/yyyy hh:mm a"),
            opdNumber: opdOrIpdNumber ? String(opdOrIpdNumber) : "",
            consultant: consultantName,
            referredBy: referredByName,
            status: data.isPaid ? "Paid" : "Pending",
          }}
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
        />
        <div className="mt-4 space-y-3">
          <div className="overflow-hidden">
            <InvoiceTable
              emptyMessage="No Items"
              data={items}
              columns={[
                {
                  key: "date",
                  title: "Date",
                  className: "w-5",
                  render: (item) => format(item.createdAt, "dd/MM/yyyy"),
                },
                {
                  key: "Item",
                  title: "Description",
                  className: "w-60",
                  render: (item) => item.service?.name,
                },
                {
                  key: "qty",
                  title: "Qty",
                  className: "w-3",
                  render: (item) => item.quantity,
                },
                {
                  key: "rate",
                  title: "Rate",
                  className: "w-10",
                  render: (item) => amount(item.rate),
                },
                {
                  key: "no",
                  title: "Discount",
                  className: "w-10",
                  render: (item) =>
                    item.discountType === "PERCENTAGE"
                      ? (item.quantity * item.rate * item.discountValue) / 100
                      : item.discountValue,
                },
                {
                  key: "total",
                  title: "Total",
                  className: "w-10",
                  render: (item) => amount(item.total),
                },
              ]}
            />
          </div>
        </div>
        <div className="inline-block mt-2 rounded bg-amber-200 px-3 py-1 font-semibold text-inherit">
          This is not the final invoice.
        </div>
      </div>
    </div>
  );
};

export default InvoicePrintDayWise;
