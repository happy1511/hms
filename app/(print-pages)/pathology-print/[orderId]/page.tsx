import PrintPathologyOrder from "@/app-pages/clinical-tests/pathology/PrintPathologyOrder";
import CustomHeader from "@/components/common/CustomHeader";

const page = () => {
  return (
    <main>
      <CustomHeader />

      <div className="relative h-[calc(100dvh-48px)]">
        <PrintPathologyOrder />
      </div>
    </main>
  );
};

export default page;
