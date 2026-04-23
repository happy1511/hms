import PrintMultiplePathology from "@/app-pages/pathology/PrintMultiplePathology";
import { LoaderIcon } from "lucide-react";
import { Suspense } from "react";

const page = () => {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center items-center h-full">
          <LoaderIcon className="animate-spin size-4" />
        </div>
      }
    >
      <PrintMultiplePathology />
    </Suspense>
  );
};

export default page;
