import IpdBillForm from "@/app-pages/ipd/IpdBillForm";
import { Suspense } from "react";

const page = () => {
  return (
    <Suspense>
      <IpdBillForm />
    </Suspense>
  );
};

export default page;
