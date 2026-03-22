import PathologyOrders from "@/app-pages/clinical-tests/pathology/PathologyOrders";
import { PathologyOrderStatus } from "@/generated/prisma/enums";

const page = () => {
  return (
    <PathologyOrders
      title="Completed Orders"
      cancelled={false}
      outsourced={false}
      forcedTestStatus={[PathologyOrderStatus["COMPLETED"]]}
    />
  );
};

export default page;

