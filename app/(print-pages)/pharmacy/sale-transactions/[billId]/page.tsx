import PrintSaleTransactions from "@/app-pages/pharmacy/PrintSaleTransactions";
import CustomHeader from "@/components/common/CustomHeader";
import { Suspense } from "react";

const page = () => {
  return (
    <Suspense>
      <main>
        <CustomHeader hideSidebarToggle={true} />

        <div className="relative h-[calc(100dvh-48px)]">
          <PrintSaleTransactions />
        </div>
      </main>
    </Suspense>
  );
};

export default page;
