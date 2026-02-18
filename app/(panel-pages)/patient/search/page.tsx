import PatientSearch from "@/app-pages/patient/PatientSearch";
import { Suspense } from "react";

const page = () => {
  return (
    <Suspense fallback={"Loading..."}>
      <PatientSearch />
    </Suspense>
  );
};

export default page;
