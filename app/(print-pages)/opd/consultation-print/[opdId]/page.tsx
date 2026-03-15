import PrintOpdConsultation from "@/app-pages/opd/PrintOpdConsultation";
import { Suspense } from "react";

const page = () => {
  return (
    <Suspense>
      <main>
        <PrintOpdConsultation />
      </main>
    </Suspense>
  );
};

export default page;
