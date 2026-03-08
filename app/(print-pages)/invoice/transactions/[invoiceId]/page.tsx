import PrintInvoiceTransactions from "@/app-pages/invoice/PrintInvoiceTransactions";
import CustomHeader from "@/components/common/CustomHeader";

const page = () => {
  return (
    <main>
      <CustomHeader />

      <div className="relative h-[calc(100dvh-48px)]">
        <PrintInvoiceTransactions />
      </div>
    </main>
  );
};

export default page;
