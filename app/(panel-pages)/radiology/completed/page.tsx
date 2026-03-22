import RadiologyOrders from "@/app-pages/clinical-tests/radiology/RadiologyOrders";
import { RadiologyOrderStatus } from "@/generated/prisma/enums";

const page = () => {
  return (
    <RadiologyOrders
      title="Completed Orders"
      cancelled={false}
      outsourced={false}
      forcedTestStatus={[RadiologyOrderStatus["COMPLETED"]]}
    />
  );
};

export default page;

