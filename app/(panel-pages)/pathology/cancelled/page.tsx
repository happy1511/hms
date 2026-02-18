import PathologyOrders from "@/app-pages/clinical-tests/pathology/PathologyOrders";

const page = () => {
  return (
    <PathologyOrders
      title="Cancelled Orders"
      cancelled={true}
      outsourced={false}
    />
  );
};

export default page;
