"use client";

import InvoicePrintLayout from "@/components/common/InvoicePrintLayout";
import CustomButton from "@/components/common/CustomButton";
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
    <div className="min-h-screen bg-[#e8e8e8]">
      <div className="sticky top-0 z-20 flex items-center justify-end gap-2 border-b bg-white px-4 py-3 print:hidden">
        <CustomButton type="button" onClick={() => window.print()}>
          Print Detailed Invoice
        </CustomButton>
      </div>
      <InvoicePrintLayout
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
          status: data.isPaid ? "Paid" : "Pending",
        }}
        discount={invoiceDiscountAmount || 0}
        paid={paidAmount}
        billingItems={billingItems}
      />
    </div>
  );
};

export default PrintInvoice;
