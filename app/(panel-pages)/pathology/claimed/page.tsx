import PathologyOrders from "@/app-pages/clinical-tests/pathology/PathologyOrders";

const page = () => {
  return (
    <PathologyOrders
      title="Pathology Orders"
      cancelled={false}
      outsourced={false}
    />
  );
};

export default page;
