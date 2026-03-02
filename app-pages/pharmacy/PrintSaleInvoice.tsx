"use client";

import SaleInvoiceExport from "@/components/common/SaleInvoiceExport";
import { useGetSaleBill } from "@/hooks/query/pharmacySaleBill";
import { LoaderIcon } from "lucide-react";
import { useParams } from "next/navigation";

const PrintSaleInvoice = () => {
  const { billId }: { billId: string } = useParams();
  const { data, isLoading } = useGetSaleBill(billId);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <LoaderIcon className="size-4 animate-spin" />
      </div>
    );
  }

  if (!data) return <div />;

  return (
    <SaleInvoiceExport
      billNo={`SB-${data.id}`}
      billDate={new Date(data.invoice.createdAt).toLocaleDateString()}
      patientName={
        data.patient
          ? `${data.patient.firstName} ${data.patient.lastName}`
          : "Walk-in Customer"
      }
      doctorName={data.doctor?.user?.name ?? undefined}
      lines={data.saleItems.map((item) => ({
        name: item.inventoryItem.drug.name,
        batchNo: item.inventoryItem.batchNo,
        qty: item.quantity,
        rate: item.rate,
        taxableAmount: item.taxableAmount ?? item.total,
        gstAmount: item.gstAmount ?? 0,
        cGstAmount: item.cGstAmount ?? 0,
        sGstAmount: item.sGstAmount ?? 0,
        iGstAmount: item.iGstAmount ?? 0,
        total: item.total,
      }))}
      invoiceDiscount={data.invoice.discountValue}
      invoiceTotal={data.invoice.total}
    />
  );
};

export default PrintSaleInvoice;
