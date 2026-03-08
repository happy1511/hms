import PrintRadiologyOrder from "@/app-pages/clinical-tests/radiology/PrintRadiologyOrder";
import CustomHeader from "@/components/common/CustomHeader";

const page = () => {
  return (
    <main>
      <CustomHeader />

      <div className="relative h-[calc(100dvh-48px)]">
        <PrintRadiologyOrder />
      </div>
    </main>
  );
};

export default page;
