import PathologyOrders from "@/app-pages/clinical-tests/pathology/PathologyOrders";

const page = () => {
  return (
    <PathologyOrders
      title="Outsourced Orders"
      cancelled={false}
      outsourced={true}
    />
  );
};

export default page;
