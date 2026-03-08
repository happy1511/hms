import PrintSaleTransactions from "@/app-pages/pharmacy/PrintSaleTransactions";
import CustomHeader from "@/components/common/CustomHeader";

const page = () => {
  return (
    <main>
      <CustomHeader />

      <div className="relative h-[calc(100dvh-48px)]">
        <PrintSaleTransactions />
      </div>
    </main>
  );
};

export default page;
