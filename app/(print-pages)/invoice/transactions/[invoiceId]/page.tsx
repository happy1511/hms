import PrintInvoiceTransactions from "@/app-pages/invoice/PrintInvoiceTransactions";
import { Suspense } from "react";

const page = () => {
  return (
    <Suspense>
      <main>
        <PrintInvoiceTransactions />
      </main>
    </Suspense>
  );
};

export default page;
