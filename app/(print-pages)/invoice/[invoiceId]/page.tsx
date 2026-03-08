import InvoiceDetails from "@/app-pages/invoice/InvoiceDetails";
import CustomHeader from "@/components/common/CustomHeader";

const page = () => {
  return (
    <main>
      <CustomHeader />

      <div className="relative h-[calc(100dvh-48px)]">
        <InvoiceDetails />
      </div>
    </main>
  );
};

export default page;
