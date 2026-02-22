import RadiologyOrders from "../../../../app-pages/clinical-tests/radiology/RadiologyOrders";

const page = () => {
  return (
    <RadiologyOrders
      title="Cancelled Orders"
      cancelled={true}
      outsourced={false}
    />
  );
};

export default page;
