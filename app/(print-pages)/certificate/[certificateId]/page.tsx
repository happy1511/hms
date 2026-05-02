import PrintCertificate from "@/app-pages/certificate/PrintCertificate";
import { Suspense } from "react";

const page = () => {
  return (
    <Suspense>
      <main>
        <PrintCertificate />
      </main>
    </Suspense>
  );
};

export default page;
