import PrintInvoice from "@/app-pages/invoice/PrintInvoice";
import { Suspense } from "react";

const page = () => {
  return (
    <Suspense>
      <main>
        <PrintInvoice mode="compact" />
      </main>
    </Suspense>
  );
};

export default page;
