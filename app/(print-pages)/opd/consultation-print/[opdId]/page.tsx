import PrintOpdConsultation from "@/app-pages/opd/PrintOpdConsultation";
import CustomHeader from "@/components/common/CustomHeader";

const page = () => {
  return (
    <main>
      <CustomHeader />
      <div className="relative h-[calc(100dvh-48px)]">
        <PrintOpdConsultation />
      </div>
    </main>
  );
};

export default page;
