import PrintGrn from "@/app-pages/pharmacy/PrintGrn";
import { Suspense } from "react";

const page = () => {
  return (
    <Suspense>
      <main>
        <PrintGrn />
      </main>
    </Suspense>
  );
};

export default page;
