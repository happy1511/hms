"use client";

import InvoiceExport from "@/components/common/InvoiceExport";
import { useInvoiceDetails } from "@/hooks/query/invoice";
import { OPDType } from "@/lib/type";
import { format } from "date-fns";
import { BlobProvider } from "@react-pdf/renderer";
import { LoaderIcon, PlusIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useMemo, useState } from "react";
import { Dialog, DialogContent, DialogTrigger } from "../ui/dialog";
import { Button } from "../ui/button";
import { Checkbox } from "../ui/checkbox";
import CustomButton from "../common/CustomButton";

interface Props {
  opd?: OPDType;
  invoiceId?: number;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger?: React.ReactNode;
}

const ViewInvoiceModal = ({
  open,
  onOpenChange,
  opd,
  invoiceId,
  trigger,
}: Props) => {
  const router = useRouter();
  const [includePaymentHistory, setIncludePaymentHistory] = useState(false);
  const [includeRemarks, setIncludeRemarks] = useState(false);
  const effectiveInvoiceId = invoiceId ?? opd?.invoice?.id;

  if (!effectiveInvoiceId) return null;

  const { data, isLoading } = useInvoiceDetails({
    invoiceId: effectiveInvoiceId,
  });

  const previewData = useMemo(() => {
    if (!data) return null;

    const patient = data?.opd?.patient || data?.ipd?.patient;
    const patientAge = patient?.dob
      ? String(
          Math.max(
            0,
            new Date().getFullYear() - new Date(patient.dob).getFullYear(),
          ),
        )
      : "";

    const homeAddress = patient?.addresses?.[0];
    const address = [
      homeAddress?.addressLineOne,
      homeAddress?.addressLineTwo,
      homeAddress?.addressLineThree,
      homeAddress?.location?.city,
      homeAddress?.location?.state,
      homeAddress?.location?.country,
      homeAddress?.location?.postcode,
    ]
      .filter(Boolean)
      .join(", ");

    const billingItems = data.sections.map((section) => ({
      name: section.name,
      items: section.invoiceBillingItems.map((item) => ({
        description: item.service.name,
        qty: item.quantity,
        price: item.rate,
        date: format(item.createdAt, "dd/MM/yyyy"),
        discount:
          item.discountType === "PERCENTAGE"
            ? (item.quantity * item.rate * item.discountValue) / 100
            : item.discountValue,
      })),
    }));

    const paid = data.transactions.reduce((sum, txn) => sum + txn.amount, 0);
    const invoiceDiscount =
      data.discountType === "PERCENTAGE"
        ? (data.rate * data.discountValue) / 100
        : data.discountValue;

    return {
      discount: invoiceDiscount,
      paid,
      billingItems,
      customer: {
        name: `${patient?.firstName || ""} ${patient?.lastName || ""}`.trim(),
        uhid: patient?.uhid || "-",
        gender: patient?.gender ? String(patient.gender) : "-",
        age: patientAge,
        relation: patient?.relations?.[0]
          ? `${String(patient.relations[0].type).replaceAll("_", " ")} ${patient.relations[0].name}`
          : "-",
        address: address || "-",
        phone: patient?.contacts?.[0]?.value || "-",
      },
      invoice: {
        number: `INV-${data.id}`,
        date: format(new Date(data.createdAt), "dd/MM/yy hh:mm a"),
        opdNumber: String(data.opd?.id || data.ipd?.id || "-"),
        consultant:
          data.opd?.consultantDoctor?.user?.name ||
          data.ipd?.consultantDoctor?.user?.name ||
          "-",
        referredBy:
          data.opd?.referringDoctor?.user?.name ||
          data.ipd?.referringDoctor?.user?.name ||
          "-",
      },
      transactions: data.transactions.map((txn) => ({
        date: format(new Date(txn.createdAt), "dd/MM/yyyy hh:mm a"),
        mode: String(txn.mode),
        amount: txn.amount,
        remarks: txn.remarks || "",
        receivedBy: txn.receivedBy?.name || "-",
      })),
    };
  }, [data]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button
            variant="outline"
            className="h-auto shadow-none p-1 cursor-pointer"
          >
            <PlusIcon className="size-2.5 text-destructive" />
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="max-w-[98vw]! border-secondary border-4 bg-white h-[95dvh] flex flex-col p-4">
        <div className="text-sm font-medium">Invoice</div>

        <div className="flex items-center gap-4 text-xs mt-1">
          <label className="flex items-center gap-2">
            <Checkbox
              checked={includePaymentHistory}
              onCheckedChange={(value) => {
                const checked = Boolean(value);
                setIncludePaymentHistory(checked);
                if (!checked) {
                  setIncludeRemarks(false);
                }
              }}
            />
            Include Payment History
          </label>
          <label className="flex items-center gap-2">
            <Checkbox
              disabled={!includePaymentHistory}
              checked={includeRemarks}
              onCheckedChange={(value) => setIncludeRemarks(Boolean(value))}
            />
            Include Remarks
          </label>
        </div>

        <div className="flex-1 overflow-hidden border mt-3">
          {isLoading || !previewData ? (
            <div className="h-full w-full flex items-center justify-center">
              <LoaderIcon className="size-4 animate-spin" />
            </div>
          ) : (
            <BlobProvider
              key={`${effectiveInvoiceId}-${includePaymentHistory}-${includeRemarks}`}
              document={
                <InvoiceExport
                  {...previewData}
                  showViewer={false}
                  includePaymentHistory={includePaymentHistory}
                  includeRemarks={includeRemarks}
                />
              }
            >
              {({ url, loading }) =>
                loading ? (
                  <div className="h-full w-full flex items-center justify-center">
                    <LoaderIcon className="size-4 animate-spin" />
                  </div>
                ) : (
                  <iframe
                    title="Invoice Preview"
                    src={url || undefined}
                    className="h-full w-full"
                  />
                )
              }
            </BlobProvider>
          )}
        </div>

        <div className="flex justify-center gap-2 mt-3">
          <CustomButton
            type="button"
            onClick={() => router.push(`/invoice/${effectiveInvoiceId}`)}
          >
            View More Details
          </CustomButton>
          <CustomButton
            type="button"
            onClick={() =>
              window.open(`/invoice/transactions/${effectiveInvoiceId}`, "_blank")
            }
          >
            Print Payment Receipt
          </CustomButton>

          <CustomButton
            type="button"
            className="bg-destructive"
            onClick={() => onOpenChange?.(false)}
          >
            Close
          </CustomButton>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ViewInvoiceModal;
