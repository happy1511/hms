import PrintInvoice from "@/app-pages/invoice/PrintInvoice";
import CustomHeader from "@/components/common/CustomHeader";

const page = () => {
  return (
    <main>
      <CustomHeader />

      <div className="relative h-[calc(100dvh-48px)]">
        <PrintInvoice />
      </div>
    </main>
  );
};

export default page;
