import RadiologyOrders from "../../../../app-pages/clinical-tests/radiology/RadiologyOrders";

const page = () => {
  return (
    <RadiologyOrders
      title="Outsourced Orders"
      cancelled={false}
      outsourced={true}
    />
  );
};

export default page;
