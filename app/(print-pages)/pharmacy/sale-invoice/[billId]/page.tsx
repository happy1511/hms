import PrintSaleInvoice from "@/app-pages/pharmacy/PrintSaleInvoice";
import CustomHeader from "@/components/common/CustomHeader";

const page = () => {
  return (
    <main>
      <CustomHeader />

      <div className="relative h-[calc(100dvh-48px)]">
        <PrintSaleInvoice />
      </div>
    </main>
  );
};

export default page;
