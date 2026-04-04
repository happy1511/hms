import PrintSaleInvoice from "@/app-pages/pharmacy/PrintSaleInvoice";
import { Suspense } from "react";

const page = () => {
  return (
    <Suspense>
      <main>
        <PrintSaleInvoice />
      </main>
    </Suspense>
  );
};

export default page;
