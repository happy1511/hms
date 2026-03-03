"use client";

import InvoiceExport from "@/components/common/InvoiceExport";
import { Prisma } from "@/generated/prisma/client";
import { useInvoiceDetails } from "@/hooks/query/invoice";
import { BillingSections } from "@/lib/type";
import { format } from "date-fns";
import { LoaderIcon } from "lucide-react";
import { useParams } from "next/navigation";

const getPatientAge = (dob?: string | Date) => {
  if (!dob) return "";
  const birthDate = new Date(dob);
  if (Number.isNaN(birthDate.getTime())) return "";

  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < birthDate.getDate())
  ) {
    age -= 1;
  }

  return String(age);
};

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

  const filteredSections = data.sections;

  const billingItems = filteredSections.map((section: BillingSections) => ({
    name: section.name,
    items: section.invoiceBillingItems.map(
      (
        item: Prisma.InvoiceBillingItemGetPayload<{
          include: { service: true };
        }>,
      ) => ({
        name: item.service.name,
        description: item.service.description || item.service.name,
        qty: item.quantity,
        price: item.rate,
        date: format(item.createdAt, "dd/MM/yyyy"),
        discount:
          item.discountType === "PERCENTAGE"
            ? (item.quantity * item.rate * item.discountValue) / 100
            : item.discountValue,
      }),
    ),
  }));

  const invoiceDiscountAmount =
    data.discountType === "PERCENTAGE"
      ? (data.rate * data.discountValue) / 100
      : data.discountValue;
  const paidAmount = data.transactions.reduce(
    (sum, transaction) => sum + transaction.amount,
    0,
  );

  const patient = data?.opd?.patient || data?.ipd?.patient;
  const patientAge = getPatientAge(patient?.dob);
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
          discount={invoiceDiscountAmount || 0}
          paid={paidAmount}
          billingItems={billingItems}
          customer={{
            name: `${patient?.firstName} ${patient?.lastName}`,
            uhid: patient?.uhid || "",
            age: patientAge,
            gender: patientGender,
            relation: patientRelation,
            address: patient?.addresses?.[0] ? formatPatientAddress(patient) : "",
            phone: patient?.contacts?.[0]?.value || "",
          }}
          invoice={{
            number: `INV-${data.id}`,
            date: format(new Date(data.createdAt), "dd/MM/yyyy hh:mm a"),
            opdNumber: opdOrIpdNumber ? String(opdOrIpdNumber) : "",
            consultant: consultantName,
            referredBy: referredByName,
          }}
        />
      </div>
    </div>
  );
};

export default PrintInvoice;
