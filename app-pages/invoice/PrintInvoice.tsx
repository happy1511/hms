"use client";

import InvoiceExport from "@/components/common/InvoiceExport";
import { Prisma } from "@/generated/prisma/client";
import { useInvoiceDetails } from "@/hooks/query/invoice";
import { BillingSections } from "@/lib/type";
import { LoaderIcon } from "lucide-react";
import { useParams } from "next/navigation";

const formatPatientAddress = (patient: any) => {
  if (!patient?.addresses?.length) return "";

  // Prefer HOME address
  const homeAddress =
    patient.addresses.find((a: any) => a.type === "HOME") ||
    patient.addresses[0];

  if (!homeAddress) return "";

  const parts = [
    homeAddress.addressLineOne,
    homeAddress.addressLineTwo,
    homeAddress.addressLineThree,
    homeAddress.location?.postcode,
    homeAddress.location?.city,
    homeAddress.location?.state,
    homeAddress.location?.country,
  ].filter(Boolean);

  return parts.join(", ");
};

const PrintInvoice = () => {
  const { invoiceId }: { invoiceId: string } = useParams();

  const { data, isLoading } = useInvoiceDetails({
    invoiceId: Number(invoiceId),
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <LoaderIcon className="animate-spin size-4" />
      </div>
    );
  }

  if (!data) return <div />;

  // filter only selected sections
  // const filteredSections = data.sections.filter((section: any) =>
  //   selectedSections.includes(section.id)
  // );
  const filteredSections = data.sections;

  // map to InvoiceExport format
  const billingItems = filteredSections.map((section: BillingSections) => ({
    name: section.name,
    items: section.invoiceBillingItems.map(
      (
        item: Prisma.InvoiceBillingItemGetPayload<{
          include: { service: true };
        }>,
      ) => ({
        name: item.service.name,
        description: item.service.description || "",
        qty: item.quantity,
        price: item.rate,
        discount: item.discountValue,
      }),
    ),
  }));

  // calculate totals
  const subtotal = billingItems.reduce((acc: number, section: any) => {
    return (
      acc +
      section.items.reduce(
        (s: number, item: any) => s + item.qty * item.price,
        0,
      )
    );
  }, 0);

  const totalDiscount = billingItems.reduce((acc: number, section: any) => {
    return (
      acc + section.items.reduce((s: number, item: any) => s + item.discount, 0)
    );
  }, 0);

  const total = subtotal - totalDiscount;

  const patient = data?.opd?.patient || data?.ipd?.patient;

  return (
    <div className="flex gap-6 h-full w-full">
      {/* LEFT SIDE - SECTION SELECTOR */}
      {/* <div className="w-64 border rounded-lg p-4 space-y-3">
        <h3 className="font-semibold text-sm">Select Sections</h3>

        {data.sections.map((section: any) => (
          <div key={section.id} className="flex items-center space-x-2">
            <Checkbox
              checked={selectedSections.includes(section.id)}
              onCheckedChange={(checked) => {
                if (checked) {
                  setSelectedSections((prev) => [...prev, section.id]);
                } else {
                  setSelectedSections((prev) =>
                    prev.filter((id) => id !== section.id)
                  );
                }
              }}
            />
            <Label>{section.name}</Label>
          </div>
        ))}
      </div> */}

      {/* RIGHT SIDE - INVOICE */}
      <div className="flex-1">
        <InvoiceExport
          discount={data.discountValue || 0}
          paid={data.isPaid ? total : 0}
          billingItems={billingItems}
          customer={{
            name: `${patient?.firstName} ${patient?.lastName}`,
            address: patient?.addresses?.[0] ? formatPatientAddress(patient) : "",
            phone: patient?.contacts?.[0]?.value || "",
          }}
          invoice={{
            number: `INV-${data.id}`,
            date: new Date(data.createdAt).toLocaleDateString(),
          }}
        />
      </div>
    </div>
  );
};

export default PrintInvoice;
