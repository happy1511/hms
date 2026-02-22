import RadiologyOrders from "../../../../app-pages/clinical-tests/radiology/RadiologyOrders";

const page = () => {
  return (
    <RadiologyOrders
      title="Radiology Orders"
      cancelled={false}
      outsourced={false}
    />
  );
};

export default page;
